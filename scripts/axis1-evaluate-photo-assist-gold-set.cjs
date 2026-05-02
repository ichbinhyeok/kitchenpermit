const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");

const repoRoot = path.resolve(__dirname, "..");
const defaultGoldSetPath = path.join(
  repoRoot,
  "references",
  "axis1-photo-assist-gold-set.json",
);
const defaultOutputDir = path.join(
  repoRoot,
  "references",
  "axis1-validation-artifacts",
  "2026-05-01",
);

const goldSetPath = path.resolve(process.argv[2] ?? defaultGoldSetPath);
const outputDir = path.resolve(process.argv[3] ?? defaultOutputDir);

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
  axis1PhotoAssistLowConfidenceThreshold,
  buildMockAxis1PhotoAssistSuggestions,
} = require(path.join(repoRoot, "frontend", "src", "lib", "axis1-photo-assist.ts"));

const forbiddenReasonTerms =
  /\b(NFPA|compliance|pass\/fail|pass-fail|fire marshal|official|certificate|inspection|approval|repair|verified|proves|guarantee)\b/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function existsRelative(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function percent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
}

function flattenCases(goldSet) {
  return goldSet.cases.flatMap((testCase) =>
    testCase.photos.map((photo) => ({
      caseId: testCase.id,
      caseTitle: testCase.title,
      fixtureSource: testCase.fixtureSource,
      localOnly: Boolean(testCase.localOnly),
      expectedOutcome: testCase.expectedOutcome,
      ...photo,
    })),
  );
}

const goldSet = readJson(goldSetPath);
const photos = flattenCases(goldSet);
const inputs = photos.map((photo) => ({
  photoId: photo.photoId,
  fileName: photo.fileName,
}));
const suggestions = buildMockAxis1PhotoAssistSuggestions(inputs);
const byPhotoId = new Map(suggestions.map((suggestion) => [suggestion.photoId, suggestion]));

const rows = photos.map((photo) => {
  const suggestion = byPhotoId.get(photo.photoId);
  const acceptedSlotIds = photo.acceptedSlotIds ?? [photo.expectedSlotId];
  const slotStrictHit = suggestion?.suggestedSlotId === photo.expectedSlotId;
  const slotAcceptedHit = acceptedSlotIds.some(
    (slotId) => suggestion?.suggestedSlotId === slotId,
  );
  const reviewHit = suggestion?.needsVendorReview === photo.expectedNeedsVendorReview;
  const reasonViolation = forbiddenReasonTerms.test(suggestion?.reason ?? "");
  const pendingViolation = suggestion?.vendorDecision !== "pending";
  const missingFixture = !existsRelative(photo.path);

  return {
    caseId: photo.caseId,
    photoId: photo.photoId,
    fileName: photo.fileName,
    path: photo.path,
    missingFixture,
    expectedSlotId: photo.expectedSlotId,
    acceptedSlotIds,
    suggestedSlotId: suggestion?.suggestedSlotId ?? null,
    expectedTone: photo.expectedTone,
    suggestedTone: suggestion?.suggestedTone ?? "unknown",
    expectedNeedsVendorReview: photo.expectedNeedsVendorReview,
    needsVendorReview: suggestion?.needsVendorReview ?? null,
    confidence: suggestion?.confidence ?? null,
    confidenceThreshold: axis1PhotoAssistLowConfidenceThreshold,
    vendorDecision: suggestion?.vendorDecision ?? null,
    reason: suggestion?.reason ?? "",
    slotStrictHit,
    slotAcceptedHit,
    reviewHit,
    reasonViolation,
    pendingViolation,
    mustRemainSuggestionOnly: Boolean(photo.mustRemainSuggestionOnly),
    notes: photo.notes,
  };
});

const totals = {
  photos: rows.length,
  cases: goldSet.cases.length,
  missingFixtures: rows.filter((row) => row.missingFixture).length,
  strictSlotHits: rows.filter((row) => row.slotStrictHit).length,
  acceptedSlotHits: rows.filter((row) => row.slotAcceptedHit).length,
  reviewFlagHits: rows.filter((row) => row.reviewHit).length,
  expectedReviewPhotos: rows.filter((row) => row.expectedNeedsVendorReview).length,
  actualReviewPhotos: rows.filter((row) => row.needsVendorReview).length,
  reasonViolations: rows.filter((row) => row.reasonViolation).length,
  pendingViolations: rows.filter((row) => row.pendingViolation).length,
};

const summary = {
  generatedAt: new Date().toISOString(),
  goldSet: path.relative(repoRoot, goldSetPath),
  provider: "mock-rule-fallback",
  totals,
  metrics: {
    strictSlotAccuracy: percent(totals.strictSlotHits, totals.photos),
    acceptedSlotAccuracy: percent(totals.acceptedSlotHits, totals.photos),
    reviewFlagAgreement: percent(totals.reviewFlagHits, totals.photos),
    expectedReviewRate: percent(totals.expectedReviewPhotos, totals.photos),
    actualReviewRate: percent(totals.actualReviewPhotos, totals.photos),
    reasonSafety: percent(totals.photos - totals.reasonViolations, totals.photos),
    pendingDecisionSafety: percent(totals.photos - totals.pendingViolations, totals.photos),
  },
  interpretation: [
    "Mock fallback is filename-based. Low slot accuracy on messy phone photos is expected and shows why vision assist is useful.",
    "The hard safety bar is that suggestions stay pending and reasons avoid authority/compliance/repair overclaim language.",
    "Gemini should be evaluated later against the same set with a small paid subset before prompt/model changes.",
  ],
  rows,
};

fs.mkdirSync(outputDir, { recursive: true });

const jsonOutputPath = path.join(outputDir, "photo-assist-gold-set-report.json");
const markdownOutputPath = path.join(outputDir, "photo-assist-gold-set-report.md");

fs.writeFileSync(jsonOutputPath, JSON.stringify(summary, null, 2));

const misses = rows.filter((row) => !row.slotAcceptedHit || !row.reviewHit);
const markdown = `# Axis 1 Photo Assist Gold Set Report

Generated: ${summary.generatedAt}

Provider: mock-rule-fallback

## Summary

- Photos: ${totals.photos}
- Cases: ${totals.cases}
- Missing fixture files: ${totals.missingFixtures}
- Strict slot accuracy: ${summary.metrics.strictSlotAccuracy}%
- Accepted slot accuracy: ${summary.metrics.acceptedSlotAccuracy}%
- Review-flag agreement: ${summary.metrics.reviewFlagAgreement}%
- Expected review rate: ${summary.metrics.expectedReviewRate}%
- Actual review rate: ${summary.metrics.actualReviewRate}%
- Reason safety: ${summary.metrics.reasonSafety}%
- Pending-decision safety: ${summary.metrics.pendingDecisionSafety}%

## Read

Mock fallback is filename-based, so it should not be expected to solve generic
phone filenames or visually messy photos. The important safety result is whether
it stays in suggestion mode and avoids overclaim language.

## Misses And Review Differences

${misses
  .map(
    (row) =>
      `- ${row.photoId}: expected slot ${row.expectedSlotId ?? "none"}, suggested ${
        row.suggestedSlotId ?? "none"
      }; expected review ${row.expectedNeedsVendorReview}, got ${
        row.needsVendorReview
      }. ${row.notes}`,
  )
  .join("\n")}

## Boundary Violations

- Reason violations: ${totals.reasonViolations}
- Pending decision violations: ${totals.pendingViolations}
- Missing fixtures: ${totals.missingFixtures}
`;

fs.writeFileSync(markdownOutputPath, markdown);

console.log(JSON.stringify(summary.metrics, null, 2));
console.log(`Wrote ${path.relative(repoRoot, jsonOutputPath)}`);
console.log(`Wrote ${path.relative(repoRoot, markdownOutputPath)}`);

if (totals.reasonViolations > 0 || totals.pendingViolations > 0) {
  process.exitCode = 1;
}
