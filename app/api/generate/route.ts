import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://webhook.solucoesai.tech/webhook/11606907-7c8a-4e60-b290-d8c4545cf2c4";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const webhookResponse = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!webhookResponse.ok) {
            const errText = await webhookResponse.text();
            return NextResponse.json(
                { error: "Webhook returned error", status: webhookResponse.status, detail: errText },
                { status: webhookResponse.status }
            );
        }

        const data = await webhookResponse.json();
        return NextResponse.json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: "Failed to reach webhook", detail: message }, { status: 502 });
    }
}
