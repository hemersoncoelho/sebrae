"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Edit, RefreshCw, Share, Calendar, MapPin, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Textarea } from "@/app/components/ui/Textarea";
import { Badge } from "@/app/components/ui/Badge";
import { Card, CardContent } from "@/app/components/ui/Card";
import { getEvent, saveEvent } from "@/app/utils/storage";
import { generateContent } from "@/app/utils/generate";
import { EventItem } from "@/app/types";
import ReactMarkdown from "react-markdown";

import { getEventFromBaserow } from "@/app/services/baserow";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [event, setEvent] = React.useState<EventItem | null>(null);
    const [activeTab, setActiveTab] = React.useState<"summary" | "article">("summary");
    const [editedContent, setEditedContent] = React.useState({ summary: "", article: "" });
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [copySuccess, setCopySuccess] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

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
                    organizer: row.Agente,
                    coverUrl: row.Fotos?.[0]?.url || "",
                    coverBase64: "",
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
                        <div className="aspect-video w-full bg-gray-100 relative">
                            {event.coverUrl || event.coverBase64 ? (
                                <img src={event.coverUrl || event.coverBase64} alt={event.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">Sem imagem</div>
                            )}
                        </div>
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
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        {event.organizer}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Como/Quanto</h4>
                                <div className="prose prose-neutral text-gray-500 max-w-none text-[10px] leading-tight">
                                    <ReactMarkdown>{event.comoQuanto.join("\n\n")}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 mt-2">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Por quê?</h4>
                                <div className="prose prose-neutral text-gray-500 max-w-none text-[10px] leading-tight">
                                    <ReactMarkdown>{event.porQue.join("\n\n")}</ReactMarkdown>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Content Editor */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setActiveTab("summary")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "summary" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Resumo
                            </button>
                            <button
                                onClick={() => setActiveTab("article")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "article" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Matéria
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                {copySuccess ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">{copySuccess || "Copiar"}</span>
                            </Button>
                            <Button variant="outline" size="sm" disabled title="Em breve">
                                <Share className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    <Card className="min-h-[500px] flex flex-col">
                        <CardContent className="flex-1 p-0">
                            {isEditing ? (
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
        </div>
    );
}
