"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, Target, TrendingUp, AlertCircle, FileCheck, Lightbulb, Link as LinkIcon, Download } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { BrainLoader } from "@/app/components/ui/BrainLoader";
import { getGestaoReport, GestaoReportResponse } from "@/app/services/baserowGestao";

export default function GestaoReportDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [report, setReport] = React.useState<GestaoReportResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const loadReport = async () => {
            try {
                const data = await getGestaoReport(id);
                setReport(data);
            } catch (error) {
                console.error("Failed to fetch gestao report", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadReport();
    }, [id]);

    const handlePrint = () => {
        if (!report) return;
        const originalTitle = document.title;
        document.title = `${report.eixo} - Relatório Gestão`;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 500);
    };

    if (isLoading) return <BrainLoader />;

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold mb-4">Relatório não encontrado</h2>
                <Button onClick={() => router.push("/relatorio-gestao")}>Voltar para a lista</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <style type="text/css" media="print">
                {`
                  @page { margin: 20mm; }
                `}
            </style>
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/relatorio-gestao")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                            {report.eixo}
                        </h1>
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                        <Download className="h-4 w-4" />
                        Imprimir / PDF
                    </Button>
                </div>
            </header>

            <main className="container mx-auto mt-8 max-w-4xl px-4 flex flex-col gap-8 print:mt-0 print:px-0">
                {/* Cabeçalho do Relatório */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8">
                        <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                            {report.periodo}
                        </span>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-[#009151] font-bold text-sm tracking-widest uppercase">Eixo Estratégico</p>
                            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                                {report.eixo}
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-5 w-5 text-indigo-500" />
                                <span className="font-medium">Analista:</span>
                                <span className="text-gray-900">{report.nome_analista}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Target className="h-5 w-5 text-indigo-500" />
                                <span className="font-medium">Projeto:</span>
                                <span className="text-gray-900">{report.projeto}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Conteúdo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Coluna Principal */}
                    <div className="md:col-span-2 space-y-6 flex flex-col">
                        {/* Ações */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="border-b border-gray-50 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                    <FileCheck className="h-5 w-5 text-green-600" />
                                    Principais Ações Executadas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {report.principais_acoes}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resultados */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="border-b border-gray-50 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Resultados Concretos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {report.resultados}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Barra Lateral / Destaques */}
                    <div className="space-y-6">
                        {/* Impacto */}
                        <Card className="bg-indigo-600 text-white border-none shadow-md overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <p className="font-bold text-indigo-100 uppercase text-xs tracking-wider">Impacto Alcançado</p>
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">
                                    {report.impacto || "N/A"}
                                </h3>
                            </CardContent>
                        </Card>

                        {/* Destaque */}
                        <Card className="border-none shadow-sm bg-yellow-50/50">
                            <CardHeader className="pb-3 px-6 pt-6">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-yellow-800 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Destaque do Período
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-0">
                                <p className="text-sm text-yellow-900 font-medium leading-relaxed italic border-l-2 border-yellow-200 pl-3">
                                    "{report.destaque}"
                                </p>
                            </CardContent>
                        </Card>

                        {/* Indicadores */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-50">
                                <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-wider">Métricas e Indicadores</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {report.indicadores}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Seção de Rodapé do Detalhamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Riscos */}
                    <Card className="border-none shadow-sm border-l-4 border-l-red-500 bg-red-50/20">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-md font-bold text-red-800 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Riscos e Gargalos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-900 leading-relaxed">
                                {report.riscos}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sugestão de Comunicação */}
                    <Card className="border-none shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md font-bold text-indigo-800 flex items-center gap-2">
                                <Send className="h-4 w-4 rotate-45" /> {/* Use a standard icon or similar */}
                                Pauta para Comunicação
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                {report.sugestao}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Link de Evidências */}
                {report.evidencias && (
                    <div className="pt-4">
                        <a 
                            href={report.evidencias} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 p-4 bg-white border border-dashed border-indigo-300 rounded-2xl text-indigo-700 hover:bg-indigo-50 transition-all font-bold"
                        >
                            <LinkIcon className="h-5 w-5" />
                            Acessar Evidências e Documentação Complementar
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}

// Simple Send icon component for the suggestion section
function Send(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}
