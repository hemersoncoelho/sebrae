"use client";

import { EventItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface TrendingSidebarProps {
    events: EventItem[];
}

export function TrendingSidebar({ events }: TrendingSidebarProps) {
    // Mock logic: take first 4 events
    const trending = events.slice(0, 4);

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Em Alta
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {trending.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum evento em destaque.</p>
                ) : (
                    trending.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`} className="group flex gap-3 items-start">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                {event.coverUrl || event.coverBase64 ? (
                                    <img
                                        src={event.coverUrl || event.coverBase64}
                                        alt={event.title}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gray-200" />
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-blue-600">
                                    {event.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {new Date(event.date).toLocaleDateString("pt-BR")}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
