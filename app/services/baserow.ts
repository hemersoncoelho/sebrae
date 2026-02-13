"use server";

const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const TABLE_ID = process.env.BASEROW_TABLE_ID || "800242"; // Fallback for safety, but should be in .env

interface BaserowEventData {
    Evento: string;
    Data_Evento: string;
    Local: string;
    Agente: string; // Will store comma-separated organizers
    Fotos: { name: string; url: string }[];
    "como/quanto": string;
    porque: string;
    eixo?: string;
    projeto?: string;
}

interface BaserowEventResponse {
    id: number;
    order: string;
    Evento: string;
    Data_Evento: string;
    Local: string;
    Agente: string;
    Fotos: { name: string; url: string }[];
    "como/quanto": string;
    porque: string;
    resumo: string;
    materia: string;
    eixo?: string;
    projeto?: string;
}

export const uploadImageToBaserow = async (formData: FormData): Promise<{ name: string; url: string }> => {
    if (!BASEROW_TOKEN) throw new Error("Missing BASEROW_TOKEN");

    // Validate file presence
    const file = formData.get("file");
    if (!file) throw new Error("No file parameter");

    const response = await fetch("https://api.baserow.io/api/user-files/upload-file/", {
        method: "POST",
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
            // Content-Type is set automatically with FormData
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Baserow Upload Error:", errorText);
        throw new Error(`Failed to upload image to Baserow: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return { name: data.name, url: data.url };
};

export const createEventRow = async (data: BaserowEventData): Promise<number> => {
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
        console.error("Baserow Error:", errorBody);
        throw new Error(`Failed to create row in Baserow: ${errorBody}`);
    }

    const responseData = await response.json();
    return responseData.id;
};

export const getEventsFromBaserow = async (): Promise<BaserowEventResponse[]> => {
    if (!BASEROW_TOKEN) throw new Error("Missing BASEROW_TOKEN");

    const response = await fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`, {
        method: "GET",
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to fetch events from Baserow");
    }

    const data = await response.json();
    return data.results;
};

export const getEventFromBaserow = async (id: string): Promise<BaserowEventResponse> => {
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
        throw new Error(`Failed to fetch event from Baserow: ${err}`);
    }

    const data = await response.json();
    return data;
};

export const updateEventRow = async (id: number, data: Partial<BaserowEventData>): Promise<BaserowEventResponse> => {
    if (!BASEROW_TOKEN) throw new Error("Missing BASEROW_TOKEN");

    const response = await fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}/?user_field_names=true`, {
        method: "PATCH",
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Baserow Update Error:", errorBody);
        throw new Error(`Failed to update row in Baserow: ${errorBody}`);
    }

    const responseData = await response.json();
    return responseData;
};
