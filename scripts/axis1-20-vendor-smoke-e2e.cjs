#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const frontendDir = path.join(repoRoot, "frontend");
const outputDir = path.join(repoRoot, "output");
const reportPath = path.join(outputDir, "axis1-20-vendor-smoke-e2e-report.json");
const playwright = require(path.join(frontendDir, "node_modules", "playwright"));

const defaultPort = Number(process.env.AXIS1_E2E_PORT || 3021);
const externalBaseUrl = process.env.AXIS1_E2E_BASE_URL;
const basePath = "/axis-1/tool";
const fixtureDir = path.join(frontendDir, "public", "axis1-test-photos");
const forbiddenCustomerCopyPattern =
  /NFPA|fire marshal|official inspection|pass\/fail|certificate|compliance approval/i;

class SmokeFailure extends Error {
  constructor(message) {
    super(message);
    this.name = "SmokeFailure";
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new SmokeFailure(message);
  }
}

function matches(value, matcher) {
  if (matcher instanceof RegExp) {
    return matcher.test(value);
  }

  return value.toLowerCase().includes(String(matcher).toLowerCase());
}

async function waitForServer(baseUrl, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const request = http.get(`${baseUrl}${basePath}`, (response) => {
        response.resume();
        resolve(response.statusCode && response.statusCode < 500);
      });

      request.on("error", () => resolve(false));
      request.setTimeout(1000, () => {
        request.destroy();
        resolve(false);
      });
    });

    if (ok) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  throw new Error(`Timed out waiting for ${baseUrl}${basePath}`);
}

async function canReachServer(baseUrl) {
  try {
    await waitForServer(baseUrl, 1200);
    return true;
  } catch {
    return false;
  }
}

async function startStaticServer() {
  if (externalBaseUrl) {
    await waitForServer(externalBaseUrl);
    return { baseUrl: externalBaseUrl, stop: async () => {} };
  }

  const outDir = path.join(frontendDir, "out");

  if (!fs.existsSync(path.join(outDir, "axis-1", "tool.html"))) {
    throw new Error(
      "frontend/out is missing. Run `cd frontend && npm run build` before this e2e harness.",
    );
  }

  let selectedPort = defaultPort;
  let baseUrl = `http://localhost:${selectedPort}`;

  while (await canReachServer(baseUrl)) {
    selectedPort += 1;
    if (selectedPort > defaultPort + 50) {
      throw new Error(`No free local port found from ${defaultPort} to ${defaultPort + 50}.`);
    }
    baseUrl = `http://localhost:${selectedPort}`;
  }

  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const args =
    process.platform === "win32"
      ? ["/c", "npx", "serve@latest", "out", "-l", String(selectedPort)]
      : ["serve@latest", "out", "-l", String(selectedPort)];
  const child = spawn(command, args, {
    cwd: frontendDir,
    stdio: ["ignore", "ignore", "ignore"],
    windowsHide: true,
  });

  await waitForServer(baseUrl);

  return {
    baseUrl,
    stop: async () => {
      if (!child.killed) {
        if (process.platform === "win32") {
          spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
            stdio: "ignore",
            windowsHide: true,
          });
        } else {
          child.kill();
        }
      }
    },
  };
}

async function visibleButtonHandles(page) {
  const handles = await page.locator("button").elementHandles();
  const visible = [];

  for (const handle of handles) {
    const state = await handle.evaluate((element) => ({
      visible: Boolean(
        element.offsetWidth || element.offsetHeight || element.getClientRects().length,
      ),
      disabled: element.disabled,
      text: element.innerText.trim(),
      aria: element.getAttribute("aria-label") || "",
    }));

    if (state.visible && !state.disabled) {
      visible.push({
        handle,
        text: state.text,
        accessibleText: `${state.text}\n${state.aria}`.trim(),
      });
    }
  }

  return visible;
}

async function clickVisibleButton(page, matcher, options = {}) {
  const buttons = await visibleButtonHandles(page);

  for (const button of buttons) {
    if (matches(button.accessibleText, matcher)) {
      await button.handle.click();
      await page.waitForTimeout(options.waitMs ?? 200);
      return button.accessibleText;
    }
  }

  if (options.optional) {
    return null;
  }

  throw new SmokeFailure(`No visible enabled button matched ${matcher}`);
}

async function goToScenario(page, baseUrl, vendorId, step = "photos") {
  await page.goto(`${baseUrl}${basePath}?qa=vendor-${vendorId}&step=${step}`, {
    waitUntil: "networkidle",
  });
}

async function pickCompleted(page) {
  await clickVisibleButton(page, /^COMPLETED|^Completed/);
}

async function pickBlocked(page) {
  await clickVisibleButton(page, "BLOCKED / NO ACCESS");
}

async function pickCondition(page) {
  await clickVisibleButton(page, "CONDITION FOUND");
}

async function pickVisitType(page, label) {
  await clickVisibleButton(page, label);
}

async function confirmNotesIfNeeded(page) {
  await clickVisibleButton(page, "USE NOTES FOR MISSING PROOF", {
    optional: true,
    waitMs: 250,
  });
}

async function goToOutputs(page) {
  await confirmNotesIfNeeded(page);
  await clickVisibleButton(page, /^SEND|^Send|Go to Send|Continue to Send|Open Send/i, { waitMs: 350 });
  const rows = await outputRows(page);
  assert(rows.length > 0, "Send page did not show generated output rows.");
  return rows;
}

async function nearestSelectText(selectHandle) {
  return selectHandle.evaluate((select) => {
    const row = select.closest("article") || select.closest("label") || select.parentElement;
    return (row?.innerText || "").slice(0, 1400);
  });
}

async function selectVisibleAreaStatus(page, areaMatcher, value) {
  const selects = await page.locator("select").elementHandles();

  for (const select of selects) {
    const visible = await select.evaluate((element) =>
      Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
    );

    if (!visible) {
      continue;
    }

    const text = await nearestSelectText(select);

    if (matches(text, areaMatcher)) {
      await select.selectOption(value);
      await page.waitForTimeout(250);
      return text;
    }
  }

  throw new SmokeFailure(`No visible area status select matched ${areaMatcher}`);
}

async function getVisibleAreaStatus(page, areaMatcher) {
  const selects = await page.locator("select").elementHandles();

  for (const select of selects) {
    const visible = await select.evaluate((element) =>
      Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
    );

    if (!visible) {
      continue;
    }

    const text = await nearestSelectText(select);

    if (matches(text, areaMatcher)) {
      return select.evaluate((element) => element.value);
    }
  }

  throw new SmokeFailure(`No visible area status select matched ${areaMatcher}`);
}

async function selectVisiblePhotoRole(page, roleValue) {
  const selects = await page.locator("select").elementHandles();

  for (const select of selects) {
    const visible = await select.evaluate((element) =>
      Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
    );

    if (!visible) {
      continue;
    }

    const hasRole = await select.evaluate(
      (element, value) => Array.from(element.options).some((option) => option.value === value),
      roleValue,
    );

    if (hasRole) {
      await select.selectOption(roleValue);
      await page.waitForTimeout(450);
      return;
    }
  }

  throw new SmokeFailure(`No visible photo role select contained ${roleValue}`);
}

async function outputRows(page) {
  return page.locator(".axis-output-row").evaluateAll((rows) =>
    rows
      .filter((row) =>
        Boolean(row.offsetWidth || row.offsetHeight || row.getClientRects().length),
      )
      .map((row) => ({
        readiness: row.getAttribute("data-readiness"),
        text: row.innerText.trim(),
      })),
  );
}

function outputRow(rows, label) {
  const row = rows.find((item) => item.text.includes(label));
  assert(row, `Missing generated output row: ${label}`);
  return row;
}

async function bodyText(page) {
  return page.locator("body").innerText();
}

async function waitForBodyText(page, matcher, timeoutMs = 2500) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const text = await bodyText(page);

    if (matches(text, matcher)) {
      return text;
    }

    await page.waitForTimeout(120);
  }

  return bodyText(page);
}

async function assertCustomerCopySafe(page) {
  const text = await bodyText(page);
  assert(
    !forbiddenCustomerCopyPattern.test(text),
    "Forbidden compliance/approval language appeared in the page.",
  );
}

async function uploadBulkPhotos(page, fileNames) {
  await page.locator('input[aria-label="Upload job photos"]').setInputFiles(
    fileNames.map((fileName) => path.join(fixtureDir, fileName)),
  );
  await page.waitForTimeout(700);
}

async function uploadSlotPhoto(page, ariaLabel, fileName) {
  await page.locator(`input[aria-label="${ariaLabel}"]`).setInputFiles(
    path.join(fixtureDir, fileName),
  );
  await page.waitForTimeout(500);
}

const vendorScenarios = [
  {
    id: "v01-no-photo-clean",
    vendor: "Vendor 01 - clean no-photo written record",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Customer handoff link").readiness === "ready", "Customer link not ready.");
      assert(outputRow(rows, "Evidence PDF").readiness === "ready", "Evidence PDF not ready.");
      assert(
        outputRow(rows, "Invoice proof summary").readiness === "needs_review",
        "Invoice proof should need review for written record.",
      );
      assert(
        outputRow(rows, "Payment-support copy").readiness === "needs_review",
        "Payment support should need review for written record.",
      );
      assert(/written service record|WRITTEN RECORD/i.test(await bodyText(page)), "Written record basis missing.");
      await assertCustomerCopySafe(page);
    },
  },
  {
    id: "v02-quick-note-preserved",
    vendor: "Vendor 02 - quick note survives result selection",
    step: "photos",
    run: async ({ page }) => {
      const note = "fan access blocked by locked roof hatch";
      await page.locator("#quickCloseoutNote").fill(note);
      await clickVisibleButton(page, "Package");
      await pickCompleted(page);
      assert((await page.locator("#quickCloseoutNote").inputValue()) === note, "Quick note was lost after result.");
      let text = await bodyText(page);
      assert(
        !/Vendor note needs placement/i.test(text),
        "Quick note was still shown as unplaced after clear fan blocked signal.",
      );
      assert(
        (await getVisibleAreaStatus(page, "Rooftop fan")) === "could-not-access",
        "Quick note did not mark rooftop fan blocked.",
      );
      assert(
        (await getVisibleAreaStatus(page, "Duct / access")) === "done-no-photo",
        "Quick note incorrectly changed duct/access.",
      );
      text = await bodyText(page);
      assert(text.includes("Blocked / no access: Rooftop fan and roof discharge"), "Quick note did not update customer-safe blocked copy.");
      await clickVisibleButton(page, "Declare");
      assert((await page.locator("#quickCloseoutNote").inputValue()) === note, "Quick note was not editable on return.");
    },
  },
  {
    id: "v03-rooftop-fan-blocked-only",
    vendor: "Vendor 03 - rooftop fan blocked only",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, "Rooftop fan", "could-not-access");
      assert(
        (await getVisibleAreaStatus(page, "Duct / access")) === "done-no-photo",
        "Duct/access changed when only rooftop fan was edited.",
      );
      const text = await bodyText(page);
      assert(
        text.includes("Blocked / no access: Rooftop fan and roof discharge"),
        "Customer-safe draft did not list rooftop fan as blocked.",
      );
      assert(
        !text.includes("Blocked / no access: Reachable plenum, duct path, and access, Rooftop fan and roof discharge"),
        "Customer-safe draft incorrectly blocked duct/access too.",
      );
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Revisit copy").readiness === "ready", "Revisit copy not ready.");
      assert(outputRow(rows, "Next-service copy").readiness === "needs_review", "Next service should need review.");
    },
  },
  {
    id: "v04-duct-access-blocked-only",
    vendor: "Vendor 04 - duct/access blocked only",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, "Duct / access", "could-not-access");
      assert(
        (await getVisibleAreaStatus(page, "Rooftop fan")) === "done-no-photo",
        "Rooftop fan changed when only duct/access was edited.",
      );
      const text = await bodyText(page);
      assert(
        text.includes("Blocked / no access: Reachable plenum, duct path, and access"),
        "Customer-safe draft did not list duct/access as blocked.",
      );
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Revisit copy").readiness === "ready", "Revisit copy not ready.");
    },
  },
  {
    id: "v05-fan-completed-no-photo",
    vendor: "Vendor 05 - fan completed from notes",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      assert(
        (await getVisibleAreaStatus(page, "Rooftop fan")) === "done-no-photo",
        "Fan was not represented as notes-only completed.",
      );
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Payment-support copy").readiness === "needs_review", "Payment support should need review.");
      assert((await bodyText(page)).includes("Fan"), "Fan status not visible in closeout.");
    },
  },
  {
    id: "v06-duct-completed-no-photo",
    vendor: "Vendor 06 - duct completed from notes",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      assert(
        (await getVisibleAreaStatus(page, "Duct / access")) === "done-no-photo",
        "Duct/access was not represented as notes-only completed.",
      );
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Invoice proof summary").readiness === "needs_review", "Invoice proof should need review.");
    },
  },
  {
    id: "v07-condition-quote-ready",
    vendor: "Vendor 07 - condition found quote follow-up",
    step: "review",
    run: async ({ page }) => {
      await pickCondition(page);
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Follow-up quote copy").readiness === "ready", "Quote copy not ready.");
      assert(outputRow(rows, "Revisit copy").readiness === "not_applicable", "Condition should not create revisit copy.");
      const text = await bodyText(page);
      assert(!text.includes("Condition photo attached"), "No-photo condition claimed a condition photo.");
      assert(
        /Condition recorded from service note|Written condition record|No condition photo attached/i.test(text),
        "No-photo condition did not state written-note evidence.",
      );
      await assertCustomerCopySafe(page);
    },
  },
  {
    id: "v08-condition-no-vendor-warning-leak",
    vendor: "Vendor 08 - condition copy separates vendor warnings",
    step: "review",
    run: async ({ page }) => {
      await pickCondition(page);
      const text = await bodyText(page);
      assert(text.includes("Condition"), "Condition language missing.");
      assert(!text.includes("Condition photo attached"), "No-photo condition claimed a condition photo.");
      assert(!/Private risk check|Vendor-only|internal warning/i.test(text), "Internal warning language leaked into review copy.");
      await assertCustomerCopySafe(page);
    },
  },
  {
    id: "v09-fan-only-partial",
    vendor: "Vendor 09 - fan-only partial job",
    step: "review",
    run: async ({ page }) => {
      await pickVisitType(page, "FAN ONLY");
      await pickCompleted(page);
      const text = await bodyText(page);
      assert(
        text.includes("Completed: Rooftop fan and roof discharge, Grease path and containment"),
        "Fan-only completed areas were wrong.",
      );
      assert(
        text.includes("Not part of this visit: Hood canopy and filters, Reachable plenum, duct path, and access"),
        "Fan-only excluded areas were not visible.",
      );
      assert(!text.includes("Not completed / not part of this visit:"), "Fan-only visit used failure wording for separate areas.");
    },
  },
  {
    id: "v10-filters-only-partial",
    vendor: "Vendor 10 - filters-only partial job",
    step: "review",
    run: async ({ page }) => {
      await pickVisitType(page, "FILTERS ONLY");
      await pickCompleted(page);
      const text = await bodyText(page);
      assert(text.includes("Completed: Hood canopy and filters"), "Filters-only completion not shown.");
      assert(text.includes("Not part of this visit:"), "Filters-only excluded areas missing.");
      assert(!text.includes("Not completed / not part of this visit:"), "Filters-only visit used failure wording for separate areas.");
      assert(text.includes("Rooftop fan and roof discharge"), "Fan exclusion missing for filters-only visit.");
    },
  },
  {
    id: "v11-duct-separate-not-this-visit",
    vendor: "Vendor 11 - duct separate from this visit",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, "Duct / access", "not-in-scope");
      const text = await bodyText(page);
      assert(
        text.includes("Not part of this visit: Reachable plenum, duct path, and access"),
        "Separate duct/access area missing from customer-safe boundary.",
      );
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Revisit copy").readiness === "not_applicable", "Separate area should not create revisit copy.");
    },
  },
  {
    id: "v12-grease-condition",
    vendor: "Vendor 12 - grease path condition quote",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, "Grease path", "condition-note");
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Follow-up quote copy").readiness === "ready", "Condition area did not make quote ready.");
      assert(outputRow(rows, "Revisit copy").readiness === "not_applicable", "Condition area should not create revisit copy.");
    },
  },
  {
    id: "v13-grease-not-completed",
    vendor: "Vendor 13 - grease path not completed",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, "Grease path", "not-done");
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Revisit copy").readiness === "ready", "Not-completed area did not make revisit ready.");
      assert(outputRow(rows, "Next-service copy").readiness === "needs_review", "Not-completed area did not hold next-service review.");
    },
  },
  {
    id: "v14-uncertain-photo-visible-nonblocking",
    vendor: "Vendor 14 - uncertain suggested photo stays visible without blocking",
    step: "photos",
    run: async ({ page }) => {
      await uploadBulkPhotos(page, ["clean-exhaust-duct.jpg"]);
      const text = await bodyText(page);
      assert(/saved, not claimed|extra evidence|saved as extra/i.test(text), "Uncertain photo was not kept visible as extra evidence.");
      assert(!/Use this as Access\?|PHOTO NEEDS ONE TAP|photo role still needs your choice/i.test(text), "Uncertain photo still created mandatory sorting work.");
      await clickVisibleButton(page, /^Pick result|Package|Package closeout/i);
      await pickCompleted(page);
      const rows = await goToOutputs(page);
      assert(rows.length > 0, "Outputs did not open after uncertain photo stayed unused.");
      assert(!/PHOTO NEEDS ONE TAP|photo role still needs your choice/i.test(await bodyText(page)), "Uncertain photo blocked generated outputs.");
    },
  },
  {
    id: "v15-misclassified-photo-corrected",
    vendor: "Vendor 15 - suggested access photo corrected to fan",
    step: "photos",
    run: async ({ page }) => {
      await uploadBulkPhotos(page, ["clean-exhaust-duct.jpg"]);
      const evidenceText = await waitForBodyText(
        page,
        /saved, not claimed|extra evidence|saved as extra/i,
      );
      assert(
        /saved, not claimed|extra evidence|saved as extra/i.test(evidenceText),
        "Uncertain access suggestion was not visible as extra evidence.",
      );
      await clickVisibleButton(page, /FIX PHOTO MATCHES|REVIEW PHOTOS|Fix photo matches|Review photos/i);
      await selectVisiblePhotoRole(page, "rooftop-fan");
      await clickVisibleButton(page, "Declare");
      const text = await bodyText(page);
      assert(/Fan[\s\S]{0,40}VENDOR CONFIRMED|Fan[\s\S]{0,40}AI ATTACHED/i.test(text), "Corrected photo role was not attached as fan.");
      assert(/1 confirmed/i.test(text), "Corrected photo did not stay confirmed.");
    },
  },
  {
    id: "v16-before-only-photo",
    vendor: "Vendor 16 - before photo without after",
    step: "photos",
    run: async ({ page }) => {
      await uploadSlotPhoto(page, "Upload Before photo", "dirty-hood-filter-wide.jpg");
      await clickVisibleButton(page, "Package");
      await pickCompleted(page);
      const text = await bodyText(page);
      assert(
        /Before\/after support is incomplete|UNCLEAR \/ NEEDS REVIEW|Need After|No after photo/i.test(text),
        "Missing after-photo boundary not shown.",
      );
    },
  },
  {
    id: "v17-after-only-photo",
    vendor: "Vendor 17 - after photo without before",
    step: "photos",
    run: async ({ page }) => {
      await uploadSlotPhoto(page, "Upload After photo", "clean-hood-before-after.jpg");
      await clickVisibleButton(page, "Package");
      await pickCompleted(page);
      const text = await bodyText(page);
      assert(
        /Before\/after support is incomplete|UNCLEAR \/ NEEDS REVIEW|Need Before|No before photo/i.test(text),
        "Missing before-photo boundary not shown.",
      );
    },
  },
  {
    id: "v18-outputs-page-edit",
    vendor: "Vendor 18 - outputs page area edit updates fanout",
    step: "review",
    run: async ({ page }) => {
      await pickCompleted(page);
      await goToOutputs(page);
      await selectVisibleAreaStatus(page, /Rooftop fan|Fan\b/, "could-not-access");
      const rows = await outputRows(page);
      assert(outputRow(rows, "Revisit copy").readiness === "ready", "Output-page area edit did not make revisit ready.");
      assert(outputRow(rows, "Follow-up quote copy").readiness === "not_applicable", "Fan block incorrectly made quote ready.");
    },
  },
  {
    id: "v19-mobile-minimal-closeout",
    vendor: "Vendor 19 - mobile minimal no-photo closeout",
    step: "photos",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page }) => {
      const note = "duct not part of this visit";
      await page.locator("#quickCloseoutNote").fill(note);
      await clickVisibleButton(page, "PACKAGE");
      await pickCompleted(page);
      assert((await page.locator("#quickCloseoutNote").inputValue()) === note, "Mobile quick note was lost.");
      assert((await bodyText(page)).includes("CUSTOMER-SAFE DRAFT"), "Mobile closeout preview missing.");
    },
  },
  {
    id: "v20-three-step-not-five-step",
    vendor: "Vendor 20 - IA stays closeout-first",
    step: "photos",
    run: async ({ page }) => {
      const buttons = await visibleButtonHandles(page);
      const stepText = buttons
        .slice(0, 8)
        .map((button) => button.text)
        .join("\n");
      assert(stepText.includes("DECLARE"), "Declare step missing.");
      assert(stepText.includes("PACKAGE"), "Package step missing.");
      assert(stepText.includes("SEND"), "Send step missing.");
      assert(!/\bRISK\b|\bSCOPE\b|\bPROOF\b|CONFIRM\/PAY|\bNEXT\b/.test(stepText), "Old 5-step IA visible in primary nav.");
    },
  },
];

async function runScenario(browser, baseUrl, scenario, index) {
  const startedAt = Date.now();
  const viewport = scenario.viewport || { width: 1365, height: 900 };
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: Boolean(viewport.isMobile),
    hasTouch: Boolean(viewport.hasTouch),
  });

  try {
    await goToScenario(page, baseUrl, scenario.id, scenario.step);
    await scenario.run({ page, baseUrl });

    return {
      index: index + 1,
      id: scenario.id,
      vendor: scenario.vendor,
      status: "passed",
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      index: index + 1,
      id: scenario.id,
      vendor: scenario.vendor,
      status: "failed",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const server = await startStaticServer();
  const browser = await playwright.chromium.launch({ headless: true });

  try {
    const results = [];

    for (let index = 0; index < vendorScenarios.length; index += 1) {
      const result = await runScenario(browser, server.baseUrl, vendorScenarios[index], index);
      results.push(result);
      const marker = result.status === "passed" ? "PASS" : "FAIL";
      console.log(`${marker} ${String(result.index).padStart(2, "0")} ${result.vendor}`);

      if (result.status === "failed") {
        console.log(`     ${result.error}`);
      }
    }

    const passed = results.filter((result) => result.status === "passed").length;
    const failed = results.length - passed;
    const report = {
      name: "Axis 1 unweighted 20-vendor smoke e2e",
      baseUrl: server.baseUrl,
      generatedAt: new Date().toISOString(),
      weighting: "none",
      total: results.length,
      passed,
      failed,
      results,
    };

    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nSummary: ${passed}/${results.length} passed, ${failed} failed.`);
    console.log(`Report: ${reportPath}`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close().catch(() => {});
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
