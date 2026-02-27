"use client";

import Link from "next/link";
import { EventItem } from "../types";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Calendar, MapPin, Eye } from "lucide-react";

interface EventCardProps {
    event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
    const statusVariant =
        event.status === "Publicado" ? "success" :
            event.status === "Destaque" ? "warning" : "secondary";

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <Link href={`/events/${event.id}`} className="block h-full w-full">
                    {event.coverUrl || event.coverBase64 ? (
                        <img
                            src={event.coverUrl || event.coverBase64}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            Sem imagem
                        </div>
                    )}
                </Link>
                <div className="absolute top-2 left-2 pointer-events-none">
                    <Badge variant={statusVariant} className="shadow-sm">
                        {event.status}
                    </Badge>
                </div>
            </div>

            <CardContent className="flex-1 p-4">
                {event.organizer && event.organizer.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {event.organizer.map((org, index) => (
                            <Badge key={index} variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                                {org}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString("pt-BR")}
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{event.location}</span>
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link href={`/events/${event.id}`}>
                        {event.title}
                    </Link>
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {event.generated.summary || "Sem resumo gerado."}
                </p>

                <div className="flex flex-wrap gap-2">
                    {event.porQue && event.porQue.slice(0, 1).map((obj, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-normal">
                            {obj}
                        </Badge>
                    ))}
                    {event.comoQuanto && event.comoQuanto.slice(0, 1).map((res, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-normal bg-blue-50 text-blue-700 border-blue-100">
                            {res}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    {event.views || 0} views
                </div>
                <div className="flex gap-2">
                    <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="outline">
                            Ver matéria
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
