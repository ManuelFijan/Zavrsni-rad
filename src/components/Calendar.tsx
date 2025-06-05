import React, {useState, useEffect} from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    subDays,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
} from "date-fns";
import {hr} from "date-fns/locale";
import {
    getEvents,
    addEvent,
    deleteCalendarEvent,
    CalendarEvent,
    CalendarEventCreate
} from "../services/CalendarService";
import {getQuotes, Quote} from "../services/QuoteService";
import {TrashIcon} from "@heroicons/react/24/outline";

const CalendarSection: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [view, setView] = useState<"Dan" | "Tjedan" | "Mjesec">("Mjesec");
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [newTitle, setNewTitle] = useState<string>("");
    const [newDate, setNewDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [selectedQuoteIdForEvent, setSelectedQuoteIdForEvent] = useState<string>("");

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
    const [eventToDeleteId, setEventToDeleteId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const fetchedEvents = await getEvents();
                setEvents(fetchedEvents.map(e => ({...e, date: (e.date + "T00:00:00")})));
                const fetchedQuotes = await getQuotes();
                setQuotes(fetchedQuotes);
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        })();
    }, []);

    const handleAddEvent = async () => {
        try {
            if (!newDate || !newTitle.trim()) {
                alert("Please select a date and enter a title.");
                return;
            }
            const eventPayload: CalendarEventCreate = {
                date: newDate,
                title: newTitle,
            };
            if (selectedQuoteIdForEvent) {
                eventPayload.quoteId = parseInt(selectedQuoteIdForEvent, 10);
            }

            const createdEventData = await addEvent(eventPayload);
            setEvents([...events, {...createdEventData, date: (createdEventData.date + "T00:00:00")}]);
            setNewTitle("");
            setSelectedQuoteIdForEvent("");
        } catch (err: any) {
            console.error("Error adding event:", err);
            alert(err.response?.data?.message || err.message || "Greška pri dodavanju događaja.");
        }
    };

    const promptDeleteConfirmation = (eventId: number) => {
        setEventToDeleteId(eventId);
        setShowDeleteConfirmModal(true);
    };

    const executeDeleteEvent = async () => {
        if (eventToDeleteId === null) return;
        try {
            await deleteCalendarEvent(eventToDeleteId);
            setEvents(events.filter(event => event.id !== eventToDeleteId));
        } catch (error: any) {
            console.error("Error deleting event:", error);
            alert(error.response?.data?.message || error.message || "Greška pri brisanju događaja.");
        } finally {
            setShowDeleteConfirmModal(false);
            setEventToDeleteId(null);
        }
    };

    const getViewCells = () => {
        if (view === "Dan") {
            return renderDayView();
        } else if (view === "Tjedan") {
            return renderWeekView();
        } else {
            return renderMonthView();
        }
    };

    const handleDayClick = (day: Date) => {
        setNewDate(format(day, "yyyy-MM-dd"));
        const titleInput = document.getElementById('newTitleInput');
        if (titleInput) titleInput.focus();
    };

    const renderDayView = () => {
        const dayEvents = events.filter((e) =>
            isSameDay(new Date(e.date), currentDate)
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
                        <div key={evt.id} className="text-sm mb-1 flex justify-between items-center">
                             <span className="truncate flex-1 min-w-0"
                                   title={`${evt.title}${evt.quoteId ? ` (Ponuda #${evt.quoteId})` : ''}`}>
                                 {evt.title}
                                 {evt.quoteId &&
                                     <span
                                         className="text-xs text-blue-600 ml-1 whitespace-nowrap">(Ponuda #{evt.quoteId})</span>}
                            </span>
                            <button onClick={() => promptDeleteConfirmation(evt.id)}
                                    className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0">
                                <TrashIcon className="h-4 w-4"/>
                            </button>
                        </div>
                    ))
                )}
            </div>
        );
    };

    const renderWeekView = () => {
        const start = startOfWeek(currentDate, {weekStartsOn: 1});
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = addDays(start, i);
            const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
            days.push(
                <div key={day.toString()} className="p-2 border border-gray-200 min-h-[80px]">
                    <div className="text-sm font-semibold mb-1">
                        {format(day, "EEE, d.MM", {locale: hr})}
                    </div>
                    {dayEvents.map((evt) => (
                        <div key={evt.id} className="text-xs flex justify-between items-center w-full mt-0.5">
                            <div
                                className="truncate flex-1 min-w-0"
                                title={`${evt.title}${evt.quoteId ? ` (Ponuda #${evt.quoteId})` : ''}`}
                            >
                                {evt.title}
                                {evt.quoteId &&
                                    <span className="text-blue-500 ml-1 whitespace-nowrap">(P #{evt.quoteId})</span>}
                            </div>
                            <button onClick={() => promptDeleteConfirmation(evt.id)}
                                    className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0 p-0.5">
                                <TrashIcon className="h-3 w-3"/>
                            </button>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div>
                <h3 className="font-bold mb-2">Pregled tjedna
                    ({format(start, "d.MM")} - {format(addDays(start, 6), "d.MM.yyyy")})</h3>
                <div
                    className="grid grid-cols-7 gap-px border-t border-l border-gray-200">
                    {days.map((dayComponent, index) => (
                        <div key={`header-${index}`}
                             className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">
                            {format(addDays(start, index), "EEE", {locale: hr})}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px border-l border-b border-r border-gray-200">{days}</div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, {weekStartsOn: 1});
        const endDate = endOfWeek(monthEnd, {weekStartsOn: 1});

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter((e) => isSameDay(new Date(e.date), cloneDay));

                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={`p-2 border-r border-b border-gray-200 min-h-[100px] relative ${
                            !isSameMonth(cloneDay, monthStart) ? "bg-gray-100 text-gray-400" : "cursor-pointer hover:bg-gray-50"
                        }`}
                        onClick={() => isSameMonth(cloneDay, monthStart) && handleDayClick(cloneDay)}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-sm">{format(cloneDay, "d", {locale: hr})}</span>
                            {dayEvents.length > 0 && isSameMonth(cloneDay, monthStart) && (
                                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            )}
                        </div>
                        <div className="mt-1 space-y-0.5">
                            {dayEvents.map((evt) => (
                                <div key={evt.id}
                                     className="text-xs text-gray-700 flex justify-between items-center w-full">
                                    <div
                                        className="truncate flex-1 min-w-0"
                                        title={`${evt.title}${evt.quoteId ? ` (Ponuda #${evt.quoteId})` : ''}`}
                                    >
                                        {evt.title}
                                        {evt.quoteId && <span
                                            className="text-blue-500 ml-1 whitespace-nowrap">(P #{evt.quoteId})</span>}
                                    </div>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        promptDeleteConfirmation(evt.id);
                                    }}
                                            className="text-red-500 hover:text-red-700 ml-1 p-0.5 flex-shrink-0">
                                        <TrashIcon className="h-3 w-3"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={`row-${day.toISOString()}`}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div>
                <h3 className="font-bold mb-2">Pregled mjeseca</h3>
                <div className="grid grid-cols-7 border-t border-l border-gray-200">
                    {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map(dayName => (
                        <div key={dayName}
                             className="p-2 text-center text-sm font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50">
                            {dayName}
                        </div>
                    ))}
                </div>
                <div className="border-l border-gray-200">
                    {rows}
                </div>
            </div>
        );
    };

    const handlePrev = () => {
        if (view === "Mjesec") {
            setCurrentDate(subMonths(currentDate, 1));
        } else if (view === "Tjedan") {
            setCurrentDate(subWeeks(currentDate, 1));
        } else if (view === "Dan") {
            setCurrentDate(subDays(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (view === "Mjesec") {
            setCurrentDate(addMonths(currentDate, 1));
        } else if (view === "Tjedan") {
            setCurrentDate(addWeeks(currentDate, 1));
        } else if (view === "Dan") {
            setCurrentDate(addDays(currentDate, 1));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
        setNewDate(format(new Date(), "yyyy-MM-dd"));
    };


    return (
        <div className="bg-white shadow rounded-lg p-6">
            <section className="py-8 sm:p-8">
                <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 xl:px-14">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePrev} className="p-2 rounded hover:bg-gray-200"
                                    aria-label="Previous">
                                &lt;
                            </button>
                            <h2 className="text-xl font-semibold">
                                {view === "Dan" && format(currentDate, "PPP", {locale: hr})}
                                {view === "Tjedan" && `${format(startOfWeek(currentDate, {weekStartsOn: 1}), "d.MM.", {locale: hr})} - ${format(endOfWeek(currentDate, {weekStartsOn: 1}), "d.MM.yyyy", {locale: hr})}`}
                                {view === "Mjesec" && format(currentDate, "MMMM yyyy", {locale: hr})}
                            </h2>
                            <button onClick={handleNext} className="p-2 rounded hover:bg-gray-200"
                                    aria-label="Next">
                                &gt;
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToday}
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

                    <div>{getViewCells()}</div>

                    <div className="mt-6 p-4 border border-gray-300 rounded">
                        <h3 className="font-medium mb-2">Dodaj novi događaj</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="rounded border border-gray-300 px-2 py-1.5 text-sm"/>
                            <input
                                className="rounded border border-gray-300 px-2 py-1.5 text-sm flex-grow sm:min-w-[200px]"
                                id="newTitleInput"
                                type="text"
                                placeholder="Opis događaja"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                            <select
                                value={selectedQuoteIdForEvent}
                                onChange={(e) => setSelectedQuoteIdForEvent(e.target.value)}
                                className="rounded border border-gray-300 px-2 py-1.5 text-sm flex-grow sm:min-w-[200px]"
                            >
                                <option value="">Poveži ponudu (opcionalno)</option>
                                {quotes.map((quote) => (
                                    <option key={quote.id} value={quote.id.toString()}>
                                        Ponuda
                                        #{quote.id} ({new Date(quote.createdAt).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddEvent}
                                className="bg-orange-600 text-white px-4 py-1.5 rounded text-sm hover:bg-orange-700 sm:whitespace-nowrap"
                            >
                                Dodaj
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                     onClick={() => {
                         setShowDeleteConfirmModal(false);
                         setEventToDeleteId(null);
                     }}>
                    <div className="bg-white p-6 rounded-lg shadow-xl min-w-[300px] max-w-md"
                         onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Potvrda brisanja</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Jeste li sigurni da želite obrisati ovaj događaj? Ova akcija se ne može poništiti.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirmModal(false);
                                    setEventToDeleteId(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={executeDeleteEvent}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Obriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarSection;