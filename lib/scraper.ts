import { chromium } from "playwright-core";

export interface AvailableDate {
  date: string;
  day: string;
}

export interface MonthResult {
  month: string;
  available: AvailableDate[];
  soldOut: number;
}

export interface ScrapeResult {
  months: MonthResult[];
  checked: string;
  error?: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS_TO_CHECK = [
  { name: "Feb", prefix: "2026-02", label: "February" },
  // { name: "Mar", prefix: "2026-03", label: "March" },
];

async function scrapeMonth(
  page: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof chromium.connectOverCDP>>["newContext"]
    >
  >["newPage"] extends () => Promise<infer P>
    ? P
    : never,
  monthConfig: (typeof MONTHS_TO_CHECK)[0]
): Promise<MonthResult> {
  console.log(`[Scraper] Clicking ${monthConfig.label} tab...`);
  const tab = page
    .locator(".p-period__month")
    .filter({ hasText: monthConfig.name });
  await tab.click();

  console.log(`[Scraper] Waiting for calendar to update...`);
  await page.waitForTimeout(2000);

  console.log(`[Scraper] Extracting ${monthConfig.label} date cells...`);
  const dateCells = await page
    .locator(`td[data-date^="${monthConfig.prefix}"]`)
    .all();
  console.log(
    `[Scraper] Found ${dateCells.length} ${monthConfig.label} date cells`
  );

  const available: AvailableDate[] = [];
  let soldOut = 0;

  for (const cell of dateCells) {
    const dateStr = await cell.getAttribute("data-date");
    if (!dateStr) continue;

    const classList = await cell.getAttribute("class");
    if (!classList) continue;

    // Skip cells that are for other months
    if (classList.includes("fc-day-other")) continue;

    // Check if it's a holiday (museum closed)
    const hasHoliday = await cell.locator("span.holiday").count();
    if (hasHoliday > 0) continue;

    // Check if sold out
    const isSoldOut = classList.includes("fc-day-soldout");

    if (isSoldOut) {
      soldOut++;
    } else {
      // Check if it has no data (not available yet)
      if (classList.includes("fc-day-no-data")) continue;

      const date = new Date(dateStr);
      const dayName = DAYS[date.getUTCDay()];
      const formattedDate = `${monthConfig.name} ${date.getUTCDate()}`;

      available.push({
        date: formattedDate,
        day: dayName,
      });
    }
  }

  console.log(
    `[Scraper] ${monthConfig.label}: ${available.length} available, ${soldOut} sold out`
  );
  return {
    month: monthConfig.label,
    available,
    soldOut,
  };
}

export async function scrapeTickets(): Promise<ScrapeResult> {
  const apiKey = process.env.BROWSERLESS_API_KEY;

  if (!apiKey) {
    console.log("[Scraper] No BROWSERLESS_API_KEY configured");
    return {
      months: [],
      checked: new Date().toISOString(),
      error: "BROWSERLESS_API_KEY not configured",
    };
  }

  const browserlessUrl = `wss://chrome.browserless.io?token=${apiKey}`;
  let browser;

  try {
    console.log("[Scraper] Connecting to Browserless...");
    browser = await chromium.connectOverCDP(browserlessUrl);
    console.log("[Scraper] Connected! Creating context...");

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("[Scraper] Navigating to Nintendo Museum calendar...");
    await page.goto("https://museum-tickets.nintendo.com/en/calendar", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    console.log("[Scraper] Page loaded!");

    const months: MonthResult[] = [];
    for (const monthConfig of MONTHS_TO_CHECK) {
      const result = await scrapeMonth(page, monthConfig);
      months.push(result);
    }

    await browser.close();
    console.log("[Scraper] Browser closed. Done!");

    return {
      months,
      checked: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Scraper] Error:", error);
    if (browser) {
      await browser.close();
    }
    return {
      months: [],
      checked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
