"use client";

import * as React from "react";
import { EventItem } from "@/app/types";

interface MonthlyEventsChartProps {
    events: EventItem[];
}

export function MonthlyEventsChart({ events }: MonthlyEventsChartProps) {
    const data = React.useMemo(() => {
        // If no events, return empty
        if (events.length === 0) return [];

        // Sort events by date using timestamps
        const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Use a Map to preserve insertion order (which is chronological due to sort)
        const monthMap = new Map<string, number>();

        sortedEvents.forEach(event => {
            if (!event.date) return;

            const date = new Date(event.date);
            // Check for invalid date
            if (isNaN(date.getTime())) return;

            // Create a sortable key (YYYY-MM) to ensure correct ordering if we used a plain object
            // But since we are iterating sorted array, insertion order is fine.
            try {
                const monthKey = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
                monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
            } catch (e) {
                console.warn("Error formatting date:", event.date, e);
            }
        });

        return Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }));

    }, [events]);

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Eventos por Mês</h3>

            <div className="flex items-end justify-between gap-2 h-40">
                {data.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Sem dados
                    </div>
                ) : (
                    data.map((item, index) => {
                        const heightPercentage = (item.count / maxCount) * 100;
                        return (
                            <div key={index} className="flex flex-col items-center gap-2 flex-1 group h-full">
                                <div className="relative w-full flex items-end justify-center h-full">
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                        {item.count} eventos
                                    </div>
                                    {/* Bar Container */}
                                    <div
                                        className="w-full max-w-[24px] bg-blue-50 rounded-t-sm relative overflow-hidden"
                                        style={{ height: '100%' }}
                                    >
                                        {/* Filled Bar */}
                                        <div
                                            className="absolute bottom-0 w-full bg-blue-600 rounded-t-sm transition-all duration-500 ease-out group-hover:bg-blue-700"
                                            style={{ height: `${heightPercentage}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-[10px] font-medium text-gray-500 uppercase">{item.month}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
