const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(
  process.argv[2] ??
    path.join(repoRoot, "references", "axis1-validation-artifacts", "2026-05-01"),
);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      return;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(path.join(repoRoot, "frontend", ".env.local"));

const ts = require(path.join(repoRoot, "frontend", "node_modules", "typescript"));
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveAxisAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const candidate = path.join(repoRoot, "frontend", "src", request.slice(2));
    const matches = [
      candidate,
      `${candidate}.ts`,
      `${candidate}.tsx`,
      `${candidate}.js`,
      path.join(candidate, "index.ts"),
      path.join(candidate, "index.tsx"),
      path.join(candidate, "index.js"),
    ];
    const match = matches.find((filePath) => fs.existsSync(filePath));

    if (match) {
      return match;
    }

    return candidate;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
  });

  module._compile(output.outputText, filename);
};

const {
  requestGeminiAxis1PhotoAssist,
} = require(path.join(
  repoRoot,
  "frontend",
  "src",
  "lib",
  "axis1-photo-assist-gemini.ts",
));

const forbiddenReasonTerms =
  /\b(NFPA|compliance|pass\/fail|pass-fail|fire marshal|official|certificate|inspection|approval|repair|verified|proves|guarantee)\b/i;

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") {
    return "image/png";
  }

  if (ext === ".webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

function dataUrlFor(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const buffer = fs.readFileSync(absolutePath);

  return `data:${mimeFor(absolutePath)};base64,${buffer.toString("base64")}`;
}

function percent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
}

const liveSet = [
  {
    photoId: "live-phone-001",
    fileName: "IMG_7421.jpg",
    path: "frontend/public/axis1-test-photos/clean-hood-before-after.jpg",
    expectedSlotId: "hood-before",
    acceptedSlotIds: ["hood-before", "hood-after"],
    expectedNeedsVendorReview: true,
    notes: "Combined hood before/after image with numeric phone filename.",
  },
  {
    photoId: "live-phone-002",
    fileName: "IMG_7422.jpg",
    path: "frontend/public/axis1-test-photos/clean-filter-after-wash.jpg",
    expectedSlotId: "filter-bank",
    acceptedSlotIds: ["filter-bank", "hood-before", "hood-after"],
    expectedNeedsVendorReview: true,
    notes: "Clean filter-like image with ambiguous numeric filename.",
  },
  {
    photoId: "live-phone-003",
    fileName: "IMG_7423.jpg",
    path: "frontend/public/axis1-test-photos/kitchen-exhaust-fan.jpg",
    expectedSlotId: null,
    acceptedSlotIds: [null],
    expectedNeedsVendorReview: true,
    notes: "Unrelated wall-mounted appliance with numeric filename.",
  },
  {
    photoId: "live-phone-004",
    fileName: "IMG_7424.jpg",
    path: "frontend/public/axis1-test-photos/grease-system-before.jpg",
    expectedSlotId: "grease-containment",
    acceptedSlotIds: ["grease-containment", "access-condition", null],
    expectedNeedsVendorReview: true,
    notes: "Cropped grease/duct path with numeric filename.",
  },
  {
    photoId: "live-phone-005",
    fileName: "IMG_7425.jpg",
    path: "frontend/public/axis1-test-photos/grease-duct-before-cleaning.jpg",
    expectedSlotId: "access-condition",
    acceptedSlotIds: ["access-condition", "hood-before", "hood-after"],
    expectedNeedsVendorReview: true,
    notes: "Misleading blocked/cleaned photo renamed to a numeric phone filename.",
  },
  {
    photoId: "live-phone-006",
    fileName: "IMG_8420.jpg",
    path: "frontend/public/axis1-test-photos/kitchen-exhaust-fan.jpg",
    expectedSlotId: null,
    acceptedSlotIds: [null],
    expectedNeedsVendorReview: true,
    notes: "Synthetic unrelated receipt image with phone filename.",
  },
];

async function main() {
  const inputs = liveSet.map((photo) => ({
    photoId: photo.photoId,
    fileName: photo.fileName,
    dataUrl: dataUrlFor(photo.path),
  }));

  const response = await requestGeminiAxis1PhotoAssist(inputs);
  const byPhotoId = new Map(
    response.suggestions.map((suggestion) => [suggestion.photoId, suggestion]),
  );
  const rows = liveSet.map((photo) => {
    const suggestion = byPhotoId.get(photo.photoId);
    const slotAcceptedHit = photo.acceptedSlotIds.some(
      (slotId) => suggestion?.suggestedSlotId === slotId,
    );
    const reviewHit =
      suggestion?.needsVendorReview === photo.expectedNeedsVendorReview;
    const reasonViolation = forbiddenReasonTerms.test(suggestion?.reason ?? "");
    const pendingViolation = suggestion?.vendorDecision !== "pending";

    return {
      ...photo,
      suggestedSlotId: suggestion?.suggestedSlotId ?? null,
      suggestedTone: suggestion?.suggestedTone ?? "unknown",
      confidence: suggestion?.confidence ?? null,
      needsVendorReview: suggestion?.needsVendorReview ?? null,
      reason: suggestion?.reason ?? "",
      vendorDecision: suggestion?.vendorDecision ?? null,
      slotAcceptedHit,
      reviewHit,
      reasonViolation,
      pendingViolation,
    };
  });
  const totals = {
    photos: rows.length,
    acceptedSlotHits: rows.filter((row) => row.slotAcceptedHit).length,
    reviewFlagHits: rows.filter((row) => row.reviewHit).length,
    reasonViolations: rows.filter((row) => row.reasonViolation).length,
    pendingViolations: rows.filter((row) => row.pendingViolation).length,
    nullExpectedPhotos: rows.filter((row) => row.expectedSlotId === null).length,
    nullExpectedCorrect: rows.filter(
      (row) => row.expectedSlotId === null && row.suggestedSlotId === null,
    ).length,
  };
  const summary = {
    generatedAt: new Date().toISOString(),
    provider: response.provider,
    mode: response.mode,
    model: response.model,
    warning: response.warning,
    keyLoaded: Boolean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
    totals,
    metrics: {
      acceptedSlotAccuracy: percent(totals.acceptedSlotHits, totals.photos),
      reviewFlagAgreement: percent(totals.reviewFlagHits, totals.photos),
      reasonSafety: percent(totals.photos - totals.reasonViolations, totals.photos),
      pendingDecisionSafety: percent(
        totals.photos - totals.pendingViolations,
        totals.photos,
      ),
      unrelatedNullAccuracy: percent(
        totals.nullExpectedCorrect,
        totals.nullExpectedPhotos,
      ),
    },
    rows,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, "gemini-live-phone-filename-smoke.json");
  const markdownPath = path.join(outputDir, "gemini-live-phone-filename-smoke.md");

  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
  fs.writeFileSync(
    markdownPath,
    `# Gemini Live Phone Filename Smoke

Generated: ${summary.generatedAt}

Provider: ${summary.provider}
Mode: ${summary.mode}
Model: ${summary.model}
Warning: ${summary.warning ?? "none"}

## Metrics

- Photos: ${totals.photos}
- Accepted slot accuracy: ${summary.metrics.acceptedSlotAccuracy}%
- Review-flag agreement: ${summary.metrics.reviewFlagAgreement}%
- Reason safety: ${summary.metrics.reasonSafety}%
- Pending-decision safety: ${summary.metrics.pendingDecisionSafety}%
- Unrelated null accuracy: ${summary.metrics.unrelatedNullAccuracy}%

## Rows

${rows
  .map(
    (row) =>
      `- ${row.photoId} (${row.fileName}): expected ${
        row.expectedSlotId ?? "null"
      }, suggested ${row.suggestedSlotId ?? "null"}, confidence ${
        row.confidence
      }, review ${row.needsVendorReview}. ${row.reason}`,
  )
  .join("\n")}
`,
  );

  console.log(JSON.stringify(summary.metrics, null, 2));
  console.log(`Provider: ${summary.provider} ${summary.model}`);
  console.log(`Wrote ${path.relative(repoRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, markdownPath)}`);

  if (response.provider !== "gemini" || response.mode !== "live") {
    process.exitCode = 1;
  }

  if (totals.reasonViolations > 0 || totals.pendingViolations > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
