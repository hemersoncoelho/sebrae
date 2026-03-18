"use client";

import React from "react";
import { EventItem } from "../types";
import { parseDate } from "../utils/formatters";
import ReactMarkdown from "react-markdown";

interface EventReportTemplateProps {
    event: EventItem;
    editedContent?: { summary: string; article: string };
}

// A hidden component but styled explicitly to look like a news article when captured by html2pdf
export const EventReportTemplate = React.forwardRef<HTMLDivElement, EventReportTemplateProps>(({ event, editedContent }, ref) => {
    // Helper to format date just like "15 de Janeiro" or full date
    const formattedDate = parseDate(event.date) || "Data não informada";
    const dateObj = new Date(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('pt-BR', { month: 'long' });
    const formattedShortDate = !isNaN(day) ? `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}` : formattedDate;

    // Define the tag/supertitle
    const tag = (event.eixos && event.eixos.length > 0) ? event.eixos[0] 
              : (event.projetos && event.projetos.length > 0) ? event.projetos[0] 
              : "REDE DE ATENDIMENTO";

    let rawArticle = editedContent?.article || event.generated?.article || "";
    
    // We will try to extract Title and Subtitle from the raw Markdown.
    // The prompt structure often outputs: 
    // Title
    // Subtitle (Linha fina)
    // Lead
    // ...
    
    let displayTitle = event.title;
    let displaySubtitle = editedContent?.summary || event.generated?.summary || "";
    let cleanArticleBody = rawArticle;

    const allPhotos = event.fotos || [];
    const mainPhotoUrl = event.coverUrl || (allPhotos.length > 0 ? allPhotos[0].url : null);
    const extraPhotos = allPhotos.filter(f => f.url && f.url !== mainPhotoUrl);
    const injectedPhotoUrl = extraPhotos.length > 0 ? extraPhotos[0].url : null;

    if (rawArticle) {
        const lines = rawArticle.split('\n').filter(line => line.trim() !== '');
        
        // The generated article sometimes starts with the Tag/Eixo before the actual Title. 
        // Let's strip those out first.
        while (lines.length > 0) {
            const tempLine = lines[0].replace(/^[#\-*]+\s*/, '').replace(/\*\*/g, '').trim().toUpperCase();
            if (tempLine === tag.toUpperCase() || 
                event.eixos?.some(e => e.toUpperCase() === tempLine) ||
                tempLine === "TÍTULO" || tempLine === "MATÉRIA") {
                lines.shift();
            } else {
                break;
            }
        }

        if (lines.length >= 2) {
            // Strip prefixes like "Título: " or "Subtítulo: "
            const sanitizeLine = (l: string) => l.replace(/^[#\-*]+\s*/, '').replace(/\*\*/g, '').replace(/^(Título|Subtítulo|Linha fina):\s*/i, '').trim();
            
            const firstLine = sanitizeLine(lines[0]);
            const secondLine = sanitizeLine(lines[1]);
            
            // If the first two lines aren't excessively long paragraphs, we treat them as Title and Subtitle
            if (firstLine.length > 0 && firstLine.length < 200 && secondLine.length > 0 && secondLine.length < 300) {
                displayTitle = firstLine;
                displaySubtitle = secondLine;
                
                // Remove title and subtitle from the body so they don't repeat
                lines.shift();
                lines.shift();
            }
        }

        // Clean up author lines and tag lines from the body so they don't repeat
        const cleanedLines = lines.filter(line => {
            const trimmed = line.trim();
            if (trimmed.toUpperCase() === tag.toUpperCase()) return false;
            if (event.eixos?.some(e => trimmed.toUpperCase() === e.toUpperCase())) return false;
            if (trimmed.toUpperCase() === event.title.toUpperCase()) return false;
            if (trimmed.toLowerCase().startsWith("por ")) return false;
            return true;
        });
        
        // Inject the second photo after the 2nd paragraph of the cleaned article body
        if (injectedPhotoUrl) {
            const insertionIndex = Math.min(2, cleanedLines.length);
            cleanedLines.splice(insertionIndex, 0, `![Foto Adicional](${injectedPhotoUrl})`);
        }
        
        cleanArticleBody = cleanedLines.join('\n\n'); // Rejoin with double breaks for markdown paragraphs
    }

    return (
        <div ref={ref} className="bg-white text-black w-[800px] max-w-[800px] min-h-[1123px] mx-auto overflow-hidden relative print:w-full print:max-w-none print:h-auto print:min-h-0" style={{ fontFamily: "Arial, sans-serif" }}>

            <div className="px-12 py-12">
                
                {/* HEADERS */}
                <div className="mb-6">
                    {/* EISO / PROJETO (Tag) */}
                    <div className="text-[#009151] font-bold text-[15px] mb-2 tracking-tight flex items-center">
                        {tag}
                    </div>

                    {/* Title */}
                    <h1 className="text-[#2563eb] font-bold text-[40px] leading-[1.15] tracking-[-.02em] mb-4">
                        {displayTitle}
                    </h1>

                    {/* Subtitle / Linha Fina */}
                    {displaySubtitle && (
                        <p className="text-gray-700 text-[19px] font-normal leading-snug mb-6">
                            {displaySubtitle}
                        </p>
                    )}

                    {/* Author */}
                    <div className="text-gray-900 pb-2 mb-6 text-[15px] font-medium border-b border-gray-100 flex items-center">
                        Por &nbsp;<strong className="font-bold">
                            {event.organizer && event.organizer.length > 0 
                                ? (Array.isArray(event.organizer) ? event.organizer.join(" e ") : event.organizer)
                                : "Redação"}
                        </strong>
                    </div>
                </div>

                {/* HERO IMAGE */}
                {(event.coverUrl || (event.fotos && event.fotos.length > 0)) && (
                    <div className="mb-8 w-full">
                        <img 
                            src={event.coverUrl || (event.fotos && event.fotos[0]?.url)} 
                            alt="Foto Principal do Evento" 
                            className="w-full h-auto max-h-[450px] object-cover rounded-md"
                        />
                    </div>
                )}

                {/* ARTICLE CONTENT */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-[1.7] text-[17px]">
                    {cleanArticleBody ? (
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-[22px] font-bold text-[#009151] mt-8 mb-4 tracking-tight" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-[20px] font-bold text-[#009151] mt-8 mb-4 tracking-tight" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-[18px] font-bold text-[#009151] mt-6 mb-3 tracking-tight" {...props} />,
                                p: ({node, ...props}) => <p className="mb-6" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6" {...props} />,
                                li: ({node, ...props}) => <li className="mb-2" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                                img: ({node, ...props}) => <img className="w-full h-auto max-h-[450px] object-cover rounded-md my-8 border border-gray-200" {...props} />,
                            }}
                        >
                            {cleanArticleBody}
                        </ReactMarkdown>
                    ) : (
                        <p className="italic text-gray-500 text-center">Nenhum conteúdo de matéria disponível para este evento.</p>
                    )}
                </div>

                {/* ADDITIONAL PHOTOS (Mais Registros) */}
                {extraPhotos.length > (injectedPhotoUrl ? 1 : 0) && (
                    <div className="mt-14 pt-8 border-t border-gray-100">
                        <h3 className="text-[18px] font-bold text-[#009151] mb-6">Mais Registros</h3>
                        <div className="flex flex-col gap-6 items-center">
                            {extraPhotos.map((foto, idx) => {
                                if (foto.url === injectedPhotoUrl) return null;
                                
                                return (
                                    <img 
                                        key={idx} 
                                        src={foto.url} 
                                        alt={`Registro Adicional ${idx + 1}`} 
                                        className="w-full h-auto max-h-[400px] object-contain rounded-md border border-gray-200"
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

EventReportTemplate.displayName = "EventReportTemplate";
