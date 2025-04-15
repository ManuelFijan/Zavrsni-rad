import React, {useState, useEffect} from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
} from "date-fns";
import { hr } from "date-fns/locale";
import {getEvents, addEvent, CalendarEvent} from "../services/CalendarService";

const CalendarSection: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [view, setView] = useState<"Dan" | "Tjedan" | "Mjesec">("Mjesec");
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // new event creation
    const [newTitle, setNewTitle] = useState<string>("");
    const [newDate, setNewDate] = useState<string>("");

    // load events when calendar opens
    useEffect(() => {
        (async () => {
            try {
                const fetchedEvents = await getEvents();
                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Failed to load events:", error);
            }
        })();
    }, []);

    const handleAddEvent = async () => {
        try {
            if (!newDate || !newTitle.trim()) {
                alert("Please select a date and enter a title.");
                return;
            }
            const dateObj = new Date(newDate);
            const createdEvent = await addEvent(dateObj, newTitle);
            setEvents([...events, createdEvent]);
            setNewDate("");
            setNewTitle("");
        } catch (err: any) {
            alert(err);
        }
    };

    // switch view day/week/month
    const getViewCells = () => {
        if (view === "Dan") {
            return renderDayView();
        } else if (view === "Tjedan") {
            return renderWeekView();
        } else {
            return renderMonthView();
        }
    };

    // day view
    const renderDayView = () => {
        const dayStart = startOfWeek(currentDate, {weekStartsOn: 0});
        const dayEvents = events.filter((e) =>
            isSameDay(e.date, currentDate)
        );

        return (
            <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">
                    Pregled dana - {format(currentDate, "PPP", {locale: hr})}
                </h3>
                {dayEvents.length === 0 ? (
                    <p>Danas nemate događaja.</p>
                ) : (
                    dayEvents.map((evt) => (
                        <div key={evt.id} className="text-sm mb-1">
                            {evt.title}
                        </div>
                    ))
                )}
            </div>
        );
    };

    // week view
    const renderWeekView = () => {
        const start = startOfWeek(currentDate, {weekStartsOn: 0});
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = addDays(start, i);
            const dayEvents = events.filter((e) => isSameDay(e.date, day));
            days.push(
                <div key={day.toString()} className="p-2 border border-gray-200">
                    <div className="text-sm font-semibold mb-1">
                        {format(day, "EEE, MMM d", {locale: hr})}
                    </div>
                    {dayEvents.map((evt) => (
                        <div key={evt.id} className="text-xs">
                            {evt.title}
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div>
                <h3 className="font-bold mb-2">Pregled tjedna</h3>
                <div className="grid grid-cols-7 gap-1">{days}</div>
            </div>
        );
    };

    // month view
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, {weekStartsOn: 0});
        const endDate = endOfWeek(monthEnd, {weekStartsOn: 0});

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter((e) => isSameDay(e.date, cloneDay));

                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={`p-2 border-r border-b border-gray-200 min-h-[80px] relative ${
                            !isSameMonth(cloneDay, monthStart) ? "bg-gray-100 text-gray-400" : ""
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-sm">{format(cloneDay, "d", {locale: hr})}</span>
                            {dayEvents.length > 0 && (
                                <div className="w-2 h-2 bg-orange-600 hover:bg-orange-700 rounded-full"></div>
                            )}
                        </div>
                        {dayEvents.map((evt) => (
                            <div key={evt.id} className="text-xs text-gray-700 mt-1">
                                {evt.title}
                            </div>
                        ))}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-0" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div>
                <h3 className="font-bold mb-2">Pregled mjeseca</h3>
                {rows}
            </div>
        );
    };

    // navigation buttons
    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };
    const today = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <section className="py-8 sm:p-8">
                <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 xl:px-14">
                    {/* header */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button onClick={prevMonth} className="p-2 rounded hover:bg-gray-200"
                                    aria-label="Previous Month">
                                &lt;
                            </button>
                            <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy", {locale: hr})}</h2>
                            <button onClick={nextMonth} className="p-2 rounded hover:bg-gray-200"
                                    aria-label="Next Month">
                                &gt;
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={today}
                                className="py-2 px-4 rounded-md bg-orange-600 hover:bg-orange-700 text-white transition"
                            >
                                Danas
                            </button>
                            <div className="flex items-center gap-1">
                                {["Dan", "Tjedan", "Mjesec"].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v as "Dan" | "Tjedan" | "Mjesec")}
                                        className={`py-1 px-3 rounded-md text-sm font-medium ${
                                            view === v ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        } transition`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* main calendar area */}
                    <div>{getViewCells()}</div>

                    {/* form to add an event */}
                    <div className="mt-6 p-4 border border-gray-300 rounded">
                        <h3 className="font-medium mb-2">Dodaj novi događaj</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="rounded border px-2 py-1"
                            />
                            <input
                                type="text"
                                placeholder="Opis događaja"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="rounded border px-2 py-1 flex-grow"
                            />
                            <button
                                onClick={handleAddEvent}
                                className="bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700"
                            >
                                Dodaj
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CalendarSection;