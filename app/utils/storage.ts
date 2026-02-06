import { EventItem } from "../types";

const STORAGE_KEY = "relatorio_evento_data";

export const getEvents = (): EventItem[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const getEvent = (id: string): EventItem | undefined => {
    const events = getEvents();
    return events.find((e) => e.id === id);
};

export const saveEvent = (event: EventItem): void => {
    const events = getEvents();
    const existingIndex = events.findIndex((e) => e.id === event.id);

    if (existingIndex >= 0) {
        events[existingIndex] = event;
    } else {
        events.push(event);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const deleteEvent = (id: string): void => {
    const events = getEvents();
    const filtered = events.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
