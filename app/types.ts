export interface EventItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  organizer?: string[];
  eixos?: string[];
  projetos?: string[];
  coverBase64?: string;
  coverUrl?: string;
  fotos?: { name: string; url: string }[];
  comoQuanto: string[];
  porQue: string[];
  tone: "jornalistico" | "institucional" | "descontraido";
  length: "curto" | "medio" | "longo";
  cta: boolean;
  status: "Publicado" | "Rascunho" | "Destaque";
  views?: number;
  generated: {
    summary: string;
    article: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = EventItem["status"];
export type EventTone = EventItem["tone"];
export type EventLength = EventItem["length"];
