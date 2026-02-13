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
import { EventsByAnalystChart } from "@/app/components/EventsByAnalystChart";
import { ProjetosChart } from "@/app/components/ProjetosChart";
import { EixosChart } from "@/app/components/EixosChart";
import { getEvents as fetchLocalEvents } from "@/app/utils/storage";
import { parseDate } from "@/app/utils/formatters";

export default function EventsPage() {
    const [events, setEvents] = React.useState<EventItem[]>([]);
    const [search, setSearch] = React.useState("");
    const [filteredEvents, setFilteredEvents] = React.useState<EventItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedMonth, setSelectedMonth] = React.useState("Todos");
    const [selectedProject, setSelectedProject] = React.useState("Todos");
    const [selectedEixo, setSelectedEixo] = React.useState("Todos");
    const [selectedOrganizer, setSelectedOrganizer] = React.useState("Todos");
    const [activeTab, setActiveTab] = React.useState<"eventos" | "dashboard">("eventos");

    // Extract available months from events
    const availableMonths = React.useMemo(() => {
        const months = new Set<string>();
        events.forEach(event => {
            const date = new Date(event.date);
            const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            const formatted = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
            months.add(formatted);
        });
        return Array.from(months);
    }, [events]);

    // Extract available Projects
    const availableProjects = React.useMemo(() => {
        const projects = new Set<string>();
        events.forEach(event => {
            (event.projetos || []).forEach(p => projects.add(p));
        });
        return Array.from(projects).sort();
    }, [events]);

    // Extract available Eixos
    const availableEixos = React.useMemo(() => {
        const eixos = new Set<string>();
        events.forEach(event => {
            (event.eixos || []).forEach(e => eixos.add(e));
        });
        return Array.from(eixos).sort();
    }, [events]);

    // Extract available Organizers
    const availableOrganizers = React.useMemo(() => {
        const organizers = new Set<string>();
        events.forEach(event => {
            if (Array.isArray(event.organizer)) {
                event.organizer.forEach(o => organizers.add(o));
            } else if (event.organizer) {
                organizers.add(event.organizer);
            }
        });
        return Array.from(organizers).sort();
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
                    date: parseDate(row.Data_Evento),
                    location: row.Local,
                    organizer: row.Agente ? row.Agente.split(", ").filter(Boolean) : [],
                    eixos: row.eixo ? row.eixo.split(", ").filter(Boolean) : [],
                    projetos: row.projeto ? row.projeto.split(", ").filter(Boolean) : [],
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

                console.log("Mapped Events:", mappedEvents); // DEBUG: Check dates

                // Sort by date desc
                const sorted = mappedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setEvents(sorted);
                setFilteredEvents(sorted);
            } catch (error) {
                console.error("Failed to fetch from Baserow, falling back to local storage", error);
                // Fallback to local storage
                const localData = fetchLocalEvents();
                const eventsWithParsedDates = localData.map((e: any) => ({
                    ...e,
                    date: parseDate(e.date),
                    organizer: Array.isArray(e.organizer) ? e.organizer : (e.organizer ? [e.organizer] : [])
                }));
                const sorted = eventsWithParsedDates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setEvents(sorted);
                setFilteredEvents(sorted);
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, []);

    // Combined filtering logic
    React.useEffect(() => {
        let filtered = events;

        // 1. Search
        if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((e) => e.title.toLowerCase().includes(lower));
        }

        // 2. Month Filter
        if (selectedMonth !== "Todos") {
            filtered = filtered.filter(e => {
                const date = new Date(e.date);
                const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                const formatted = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
                return formatted === selectedMonth;
            });
        }

        // 3. Project Filter
        if (selectedProject !== "Todos") {
            filtered = filtered.filter(e => (e.projetos || []).includes(selectedProject));
        }

        // 4. Eixo Filter
        if (selectedEixo !== "Todos") {
            filtered = filtered.filter(e => (e.eixos || []).includes(selectedEixo));
        }

        // 5. Organizer Filter
        if (selectedOrganizer !== "Todos") {
            filtered = filtered.filter(e => {
                if (Array.isArray(e.organizer)) {
                    return e.organizer.includes(selectedOrganizer);
                }
                return e.organizer === selectedOrganizer;
            });
        }

        setFilteredEvents(filtered);
    }, [search, events, selectedMonth, selectedProject, selectedEixo, selectedOrganizer]);

    const clearFilters = () => {
        setSearch("");
        setSelectedMonth("Todos");
        setSelectedProject("Todos");
        setSelectedEixo("Todos");
        setSelectedOrganizer("Todos");
    };

    const hasActiveFilters = search || selectedMonth !== "Todos" || selectedProject !== "Todos" || selectedEixo !== "Todos" || selectedOrganizer !== "Todos";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/sebrae-logo.png" alt="Sebrae" className="h-10 w-auto" />
                        <span className="hidden sm:inline-block font-bold text-gray-900 text-lg">Relatório de Eventos</span>
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
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                                Limpar
                            </Button>
                        )}
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
                {/* Tabs */}
                <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("eventos")}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === "eventos"
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Eventos
                        {activeTab === "eventos" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === "dashboard"
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Dashboard
                        {activeTab === "dashboard" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Filters Bar - Visible on both tabs for Month, but other filters only for Eventos list if desired, or all. 
                    User asked for "Filtro do mês" on Dashboard. Let's keep the Month filter common.
                 */}
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap mb-6">
                    {/* Month Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
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
                </div>

                {activeTab === "eventos" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-12 space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900">Eventos Publicados</h1>
                                <span className="text-sm text-gray-500">{filteredEvents.length} eventos</span>
                            </div>

                            {/* Advanced Filters - Only visible on Event List for now as per request specific to Month on Dashboard */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <select
                                    className="h-10 w-full rounded-lg border-gray-200 bg-white text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    <option value="Todos">Todos os Projetos</option>
                                    {availableProjects.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>

                                <select
                                    className="h-10 w-full rounded-lg border-gray-200 bg-white text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                    value={selectedEixo}
                                    onChange={(e) => setSelectedEixo(e.target.value)}
                                >
                                    <option value="Todos">Todos os Eixos</option>
                                    {availableEixos.map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>

                                <select
                                    className="h-10 w-full rounded-lg border-gray-200 bg-white text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                    value={selectedOrganizer}
                                    onChange={(e) => setSelectedOrganizer(e.target.value)}
                                >
                                    <option value="Todos">Todos os Organizadores</option>
                                    {availableOrganizers.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <span className="text-sm text-gray-500">Visão Geral</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-1">
                                <EventsByAnalystChart events={filteredEvents} /> {/* Changed to filteredEvents */}
                            </div>
                            <div className="xl:col-span-1">
                                <ProjetosChart events={filteredEvents} /> {/* Changed to filteredEvents */}
                            </div>
                            <div className="xl:col-span-1">
                                <EixosChart events={filteredEvents} /> {/* Changed to filteredEvents */}
                            </div>
                            <div className="xl:col-span-3">
                                <MonthlyEventsChart events={filteredEvents} /> {/* Changed to filteredEvents */}
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Em Alta</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    {/* Create a filtered version for TrendingSidebar if needed or just pass filteredEvents */}
                                    <TrendingSidebar events={filteredEvents} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
