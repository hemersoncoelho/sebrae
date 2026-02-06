import { EventItem } from "../types";

export const buildLLMPrompt = (event: EventItem): string => {
  const { title, date, location, organizer, porQue, comoQuanto, tone, length, cta } = event;

  const system = `Você é um redator profissional em pt-BR. Não invente dados.`;

  const user = `
    Crie um resumo e uma matéria sobre o seguinte evento:
    
    Evento: ${title}
    Data: ${date}
    Local: ${location || "Não informado"}
    Organizador: ${organizer || "Não informado"}
    Objetivos: ${porQue.join(", ")}
    Resultados: ${comoQuanto.join(", ")}
    
    Configurações:
    - Tom: ${tone}
    - Tamanho: ${length}
    - Incluir CTA: ${cta ? "Sim" : "Não"}
    
    Formato de saída desejado:
    (A) Resumo
    (B) Matéria estruturada (Título, Linha fina, Lead, Corpo, Destaques, Resultados, CTA se solicitado)
  `;

  return `System: ${system}\nUser: ${user}`;
};
