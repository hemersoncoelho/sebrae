"use client";

import * as React from "react";
import { EventItem } from "@/app/types";

interface ProjetosChartProps {
    events: EventItem[];
}

// Math helper for SVG arcs
function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
}

export function ProjetosChart({ events }: ProjetosChartProps) {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const data = React.useMemo(() => {
        if (events.length === 0) return [];

        const projectMap = new Map<string, number>();

        events.forEach(event => {
            const projetos = Array.isArray(event.projetos)
                ? event.projetos
                : event.projetos ? [event.projetos] : [];

            projetos.forEach(projeto => {
                projectMap.set(projeto, (projectMap.get(projeto) || 0) + 1);
            });
        });

        // Calculate total for percentages
        const total = Array.from(projectMap.values()).reduce((a, b) => a + b, 0);

        return Array.from(projectMap.entries())
            .map(([name, count]) => ({
                name,
                count,
                percentage: count / total
            }))
            .sort((a, b) => b.count - a.count);

    }, [events]);

    const totalEvents = React.useMemo(() => {
        return data.reduce((acc, item) => acc + item.count, 0);
    }, [data]);

    const colors = [
        "text-blue-500",
        "text-emerald-500",
        "text-violet-500",
        "text-amber-500",
        "text-red-500",
        "text-cyan-500",
        "text-pink-500",
        "text-lime-500",
        "text-indigo-500",
        "text-orange-500"
    ];

    // Helper to get hex color for legend
    const getHexColor = (index: number) => {
        const hexColors = [
            "#3b82f6", // blue-500
            "#10b981", // emerald-500
            "#8b5cf6", // violet-500
            "#f59e0b", // amber-500
            "#ef4444", // red-500
            "#06b6d4", // cyan-500
            "#ec4899", // pink-500
            "#84cc16", // lime-500
            "#6366f1", // indigo-500
            "#f97316"  // orange-500
        ];
        return hexColors[index % hexColors.length];
    };

    let cumulativePercent = 0;

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col h-full min-h-[400px]">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Projetos</h3>

            {data.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-400 text-sm h-full">
                    Sem dados
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 h-full">
                    {/* SVG Donut Chart */}
                    <div className="relative w-48 h-48">
                        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90 transform">
                            {data.map((slice, index) => {
                                const start = cumulativePercent;
                                const end = cumulativePercent + slice.percentage;
                                cumulativePercent = end;

                                // If it's a full circle (100%), draw a circle
                                if (slice.percentage === 1) {
                                    return (
                                        <circle
                                            key={index}
                                            cx="0"
                                            cy="0"
                                            r="0.8" // Donut thickness handled by stroke-width or difference in radius? 
                                            // SVG approach: multiple paths are complex. 
                                            // Simpler approach: stroke-dasharray on a circle.
                                            fill="transparent"
                                            stroke={getHexColor(index)}
                                            strokeWidth="0.4"
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            className="transition-all duration-200 cursor-pointer hover:opacity-90"
                                        />
                                    )
                                }

                                const [startX, startY] = getCoordinatesForPercent(start);
                                const [endX, endY] = getCoordinatesForPercent(end);

                                const largeArcFlag = slice.percentage > 0.5 ? 1 : 0;

                                const pathData = [
                                    `M ${startX} ${startY}`, // Move to start
                                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc to end
                                    `L 0 0`, // Line to center (creates a pie slice, we'll mask center or use stroke?)
                                ].join(' ');

                                // To make a donut with hoverable slices, standard path is easier as a PIE slice, 
                                // then put a white circle in middle on top.

                                const isHovered = hoveredIndex === index;
                                const scale = isHovered ? 1.05 : 1;

                                return (
                                    <path
                                        key={index}
                                        d={pathData}
                                        fill={getHexColor(index)}
                                        className="transition-all duration-300 ease-out cursor-pointer"
                                        style={{
                                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                            transformOrigin: '0 0',
                                            opacity: (hoveredIndex !== null && hoveredIndex !== index) ? 0.6 : 1
                                        }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Hole for Donut Effect */}
                        <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm pointer-events-none">
                            <span className={`text-3xl font-bold transition-colors duration-300 ${hoveredIndex !== null ? colors[hoveredIndex % colors.length] : 'text-gray-900'}`}>
                                {hoveredIndex !== null ? data[hoveredIndex].count : totalEvents}
                            </span>
                            <span className="text-xs text-gray-500 uppercase font-medium text-center px-2 leading-tight">
                                {hoveredIndex !== null ? data[hoveredIndex].name : 'Projetos'}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="w-full space-y-2">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between text-sm p-1 rounded transition-colors cursor-pointer ${hoveredIndex === index ? 'bg-gray-50' : ''}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-3 h-3 rounded-full shrink-0`} style={{ backgroundColor: getHexColor(index) }} />
                                    <span className={`truncate max-w-[180px] transition-font ${hoveredIndex === index ? 'font-medium text-gray-900' : 'text-gray-600'}`} title={item.name}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className={`font-medium ${hoveredIndex === index ? 'text-gray-900' : 'text-gray-500'}`}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
