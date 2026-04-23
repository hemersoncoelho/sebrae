import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WEBHOOK_URL = "https://webhook.solucoesai.tech/webhook/11606907-7c8a-4e60-b290-d8c4545cf2c4";
const LOG_PATH = "/home/hemersoncoelho/Documentos/Sebrae/.cursor/debug-ed381d.log";

function writeLog(entry: object) {
    try {
        fs.appendFileSync(LOG_PATH, JSON.stringify({ sessionId: "ed381d", timestamp: Date.now(), ...entry }) + "\n");
    } catch { /* ignore if path unavailable (Vercel) */ }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // #region agent log
        writeLog({ location: "api/generate:before-fetch", hypothesisId: "H-I,H-J,H-K", message: "Chamando webhook server-side", data: { webhookUrl: WEBHOOK_URL, bodyKeys: Object.keys(body) } });
        // #endregion

        let webhookResponse: Response;
        try {
            webhookResponse = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        } catch (fetchErr) {
            const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
            // #region agent log
            writeLog({ location: "api/generate:fetch-threw", hypothesisId: "H-I,H-K", message: "fetch() lançou exceção", data: { error: msg } });
            // #endregion
            return NextResponse.json({ error: "Failed to reach webhook", detail: msg, debugCode: "FETCH_THREW" }, { status: 502 });
        }

        // #region agent log
        writeLog({ location: "api/generate:response", hypothesisId: "H-I,H-J,H-K", message: "Resposta do webhook recebida", data: { status: webhookResponse.status, ok: webhookResponse.ok, statusText: webhookResponse.statusText } });
        // #endregion

        if (!webhookResponse.ok) {
            const errText = await webhookResponse.text();
            // #region agent log
            writeLog({ location: "api/generate:error-body", hypothesisId: "H-J", message: "Corpo do erro do webhook", data: { status: webhookResponse.status, body: errText.slice(0, 500) } });
            // #endregion
            return NextResponse.json(
                { error: "Webhook returned error", status: webhookResponse.status, detail: errText.slice(0, 300), debugCode: "WEBHOOK_ERROR" },
                { status: webhookResponse.status }
            );
        }

        const data = await webhookResponse.json();
        // #region agent log
        writeLog({ location: "api/generate:success", hypothesisId: "H-E", message: "Webhook retornou sucesso", data: { keys: Object.keys(data) } });
        // #endregion
        return NextResponse.json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // #region agent log
        writeLog({ location: "api/generate:outer-catch", hypothesisId: "H-K", message: "Erro geral na rota", data: { error: message } });
        // #endregion
        return NextResponse.json({ error: "Failed to reach webhook", detail: message, debugCode: "OUTER_CATCH" }, { status: 502 });
    }
}
