"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { EventCard } from "@/app/components/EventCard";
import { TrendingSidebar } from "@/app/components/TrendingSidebar";
import { EventItem } from "@/app/types";
import { getEventsFromBaserow } from "@/app/services/baserow";
import { MonthlyEventsChart } from "@/app/components/MonthlyEventsChart";
import { getEvents as fetchLocalEvents } from "@/app/utils/storage";

export default function EventsPage() {
    const [events, setEvents] = React.useState<EventItem[]>([]);
    const [search, setSearch] = React.useState("");
    const [filteredEvents, setFilteredEvents] = React.useState<EventItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedMonth, setSelectedMonth] = React.useState("Todos");

    // Extract available months from events
    const availableMonths = React.useMemo(() => {
        const months = new Set<string>();
        events.forEach(event => {
            const date = new Date(event.date);
            const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            // Capitalize first letter
            const formatted = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
            months.add(formatted);
        });
        // Sort months (this is a simple string sort, ideally should be chronological)
        return Array.from(months);
    }, [events]);

    React.useEffect(() => {
        const loadEvents = async () => {
            try {
                // 1. Try fetching from Baserow
                const baserowEvents = await getEventsFromBaserow();

                // 2. Map to EventItem
                const mappedEvents: EventItem[] = baserowEvents.map((row) => ({
                    id: row.id.toString(),
                    title: row.Evento,
                    date: row.Data_Evento,
                    location: row.Local,
                    organizer: row.Agente,
                    coverUrl: row.Fotos?.[0]?.url || "",
                    porQue: row.porque ? row.porque.split(",").map((s: string) => s.trim()) : [],
                    comoQuanto: row["como/quanto"] ? row["como/quanto"].split(",").map((s: string) => s.trim()) : [],
                    tone: "jornalistico", // Default as it's not in Baserow yet
                    length: "medio",     // Default
                    cta: false,          // Default
                    status: "Publicado",
                    views: 0,
                    generated: { summary: "", article: "" }, // Content not stored in Baserow yet based on schema
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));

                // Sort by date desc
                const sorted = mappedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setEvents(sorted);
                setFilteredEvents(sorted);
            } catch (error) {
                console.error("Failed to fetch from Baserow, falling back to local storage", error);
                // Fallback to local storage
                const localData = fetchLocalEvents();
                const sorted = localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setEvents(sorted);
                setFilteredEvents(sorted);
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, []);

    React.useEffect(() => {
        const lower = search.toLowerCase();
        let filtered = events.filter((e) => e.title.toLowerCase().includes(lower));

        if (selectedMonth !== "Todos") {
            filtered = filtered.filter(e => {
                const date = new Date(e.date);
                const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                const formatted = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
                return formatted === selectedMonth;
            });
        }

        setFilteredEvents(filtered);
    }, [search, events, selectedMonth]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                            RE
                        </div>
                        <span className="hidden sm:inline-block font-bold text-gray-900">Relatório de Evento</span>
                    </div>

                    <div className="flex flex-1 items-center gap-2 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Buscar eventos..."
                                className="pl-9 bg-gray-100 border-transparent focus:bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <Link href="/create">
                        <Button className="shrink-0 gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Novo Evento</span>
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Eventos Publicados</h1>
                            <span className="text-sm text-gray-500">{filteredEvents.length} eventos</span>
                        </div>

                        {/* Month Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            <button
                                onClick={() => setSelectedMonth("Todos")}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedMonth === "Todos"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                    }`}
                            >
                                Todos
                            </button>
                            {availableMonths.map((month) => (
                                <button
                                    key={month}
                                    onClick={() => setSelectedMonth(month)}
                                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedMonth === month
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-[300px] rounded-xl bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                                <div className="rounded-full bg-gray-50 p-4 mb-4">
                                    <Plus className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Nenhum evento encontrado</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
                                    Comece criando seu primeiro evento para gerar relatórios automáticos.
                                </p>
                                <Link href="/create">
                                    <Button>Criar primeiro evento</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {filteredEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar (Desktop only) */}
                    <div className="hidden lg:block lg:col-span-4 space-y-6">
                        <TrendingSidebar events={events} />

                        {/* Promo / Extra Widget */}
                        <MonthlyEventsChart events={events} />
                    </div>
                </div>
            </main>
        </div>
    );
}
