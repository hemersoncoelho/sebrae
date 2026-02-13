"use client";

import * as React from "react";
import { EventItem } from "@/app/types";

interface MonthlyEventsChartProps {
    events: EventItem[];
}

export function MonthlyEventsChart({ events }: MonthlyEventsChartProps) {
    const data = React.useMemo(() => {
        // Initialize all months with 0
        const months = [
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ];
        const monthCounts = new Array(12).fill(0);

        events.forEach(event => {
            if (!event.date) return;
            const date = new Date(event.date);
            if (isNaN(date.getTime())) return;

            // Increment count for the month (0-11)
            // Note: This aggregates over ALL years. 
            // If we want only current year, we would filter first. 
            // For now, simple seasonality check is usually desired or the data is from current year.
            monthCounts[date.getMonth()]++;
        });

        return months.map((name, index) => ({
            name,
            count: monthCounts[index]
        }));

    }, [events]);

    const maxCount = Math.max(...data.map(d => d.count), 1);

    const getIntensityColor = (count: number) => {
        if (count === 0) return "bg-gray-50 text-gray-300";

        const intensity = count / maxCount;

        if (intensity < 0.2) return "bg-blue-100 text-blue-700";
        if (intensity < 0.4) return "bg-blue-300 text-blue-800";
        if (intensity < 0.6) return "bg-blue-500 text-white";
        if (intensity < 0.8) return "bg-blue-700 text-white";
        return "bg-blue-900 text-white";
    };

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Eventos por Mês</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className={`
                            relative flex flex-col items-center justify-center p-4 rounded-xl transition-all
                            ${getIntensityColor(item.count)}
                        `}
                        title={`${item.count} eventos em ${item.name}`}
                    >
                        <span className="text-lg font-bold">{item.count}</span>
                        <span className="text-xs uppercase font-medium opacity-80">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
