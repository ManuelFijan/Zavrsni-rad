import apiClient from "./axiosConfig";
import { Quote } from './QuoteService';

export interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    quoteId?: number;
}

export interface CalendarEventCreate {
    title: string;
    date: string;
    quoteId?: number;
}

export async function getEvents(): Promise<CalendarEvent[]> {
    try {
        const response = await apiClient.get<CalendarEvent[]>('/api/calendar-events');
        return response.data.map(event => ({
            ...event,
            date: event.date
        }));
    } catch (error) {
        console.error("Failed to fetch events:", error);
        throw error;
    }
}

export async function addEvent(eventData: CalendarEventCreate): Promise<CalendarEvent> {
    try {
        const response = await apiClient.post<CalendarEvent>('/api/calendar-events', eventData);
        return {
            ...response.data,
            date: response.data.date
        };
    } catch (error) {
        console.error("Failed to add event:", error);
        throw error;
    }
}

export async function deleteCalendarEvent(eventId: number): Promise<void> {
    try {
        await apiClient.delete(`/api/calendar-events/${eventId}`);
    } catch (error) {
        console.error(`Failed to delete event ${eventId}:`, error);
        throw error;
    }
}