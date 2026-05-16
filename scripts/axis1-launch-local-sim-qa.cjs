#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const repoRoot = path.resolve(__dirname, "..");
const frontendDir = path.join(repoRoot, "frontend");
const baseUrl = process.env.AXIS1_SIM_BASE_URL || "http://127.0.0.1:8096";
const outputDir = path.resolve(
  process.env.AXIS1_SIM_OUTPUT_DIR ||
    path.join(repoRoot, "references", "axis1-launch-qa", "local-sim-2026-05-14"),
);
const screenshotDir = path.join(outputDir, "screenshots");
const accountEmail = process.env.AXIS1_SIM_EMAIL || "admin@kitchenpermit.com";
const accountPassword = process.env.AXIS1_SIM_PASSWORD || "correct-horse-1";
const generatedAt = new Date().toISOString();
const fixtureDir = path.join(frontendDir, "public", "axis1-test-photos");
const playwright = require(path.join(frontendDir, "node_modules", "playwright"));

const photoSlots = [
  "hood-before",
  "hood-after",
  "filter-bank",
  "access-condition",
  "rooftop-fan",
  "grease-containment",
  "service-label",
];

const forbiddenCustomerCopyPattern =
  /\bproof link\b|mailto:|invoice|payment link|pay now|backend pdfbox|api\/axis1\/assets\/.*service-report\.pdf/i;
const internalLanguagePattern =
  /\bjob truth record|source of truth|private risk check|vendor-only warning|scope ledger|packet id query|static export|dynamic route/i;

class QaFailure extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "QaFailure";
    this.details = details;
  }
}

function assert(condition, message, details) {
  if (!condition) {
    throw new QaFailure(message, details);
  }
}

function includesCopy(text, needle) {
  return text.toLowerCase().includes(String(needle).toLowerCase());
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mimeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

function dataUrlFor(relativeFixturePath) {
  const absolutePath = path.join(fixtureDir, relativeFixturePath);
  const bytes = fs.readFileSync(absolutePath);
  return `data:${mimeFor(absolutePath)};base64,${bytes.toString("base64")}`;
}

async function logoDataUrl() {
  const sharp = require(path.join(frontendDir, "node_modules", "sharp"));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
      <rect width="480" height="180" rx="24" fill="#123A2F"/>
      <rect x="34" y="34" width="112" height="112" rx="18" fill="#F7F1E9"/>
      <path d="M63 104c33-23 55-23 82 0" fill="none" stroke="#D76A2D" stroke-width="14" stroke-linecap="round"/>
      <path d="M69 72h71v22H69z" fill="#123A2F"/>
      <text x="174" y="78" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="800" fill="#F7F1E9">Kitchen Permit</text>
      <text x="174" y="118" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#D8E7D1">Hood Service</text>
    </svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

function splitSetCookie(headerValue) {
  if (!headerValue) {
    return [];
  }

  return headerValue.split(/,(?=\s*[^;,=\s]+=[^;,]*)/g).map((item) => item.trim());
}

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  apply(headers) {
    const fromNative =
      typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    const fromCombined = splitSetCookie(headers.get("set-cookie"));

    [...fromNative, ...fromCombined].forEach((cookie) => {
      const [pair] = cookie.split(";");
      const separator = pair.indexOf("=");

      if (separator === -1) {
        return;
      }

      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();

      if (name) {
        this.cookies.set(name, value);
      }
    });
  }

  header() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  playwrightCookies(targetBaseUrl) {
    const parsed = new URL(targetBaseUrl);

    return Array.from(this.cookies.entries()).map(([name, value]) => ({
      name,
      value,
      domain: parsed.hostname,
      path: "/",
      httpOnly: name.toLowerCase().includes("session"),
      secure: parsed.protocol === "https:",
      sameSite: "Lax",
    }));
  }
}

async function httpRequest(pathname, options = {}, jar) {
  const headers = new Headers(options.headers || {});

  if (jar && jar.header()) {
    headers.set("Cookie", jar.header());
  }

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
  }

  const response = await fetch(new URL(pathname, baseUrl), {
    method: options.method || "GET",
    redirect: options.redirect || "manual",
    headers,
    body:
      options.body !== undefined
        ? options.body
        : options.json !== undefined
          ? JSON.stringify(options.json)
          : undefined,
  });

  if (jar) {
    jar.apply(response.headers);
  }

  return response;
}

async function readJsonResponse(response, label) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch (error) {
    throw new QaFailure(`${label} did not return JSON`, {
      status: response.status,
      text: text.slice(0, 600),
      error: error.message,
    });
  }
}

async function assertServerReady() {
  const response = await httpRequest("/api/account/entitlements", {
    headers: { Accept: "application/json" },
  });
  assert(response.ok, "Local Axis 1 server is not ready.", {
    status: response.status,
    baseUrl,
  });
}

async function signupOrLogin() {
  const jar = new CookieJar();
  const signupBody = new URLSearchParams({
    email: accountEmail,
    password: accountPassword,
    confirmPassword: accountPassword,
    next: "/dashboard",
  });
  const signup = await httpRequest(
    "/auth/signup",
    {
      method: "POST",
      body: signupBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
    jar,
  );
  const signupLocation = signup.headers.get("location") || "";

  if (signupLocation.includes("auth=exists")) {
    const loginJar = new CookieJar();
    const loginBody = new URLSearchParams({
      email: accountEmail,
      password: accountPassword,
      next: "/dashboard",
    });
    const login = await httpRequest(
      "/auth/login",
      {
        method: "POST",
        body: loginBody,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      loginJar,
    );
    const loginLocation = login.headers.get("location") || "";

    assert(
      login.status >= 300 &&
        login.status < 400 &&
        !loginLocation.includes("auth=failed"),
      "Existing local admin account could not be logged in.",
      { status: login.status, loginLocation },
    );

    return { jar: loginJar, mode: "login" };
  }

  assert(signup.status >= 300 && signup.status < 400, "Signup failed.", {
    status: signup.status,
    signupLocation,
  });

  return { jar, mode: "signup" };
}

async function saveCompanyProfile(jar) {
  const profile = {
    companyName: "Kitchen Permit Hood Service",
    serviceArea: "Los Angeles County | restaurant hood cleaning records",
    directLine: "(213) 555-0196",
    dispatchEmail: "dispatch@kitchenpermit.example",
    afterHoursPhone: "(213) 555-0199",
    certification: "CA KEC service record / crew KP-14",
    technicianLabel: "Maria J. / Night crew KP-14",
    brandInitials: "KP",
    logoUrl: await logoDataUrl(),
    brandColor: "#1F7A4D",
  };
  const response = await httpRequest(
    "/api/account/company-profile",
    { method: "PUT", json: profile },
    jar,
  );
  const body = await readJsonResponse(response, "Company profile save");

  assert(response.ok, "Company profile save failed.", {
    status: response.status,
    body,
  });
  assert(body.companyName === profile.companyName, "Company profile did not persist.");
  assert(body.brandColor === "#1F7A4D", "Brand accent color was not normalized/persisted.", {
    body,
  });

  return body;
}

function emptyUploadedPhotos() {
  return Object.fromEntries(photoSlots.map((slot) => [slot, null]));
}

function emptyPhotoResolutions() {
  return Object.fromEntries(photoSlots.map((slot) => [slot, "open"]));
}

function buildUploadedPhotos(assignments) {
  const photos = emptyUploadedPhotos();

  Object.entries(assignments || {}).forEach(([slotId, fileName]) => {
    photos[slotId] = {
      src: dataUrlFor(fileName),
      name: fileName,
      source: "manual",
      confidence: "manual",
      matchLabel: "Launch QA field photo",
      vendorDecision: "confirmed",
    };
  });

  return photos;
}

function buildPhotoResolutions(assignments, overrides = {}) {
  const resolutions = emptyPhotoResolutions();

  photoSlots.forEach((slotId) => {
    if (assignments && assignments[slotId]) {
      resolutions[slotId] = "open";
      return;
    }

    resolutions[slotId] = overrides[slotId] || "not-captured";
  });

  return resolutions;
}

function reportPayload(testCase, productPlan) {
  const photoAssignments = testCase.photos || {};

  return {
    productPlan,
    values: {
      scenario: testCase.scenario,
      propertyName: testCase.propertyName,
      siteCity: testCase.siteCity,
      serviceDate: testCase.serviceDate,
      authorizedBy: testCase.authorizedBy,
      cadence: testCase.cadence,
      serviceWindow: testCase.serviceWindow,
      systemName: testCase.systemName,
      exceptionKinds: testCase.exceptionKinds || [],
      exceptionNote: testCase.exceptionNote || "",
      followUpMode: testCase.followUpMode,
      followUpNote: testCase.followUpNote || "",
      summaryOverride: testCase.summaryOverride || "",
      customerActionOverride: testCase.customerActionOverride || "",
      followUpOverride: testCase.followUpOverride || "",
      recordNoteOverride: testCase.recordNoteOverride || "",
    },
    uploadedFieldPhotos: buildUploadedPhotos(photoAssignments),
    photoSlotResolutions: buildPhotoResolutions(
      photoAssignments,
      testCase.photoResolutions || {},
    ),
    links: {},
    presentationMode: "standard",
    visibleSections: {
      photos: true,
      checklist: true,
      routeDetail: true,
      nextService: true,
    },
    qaSeed: {
      id: testCase.id,
      generatedAt,
      purpose: "Axis 1 launch local simulation",
    },
  };
}

const companyCases = [
  {
    id: "marigold-main-clean-may",
    scenario: "clean",
    propertyName: "Marigold Diner",
    siteCity: "Los Angeles, CA",
    serviceDate: "2026-02-15",
    authorizedBy: "Luis, closing manager",
    cadence: "90",
    serviceWindow: "01:20-03:15",
    systemName: "Main cookline hood",
    followUpMode: "none",
    summaryOverride:
      "Accessible hood interior, filter bank, and reachable plenum were cleaned and closed during the overnight visit.",
    customerActionOverride:
      "Reply to confirm the next 90-day service window before May 16, 2026.",
    recordNoteOverride:
      "Keep this service report with manager review, landlord, and insurance documentation.",
    photos: {
      "hood-before": "clean-hood-before-after.jpg",
      "hood-after": "hood-filters-installed.jpg",
      "filter-bank": "clean-exhaust-duct.jpg",
      "rooftop-fan": "rooftop-fan-cleaning.jpg",
      "grease-containment": "grease-removed-bucket.jpg",
    },
    photoResolutions: {
      "access-condition": "not-applicable",
      "service-label": "not-captured",
    },
  },
  {
    id: "canal-tacos-access-past-due",
    scenario: "exception",
    propertyName: "Canal Street Tacos",
    siteCity: "Glendale, CA",
    serviceDate: "2026-02-02",
    authorizedBy: "Angela, assistant manager",
    cadence: "90",
    serviceWindow: "23:45-01:35",
    systemName: "Tortilla line exhaust",
    exceptionKinds: ["blocked-storage"],
    exceptionNote:
      "Stored dry-goods racks blocked the rear duct access panel during service.",
    followUpMode: "monitor",
    followUpNote:
      "Clear the rear access path before the next visit so the section can be checked without delaying the line.",
    customerActionOverride:
      "Clear the rear access path and reply so dispatch can schedule the open access check.",
    photos: {
      "hood-after": "hood-filters-installed.jpg",
      "access-condition": "grease-duct-before-cleaning.jpg",
      "filter-bank": "clean-exhaust-duct.jpg",
      "rooftop-fan": "kitchen-exhaust-fan.jpg",
    },
    photoResolutions: {
      "hood-before": "not-captured",
      "grease-containment": "not-captured",
      "service-label": "not-captured",
    },
  },
  {
    id: "northside-grill-rooftop-quote",
    scenario: "exception",
    propertyName: "Northside Grill",
    siteCity: "Pasadena, CA",
    serviceDate: "2026-04-23",
    authorizedBy: "Dina, general manager",
    cadence: "60",
    serviceWindow: "02:10-04:05",
    systemName: "Charbroiler hood line",
    exceptionKinds: ["rooftop-hinge-curb"],
    exceptionNote:
      "Rooftop fan hinge/curb condition was visible during service and should be reviewed before the next heavy-volume weekend.",
    followUpMode: "quote",
    followUpNote:
      "Reply if you want a quote review for the rooftop hinge and curb condition.",
    customerActionOverride:
      "Review the rooftop condition and reply if you want a quote before the next service window.",
    photos: {
      "hood-before": "clean-hood-before-after.jpg",
      "hood-after": "hood-filters-installed.jpg",
      "rooftop-fan": "fan-before-after.jpg",
      "grease-containment": "grease-system-before.jpg",
    },
    photoResolutions: {
      "filter-bank": "not-captured",
      "access-condition": "not-applicable",
      "service-label": "not-captured",
    },
  },
  {
    id: "harbor-wok-thirty-day",
    scenario: "clean",
    propertyName: "Harbor Wok",
    siteCity: "Long Beach, CA",
    serviceDate: "2026-04-29",
    authorizedBy: "Mei, owner",
    cadence: "30",
    serviceWindow: "00:35-02:20",
    systemName: "High-volume wok line",
    followUpMode: "none",
    summaryOverride:
      "Accessible hood line and filter bank were cleaned after a heavy grease-load service cycle.",
    customerActionOverride:
      "Confirm the next 30-day service window so the high-volume line stays on schedule.",
    photos: {
      "hood-before": "dirty-hood-filter-closeup.jpg",
      "hood-after": "hood-filters-installed.jpg",
      "filter-bank": "clean-exhaust-duct.jpg",
      "grease-containment": "grease-removed-bucket.jpg",
    },
    photoResolutions: {
      "access-condition": "not-applicable",
      "rooftop-fan": "not-captured",
      "service-label": "not-captured",
    },
  },
  {
    id: "blue-line-pizza-written-record",
    scenario: "clean",
    propertyName: "Blue Line Pizza",
    siteCity: "Burbank, CA",
    serviceDate: "2026-05-08",
    authorizedBy: "Rosa, shift lead",
    cadence: "30",
    serviceWindow: "03:05-04:15",
    systemName: "Oven hood and make-line exhaust",
    followUpMode: "none",
    summaryOverride:
      "Service was closed from the written crew record because no field photos were attached to this link.",
    customerActionOverride:
      "Keep the PDF copy with the store service record and reply if the next 30-day date needs to move.",
    photos: {},
    photoResolutions: {
      "hood-before": "not-captured",
      "hood-after": "not-captured",
      "filter-bank": "not-captured",
      "access-condition": "not-applicable",
      "rooftop-fan": "not-captured",
      "grease-containment": "not-captured",
      "service-label": "not-captured",
    },
  },
  {
    id: "elm-market-containment-monitor",
    scenario: "exception",
    propertyName: "Elm Market Kitchen",
    siteCity: "Santa Monica, CA",
    serviceDate: "2026-03-14",
    authorizedBy: "Noah, facilities",
    cadence: "90",
    serviceWindow: "22:50-00:30",
    systemName: "Market prep hood",
    exceptionKinds: ["grease-containment"],
    exceptionNote:
      "Grease containment path was recorded for review after the cleaning close-out.",
    followUpMode: "monitor",
    followUpNote:
      "Monitor the containment path and reply if you want a quote review before the next scheduled service.",
    customerActionOverride:
      "Review the containment note and confirm whether a follow-up quote should be opened.",
    photos: {
      "hood-before": "clean-hood-before-after.jpg",
      "hood-after": "hood-filters-installed.jpg",
      "grease-containment": "grease-system-before.jpg",
      "rooftop-fan": "kitchen-exhaust-fan.jpg",
    },
    photoResolutions: {
      "filter-bank": "not-captured",
      "access-condition": "not-applicable",
      "service-label": "not-captured",
    },
  },
  {
    id: "marigold-main-previous-cycle",
    scenario: "clean",
    propertyName: "Marigold Diner",
    siteCity: "Los Angeles, CA",
    serviceDate: "2025-11-17",
    authorizedBy: "Luis, closing manager",
    cadence: "90",
    serviceWindow: "01:30-03:00",
    systemName: "Main cookline hood",
    followUpMode: "none",
    customerActionOverride:
      "Prior service record retained for manager review and service history.",
    photos: {
      "hood-after": "hood-filters-installed.jpg",
      "filter-bank": "clean-exhaust-duct.jpg",
    },
    photoResolutions: {
      "hood-before": "not-captured",
      "access-condition": "not-applicable",
      "rooftop-fan": "not-captured",
      "grease-containment": "not-captured",
      "service-label": "not-captured",
    },
  },
];

const freeCases = [
  {
    id: "free-no-login-clean",
    scenario: "clean",
    propertyName: "Free Trial Bistro",
    siteCity: "Anaheim, CA",
    serviceDate: "2026-05-13",
    authorizedBy: "Trial manager",
    cadence: "90",
    serviceWindow: "02:00-03:10",
    systemName: "Main hood test report",
    followUpMode: "none",
    customerActionOverride:
      "This is a no-login test link. Use the company version for saved branding and history.",
    photos: {
      "hood-after": "hood-filters-installed.jpg",
      "filter-bank": "clean-exhaust-duct.jpg",
    },
    photoResolutions: {
      "hood-before": "not-captured",
      "access-condition": "not-applicable",
      "rooftop-fan": "not-captured",
      "grease-containment": "not-captured",
      "service-label": "not-captured",
    },
  },
  {
    id: "free-spoof-brand-blocked",
    scenario: "exception",
    propertyName: "Spoofed Brand Cafe",
    siteCity: "Irvine, CA",
    serviceDate: "2026-05-12",
    authorizedBy: "Trial user",
    cadence: "60",
    serviceWindow: "00:10-01:20",
    systemName: "Cafe hood test report",
    exceptionKinds: ["sealed-panel"],
    exceptionNote:
      "Panel was sealed during the test service record and remains visible as an open access item.",
    followUpMode: "monitor",
    customerActionOverride:
      "Use this only as a free test link; company branding should not appear here.",
    photos: {
      "access-condition": "grease-duct-before-cleaning.jpg",
      "hood-after": "hood-filters-installed.jpg",
    },
    photoResolutions: {
      "hood-before": "not-captured",
      "filter-bank": "not-captured",
      "rooftop-fan": "not-captured",
      "grease-containment": "not-captured",
      "service-label": "not-captured",
    },
    spoofBranding: true,
  },
];

function titleFor(testCase) {
  return `${testCase.propertyName} / ${testCase.systemName}`;
}

async function loadHistory(jar) {
  const response = await httpRequest(
    "/api/axis1/reports/history",
    { headers: { Accept: "application/json" } },
    jar,
  );
  const body = await readJsonResponse(response, "Report history");

  assert(response.ok, "Report history did not load.", {
    status: response.status,
    body,
  });

  return body;
}

async function saveCompanyReport(testCase, jar, existingHistory) {
  const existing = existingHistory.find(
    (report) =>
      report.customerName === testCase.propertyName &&
      report.siteName === testCase.systemName &&
      report.serviceDate === testCase.serviceDate,
  );

  if (existing) {
    return { ...existing, reused: true, caseId: testCase.id };
  }

  const response = await httpRequest(
    "/api/axis1/reports",
    { method: "POST", json: reportPayload(testCase, "company") },
    jar,
  );
  const body = await readJsonResponse(response, `Save company report ${testCase.id}`);

  assert(response.status === 201, "Company report save failed.", {
    status: response.status,
    body,
    caseId: testCase.id,
  });
  assert(body.productPlan === "company", "Company report was not saved as company.", {
    body,
  });
  assert(!body.expiresAt, "Company report should not expire while launch access is active.", {
    body,
  });

  return { ...body, reused: false, caseId: testCase.id };
}

async function saveFreeReport(testCase) {
  const payload = reportPayload(testCase, "company");

  if (testCase.spoofBranding) {
    payload.companyProfile = {
      companyName: "Spoofed Free Brand",
      dispatchEmail: "dispatch@spoofed.example",
      directLine: "(999) 555-0199",
      brandColor: "#16A34A",
    };
  }

  const response = await httpRequest("/api/axis1/reports", {
    method: "POST",
    json: payload,
  });
  const body = await readJsonResponse(response, `Save free report ${testCase.id}`);

  assert(response.status === 201, "Free report save failed.", {
    status: response.status,
    body,
    caseId: testCase.id,
  });
  assert(body.productPlan === "free", "Anonymous report did not downgrade to free.", {
    body,
  });
  assert(body.expiresAt, "Free report did not receive a seven-day expiry.", {
    body,
  });
  assert(!body.payload.companyProfile, "Free report retained spoofed company profile.", {
    body,
  });

  return { ...body, caseId: testCase.id };
}

async function loadPublicReport(publicId) {
  const response = await httpRequest(`/api/axis1/reports/public/${publicId}`, {
    headers: { Accept: "application/json" },
  });
  const body = await readJsonResponse(response, `Public report ${publicId}`);

  assert(response.ok, "Public report did not load.", {
    publicId,
    status: response.status,
    body,
  });

  return body;
}

async function assertAssetReadable(record) {
  const fullRecord = record.payload ? record : await loadPublicReport(record.publicId);
  const uploaded = fullRecord.payload?.uploadedFieldPhotos || {};
  const firstPhoto = Object.values(uploaded).find(
    (photo) => photo && typeof photo.src === "string" && photo.src.startsWith("/api/"),
  );

  if (!firstPhoto) {
    return { checked: false, reason: "no photo asset in this report" };
  }

  const response = await httpRequest(firstPhoto.src);

  assert(response.ok, "Stored photo asset could not be read.", {
    publicId: record.publicId,
    src: firstPhoto.src,
    status: response.status,
  });
  assert(
    (response.headers.get("content-type") || "").startsWith("image/"),
    "Stored photo asset returned a non-image content type.",
    {
      publicId: record.publicId,
      src: firstPhoto.src,
      contentType: response.headers.get("content-type"),
    },
  );

  return {
    checked: true,
    src: firstPhoto.src,
    contentType: response.headers.get("content-type"),
  };
}

async function callPhotoAssist() {
  const photos = [
    {
      photoId: "qa-phone-001",
      fileName: "IMG_7421.jpg",
      dataUrl: dataUrlFor("clean-hood-before-after.jpg"),
    },
    {
      photoId: "qa-phone-002",
      fileName: "IMG_7422.jpg",
      dataUrl: dataUrlFor("hood-filters-installed.jpg"),
    },
    {
      photoId: "qa-phone-003",
      fileName: "IMG_7423.jpg",
      dataUrl: dataUrlFor("kitchen-exhaust-fan.jpg"),
    },
    {
      photoId: "qa-phone-004",
      fileName: "blocked_area_cleaned_questionmark.jpg",
      dataUrl: dataUrlFor("grease-duct-before-cleaning.jpg"),
    },
  ];
  const response = await httpRequest("/api/axis1/photo-assist", {
    method: "POST",
    json: { photos },
  });
  const body = await readJsonResponse(response, "Photo Assist");

  assert(response.ok, "Photo Assist request failed.", {
    status: response.status,
    body,
  });
  assert(Array.isArray(body.suggestions), "Photo Assist returned no suggestions.", {
    body,
  });

  const forbiddenReasonRows = body.suggestions.filter((suggestion) =>
    forbiddenCustomerCopyPattern.test(suggestion.reason || ""),
  );
  const nonPendingRows = body.suggestions.filter(
    (suggestion) => suggestion.vendorDecision !== "pending",
  );

  assert(forbiddenReasonRows.length === 0, "Photo Assist returned unsafe customer copy.", {
    forbiddenReasonRows,
  });
  assert(nonPendingRows.length === 0, "Photo Assist skipped vendor confirmation.", {
    nonPendingRows,
  });

  return {
    mode: body.mode,
    provider: body.provider,
    model: body.model,
    warning: body.warning || null,
    suggestions: body.suggestions,
  };
}

async function textFor(page) {
  return page.locator("body").innerText({ timeout: 20_000 });
}

async function auditPage(page, options) {
  const consoleMessages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({
        type: message.type(),
        text: message.text().slice(0, 800),
      });
    }
  });
  page.on("pageerror", (error) => {
    consoleMessages.push({
      type: "pageerror",
      text: error.message.slice(0, 800),
    });
  });

  await page.goto(new URL(options.path, baseUrl).toString(), {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(600);

  if (options.waitForText) {
    await page.waitForFunction(
      (needle) => document.body.innerText.toLowerCase().includes(String(needle).toLowerCase()),
      options.waitForText,
      { timeout: 20_000 },
    );
  }

  const text = await textFor(page);
  const audit = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const anchors = Array.from(document.querySelectorAll("a[href]")).map((anchor) => ({
      text: (anchor.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140),
      href: anchor.href,
    }));
    const images = Array.from(document.querySelectorAll("img")).map((image) => ({
      src: image.currentSrc || image.src,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      complete: image.complete,
      alt: image.alt || "",
    }));

    return {
      url: window.location.href,
      title: document.title,
      textLength: body.innerText.length,
      horizontalOverflowPx: Math.max(html.scrollWidth, body.scrollWidth) - window.innerWidth,
      buttonCount: document.querySelectorAll("button").length,
      anchors,
      images,
    };
  });

  assert(!/Application error|Unhandled Runtime Error|This page could not load/i.test(text), {
    label: options.label,
    url: audit.url,
  });
  assert(audit.horizontalOverflowPx <= 4, "Page has horizontal overflow.", {
    label: options.label,
    overflow: audit.horizontalOverflowPx,
    url: audit.url,
  });

  options.mustContain?.forEach((needle) => {
    assert(includesCopy(text, needle), "Expected text was missing.", {
      label: options.label,
      needle,
      url: audit.url,
      sample: text.slice(0, 1200),
    });
  });

  options.mustNotContain?.forEach((needle) => {
    assert(!includesCopy(text, needle), "Forbidden text appeared.", {
      label: options.label,
      needle,
      url: audit.url,
    });
  });

  if (options.customerFacing) {
    assert(!forbiddenCustomerCopyPattern.test(text), "Customer-facing copy has forbidden language.", {
      label: options.label,
      url: audit.url,
    });
    assert(!internalLanguagePattern.test(text), "Customer-facing copy leaked internal language.", {
      label: options.label,
      url: audit.url,
    });
  }

  if (options.assertPdfHrefFor) {
    const expectedPdfHref = `/p/server?reportId=${options.assertPdfHrefFor}&format=pdf`;
    const pdfAnchors = audit.anchors.filter(
      (anchor) => /pdf/i.test(anchor.text) || anchor.href.includes("format=pdf"),
    );
    const assetPdfAnchors = audit.anchors.filter((anchor) =>
      /\/api\/axis1\/assets\/.*service-report\.pdf/i.test(anchor.href),
    );

    assert(
      pdfAnchors.some((anchor) => anchor.href.includes(expectedPdfHref)),
      "Customer link did not point its PDF action at the React service-record route.",
      { label: options.label, expectedPdfHref, pdfAnchors },
    );
    assert(assetPdfAnchors.length === 0, "Customer link exposed backend PDFBox PDF href.", {
      label: options.label,
      assetPdfAnchors,
    });
  }

  const screenshotPath = path.join(screenshotDir, `${safeName(options.label)}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const actionableConsoleMessages = consoleMessages.filter(
    (message) =>
      !(
        message.type === "warning" &&
        /was preloaded using link preload but not used/i.test(message.text)
      ),
  );

  return {
    label: options.label,
    url: audit.url,
    textLength: audit.textLength,
    horizontalOverflowPx: audit.horizontalOverflowPx,
    buttonCount: audit.buttonCount,
    consoleMessages,
    actionableConsoleMessages,
    anchorCount: audit.anchors.length,
    imageCount: audit.images.length,
    loadedImageCount: audit.images.filter(
      (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
    ).length,
    screenshotPath,
  };
}

async function runBrowserQa({ jar, companyReports, freeReports }) {
  ensureDir(screenshotDir);

  const browser = await playwright.chromium.launch({ headless: true });
  const companyPrimary = companyReports.find((report) => report.caseId === "canal-tacos-access-past-due") || companyReports[0];
  const freePrimary = freeReports[0];
  const results = [];

  try {
    const authContext = await browser.newContext({
      viewport: { width: 1365, height: 900 },
    });
    await authContext.addCookies(jar.playwrightCookies(baseUrl));
    const authPage = await authContext.newPage();

    results.push(
      await auditPage(authPage, {
        label: "account-admin-history",
        path: "/dashboard",
        waitForText: "Service records",
        mustContain: [
          "Kitchen Permit Hood Service",
          "Service records",
          "Marigold Diner",
          "Canal Street Tacos",
          "Open access item",
          "Written record",
          "Next service",
          "Open report",
        ],
      }),
    );

    results.push(
      await auditPage(authPage, {
        label: "builder-load-saved-report",
        path: `/axis-1/tool?step=outputs&account=company&loadReport=${companyPrimary.publicId}`,
        waitForText: companyPrimary.customerName,
        mustContain: [companyPrimary.customerName, "Company"],
      }),
    );

    await authContext.close();

    const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 940 },
    });
    const publicPage = await publicContext.newPage();

    results.push(
      await auditPage(publicPage, {
        label: "fresh-builder-first-report",
        path: "/axis-1/tool",
        waitForText: "Create the restaurant-ready hood cleaning report",
        mustContain: [
          "Free builder",
          "Drop photos if you have them",
          "Review report",
        ],
        mustNotContain: ["Sample Restaurant Group", "Austin, TX"],
      }),
    );

    results.push(
      await auditPage(publicPage, {
        label: "company-customer-link-desktop",
        path: companyPrimary.href,
        waitForText: companyPrimary.customerName,
        customerFacing: true,
        assertPdfHrefFor: companyPrimary.publicId,
        mustContain: [
          companyPrimary.customerName,
          "Kitchen Permit Hood Service",
          "PDF",
        ],
        mustNotContain: ["Sample Restaurant Group", "Austin, TX", "Call vendor"],
      }),
    );

    results.push(
      await auditPage(publicPage, {
        label: "company-service-record-pdf",
        path: `${companyPrimary.href}&format=pdf`,
        waitForText: "Save PDF",
        customerFacing: true,
        mustContain: [companyPrimary.customerName, "Save PDF", "Kitchen Permit Hood Service"],
        mustNotContain: ["Sample Restaurant Group", "Austin, TX"],
      }),
    );

    results.push(
      await auditPage(publicPage, {
        label: "free-customer-link-desktop",
        path: freePrimary.href,
        waitForText: freePrimary.customerName,
        customerFacing: true,
        assertPdfHrefFor: freePrimary.publicId,
        mustContain: [freePrimary.customerName, "PDF", "Free test link"],
        mustNotContain: [
          "Kitchen Permit Hood Service",
          "dispatch@kitchenpermit.example",
          "Use the company phone",
          "reply email shown",
          "Call vendor",
        ],
      }),
    );

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    results.push(
      await auditPage(mobilePage, {
        label: "company-customer-link-mobile",
        path: companyPrimary.href,
        waitForText: companyPrimary.customerName,
        customerFacing: true,
        assertPdfHrefFor: companyPrimary.publicId,
        mustContain: [companyPrimary.customerName, "PDF"],
        mustNotContain: ["Sample Restaurant Group", "Austin, TX", "Call vendor"],
      }),
    );

    await publicContext.close();
    await mobileContext.close();
  } finally {
    await browser.close().catch(() => {});
  }

  return results;
}

function publicLinks(report) {
  return {
    customerLink: new URL(report.href, baseUrl).toString(),
    serviceRecordPdf: new URL(`${report.href}&format=pdf`, baseUrl).toString(),
    editInBuilder: new URL(report.toolHref, baseUrl).toString(),
  };
}

function buildPrompt() {
  return `다음 작업자는 C:\\Development\\Owner\\hood에서 Axis 1 런칭 직전 실사용 QA를 이어서 수행한다.

반드시 먼저 references/axis1-core-skeleton-full-context-2026-05-13.md를 처음부터 끝까지 읽는다. 그 다음 현재 로컬 서버와 결과 문서 링크를 연다.

제품 기준:
- Axis 1은 hood cleaning service 업체가 식당/고객에게 보낼 수 있는 branded service report link/PDF를 만드는 제품이다.
- $79/월을 낼 회사 사용자가 원하는 것은 복잡한 도구가 아니라, 고객이 inspection, manager review, landlord/insurance/documentation 때 저장할 수 있는 믿을 만한 기록이다.
- 고객 전면에는 "proof link", "packet", "vendor", "closeout" 같은 내부어가 과하게 보이면 안 된다.
- invoice/payment link, mailto: 노출, 개발자스러운 링크는 실패로 본다.
- 무료는 no-login test link다. 회사명/로고/연락처/히스토리/지속 링크는 회사 버전의 이유여야 한다.
- 브랜드 색상은 앱 테마가 아니라 고객 링크/PDF의 업체 accent color로 보이는지 확인한다.
- 저장 리포트의 PDF CTA는 반드시 /p/server?reportId=<id>&format=pdf React service-record route여야 한다. 고객 전면에서 /api/axis1/assets/<id>/service-report.pdf를 누르게 만들면 회귀다.

실사용 시나리오:
1. admin@kitchenpermit.com으로 로그인해서 /dashboard를 연다.
2. 회사 프로필이 Kitchen Permit Hood Service로 보이고, 저장된 리포트 히스토리가 실제 고객/현장처럼 묶여 있는지 본다.
3. due soon, past due, open item, clean record, no-photo written record가 한눈에 식별되는지 본다.
4. 각 리포트의 Open customer link, PDF 화면, Edit report 링크를 연다.
5. 고객 링크는 웹페이지처럼 풍부해도 되지만, PDF 화면은 조용한 service record retained copy처럼 보여야 한다.
6. 무료 링크는 회사 브랜딩이 제거되고 7일 테스트 링크처럼 보여야 한다.
7. Gemini Photo Assist 결과는 사진을 정리만 하고, 서비스 완료를 판정하거나 compliance/inspection/certificate류 표현을 쓰면 안 된다.
8. 데스크톱과 모바일에서 텍스트 겹침, 가로 overflow, 깨진 이미지, 콘솔 에러, 샘플 데이터(Sample Restaurant Group / Austin, TX) 누수를 찾는다.

평가 질문:
- 식당 매니저가 이 링크를 저장하고 나중에 보여줘도 부끄럽지 않은가?
- 업체 사장이 이 대시보드를 보고 "내 고객 기록이 쌓인다"고 느끼는가?
- $79/월 회사 버전의 이유가 무료 테스트 링크와 명확히 갈리는가?
- PDF 화면이 웹 기능이 아니라 보관/제출 가능한 서비스 기록처럼 보이는가?
- 사진이 고객 기록에 도움이 되지만 업체에게 분류 노동을 강요하지 않는가?
- 링크와 PDF가 실제 운영에서 문자/이메일로 보낼 수 있는 톤인가?

작업 규칙:
- unrelated change는 revert하지 않는다.
- Next build와 Gradle test를 병렬로 돌리지 않는다.
- 수동 파일 수정은 apply_patch를 우선 사용한다.
- 결과는 references/axis1-launch-qa/local-sim-2026-05-14 아래에 남기고, 브라우저로 바로 열 수 있는 localhost 링크를 포함한다.`;
}

function markdownReport(summary) {
  const companyRows = summary.companyReports
    .map((report) => {
      const links = publicLinks(report);
      return `| ${report.customerName} / ${report.siteName} | ${report.serviceDate || ""} | ${report.nextServiceDate || ""} | ${report.hasOpenItems ? "open item" : "record"} | [customer](${links.customerLink}) | [PDF](${links.serviceRecordPdf}) | [builder](${links.editInBuilder}) |`;
    })
    .join("\n");
  const freeRows = summary.freeReports
    .map((report) => {
      const links = publicLinks(report);
      return `| ${report.customerName} / ${report.siteName} | ${report.expiresAt || ""} | [customer](${links.customerLink}) | [PDF](${links.serviceRecordPdf}) |`;
    })
    .join("\n");
  const browserRows = summary.browserQa
    .map(
      (item) =>
        `| ${item.label} | ${item.actionableConsoleMessages.length} | ${item.consoleMessages.length} | ${item.horizontalOverflowPx}px | ${item.loadedImageCount}/${item.imageCount} | [screenshot](${path.relative(outputDir, item.screenshotPath).replaceAll("\\", "/")}) |`,
    )
    .join("\n");
  const suggestions = summary.photoAssist.suggestions
    .map(
      (item) =>
        `- ${item.photoId} / ${item.fileName}: ${item.suggestedSlotId || "none"}, confidence ${item.confidence}, review ${item.needsVendorReview}. ${item.reason}`,
    )
    .join("\n");
  const findings = summary.findings.length
    ? summary.findings.map((finding) => `- ${finding}`).join("\n")
    : "- Critical blocker not found in this local simulation run.";

  return `# Axis 1 Local Launch Simulation QA

Generated: ${summary.generatedAt}

Base URL: [${summary.baseUrl}](${summary.baseUrl})

Admin account for local browser QA: ${summary.accountEmail}

Local password: ${summary.accountPassword}

## Open First

- [Account](${new URL("/dashboard", summary.baseUrl).toString()})
- [Company profile section](${new URL("/dashboard#company-profile", summary.baseUrl).toString()})
- [Service records section](${new URL("/dashboard#report-history", summary.baseUrl).toString()})

## Company Reports

| Report | Service date | Next service | State | Customer link | PDF screen | Builder |
| --- | --- | --- | --- | --- | --- | --- |
${companyRows}

## Free Test Links

| Report | Expires | Customer link | PDF screen |
| --- | --- | --- | --- |
${freeRows}

## Gemini Photo Assist

- Mode: ${summary.photoAssist.mode}
- Provider: ${summary.photoAssist.provider}
- Model: ${summary.photoAssist.model}
- Warning: ${summary.photoAssist.warning || "none"}

${suggestions}

## Browser QA

| Page | Actionable console | All console warnings/errors | Horizontal overflow | Loaded images | Screenshot |
| --- | ---: | ---: | ---: | ---: | --- |
${browserRows}

## Findings

${findings}

## Detailed Prompt For Next QA Pass

${buildPrompt()}
`;
}

async function main() {
  ensureDir(outputDir);
  ensureDir(screenshotDir);
  await assertServerReady();

  const auth = await signupOrLogin();
  const entitlementsResponse = await httpRequest(
    "/api/account/entitlements",
    { headers: { Accept: "application/json" } },
    auth.jar,
  );
  const entitlements = await readJsonResponse(entitlementsResponse, "Entitlements");

  assert(entitlements.companyAccess === true, "Local admin did not receive company access.", {
    entitlements,
  });

  const companyProfile = await saveCompanyProfile(auth.jar);
  const initialHistory = await loadHistory(auth.jar);
  const companyReports = [];

  for (const testCase of companyCases) {
    const record = await saveCompanyReport(testCase, auth.jar, [
      ...initialHistory,
      ...companyReports,
    ]);
    companyReports.push(record);
  }

  const freeReports = [];

  for (const testCase of freeCases) {
    freeReports.push(await saveFreeReport(testCase));
  }

  const refreshedHistory = await loadHistory(auth.jar);

  assert(
    companyCases.every((testCase) =>
      refreshedHistory.some(
        (report) =>
          report.customerName === testCase.propertyName &&
          report.siteName === testCase.systemName &&
          report.serviceDate === testCase.serviceDate,
      ),
    ),
    "Dashboard history is missing one or more seeded company reports.",
  );
  assert(
    !refreshedHistory.some((report) =>
      freeCases.some((testCase) => testCase.propertyName === report.customerName),
    ),
    "Free reports leaked into account history.",
  );

  const expectedCompanyStatuses = new Map([
    ["marigold-main-clean-may", "next_service"],
    ["canal-tacos-access-past-due", "open_access"],
    ["northside-grill-rooftop-quote", "quote_review"],
    ["harbor-wok-thirty-day", "next_service"],
    ["blue-line-pizza-written-record", "written_record"],
    ["elm-market-containment-monitor", "monitor_condition"],
    ["marigold-main-previous-cycle", "record_only"],
  ]);

  for (const testCase of companyCases) {
    const report = refreshedHistory.find(
      (candidate) =>
        candidate.customerName === testCase.propertyName &&
        candidate.siteName === testCase.systemName &&
        candidate.serviceDate === testCase.serviceDate,
    );
    const expectedStatus = expectedCompanyStatuses.get(testCase.id);

    assert(
      report?.historyStatus?.code === expectedStatus,
      "Dashboard history status does not match the seeded service record.",
      {
        caseId: testCase.id,
        expectedStatus,
        actualStatus: report?.historyStatus,
        hasOpenItems: report?.hasOpenItems,
      },
    );
  }

  assert(
    refreshedHistory.some((report) => report.historyStatus?.code === "open_access" && report.hasOpenItems === true) &&
      refreshedHistory.some((report) => report.historyStatus?.code === "next_service" && report.hasOpenItems === false) &&
      refreshedHistory.some((report) => report.historyStatus?.code === "written_record" && report.hasOpenItems === false),
    "Dashboard history no longer separates open access, next-service, and written-record cases.",
  );

  assert(
    freeReports.some((report) => report.historyStatus?.code === "record_only") &&
      freeReports.some((report) => report.historyStatus?.code === "open_access"),
    "Free report responses should still expose clear test-link status semantics.",
  );

  const assetCheck = await assertAssetReadable(companyReports[0]);
  const photoAssist = await callPhotoAssist();
  const browserQa = await runBrowserQa({
    jar: auth.jar,
    companyReports,
    freeReports,
  });

  const findings = [];

  if (photoAssist.mode !== "live" || photoAssist.provider !== "gemini") {
    findings.push(
      "Photo Assist did not return live Gemini mode; check AXIS1_PHOTO_ASSIST_MODE and GEMINI_API_KEY inheritance.",
    );
  }

  browserQa.forEach((result) => {
    if (result.actionableConsoleMessages.length > 0) {
      findings.push(`${result.label} emitted actionable console warnings/errors.`);
    }
  });

  const summary = {
    generatedAt,
    baseUrl,
    outputDir,
    accountEmail,
    accountPassword,
    authMode: auth.mode,
    entitlements,
    companyProfile: {
      ...companyProfile,
      logoUrl: companyProfile.logoUrl ? "[data-url omitted]" : "",
    },
    companyReports,
    freeReports,
    assetCheck,
    photoAssist,
    browserQa,
    findings,
    prompt: buildPrompt(),
  };
  const jsonPath = path.join(outputDir, "axis1-launch-local-sim-results.json");
  const markdownPath = path.join(outputDir, "axis1-launch-local-sim.md");

  fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(markdownPath, markdownReport(summary));

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    outputDir,
    accountEmail,
    authMode: auth.mode,
    companyReports: companyReports.length,
    freeReports: freeReports.length,
    photoAssist: {
      mode: photoAssist.mode,
      provider: photoAssist.provider,
      model: photoAssist.model,
      warning: photoAssist.warning,
    },
    browserPages: browserQa.length,
    findings,
    markdownPath,
    jsonPath,
  }, null, 2));
}

main().catch((error) => {
  const payload = {
    ok: false,
    name: error instanceof Error ? error.name : "Error",
    message: error instanceof Error ? error.message : String(error),
    details: error instanceof QaFailure ? error.details : undefined,
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
