import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "./ui/Card";
import { GestaoReportResponse } from "../services/baserowGestao";
import { FileText, MapPin, Briefcase } from "lucide-react";

export function GestaoCard({ report }: { report: GestaoReportResponse }) {
    return (
        <Link href={`/relatorio-gestao/${report.id}`} className="block h-full">
            <Card className="hover:shadow-lg transition-all h-full border-gray-200 hover:border-indigo-300 group">
                <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {report.periodo || "Sem período"}
                        </span>
                        <FileText className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    
                    <div className="mb-4 space-y-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-1 shrink-0" />
                            <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                                {report.eixo || "Eixo não informado"}
                            </h3>
                        </div>
                        <div className="flex items-start gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-gray-400 mt-1 shrink-0" />
                            <p className="text-sm font-medium text-gray-500 line-clamp-1">
                                {report.projeto || "Projeto não informado"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium truncate">
                            Analista: <span className="text-gray-900">{report.nome_analista || "Não informado"}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
