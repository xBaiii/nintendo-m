import type { ScrapeResult } from "./scraper";

export async function sendDiscordNotification(result: ScrapeResult): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not configured");
    return false;
  }

  const checkedTime = new Date(result.checked).toLocaleString("en-US", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (result.error) {
    const embed = {
      title: "Nintendo Museum - Ticket Check Failed",
      description: `Error: ${result.error}`,
      color: 0xff0000,
      footer: { text: `Checked: ${checkedTime} JST` },
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  const embeds = result.months.map((month) => {
    let description: string;
    let color: number;

    if (month.available.length > 0) {
      const dateList = month.available
        .map((d) => `• **${d.date}** (${d.day})`)
        .join("\n");
      description = `**${month.available.length} date(s) available!**\n\n${dateList}`;
      color = 0x00ff00;
    } else {
      description = `No available dates.\n${month.soldOut} date(s) sold out.`;
      color = 0xffaa00;
    }

    return {
      title: `Nintendo Museum - ${month.month} 2026`,
      description,
      color,
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

    return response.ok;
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    return false;
  }
}
