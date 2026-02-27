"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { EventItem } from "@/app/types";

interface PublicoChartProps {
    events: EventItem[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function PublicoChart({ events }: PublicoChartProps) {
    const data = useMemo(() => {
        const publicoCount: Record<string, number> = {};

        events.forEach(event => {
            if (event.status === "Publicado" && event.publico) {
                event.publico.forEach(pub => {
                    publicoCount[pub] = (publicoCount[pub] || 0) + 1;
                });
            }
        });

        return Object.entries(publicoCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [events]);

    if (data.length === 0) {
        return (
            <Card className="h-full border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-gray-900">Público Alvo</CardTitle>
                    <p className="text-xs text-gray-500">Distribuição por público</p>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center text-sm text-gray-500">
                    Nenhum dado disponível.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-0">
                <CardTitle className="text-base font-bold text-gray-900">Público Alvo</CardTitle>
                <p className="text-xs text-gray-500">Eventos por tipo de público</p>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#374151', fontSize: '12px' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
