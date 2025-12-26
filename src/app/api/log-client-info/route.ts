import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // 1. Re-capture Network Data (Server-side verification)
  // Headers are accessible here too, confirming what the client "sees"
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const city = request.headers.get('x-vercel-ip-city') || 'unknown';
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';
  const flag = country === 'GB' ? '🇬🇧' : country === 'US' ? '🇺🇸' : '🌍';

  const logPayload = {
    level: 'INFO',
    type: 'FULL_FORENSIC_REPORT',
    timestamp: new Date().toISOString(),
    network: {
      ip,
      location: `${city}, ${country} ${flag}`,
      ...body.network
    },
    hardware: {
      gpu: body.gpu.renderer,
      screen: `${body.screen.width}x${body.screen.height}`,
      os: body.browser.platform, // Note: platform might need to be added to client tracker if missing, but userAgent covers it
    },
    ...body
  };
  
  // 2. Console Log (For Vercel temporary view)
  console.log(JSON.stringify(logPayload, null, 2));

  // 3. Permanent Storage: Discord Webhook
  const DISCORD_URL = process.env.DISCORD_WEBHOOK_URL;

  if (DISCORD_URL) {
    try {
        const discordRes = await fetch(DISCORD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "FSO Forensic Bot",
                avatar_url: "https://cdn-icons-png.flaticon.com/512/3062/3062634.png",
                content: `🚨 **Visitor Detected** in ${city}`, // Push notification text
                embeds: [{
                    title: `🔍 Forensic Report: ${city}, ${country}`,
                    color: 3447003, // Blue
                    fields: [
                        { name: "IP Address", value: `\`${ip}\``, inline: true },
                        { name: "Location", value: `${city}, ${country} ${flag}`, inline: true },
                        { name: "System", value: body.browser?.platform || body.browser?.userAgent?.split(')')[0].split('(')[1] || "Unknown", inline: false },
                        { name: "GPU", value: body.gpu?.renderer || "Integrated/Unknown", inline: false },
                        { name: "Screen", value: body.screen ? `${body.screen.width}x${body.screen.height}` : "Unknown", inline: true },
                        { name: "Downlink", value: `${body.network?.downlink || '?'} Mbps`, inline: true },
                        { name: "Referrer", value: body.referrer || "Direct", inline: false }
                    ],
                    footer: { text: `Timestamp: ${new Date().toISOString()}` }
                }]
            })
        });

        if (!discordRes.ok) {
            console.error("Discord API Error:", await discordRes.text());
        } 
    } catch (error) {
        console.error("Discord Log Failed", error);
    }
  }

  return NextResponse.json({ status: 'logged' });
}
