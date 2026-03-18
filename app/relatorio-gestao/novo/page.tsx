"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { MultiSelect } from "@/app/components/MultiSelect";
import { BrainLoader } from "@/app/components/ui/BrainLoader";
import { createGestaoReport, GestaoReportData } from "@/app/services/baserowGestao";

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
    "Cultura Empreendedora",
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

export default function NovoRelatorioGestaoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    
    // For MultiSelects we need arrays, but we will store them as comma-separated strings
    const [analistas, setAnalistas] = React.useState<string[]>([]);
    const [eixos, setEixos] = React.useState<string[]>([]);
    const [projetos, setProjetos] = React.useState<string[]>([]);

    const [formData, setFormData] = React.useState({
        periodo: "",
        acoes: "",
        impacto: "",
        resultados: "",
        destaque: "",
        indicadores: "",
        evidencias: "",
        riscos: "",
        sugestao: "",
    });

    const handleSave = async () => {
        setIsLoading(true);

        try {
            const dataToSave: GestaoReportData = {
                nome_analista: analistas.join(", "),
                eixo: eixos.join(", "),
                projeto: projetos.join(", "),
                periodo: formData.periodo,
                principais_acoes: formData.acoes,
                impacto: formData.impacto,
                resultados: formData.resultados,
                destaque: formData.destaque,
                indicadores: formData.indicadores,
                evidencias: formData.evidencias,
                riscos: formData.riscos,
                sugestao: formData.sugestao,
            };

            await createGestaoReport(dataToSave);
            
            // Redirect to dashboard
            router.push("/relatorio-gestao");
        } catch (error) {
            console.error("Failed to save Relatório de Gestão", error);
            alert("Erro ao salvar o relatório no Baserow.");
        } finally {
            setIsLoading(false);
        }
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
                            <h1 className="text-xl font-bold text-gray-900">Novo Relatório de Gestão</h1>
                            <p className="text-xs text-gray-500">Registre o resumo do trabalho trimestral</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 max-w-3xl px-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identificação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <MultiSelect
                                label="Nome do analista"
                                options={ORGANIZERS}
                                values={analistas}
                                onChange={setAnalistas}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Período de Referência *</label>
                                <Input
                                    placeholder="Ex: Último Trimestre 2025"
                                    value={formData.periodo}
                                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Empresas / Pessoas / Municípios Impactados</label>
                                <Input
                                    placeholder="Ex: 150 MPEs e 5 Municípios"
                                    value={formData.impacto}
                                    onChange={(e) => setFormData({ ...formData, impacto: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <MultiSelect
                                label="Eixo Estratégico"
                                options={EIXOS}
                                values={eixos}
                                onChange={setEixos}
                            />
                        </div>

                        <div className="grid gap-2">
                            <MultiSelect
                                label="Programa ou Projeto"
                                options={PROJETOS}
                                values={projetos}
                                onChange={setProjetos}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Desempenho e Resultados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Principais Ações Executadas no Trimestre</label>
                            <Textarea
                                placeholder="Descreva as ações macro implementadas no período..."
                                className="min-h-[100px]"
                                value={formData.acoes}
                                onChange={(e) => setFormData({ ...formData, acoes: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Resultados Concretos Obtidos</label>
                            <Textarea
                                placeholder="Descreva os resultados práticos"
                                className="min-h-[100px]"
                                value={formData.resultados}
                                onChange={(e) => setFormData({ ...formData, resultados: e.target.value })}
                            />
                        </div>
                        
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Destaque Técnico ou Institucional do Período</label>
                            <Textarea
                                placeholder="Qual foi o maior sucesso ou entrega de destaque?"
                                className="min-h-[80px]"
                                value={formData.destaque}
                                onChange={(e) => setFormData({ ...formData, destaque: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Indicadores Relevantes (não capturados em sistemas)</label>
                            <Textarea
                                placeholder="Ex: Aumento no engajamento, métricas qualitativas, percepção de valor..."
                                className="min-h-[80px]"
                                value={formData.indicadores}
                                onChange={(e) => setFormData({ ...formData, indicadores: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Anexos e Observações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Evidências (Links, Pastas ou Documentos)</label>
                            <Input
                                placeholder="Cole aqui os links para Google Drive, fotos, etc..."
                                value={formData.evidencias}
                                onChange={(e) => setFormData({ ...formData, evidencias: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Riscos, Gargalos ou Observações Importantes</label>
                            <Textarea
                                placeholder="Tópicos de atenção ou bloqueios operacionais."
                                className="min-h-[80px]"
                                value={formData.riscos}
                                onChange={(e) => setFormData({ ...formData, riscos: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Sugestão de Destaque para Comunicação</label>
                            <Textarea
                                placeholder="O que deveria ser pauta de matéria institucional?"
                                className="min-h-[80px]"
                                value={formData.sugestao}
                                onChange={(e) => setFormData({ ...formData, sugestao: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pb-10">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Salvar Relatório de Gestão
                    </Button>
                </div>
            </main>
        </div>
    );
}
