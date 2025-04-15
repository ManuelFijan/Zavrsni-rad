import {isSameDay} from "date-fns";

export interface CalendarEvent {
    id: number;
    date: Date;
    title: string;
}

// In-memory events
let eventsDb: CalendarEvent[] = [
    {id: 1, date: new Date(), title: "Provjeriti stanje skladišta"},
    {
        id: 2,
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
        title: "Dostaviti nove projekte",
    },
    {
        id: 3,
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
        title: "Isplatiti plaće",
    },
    {
        id: 4,
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
        title: "Napraviti račune",
    },
];

// fetch all events
export async function getEvents(): Promise<CalendarEvent[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(eventsDb);
        }, 300);
    });
}

// add new event to "database"
export async function addEvent(date: Date, title: string): Promise<CalendarEvent> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!date || !title.trim()) {
                reject("Missing date or event title.");
                return;
            }
            const newId = eventsDb.length > 0 ? eventsDb[eventsDb.length - 1].id + 1 : 1;
            const newEvt: CalendarEvent = {id: newId, date, title};
            //eventsDb.push(newEvt);
            resolve(newEvt);
        }, 300);
    });
}
