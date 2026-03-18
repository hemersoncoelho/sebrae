"use server";

const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const TABLE_ID = "891991"; // The new table ID provided by the user

export interface GestaoReportData {
    nome_analista: string;
    eixo: string;
    projeto: string;
    periodo: string;
    principais_acoes: string;
    impacto: string;
    resultados: string;
    destaque: string;
    indicadores: string;
    evidencias: string;
    riscos: string;
    sugestao: string;
}

export interface GestaoReportResponse extends GestaoReportData {
    id: number;
    order: string;
}

export const createGestaoReport = async (data: GestaoReportData): Promise<number> => {
    if (!BASEROW_TOKEN) throw new Error("Missing BASEROW_TOKEN");

    const response = await fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`, {
        method: "POST",
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Baserow Gestao Error:", errorBody);
        throw new Error(`Failed to create row in Baserow Gestao: ${errorBody}`);
    }

    const responseData = await response.json();
    return responseData.id;
};

export const getGestaoReports = async (): Promise<GestaoReportResponse[]> => {
    if (!BASEROW_TOKEN) throw new Error("Missing BASEROW_TOKEN");

    const response = await fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`, {
        method: "GET",
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to fetch gestao reports from Baserow");
    }

    const data = await response.json();
    return data.results;
};

export const getGestaoReport = async (id: string): Promise<GestaoReportResponse> => {
    if (!BASEROW_TOKEN) throw new Error("Missing BASEROW_TOKEN");

    const response = await fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}/?user_field_names=true`, {
        method: "GET",
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
        },
        cache: "no-store"
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to fetch gestao report from Baserow: ${err}`);
    }

    const data = await response.json();
    return data;
};
