import type { ScrapeResult } from "./scraper";

export async function sendDiscordNotification(result: ScrapeResult): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not configured");
    return false;
  }

  // Skip notification if there's an error
  if (result.error) {
    console.log("[Discord] Skipping notification due to error");
    return false;
  }

  // Check if any month has available dates
  const hasAvailable = result.months.some((m) => m.available.length > 0);
  if (!hasAvailable) {
    console.log("[Discord] No available dates, skipping notification");
    return true; // Return true since this is expected behavior
  }

  const checkedTime = new Date(result.checked).toLocaleString("en-US", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Only include months that have available dates
  const embeds = result.months
    .filter((month) => month.available.length > 0)
    .map((month) => {
      const dateList = month.available
        .map((d) => `• **${d.date}** (${d.day})`)
        .join("\n");

      return {
        title: `Nintendo Museum - ${month.month} 2026`,
        description: `**${month.available.length} date(s) available!**\n\n${dateList}`,
        color: 0x00ff00,
      };
    });

  embeds.push({
    title: "",
    description: `Checked: ${checkedTime} JST`,
    color: 0x555555,
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    });

    console.log("[Discord] Notification sent!");
    return response.ok;
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    return false;
  }
}
