import { NextResponse } from "next/server";
import { scrapeTickets } from "@/lib/scraper";
import { sendDiscordNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const result = await scrapeTickets();

    // Send Discord notification
    await sendDiscordNotification(result);

    return NextResponse.json(result);
  } catch (error) {
    const errorResult = {
      months: [],
      checked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResult, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
