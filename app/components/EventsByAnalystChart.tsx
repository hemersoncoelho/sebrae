"use client";

import * as React from "react";
import { EventItem } from "@/app/types";

interface EventsByAnalystChartProps {
    events: EventItem[];
}

export function EventsByAnalystChart({ events }: EventsByAnalystChartProps) {
    const data = React.useMemo(() => {
        // If no events, return empty
        if (events.length === 0) return [];

        // Use a Map to count events per analyst (organizer)
        const analystMap = new Map<string, number>();

        events.forEach(event => {
            const agent = event.organizer || "Desconhecido";
            analystMap.set(agent, (analystMap.get(agent) || 0) + 1);
        });

        // Convert to array and sort by count descending
        return Array.from(analystMap.entries())
            .map(([agent, count]) => ({ agent, count }))
            .sort((a, b) => b.count - a.count);

    }, [events]);

    const maxCount = Math.max(...data.map(d => d.count), 1);

    const colors = [
        "bg-blue-500",
        "bg-emerald-500",
        "bg-violet-500",
        "bg-amber-500",
        "bg-rose-500",
        "bg-cyan-500",
        "bg-indigo-500",
        "bg-lime-500",
        "bg-fuchsia-500",
        "bg-orange-500"
    ];

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Eventos por Analista</h3>

            <div className="space-y-4">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                        Sem dados
                    </div>
                ) : (
                    data.map((item, index) => {
                        const widthPercentage = (item.count / maxCount) * 100;
                        const colorClass = colors[index % colors.length];

                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700 truncate max-w-[180px]" title={item.agent}>
                                        {item.agent}
                                    </span>
                                    <span className="text-gray-500 font-medium">{item.count}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
                                        style={{ width: `${widthPercentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
