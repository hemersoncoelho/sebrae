import { EventItem } from "../types";

export const generateContent = (event: EventItem): { summary: string; article: string } => {
    const { title, date, location, organizer, comoQuanto, porQue, tone, length, cta } = event;

    // Helpers for tone
    const tonePrefix = tone === "jornalistico" ? "Reportagem:" : tone === "institucional" ? "Comunicado:" : "Blog:";
    const toneStyle = tone === "jornalistico" ? "de forma objetiva e informativa" : tone === "institucional" ? "com tom formal e corporativo" : "de maneira leve e engajadora";

    // Helpers for length (simulated by repeating/expanding text)
    const multiplier = length === "curto" ? 1 : length === "medio" ? 2 : 3;

    // Constructing the Summary
    let summary = `${tonePrefix} O evento "${title}" realizado em ${new Date(date).toLocaleDateString("pt-BR")} ${location ? `no local ${location}` : ""} reuniu participantes para ${comoQuanto[0]}. `;
    if (porQue.length > 0) {
        summary += `Como principal resultado, destacamos: ${porQue[0]}. `;
    }
    if (length !== "curto") {
        summary += `A iniciativa reforça o compromisso ${organizer ? `do(a) ${organizer}` : "da organização"} com o setor.`;
    }

    // Constructing the Article
    const lead = `Em ${new Date(date).toLocaleDateString("pt-BR")}, ${location ? `${location} sediou` : "ocorreu"} o evento "${title}", organizado por ${organizer || "nossa equipe"}. O encontro teve como foco principal ${comoQuanto.join(", ")}.`;

    const bodyParagraphs = [];

    // Paragraph 1: Context & Objectives
    bodyParagraphs.push(`Com o objetivo de ${comoQuanto.join(" e ")}, o evento proporcionou um ambiente rico para troca de experiências e networking. ${tone === "institucional" ? "A ação alinha-se às estratégias de crescimento da organização." : "Foi um momento ímpar para todos os presentes."}`);

    // Paragraph 2: Results
    if (porQue.length > 0) {
        bodyParagraphs.push(`Os resultados alcançados superaram as expectativas. Destaque para: ${porQue.join(", ")}. ${porQue.length > 1 ? "Esses números comprovam a eficácia da iniciativa." : "Um marco importante para o projeto."}`);
    }

    // Paragraph 3 (Filler for medium/long)
    if (length !== "curto") {
        bodyParagraphs.push(`Durante a programação, os participantes puderam interagir e debater sobre os temas propostos. A dinâmica do evento favoreceu a integração e o aprendizado prático, pontos elogiados pelos presentes.`);
    }

    // Paragraph 4 (Filler for long)
    if (length === "longo") {
        bodyParagraphs.push(`Especialistas apontam que iniciativas como esta são fundamentais para o desenvolvimento do setor. A repercussão positiva reforça a necessidade de continuidade e expansão para as próximas edições.`);
    }

    // CTA
    let articleCta = "";
    if (cta) {
        articleCta = `\n\nQuer saber mais? Acompanhe nossos canais para ficar por dentro dos próximos eventos e novidades!`;
    }

    const article = `${title.toUpperCase()}\n\n${lead}\n\n${bodyParagraphs.join("\n\n")}${articleCta}`;

    return { summary, article };
};
