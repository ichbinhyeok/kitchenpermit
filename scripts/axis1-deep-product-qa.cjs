#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const frontendDir = path.join(repoRoot, "frontend");
const outputDir = path.join(repoRoot, "output", "axis1-deep-product-qa");
const reportPath = path.join(outputDir, "report.json");
const playwright = require(path.join(frontendDir, "node_modules", "playwright"));

const defaultPort = Number(process.env.AXIS1_DEEP_QA_PORT || 3032);
const externalBaseUrl = process.env.AXIS1_DEEP_QA_BASE_URL;
const basePath = "/axis-1/tool";
const fixtureDir = path.join(frontendDir, "public", "axis1-test-photos");

const forbiddenCustomerCopyPattern =
  /NFPA|fire marshal|official inspection|pass\/fail|certificate|compliance approval|official approval|inspection passed/i;
const internalLanguagePattern =
  /job truth record|source of truth|private risk check|internal warning|vendor-only warning|scope ledger|risk module|static export|dynamic route|packet id query/i;

class DeepQaFailure extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "DeepQaFailure";
    this.details = details;
  }
}

function assert(condition, message, details) {
  if (!condition) {
    throw new DeepQaFailure(message, details);
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
      "frontend/out is missing. Run `cd frontend && npm run build` before deep product QA.",
    );
  }

  const baseUrl = `http://localhost:${defaultPort}`;

  if (await canReachServer(baseUrl)) {
    return { baseUrl, stop: async () => {} };
  }

  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const args =
    process.platform === "win32"
      ? ["/c", "npx", "serve@latest", "out", "-l", String(defaultPort)]
      : ["serve@latest", "out", "-l", String(defaultPort)];
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

async function bodyText(page) {
  return page.locator("body").innerText();
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
      await page.waitForTimeout(options.waitMs ?? 220);
      return button.accessibleText;
    }
  }

  if (options.optional) {
    return null;
  }

  throw new DeepQaFailure(`No visible enabled button matched ${matcher}`);
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
      await page.waitForTimeout(300);
      return text;
    }
  }

  throw new DeepQaFailure(`No visible area status select matched ${areaMatcher}`);
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

  throw new DeepQaFailure(`No visible area status select matched ${areaMatcher}`);
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

  throw new DeepQaFailure(`No visible photo role select contained ${roleValue}`);
}

async function pickCompleted(page) {
  await clickVisibleButton(page, /^COMPLETED|^Completed/);
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
  await clickVisibleButton(page, /^SEND|^Send|Go to Send|Continue to Send|Open Send/i, { waitMs: 400 });
  const rows = await outputRows(page);
  assert(rows.length > 0, "Send page did not show generated output rows.");
  return rows;
}

async function uploadBulkPhotos(page, fileNames) {
  await page.locator('input[aria-label="Upload job photos"]').setInputFiles(
    fileNames.map((fileName) => path.join(fixtureDir, fileName)),
  );
  await page.waitForTimeout(700);
}

async function drainVisiblePhotoReviewQueue(page, maxDecisions = 6) {
  const decisions = [];

  for (let index = 0; index < maxDecisions; index += 1) {
    const text = await bodyText(page);

    if (!/Review this photo|Photo needs one tap|photo role still needs your choice/i.test(text)) {
      return decisions;
    }

    const leaveOut = /kitchen-exhaust-fan|receipt|unrelated|Pick a role or leave it out/i.test(text);

    if (leaveOut) {
      await clickVisibleButton(page, "Leave out of output", { waitMs: 350 });
      decisions.push("left-out");
      continue;
    }

    const used = await clickVisibleButton(page, /^Use as /, {
      optional: true,
      waitMs: 350,
    });

    if (used) {
      decisions.push("used-suggested-role");
      continue;
    }

    await clickVisibleButton(page, "Leave out of output", { waitMs: 350 });
    decisions.push("left-out-fallback");
  }

  return decisions;
}

async function assertCustomerCopySafe(page) {
  const text = await bodyText(page);
  assert(
    !forbiddenCustomerCopyPattern.test(text),
    "Forbidden compliance/approval language appeared in customer-facing copy.",
  );
  assert(
    !internalLanguagePattern.test(text),
    "Internal product language leaked into customer/vendor-visible copy.",
  );
}

async function collectViewportAudit(page) {
  return page.evaluate(() => {
    const criticalSelector = [
      "button",
      "a[href]",
      "select",
      "textarea",
      "input:not([type='file'])",
      "[role='button']",
      "[data-axis-tool-step]",
      "[data-axis-tool-header]",
      ".tool-link-document-preview",
      ".tool-link-preview-shell",
      ".customer-web-packet",
      ".axis-output-row",
      "[data-axis-scope-review-panel]",
      "[data-quick-note-placement]",
    ].join(",");
    const clickSelector = [
      "button:not([disabled])",
      "a[href]",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "input:not([type='hidden']):not([type='file']):not([disabled])",
      "[role='button']",
    ].join(",");

    function visible(element) {
      if (
        element.closest(
          '[aria-hidden="true"], [hidden], [inert], [data-state="closed"], [data-sonner-toaster]',
        )
      ) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let ancestor = element.parentElement;

      while (ancestor && ancestor !== document.body) {
        const ancestorStyle = window.getComputedStyle(ancestor);
        const clips =
          /(hidden|auto|scroll|clip)/.test(ancestorStyle.overflow) ||
          /(hidden|auto|scroll|clip)/.test(ancestorStyle.overflowX) ||
          /(hidden|auto|scroll|clip)/.test(ancestorStyle.overflowY);

        if (clips) {
          const ancestorRect = ancestor.getBoundingClientRect();

          if (
            centerX < ancestorRect.left ||
            centerX > ancestorRect.right ||
            centerY < ancestorRect.top ||
            centerY > ancestorRect.bottom
          ) {
            return false;
          }
        }

        ancestor = ancestor.parentElement;
      }

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 1 &&
        rect.height > 1 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
      );
    }

    function selectorFor(element) {
      if (element.id) {
        return `#${element.id}`;
      }

      for (const attr of [
        "data-axis-tool-step",
        "data-axis-tool-header",
        "data-axis-scope-review-panel",
        "data-quick-note-placement",
        "data-readiness",
        "aria-label",
      ]) {
        const value = element.getAttribute(attr);
        if (value !== null && value !== "") {
          return `${element.tagName.toLowerCase()}[${attr}="${value.slice(0, 40)}"]`;
        }
      }

      const className = String(element.className || "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .join(".");
      return className
        ? `${element.tagName.toLowerCase()}.${className}`
        : element.tagName.toLowerCase();
    }

    function textFor(element) {
      return (element.innerText || element.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);
    }

    const doc = document.documentElement;
    const body = document.body;
    const horizontalOverflowPx = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
    const visibleElements = Array.from(document.querySelectorAll("body *")).filter((element) => {
      if (element.closest("[data-nextjs-toast]")) {
        return false;
      }
      return visible(element);
    });
    const overflow = [];
    const clipped = [];

    for (const element of visibleElements) {
      const rect = element.getBoundingClientRect();
      const tag = element.tagName.toLowerCase();
      const style = window.getComputedStyle(element);
      const critical = element.matches(criticalSelector);
      const text = textFor(element);
      const widthOverflow = element.scrollWidth - element.clientWidth;
      const heightOverflow = element.scrollHeight - element.clientHeight;
      const textCritical = /^(button|a|select|textarea|input|h1|h2|h3|p|span)$/i.test(tag);
      const scrollableContainer =
        /(auto|scroll|hidden)/.test(style.overflowY) &&
        !/^(button|a|select|textarea|input|h1|h2|h3)$/i.test(tag);

      if (widthOverflow > 3 && (critical || textCritical)) {
        overflow.push({
          selector: selectorFor(element),
          text,
          tag,
          critical,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        });
      }

      if (
        heightOverflow > 4 &&
        !scrollableContainer &&
        (critical || /^(button|a|select|textarea|input|h1|h2|h3)$/i.test(tag))
      ) {
        clipped.push({
          selector: selectorFor(element),
          text,
          tag,
          critical,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        });
      }
    }

    const coveredClickables = [];
    const clickables = Array.from(document.querySelectorAll(clickSelector)).filter(visible);

    for (const element of clickables) {
      const rect = element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) {
        continue;
      }

      if (
        rect.top < 4 ||
        rect.left < 4 ||
        rect.bottom > window.innerHeight - 4 ||
        rect.right > window.innerWidth - 4
      ) {
        continue;
      }

      const hit = document.elementFromPoint(cx, cy);
      const nearestInteractive = hit?.closest?.(clickSelector) || null;

      if (hit && hit !== element && !element.contains(hit) && nearestInteractive !== element) {
        coveredClickables.push({
          selector: selectorFor(element),
          text: textFor(element) || element.getAttribute("aria-label") || "",
          hitSelector: selectorFor(hit),
          hitText: textFor(hit),
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        });
      }
    }

    return {
      url: window.location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scrollY: Math.round(window.scrollY),
      horizontalOverflowPx,
      overflow,
      clipped,
      coveredClickables,
    };
  });
}

async function auditVisualIntegrity(page, label, options = {}) {
  const snapshots = [];
  const maxScroll = await page.evaluate(
    () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  );
  const scrollTargets = options.topOnly
    ? [0]
    : Array.from(new Set([0, Math.round(maxScroll * 0.33), Math.round(maxScroll * 0.66), maxScroll]));

  for (const y of scrollTargets) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(120);
    snapshots.push(await collectViewportAudit(page));
  }

  await page.evaluate(() => window.scrollTo(0, 0));

  const horizontal = snapshots.filter((snapshot) => snapshot.horizontalOverflowPx > 1);
  const overflow = snapshots.flatMap((snapshot) =>
    snapshot.overflow.map((issue) => ({ ...issue, scrollY: snapshot.scrollY })),
  );
  const clipped = snapshots.flatMap((snapshot) =>
    snapshot.clipped.map((issue) => ({ ...issue, scrollY: snapshot.scrollY })),
  );
  const coveredClickables = snapshots.flatMap((snapshot) =>
    snapshot.coveredClickables.map((issue) => ({ ...issue, scrollY: snapshot.scrollY })),
  );
  const hardOverflow = overflow.filter(
    (issue) => issue.critical || /^(button|a|select|textarea|input|h1|h2|h3)$/i.test(issue.tag),
  );
  const hardClipped = clipped.filter(
    (issue) => issue.critical || /^(button|a|select|textarea|input|h1|h2|h3)$/i.test(issue.tag),
  );

  assert(horizontal.length === 0, `${label}: horizontal page overflow`, { horizontal });
  assert(hardOverflow.length === 0, `${label}: visible text/control overflow`, {
    overflow: hardOverflow.slice(0, 12),
  });
  assert(hardClipped.length === 0, `${label}: visible heading/control clipping`, {
    clipped: hardClipped.slice(0, 12),
  });
  assert(coveredClickables.length === 0, `${label}: visible click target is covered`, {
    coveredClickables: coveredClickables.slice(0, 12),
  });

  return {
    snapshots,
    overflowCount: overflow.length,
    clippedCount: clipped.length,
    coveredClickablesCount: coveredClickables.length,
  };
}

async function assertMenuUsable(page) {
  await clickVisibleButton(page, "Menu", { waitMs: 200 });
  const menuState = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a")).filter((link) =>
      ["Sample", "Product", "Setup"].includes((link.textContent || "").trim()),
    );

    return links.map((link) => {
      const rect = link.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        text: (link.textContent || "").trim(),
        visible: rect.width > 1 && rect.height > 1,
        clickable: hit === link || link.contains(hit),
        hitText: (hit?.textContent || "").trim().slice(0, 80),
      };
    });
  });

  assert(menuState.length === 3, "Menu did not expose Sample/Product/Setup links.", {
    menuState,
  });
  assert(
    menuState.every((item) => item.visible && item.clickable),
    "Menu link is visible but covered or not clickable.",
    { menuState },
  );
  await clickVisibleButton(page, "Menu", { waitMs: 150 });
  await page.waitForTimeout(150);
  const stillOpen = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a")).some((link) =>
      ["Sample", "Product", "Setup"].includes((link.textContent || "").trim()) &&
      link.getBoundingClientRect().width > 1 &&
      link.getBoundingClientRect().height > 1,
    ),
  );
  assert(!stillOpen, "Menu did not close after toggling the menu button.");
}

async function assertToolIsCloseoutFirst(page) {
  const text = await bodyText(page);
  assert(text.includes("Pick what happened"), "First screen does not lead with job result.");
  assert(/job result/i.test(text), "First screen does not show compact result picker.");
  assert(/declare/i.test(text), "First screen is not framed around declaration.");
  assert(/photos optional|optional proof|photos and notes improve/i.test(text), "First screen does not keep photos optional.");
  assert(!/\bRisk\b[\s\S]{0,80}\bScope\b[\s\S]{0,80}\bProof\b/i.test(text), "Old risk/scope/proof workflow leaked into primary flow.");
}

async function assertOutputsBeforeFormWork(page) {
  const layout = await page.evaluate(() => {
    const firstOutput = document.querySelector(".axis-output-row");
    const visibleSelects = Array.from(document.querySelectorAll("select")).filter((select) => {
      const rect = select.getBoundingClientRect();
      const style = window.getComputedStyle(select);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 1 &&
        rect.height > 1 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      );
    });
    const firstSelect = visibleSelects[0];
    const outputRect = firstOutput?.getBoundingClientRect();
    const selectRect = firstSelect?.getBoundingClientRect();
    return {
      firstOutputTop: outputRect ? Math.round(outputRect.top) : null,
      firstSelectTop: selectRect ? Math.round(selectRect.top) : null,
      outputText: firstOutput?.textContent?.replace(/\s+/g, " ").trim().slice(0, 160) || "",
    };
  });

  assert(layout.firstOutputTop !== null, "Outputs page did not show output fanout first.");
  assert(
    layout.firstSelectTop === null || layout.firstOutputTop <= layout.firstSelectTop,
    "Outputs page shows area editing before generated outputs.",
    layout,
  );
}

async function runCase(browser, baseUrl, testCase, index) {
  const startedAt = Date.now();
  const viewport = testCase.viewport || { width: 1365, height: 900 };
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: Boolean(viewport.isMobile),
    hasTouch: Boolean(viewport.hasTouch),
  });

  try {
    await testCase.run({ page, baseUrl });
    return {
      index: index + 1,
      id: testCase.id,
      persona: testCase.persona,
      status: "passed",
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    const screenshotPath = path.join(outputDir, `${String(index + 1).padStart(2, "0")}-${testCase.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    return {
      index: index + 1,
      id: testCase.id,
      persona: testCase.persona,
      status: "failed",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof DeepQaFailure ? error.details : undefined,
      screenshotPath,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

const testCases = [
  {
    id: "vendor-01-mobile-cold-start",
    persona: "Cold mobile vendor, first time, no photos yet",
    viewport: { width: 320, height: 700, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v01&step=photos`, { waitUntil: "networkidle" });
      await assertToolIsCloseoutFirst(page);
      await auditVisualIntegrity(page, "mobile cold start");
      await assertMenuUsable(page);
    },
  },
  {
    id: "vendor-02-mobile-note-to-blocked-fan",
    persona: "Crew lead types only one note: locked roof hatch",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      const note = "fan access blocked by locked roof hatch";
      await page.goto(`${baseUrl}${basePath}?qa=deep-v02&step=photos`, { waitUntil: "networkidle" });
      await page.locator("#quickCloseoutNote").fill(note);
      await clickVisibleButton(page, "Package");
      await pickCompleted(page);
      assert((await page.locator("#quickCloseoutNote").inputValue()) === note, "Quick note did not persist.");
      assert(
        (await getVisibleAreaStatus(page, "Rooftop fan")) === "could-not-access",
        "Locked roof hatch note was not applied to rooftop fan status.",
      );
      assert(
        !/vendor note needs placement/i.test(await bodyText(page)),
        "Applied quick note still appears as unplaced.",
      );
      assert(
        (await getVisibleAreaStatus(page, "Duct / access")) === "done-no-photo",
        "Fan note changed duct/access status.",
      );
      await auditVisualIntegrity(page, "mobile note to blocked fan");
    },
  },
  {
    id: "vendor-03-mobile-outputs-first",
    persona: "Busy vendor wants copy/link/payment output, not another form",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v03&step=review`, { waitUntil: "networkidle" });
      await pickCompleted(page);
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Customer handoff link").readiness === "ready", "Customer link should be ready.");
      const text = await bodyText(page);
      assert(/written closeout record|no field photos attached/i.test(text), "No-photo payment/output copy did not disclose written-record basis.");
      await assertOutputsBeforeFormWork(page);
      await auditVisualIntegrity(page, "mobile outputs first");
    },
  },
  {
    id: "vendor-04-desktop-rooftop-blocked-only",
    persona: "Owner fixes one wrong AI area status after a clean draft",
    viewport: { width: 1440, height: 920 },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v04&step=review`, { waitUntil: "networkidle" });
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, "Rooftop fan", "could-not-access");
      assert(
        (await getVisibleAreaStatus(page, "Duct / access")) === "done-no-photo",
        "Rooftop edit silently changed duct/access.",
      );
      const text = await bodyText(page);
      assert(text.includes("Blocked / no access: Rooftop fan and roof discharge"), "Rooftop blocked copy missing.");
      assert(
        !text.includes("Blocked / no access: Reachable plenum, duct path, and access, Rooftop fan and roof discharge"),
        "Duct/access was bundled into rooftop fan blocked copy.",
      );
      await goToOutputs(page);
      await auditVisualIntegrity(page, "desktop rooftop blocked only");
    },
  },
  {
    id: "vendor-05-filters-only-commercial-copy",
    persona: "Filters-only vendor protecting against full-scope failure language",
    viewport: { width: 1365, height: 900 },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v05&step=review`, { waitUntil: "networkidle" });
      await pickVisitType(page, "FILTERS ONLY");
      await pickCompleted(page);
      const text = await bodyText(page);
      assert(text.includes("Not part of this visit:"), "Excluded areas are not separated.");
      assert(!text.includes("Not completed / not part of this visit:"), "Narrow visit uses failure wording.");
      await auditVisualIntegrity(page, "filters-only review");
    },
  },
  {
    id: "vendor-06-condition-no-photo",
    persona: "Condition found, quote needed, no condition photo captured",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v06&step=review`, { waitUntil: "networkidle" });
      await pickCondition(page);
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Follow-up quote copy").readiness === "ready", "Condition did not make quote follow-up ready.");
      const text = await bodyText(page);
      assert(!text.includes("Condition photo attached"), "No-photo condition claimed photo proof.");
      await assertCustomerCopySafe(page);
      await auditVisualIntegrity(page, "condition no photo");
    },
  },
  {
    id: "vendor-07-misclassified-photo-correction",
    persona: "Phone photo is held out of proof until vendor optionally corrects it to fan",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v07&step=photos`, { waitUntil: "networkidle" });
      await uploadBulkPhotos(page, ["clean-exhaust-duct.jpg"]);
      const uploadedText = await bodyText(page);
      assert(/saved, not claimed|extra evidence|saved as extra/i.test(uploadedText), "Uncertain photo was not kept visible as extra evidence.");
      assert(!/photo role still needs your choice|Photo needs one tap/i.test(uploadedText), "Uncertain photo still created mandatory review work.");
      await clickVisibleButton(page, /FIX PHOTO MATCHES|REVIEW PHOTOS|Fix photo matches|Review photos/i);
      await selectVisiblePhotoRole(page, "rooftop-fan");
      assert(
        !/photo role still needs your choice/i.test(await bodyText(page)),
        "Manual photo role correction left stale pending warning.",
      );
      await auditVisualIntegrity(page, "misclassified photo correction");
    },
  },
  {
    id: "vendor-08-four-photo-phone-dump-no-required-queue",
    persona: "Crew lead uploads a four-photo phone dump without getting a required sorting queue",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-v08&step=photos`, { waitUntil: "networkidle" });
      await uploadBulkPhotos(page, [
        "clean-exhaust-duct.jpg",
        "kitchen-exhaust-fan.jpg",
        "grease-removed-bucket.jpg",
        "rooftop-fan-cleaning.jpg",
      ]);
      const before = Date.now();
      const decisions = await drainVisiblePhotoReviewQueue(page, 6);
      const elapsedMs = Date.now() - before;
      const text = await bodyText(page);

      assert(decisions.length === 0, "Four-photo dump still created required photo decisions.", {
        decisions,
      });
      assert(elapsedMs < 1200, "Photo decision drain should return immediately when photos are optional.", {
        elapsedMs,
        decisions,
      });
      assert(/saved, not claimed|extra evidence|saved as extra/i.test(text), "Uncertain photos were not visible as extra evidence candidates.");
      assert(!/photo role still needs your choice|Photo needs one tap|Use this as/i.test(text), "Photo dump still looked like mandatory classification work.");
      await clickVisibleButton(page, /^Pick result|Package|Package closeout/i);
      await pickCompleted(page);
      await goToOutputs(page);
      assert(!/photo role still needs your choice|Photo needs one tap/i.test(await bodyText(page)), "Outputs were still gated by photo classification.");
      await auditVisualIntegrity(page, "four photo phone dump no required queue");
    },
  },
  {
    id: "customer-01-clean-mobile-link",
    persona: "Restaurant manager opens a clean closeout link on phone",
    viewport: { width: 320, height: 700, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/p/sample-clean-closeout`, { waitUntil: "networkidle" });
      await assertCustomerCopySafe(page);
      await auditVisualIntegrity(page, "clean customer mobile link");
    },
  },
  {
    id: "customer-02-condition-mobile-link",
    persona: "Customer reads a condition record without photo evidence",
    viewport: { width: 320, height: 700, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/p/sample-condition-review`, { waitUntil: "networkidle" });
      const text = await bodyText(page);
      assert(!text.includes("Condition photo attached"), "Customer condition link claimed photo proof.");
      assert(!text.includes("Blocked access photo + next action"), "Condition link used blocked-access photo language.");
      assert(!/Rear duct access panel[\s\S]{0,120}(blocked|not represented)/i.test(text), "Condition link leaked blocked access row.");
      await assertCustomerCopySafe(page);
      await auditVisualIntegrity(page, "condition customer mobile link");
    },
  },
  {
    id: "customer-03-blocked-desktop-link",
    persona: "Manager checks why an area needs revisit",
    viewport: { width: 1440, height: 920 },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/p/sample-blocked-access`, { waitUntil: "networkidle" });
      const text = await bodyText(page);
      assert(text.includes("blocked") || text.includes("Blocked"), "Blocked access reason is not visible.");
      await assertCustomerCopySafe(page);
      await auditVisualIntegrity(page, "blocked customer desktop link");
    },
  },
  {
    id: "ux-01-tablet-review-layout",
    persona: "UX reviewer looking for tablet transition defects",
    viewport: { width: 768, height: 1024, isMobile: false },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-ux01&step=review`, { waitUntil: "networkidle" });
      await pickCompleted(page);
      await auditVisualIntegrity(page, "tablet review layout");
    },
  },
  {
    id: "dev-01-generated-output-consistency",
    persona: "Senior dev checking output fanout after output-page area edit",
    viewport: { width: 1365, height: 900 },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-dev01&step=review`, { waitUntil: "networkidle" });
      await pickCompleted(page);
      await goToOutputs(page);
      await selectVisibleAreaStatus(page, /Grease path|containment/i, "condition-note");
      const rows = await outputRows(page);
      assert(outputRow(rows, "Follow-up quote copy").readiness === "ready", "Condition area did not update quote output.");
      assert(outputRow(rows, "Revisit copy").readiness === "not_applicable", "Condition area incorrectly generated revisit output.");
      await auditVisualIntegrity(page, "output-page consistency edit");
    },
  },
  {
    id: "dev-02-grease-not-completed-copy",
    persona: "Senior dev checking non-access incomplete copy",
    viewport: { width: 1365, height: 900 },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}${basePath}?qa=deep-dev02&step=review`, { waitUntil: "networkidle" });
      await pickCompleted(page);
      await selectVisibleAreaStatus(page, /Grease path|containment/i, "not-done");
      const rows = await goToOutputs(page);
      assert(outputRow(rows, "Revisit copy").readiness === "ready", "Grease not-completed area did not make revisit ready.");
      const text = await bodyText(page);
      assert(!/Access action should be cleared/i.test(text), "Grease not-completed copy was mislabeled as an access action.");
      assert(/Review incomplete area|completion needs review/i.test(text), "Grease not-completed copy did not explain the incomplete area.");
      await auditVisualIntegrity(page, "grease not completed output copy");
    },
  },
  {
    id: "customer-04-local-missing-record-id",
    persona: "Customer opens a malformed local link",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    run: async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/p/local`, { waitUntil: "networkidle" });
      const text = await bodyText(page);
      assert(/missing its record id/i.test(text), "Malformed local link did not explain the missing record safely.");
      assert(!internalLanguagePattern.test(text), "Malformed local link leaked implementation language.");
      await auditVisualIntegrity(page, "local missing record id");
    },
  },
];

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const server = await startStaticServer();
  const browser = await playwright.chromium.launch({ headless: true });

  try {
    const results = [];

    for (let index = 0; index < testCases.length; index += 1) {
      const result = await runCase(browser, server.baseUrl, testCases[index], index);
      results.push(result);
      const marker = result.status === "passed" ? "PASS" : "FAIL";
      console.log(`${marker} ${String(result.index).padStart(2, "0")} ${result.persona}`);

      if (result.status === "failed") {
        console.log(`     ${result.error}`);
      }
    }

    const passed = results.filter((result) => result.status === "passed").length;
    const failed = results.length - passed;
    const report = {
      name: "Axis 1 deep product QA",
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
