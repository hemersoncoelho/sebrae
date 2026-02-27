"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { UploadField } from "@/app/components/UploadField";
import { ChipInput } from "@/app/components/ChipInput";
import { MultiSelect } from "@/app/components/MultiSelect";
import { BrainLoader } from "@/app/components/ui/BrainLoader";
import { EventItem, EventTone, EventLength } from "@/app/types";
import { saveEvent } from "@/app/utils/storage";
import { generateContent } from "@/app/utils/generate";
import { uploadImageToBaserow, createEventRow } from "@/app/services/baserow";

const ORGANIZERS = [
    "Carla Araújo",
    "Julião Klessio",
    "Aucélio de Sousa",
    "Wandrey Girão",
    "Georgia Nobre",
    "Caio Sabóia"
];

const EIXOS = [
    "Ambiente de Negócios",
    "Rede de Atendimento",
    "Cultura Empreededora",
    "Ecossistema de Inovação",
    "Competitividade Empresarial"
];

const PROJETOS = [
    "COMP. EMP - MODA CARIRI",
    "COMP. EMP. - ROTA TURISTICA DO CARIRI",
    "COMP. EMP. - BOVINOCULTURA DE LEITE E DERIVADOS CARIRI",
    "COMP. EMP. - ALI PRODUTIVIDADE",
    "COMP. EMP. - ALI RURAL",
    "PLURAL CARIRI",
    "EDUCAÇÃO EMPREENDEDORA - JEPP",
    "PARCIAL",
    "R.E - DESENVOLVIMENTO INOVAÇÃO - REGIONAL CARIRI",
    "R.E - CE REDE INTEGRADA DE ECOSSISTEMAS DE INOVAÇÃO",
    "A.N - CIDADE EMPREENDEDORA CARIRI",
    "A.N - POLO EMPREENDEDOR CARIRI",
    "A.N - TERRITÓRIO EMPREENDEDOR CE CARIRI",
    "A.N - QUALIFICAÇÃO E RENDA",
    "R.A. - TERRITÓRIOS DA ESPERANÇA - UR CARIRI"
];

export default function CreateEventPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [imageFile, setImageFile] = React.useState<File | null>(null);

    const [formData, setFormData] = React.useState<Partial<EventItem>>({
        title: "",
        date: "",
        location: "",
        organizer: [],
        eixos: [],
        projetos: [],
        coverBase64: "",
        comoQuanto: [],
        porQue: [],
        tone: "jornalistico",
        length: "medio",
        cta: false,
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title) newErrors.title = "O título do evento é obrigatório.";
        if (!formData.date) newErrors.date = "A data é obrigatória.";
        if (!formData.comoQuanto?.length) newErrors.comoQuanto = "Adicione pelo menos um item em Como/Quanto.";
        if (!formData.porQue?.length) newErrors.porQue = "Adicione pelo menos um item em Por quê?.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGenerate = async () => {
        if (!validate()) return;
        setIsLoading(true);

        try {
            const eventId = uuidv4();
            const now = new Date().toISOString();

            // 1. Generate Content
            const generated = generateContent(formData as EventItem);

            // 2. Upload to Baserow (if image exists)
            let baserowImageName = "";
            let baserowImageUrl = "";

            if (imageFile) {
                try {
                    const formData = new FormData();
                    formData.append("file", imageFile);
                    const uploadResult = await uploadImageToBaserow(formData);
                    baserowImageName = uploadResult.name;
                    baserowImageUrl = uploadResult.url;
                } catch (err) {
                    console.error("Failed to upload image to Baserow", err);
                }
            }

            // 3. Create Row in Baserow
            let baserowId = 0;
            try {
                baserowId = await createEventRow({
                    Evento: formData.title!,
                    Data_Evento: formData.date!,
                    Local: formData.location || "",
                    Agente: formData.organizer ? formData.organizer.join(", ") : "",
                    eixo: formData.eixos ? formData.eixos.join(", ") : "",
                    projeto: formData.projetos ? formData.projetos.join(", ") : "",
                    Fotos: baserowImageName ? [{ name: baserowImageName, url: baserowImageUrl }] : [],
                    "como/quanto": formData.comoQuanto!.join(", "),
                    porque: formData.porQue!.join(", "),
                });
            } catch (err) {
                console.error("Failed to create row in Baserow", err);
            }

            // 4. Webhook Integration
            try {
                await fetch("https://webhook.solucoesai.tech/webhook/11606907-7c8a-4e60-b290-d8c4545cf2c4", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        id: eventId,
                        baserowId: baserowId, // Included Baserow ID
                        coverUrl: baserowImageUrl,
                        fotos: baserowImageName ? [{ name: baserowImageName, url: baserowImageUrl }] : [],
                        coverBase64: baserowImageUrl ? "" : formData.coverBase64, // Send base64 if no URL
                        generated,
                        createdAt: now,
                    }),
                });
            } catch (webhookError) {
                console.error("Failed to send webhook", webhookError);
            }

            // 5. Save Locally
            // IMPORTANT: If we have a remote URL, clear the base64 to avoid LocalStorage QuotaExceededError
            const eventToSave: EventItem = {
                id: eventId,
                title: formData.title!,
                date: formData.date!,
                location: formData.location,
                organizer: formData.organizer,
                eixos: formData.eixos,
                projetos: formData.projetos,
                coverBase64: baserowImageUrl ? "" : (formData.coverBase64 || ""),
                coverUrl: baserowImageUrl,
                fotos: baserowImageName ? [{ name: baserowImageName, url: baserowImageUrl }] : [],
                comoQuanto: formData.comoQuanto!,
                porQue: formData.porQue!,
                tone: formData.tone as EventTone,
                length: formData.length as EventLength,
                cta: formData.cta || false,
                status: "Publicado",
                views: 0,
                generated: generated,
                createdAt: now,
                updatedAt: now,
            };

            saveEvent(eventToSave);
            router.push(`/events/${eventId}`);
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDraft = () => {
        if (!formData.title) {
            setErrors({ title: "Título é obrigatório para salvar rascunho." });
            return;
        }

        const eventId = uuidv4();
        const now = new Date().toISOString();

        const draftEvent: EventItem = {
            ...(formData as EventItem),
            id: eventId,
            status: "Rascunho",
            comoQuanto: formData.comoQuanto || [],
            porQue: formData.porQue || [],
            coverBase64: formData.coverBase64 || "",
            generated: { summary: "", article: "" },
            createdAt: now,
            updatedAt: now,
        };

        saveEvent(draftEvent);
        router.push("/events");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {isLoading && <BrainLoader />}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Cadastrar Evento</h1>
                            <p className="text-xs text-gray-500">Preencha os dados para gerar o relatório</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 max-w-3xl px-4 space-y-6">
                {/* Informações do Evento */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Evento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nome do Evento *</label>
                            <Input
                                placeholder="Ex: Workshop de Inovação 2024"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Data *</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className={errors.date ? "border-red-500" : ""}
                                />
                                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Local</label>
                                <Input
                                    placeholder="Ex: Auditório Principal"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <MultiSelect
                                label="Organizador"
                                options={ORGANIZERS}
                                values={formData.organizer || []}
                                onChange={(vals) => setFormData({ ...formData, organizer: vals })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <MultiSelect
                                label="Eixos"
                                options={EIXOS}
                                values={formData.eixos || []}
                                onChange={(vals) => setFormData({ ...formData, eixos: vals })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <MultiSelect
                                label="Projetos"
                                options={PROJETOS}
                                values={formData.projetos || []}
                                onChange={(vals) => setFormData({ ...formData, projetos: vals })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Objetivos e Resultados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes Estratégicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ChipInput
                            label="Como/Quando *"
                            placeholder="Digite e aperte Enter (ex: Engajar colaboradores)"
                            values={formData.comoQuanto || []}
                            onChange={(vals) => setFormData({ ...formData, comoQuanto: vals })}
                            error={errors.comoQuanto}
                        />

                        <ChipInput
                            label="Por quê? *"
                            placeholder="Digite e aperte Enter (ex: Para aumentar a retenção)"
                            values={formData.porQue || []}
                            onChange={(vals) => setFormData({ ...formData, porQue: vals })}
                            error={errors.results}
                        />
                    </CardContent>
                </Card>

                {/* Foto */}
                <Card>
                    <CardHeader>
                        <CardTitle>Foto do Evento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UploadField
                            value={formData.coverBase64 || ""}
                            onChange={(base64, file) => {
                                setFormData({ ...formData, coverBase64: base64 });
                                setImageFile(file);
                            }}
                            label="Imagem de Capa (16:9 recomendado)"
                        />
                    </CardContent>
                </Card>

                {/* Configuração de Geração */}
                <Card className="border-blue-100 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            Geração de Conteúdo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Tom de Voz</label>
                                <select
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.tone}
                                    onChange={(e) => setFormData({ ...formData, tone: e.target.value as EventTone })}
                                >
                                    <option value="jornalistico">Jornalístico (Neutro)</option>
                                    <option value="institucional">Institucional (Formal)</option>
                                    <option value="descontraido">Descontraído (Leve)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Tamanho</label>
                                <select
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.length}
                                    onChange={(e) => setFormData({ ...formData, length: e.target.value as EventLength })}
                                >
                                    <option value="curto">Curto (Resumo rápido)</option>
                                    <option value="medio">Médio (Padrão)</option>
                                    <option value="longo">Longo (Detalhado)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="cta"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={formData.cta}
                                onChange={(e) => setFormData({ ...formData, cta: e.target.checked })}
                            />
                            <label htmlFor="cta" className="text-sm font-medium text-gray-700">
                                Incluir Call to Action (CTA) no final
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pb-10">
                    <Button variant="secondary" onClick={handleSaveDraft} className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Rascunho
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        isLoading={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Resumo e Matéria
                    </Button>
                </div>
            </main>
        </div>
    );
}
