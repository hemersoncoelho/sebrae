"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Edit, RefreshCw, Share, Calendar, MapPin, User, Users, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Textarea } from "@/app/components/ui/Textarea";
import { Badge } from "@/app/components/ui/Badge";
import { Card, CardContent } from "@/app/components/ui/Card";
import { getEvent, saveEvent } from "@/app/utils/storage";
import { generateContent } from "@/app/utils/generate";
import { EventItem } from "@/app/types";
import ReactMarkdown from "react-markdown";
import imageCompression from "browser-image-compression";
import { EventReportTemplate } from "@/app/components/EventReportTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { getEventFromBaserow, uploadImageToBaserow, updateEventRow } from "@/app/services/baserow";
import { ExpandableText } from "@/app/components/ExpandableText";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [event, setEvent] = React.useState<EventItem | null>(null);
    const [activeTab, setActiveTab] = React.useState<"summary" | "article" | "fotos">("summary");
    const [editedContent, setEditedContent] = React.useState({ summary: "", article: "" });
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [copySuccess, setCopySuccess] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = React.useState(false);
    const reportRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const loadEvent = async () => {
            // 1. Try Local Storage first
            const localData = getEvent(id);
            if (localData) {
                setEvent(localData);
                setEditedContent(localData.generated);
                setIsLoading(false);
                return;
            }

            // 2. Try Baserow
            try {
                const row = await getEventFromBaserow(id);
                const mappedEvent: EventItem = {
                    id: row.id.toString(),
                    title: row.Evento,
                    date: row.Data_Evento,
                    location: row.Local,
                    organizer: row.Agente ? row.Agente.split(", ").filter(Boolean) : [],
                    eixos: row.eixo ? row.eixo.split(", ").filter(Boolean) : [],
                    projetos: row.projeto ? row.projeto.split(", ").filter(Boolean) : [],
                    coverUrl: row.Fotos?.[0]?.url || "",
                    coverBase64: "",
                    fotos: row.Fotos || [],
                    comoQuanto: row["como/quanto"] ? [row["como/quanto"]] : [],
                    porQue: row.porque ? [row.porque] : [],
                    tone: "jornalistico",
                    length: "medio",
                    cta: false,
                    status: "Publicado",
                    views: 0,
                    generated: {
                        summary: row.resumo || "",
                        article: row.materia || ""
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                // Only generate if fields are empty
                if (!mappedEvent.generated.summary && !mappedEvent.generated.article) {
                    const generatedContent = generateContent(mappedEvent);
                    mappedEvent.generated = generatedContent;
                }

                setEvent(mappedEvent);
                setEditedContent(mappedEvent.generated);
            } catch (error) {
                console.error("Failed to fetch event", error);
                router.push("/events");
            } finally {
                setIsLoading(false);
            }
        };

        loadEvent();
    }, [id, router]);

    // Debounce save
    React.useEffect(() => {
        if (!event) return;

        const timer = setTimeout(() => {
            if (
                editedContent.summary !== event.generated.summary ||
                editedContent.article !== event.generated.article
            ) {
                setIsSaving(true);
                const updated = { ...event, generated: editedContent, updatedAt: new Date().toISOString() };
                saveEvent(updated);
                setEvent(updated);
                setTimeout(() => setIsSaving(false), 500);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [editedContent, event]);

    const handleRegenerate = () => {
        if (!event) return;
        if (!confirm("Isso irá sobrescrever suas edições atuais. Continuar?")) return;

        const newContent = generateContent(event);
        setEditedContent(newContent);
        // Save immediately
        const updated = { ...event, generated: newContent, updatedAt: new Date().toISOString() };
        saveEvent(updated);
        setEvent(updated);
    };

    const handleCopy = () => {
        const text = activeTab === "summary" ? editedContent.summary : editedContent.article;
        navigator.clipboard.writeText(text);
        setCopySuccess(activeTab === "summary" ? "Resumo copiado!" : "Matéria copiada!");
        setTimeout(() => setCopySuccess(""), 2000);
    };

    const handleExport = async () => {
        if (!event || !reportRef.current) return;

        setIsExporting(true);
        try {
            const element = reportRef.current;

            // Remove the 'hidden' class temporarily so html2canvas can capture the element
            element.classList.remove('hidden');

            const canvas = await html2canvas(element, {
                scale: 2, // 2x for better crisp resolution
                useCORS: true,
                logging: false,
                windowWidth: 800, // Enforce the template's max width during capture
            });

            // Add 'hidden' back
            element.classList.add('hidden');

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // A4 dimensions are 210 x 297 mm
            const pdfWidth = 210;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Add image to PDF (position x=0, y=0)
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            // If the content is taller than 1 page, we need to add pages (pagination)
            let heightLeft = pdfHeight - 297;
            let position = 0 - 297;

            while (heightLeft > 0) {
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= 297;
                position -= 297;
            }

            pdf.save(`Relatorio_${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        } catch (error) {
            console.error("Failed to export PDF:", error);
            alert("Erro ao exportar PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!event || !e.target.files || e.target.files.length === 0) return;

        let file = e.target.files[0];
        setIsUploading(true);

        try {
            // Compress Image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
            };
            const compressedBlob = await imageCompression(file, options);
            file = new File([compressedBlob], file.name, {
                type: compressedBlob.type,
                lastModified: Date.now(),
            });

            const formData = new FormData();
            formData.append("file", file);

            // 1. Upload to Baserow
            const uploadedFile = await uploadImageToBaserow(formData);

            // 2. Update Event Row in Baserow
            // Baserow expects an array of file objects for file fields. We append the new photo.
            const existingPhotos = event.fotos || [];
            if (!existingPhotos.find(p => p.url === event.coverUrl) && event.coverUrl) {
                // In case the coverUrl exists but isn't in fotos (legacy data)
            }
            const newPhotos = [...existingPhotos, { name: uploadedFile.name, url: uploadedFile.url }];

            await updateEventRow(parseInt(event.id), { Fotos: newPhotos });

            // 3. Update Local State
            const updatedEvent = {
                ...event,
                coverUrl: event.coverUrl || uploadedFile.url, // Keep first image as cover if empty
                fotos: newPhotos,
                updatedAt: new Date().toISOString()
            };

            setEvent(updatedEvent);
            saveEvent(updatedEvent); // Update local storage too

            alert("Imagem atualizada com sucesso!");

        } catch (error) {
            console.error("Failed to upload image:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            alert(`Erro ao enviar imagem: ${errorMessage}`);
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/events">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                                {event.title}
                            </h1>
                            <Badge variant="outline" className="hidden sm:inline-flex">{event.status}</Badge>
                            {isSaving && <span className="text-xs text-gray-400 animate-pulse">Salvando...</span>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRegenerate} title="Regenerar conteúdo">
                            <RefreshCw className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Regenerar</span>
                        </Button>
                        <Button
                            variant={isEditing ? "secondary" : "primary"}
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Edit className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{isEditing ? "Visualizar" : "Editar Texto"}</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden">
                        <div className="aspect-video w-full bg-gray-100 relative group">
                            {event.coverUrl || event.coverBase64 ? (
                                <img src={event.coverUrl || event.coverBase64} alt={event.title} className="h-full w-full object-cover transition-opacity group-hover:opacity-90" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">Sem imagem</div>
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={triggerFileInput}
                                    disabled={isUploading}
                                    className="gap-2"
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {isUploading ? "Enviando..." : "Trocar Imagem"}
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        {event.fotos && event.fotos.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
                                {event.fotos.map((photo, idx) => (
                                    <img
                                        key={idx}
                                        src={photo.url}
                                        alt={`Foto ${idx + 1}`}
                                        className="h-16 w-16 object-cover rounded-md flex-shrink-0 cursor-pointer border border-gray-200 hover:opacity-80 transition-opacity"
                                        onClick={() => {
                                            const updated = { ...event, coverUrl: photo.url };
                                            setEvent(updated);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(event.date).toLocaleString("pt-BR")}
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        {event.location}
                                    </div>
                                )}
                                {event.organizer && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <User className="h-4 w-4 mt-0.5" />
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(event.organizer) ? (
                                                event.organizer.map((org, index) => (
                                                    <Badge key={index} variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                        {org}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                    {event.organizer}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {event.eixos && event.eixos.length > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Eixos</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {event.eixos.map((eixo, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] font-normal">
                                                {eixo}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {event.projetos && event.projetos.length > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Projetos</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {event.projetos.map((projeto, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] font-normal">
                                                {projeto}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {event.publico && event.publico.length > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Público</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {event.publico.map((pub, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] font-normal bg-blue-50 text-blue-700">
                                                {pub}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {event.quantidade && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Quantidade de Pessoas/Atendimentos</h4>
                                    <span className="text-sm font-semibold text-gray-900 border border-gray-200 px-3 py-1 rounded-md inline-flex items-center gap-2 bg-gray-50">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        {event.quantidade}
                                    </span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Como/Quando</h4>
                                <ExpandableText content={event.comoQuanto} />
                            </div>

                            <div className="pt-2 border-t border-gray-100 mt-2">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Por quê?</h4>
                                <ExpandableText content={event.porQue} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Content Editor */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveTab("summary")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === "summary" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Resumo
                            </button>
                            <button
                                onClick={() => setActiveTab("article")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === "article" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Matéria
                            </button>
                            <button
                                onClick={() => setActiveTab("fotos")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === "fotos" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Fotos
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                {copySuccess ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">{copySuccess || "Copiar"}</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share className="h-4 w-4 mr-2" />}
                                {isExporting ? "Exportando..." : "Exportar PDF"}
                            </Button>
                        </div>
                    </div>

                    <Card className="min-h-[500px] flex flex-col">
                        <CardContent className="flex-1 p-0">
                            {isEditing && activeTab !== "fotos" ? (
                                <Textarea
                                    value={activeTab === "summary" ? editedContent.summary : editedContent.article}
                                    onChange={(e) =>
                                        setEditedContent({
                                            ...editedContent,
                                            [activeTab]: e.target.value,
                                        })
                                    }
                                    className="w-full h-full min-h-[500px] border-0 focus:ring-0 p-6 text-base leading-relaxed resize-none rounded-2xl"
                                    placeholder="O conteúdo gerado aparecerá aqui..."
                                />
                            ) : activeTab === "fotos" ? (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Galeria de Fotos</h3>
                                        <Button onClick={triggerFileInput} disabled={isUploading} size="sm" className="gap-2">
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                            Adicionar Foto
                                        </Button>
                                    </div>
                                    {(!event.fotos || event.fotos.length === 0) ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <Upload className="h-10 w-10 text-gray-400 mb-4" />
                                            <p className="text-gray-500 font-medium">Nenhuma foto adicionada ainda.</p>
                                            <p className="text-sm text-gray-400 mt-1">Clique no botão acima para enviar fotos para este evento.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {event.fotos.map((photo, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-200">
                                                    <img src={photo.url} alt={`Foto do evento ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <a href={photo.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white">
                                                            <Share className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 prose prose-lg prose-blue max-w-none">
                                    <ReactMarkdown>
                                        {activeTab === "summary" ? editedContent.summary : editedContent.article}
                                    </ReactMarkdown>
                                    {(!editedContent.summary && !editedContent.article) && (
                                        <p className="text-gray-400 italic">Nenhum conteúdo gerado.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Hidden PDF Export Template */}
            {event && (
                <div className="hidden absolute left-[-9999px] top-0">
                    <EventReportTemplate ref={reportRef} event={event} />
                </div>
            )}
        </div>
    );
}
