import playwright from "../frontend/node_modules/playwright/index.js";
import fs from "node:fs/promises";
import path from "node:path";

const { chromium } = playwright;

const baseUrl = process.argv[2] ?? "http://localhost:3013";
const outputRoot =
  process.argv[3] ??
  path.resolve("references", "axis1-validation-artifacts", "2026-05-01");

const pages = [
  { id: "tool", path: "/axis-1/tool", customer: false },
  { id: "clean", path: "/p/sample-clean-closeout", customer: true },
  { id: "blocked", path: "/p/sample-blocked-access", customer: true },
  { id: "condition", path: "/p/sample-condition-review", customer: true },
];

const viewports = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "mobile", width: 390, height: 844 },
];

const overclaimPattern =
  /\b(NFPA|compliance|pass\/fail|pass-fail|fire marshal|official certificate|AI-verified|verified cleaning|approval)\b/i;
const scopedOverclaimPattern = /\b(repair|inspection|inspected)\b/i;
const ctaPattern =
  /(Pay invoice|Reply after clearing access|Reply for access|Request follow-up quote|Request quote|Confirm next service|Download PDF|PDF record|Schedule next cleaning|Schedule service|Leave a review)/i;

function compactText(value, max = 160) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

await fs.mkdir(outputRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const target of pages) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.id === "mobile" ? 2 : 1,
      isMobile: viewport.id === "mobile",
      hasTouch: viewport.id === "mobile",
    });
    const page = await context.newPage();
    const consoleMessages = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        consoleMessages.push({
          type: message.type(),
          text: compactText(message.text(), 300),
        });
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(compactText(error.message, 300));
    });

    const url = `${baseUrl}${target.path}`;
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(600);

    const screenshotPath = path.join(outputRoot, `${target.id}-${viewport.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const scan = await page.evaluate(
      ({ target, ctaSource, overclaimSource, scopedSource }) => {
        const overclaim = new RegExp(overclaimSource, "i");
        const scopedOverclaim = new RegExp(scopedSource, "i");
        const cta = new RegExp(ctaSource, "i");
        const bodyText = document.body.innerText ?? "";
        const doc = document.documentElement;
        const body = document.body;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const allElements = Array.from(document.querySelectorAll("*"));

        const horizontalOverflow = Math.max(
          doc.scrollWidth - doc.clientWidth,
          body.scrollWidth - body.clientWidth,
        );

        const overflowingElements = allElements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
            const overflowsRight = rect.right > viewportWidth + 1;
            const overflowsLeft = rect.left < -1;
            const textOverflow =
              text.length > 0 &&
              element.scrollWidth > element.clientWidth + 2 &&
              !["hidden", "clip"].includes(style.overflowX);

            if (!overflowsRight && !overflowsLeft && !textOverflow) {
              return null;
            }

            return {
              tag: element.tagName.toLowerCase(),
              className: String(element.getAttribute("class") ?? "").slice(0, 120),
              text: text.slice(0, 160),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
              overflowsRight,
              overflowsLeft,
              textOverflow,
            };
          })
          .filter(Boolean)
          .slice(0, 20);

        const unnamedControls = Array.from(
          document.querySelectorAll("button, a, input, select, textarea"),
        )
          .map((element) => {
            const tag = element.tagName.toLowerCase();
            const type = element.getAttribute("type") ?? "";
            const label =
              element.getAttribute("aria-label") ??
              element.getAttribute("title") ??
              element.getAttribute("alt") ??
              element.textContent ??
              "";
            const id = element.id;
            const associatedLabel = id
              ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent
              : "";

            return {
              tag,
              type,
              hasName: Boolean(label.trim() || associatedLabel?.trim()),
              text: (label || associatedLabel || "").replace(/\s+/g, " ").trim().slice(0, 120),
              visible: Boolean(
                element.getClientRects().length &&
                  window.getComputedStyle(element).visibility !== "hidden",
              ),
            };
          })
          .filter((item) => item.visible && !item.hasName && item.type !== "hidden")
          .slice(0, 20);

        const imageAltIssues = Array.from(document.querySelectorAll("img"))
          .map((img) => ({
            src: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt"),
            visible: Boolean(img.getClientRects().length),
          }))
          .filter((img) => img.visible && img.alt === null)
          .slice(0, 20);

        const headings = Array.from(
          document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
        )
          .map((heading) => ({
            level: Number(heading.tagName.slice(1)),
            text: (heading.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 140),
          }))
          .filter((heading) => heading.text);

        const ctas = Array.from(document.querySelectorAll("a, button"))
          .map((element) => {
            const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
            const rect = element.getBoundingClientRect();

            return {
              text,
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              visible: Boolean(element.getClientRects().length),
              firstViewport: rect.top >= 0 && rect.top < viewportHeight,
              matches: cta.test(text),
            };
          })
          .filter((item) => item.visible && (item.matches || cta.test(item.text)))
          .slice(0, 30);

        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'))
          .map((input) => ({
            accept: input.getAttribute("accept") ?? "",
            multiple: input.hasAttribute("multiple"),
            visible: Boolean(input.getClientRects().length),
            id: input.id,
          }));

        const prohibitedMatches = bodyText.match(overclaim) ?? [];
        const scopedMatches = target.customer ? bodyText.match(scopedOverclaim) ?? [] : [];

        return {
          title: document.title,
          bodyText: bodyText.replace(/\s+/g, " ").trim().slice(0, 5000),
          horizontalOverflow,
          overflowingElements,
          unnamedControls,
          imageAltIssues,
          headings,
          ctas,
          fileInputs,
          prohibitedMatches: Array.from(new Set(prohibitedMatches)),
          scopedMatches: Array.from(new Set(scopedMatches)),
          bodyTextLength: bodyText.length,
        };
      },
      {
        target,
        ctaSource: ctaPattern.source,
        overclaimSource: overclaimPattern.source,
        scopedSource: scopedOverclaimPattern.source,
      },
    );

    results.push({
      id: target.id,
      path: target.path,
      url,
      customer: target.customer,
      viewport,
      status: response?.status() ?? null,
      screenshot: path.relative(process.cwd(), screenshotPath),
      consoleMessages,
      pageErrors,
      ...scan,
    });

    await context.close();
  }
}

await browser.close();

const output = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  results,
};

await fs.writeFile(
  path.join(outputRoot, "browser-scan.json"),
  JSON.stringify(output, null, 2),
);

console.log(`Wrote ${results.length} browser scans to ${outputRoot}`);
