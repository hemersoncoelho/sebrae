"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { getGestaoReports, GestaoReportResponse } from "@/app/services/baserowGestao";
import { GestaoCard } from "@/app/components/GestaoCard";

export default function GestaoReportsPage() {
    const [reports, setReports] = React.useState<GestaoReportResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const loadReports = async () => {
            try {
                const data = await getGestaoReports();
                // Baserow sometimes comes unsorted, let's flip it so newest is first by default
                setReports(data.reverse());
            } catch (error) {
                console.error("Failed to fetch gestao reports", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadReports();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/sebrae-logo.png" alt="Sebrae" className="h-10 w-auto" />
                        <span className="hidden sm:inline-block font-bold text-gray-900 text-lg">Relatório de Gestão</span>
                    </div>

                    <Link href="/relatorio-gestao/novo">
                        <Button className="shrink-0 gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Novo Relatório</span>
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Tabs for Navigation match /events */}
                <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
                    <Link
                        href="/events"
                        className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Eventos
                    </Link>
                    <Link
                        href="/events"
                        className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Dashboard
                    </Link>
                    <div
                        className="pb-3 px-1 text-sm font-medium text-indigo-600 relative transition-colors"
                    >
                        Relatório de Gestão
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Relatórios de Gestão</h1>
                            <span className="text-sm text-gray-500">{reports.length} relatórios</span>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[200px] rounded-xl bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                                <div className="rounded-full bg-indigo-50 p-4 mb-4">
                                    <Plus className="h-8 w-8 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Nenhum relatório encontrado</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
                                    Comece criando seu primeiro relatório de gestão trimestral.
                                </p>
                                <Link href="/relatorio-gestao/novo">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">Criar primeiro relatório</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {Object.entries(
                                    reports.reduce((acc, report) => {
                                        const analyst = report.nome_analista || "Outros";
                                        if (!acc[analyst]) acc[analyst] = [];
                                        acc[analyst].push(report);
                                        return acc;
                                    }, {} as Record<string, GestaoReportResponse[]>)
                                ).map(([analyst, analystReports]) => (
                                    <div key={analyst} className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                            <h2 className="text-lg font-bold text-gray-800">{analyst}</h2>
                                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                                {analystReports.length} {analystReports.length === 1 ? 'relatório' : 'relatórios'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {analystReports.map((report) => (
                                                <GestaoCard key={report.id} report={report} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
