"use client";

import React from "react";
import { EventItem } from "../types";
import { parseDate } from "../utils/formatters";

interface EventReportTemplateProps {
    event: EventItem;
}

// A hidden component but styled explicitly to look like the provided A4 PDF when captured by html2pdf
export const EventReportTemplate = React.forwardRef<HTMLDivElement, EventReportTemplateProps>(({ event }, ref) => {
    // Helper to format date just like "15 de Janeiro" or full date
    const formattedDate = parseDate(event.date) || "Data não informada";
    const dateObj = new Date(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('pt-BR', { month: 'long' });
    const formattedShortDate = !isNaN(day) ? `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}` : formattedDate;

    return (
        <div ref={ref} className="bg-white text-black w-[800px] max-w-[800px] min-h-[1123px] mx-auto overflow-hidden relative" style={{ fontFamily: "Arial, sans-serif" }}>

            {/* HEADER - Curved Blue Shape with SEBRAE Logo */}
            <div className="relative w-full h-40 bg-white">
                {/* SVG Curve simulating the header */}
                <svg className="absolute top-0 left-0 w-full h-[180px]" preserveAspectRatio="none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#7fbadded" d="M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,96C672,75,768,85,864,117.3C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
                    <path fill="#5499c7" d="M0,96L48,106.7C96,117,192,139,288,133.3C384,128,480,96,576,80C672,64,768,64,864,85.3C960,107,1056,149,1152,165.3C1248,181,1344,171,1392,165.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
                </svg>
                {/* Simple Sebrae Logo fallback */}
                <div className="absolute top-8 left-12 z-10">
                    <div className="flex flex-col text-white font-bold italic tracking-tighter" style={{ fontSize: "2.5rem", lineHeight: "1" }}>
                        SEBRAE
                        <div className="flex flex-col gap-[3px] mt-1 ml-6 w-12">
                            <div className="h-[4px] bg-white w-full"></div>
                            <div className="h-[4px] bg-white w-[80%]"></div>
                            <div className="h-[4px] bg-white w-[60%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY - Table format */}
            <div className="px-10 pt-8 pb-12 z-20 relative">
                <table className="w-full border-collapse border border-black text-[13px]">
                    <tbody>
                        {/* TITLE */}
                        <tr>
                            <th className="bg-[#4d6b8c] text-white p-2 text-center uppercase border border-black font-bold text-sm tracking-wide">
                                {event.title}
                            </th>
                        </tr>

                        {/* QUEM */}
                        <tr>
                            <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                QUEM?
                            </th>
                        </tr>
                        <tr>
                            <td className="p-2 text-center italic border border-black bg-white">
                                {Array.isArray(event.organizer) ? event.organizer.join(", ") : event.organizer || "-"}
                            </td>
                        </tr>

                        {/* QUANDO */}
                        <tr>
                            <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                QUANDO?
                            </th>
                        </tr>
                        <tr>
                            <td className="p-2 text-center italic border border-black bg-white">
                                {formattedShortDate}
                            </td>
                        </tr>

                        {/* ONDE */}
                        <tr>
                            <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                ONDE?
                            </th>
                        </tr>
                        <tr>
                            <td className="p-2 text-center italic border border-black bg-white">
                                {event.location || "-"}
                            </td>
                        </tr>

                        {/* O QUE */}
                        <tr>
                            <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                O QUE?
                            </th>
                        </tr>
                        <tr>
                            <td className="p-2 text-center italic border border-black bg-white uppercase">
                                {Array.isArray(event.projetos) && event.projetos.length > 0 ? event.projetos.join(" / ") : (event.title || "REUNIÃO")}
                            </td>
                        </tr>

                        {/* COMO e QUANTO */}
                        <tr>
                            <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                COMO e QUANTO?
                            </th>
                        </tr>
                        <tr>
                            <td className="p-4 text-justify italic border border-black bg-white leading-relaxed whitespace-pre-wrap">
                                {/* Format ComoQuanto and Materia/Summary into paragraphs. Fallback to summary if Materia isn't there */}
                                {event.comoQuanto && event.comoQuanto.length > 0 ? (
                                    event.comoQuanto.map((p, i) => <p key={i} className="mb-2 indent-8">{p}</p>)
                                ) : (
                                    <p className="indent-8">{event.generated?.article || event.generated?.summary || "Sem descrição prévia registrada."}</p>
                                )}
                                {event.quantidade && (
                                    <p className="mt-4 indent-8 font-semibold">
                                        Público alcançado/atendido: {event.quantidade}
                                        {event.publico && event.publico.length > 0 ? ` (${event.publico.join(", ")})` : ""}
                                    </p>
                                )}
                            </td>
                        </tr>

                        {/* POR QUÊ */}
                        <tr>
                            <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                POR QUÊ?
                            </th>
                        </tr>
                        <tr>
                            <td className="p-4 text-justify italic border border-black bg-white leading-relaxed space-y-2">
                                {/* Shows Eixos directly aligned with instructions from POR QUE */}
                                {event.eixos && event.eixos.length > 0 && (
                                    <p className="indent-8">
                                        O evento está alinhado aos eixos estratégicos de <strong>{event.eixos.join(" e ")}</strong>.
                                    </p>
                                )}
                                {event.porQue && event.porQue.length > 0 ? (
                                    event.porQue.map((p, i) => <p key={i} className="indent-8">{p}</p>)
                                ) : null}
                            </td>
                        </tr>

                        {/* REGISTROS */}
                        {(event.fotos && event.fotos.length > 0) || event.coverUrl ? (
                            <>
                                <tr>
                                    <th className="bg-[#99aec2] text-black p-1.5 text-center uppercase border border-black font-bold">
                                        REGISTROS
                                    </th>
                                </tr>
                                <tr>
                                    <td className="p-4 border border-black bg-white">
                                        <div className="w-full flex flex-col items-center gap-6">
                                            {/* Print Cover first if available, otherwise print photos array */}
                                            {event.coverUrl && !event.fotos?.some(f => f.url === event.coverUrl) && (
                                                <img src={event.coverUrl} alt="Foto Principal" className="w-[80%] max-h-[400px] object-cover border border-gray-300" />
                                            )}
                                            {event.fotos && event.fotos.map((foto, idx) => (
                                                <img key={idx} src={foto.url} alt={`Foto ${idx + 1}`} className="w-[80%] max-h-[400px] object-contain border border-gray-300" />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </>
                        ) : null}

                    </tbody>
                </table>
            </div>

            {/* Bottom Curve Simulation */}
            <div className="absolute -bottom-8 left-0 w-full h-24 overflow-hidden -z-10 rotate-180 opacity-40">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#7fbadded" d="M0,128L1440,0L1440,320L0,320Z" />
                </svg>
            </div>
        </div>
    );
});

EventReportTemplate.displayName = "EventReportTemplate";
