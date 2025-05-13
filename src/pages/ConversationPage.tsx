import React, {useEffect, useState} from "react";
import {sendEmail} from "../services/EmailService";
import {getQuotes, Quote} from "../services/QuoteService";
import {
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    DocumentIcon,
} from "@heroicons/react/24/outline";

const ConversationsPage: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [message, setMessage] = useState("");
    const [selectedQuoteId, setSelectedQuoteId] = useState<number | "">("");
    const [errors, setErrors] = useState<{ email?: string; message?: string; quote?: string }>({});
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        (async () => {
            setQuotes(await getQuotes());
        })();
    }, []);

    const validate = () => {
        const e: typeof errors = {};
        if (!selectedEmail.trim()) e.email = "Email je obavezan.";
        if (!/\S+@\S+\.\S+/.test(selectedEmail)) e.email = "Unesite ispravan email.";
        if (!message.trim()) e.message = "Poruka ne može biti prazna.";
        if (!selectedQuoteId) e.quote = "Morate odabrati ponudu.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSend = async () => {
        if (!validate()) return;
        setIsSending(true);
        try {
            await sendEmail(selectedEmail, message, Number(selectedQuoteId));
            setSelectedEmail("");
            setMessage("");
            setSelectedQuoteId("");
            setErrors({});
        } catch (err: any) {
            setErrors({...errors, email: err.response?.data?.message || "Greška pri slanju."});
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-500"/>
                Slanje Ponuda Emailom
            </h1>

            <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email primatelja
                </label>
                <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                    <input
                        id="email"
                        list="email-list"
                        type="email"
                        placeholder="Upiši ili odaberi email"
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                    />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Poruka
                </label>
                <textarea
                    id="message"
                    rows={4}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Unesite tekst poruke"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
            </div>

            <div className="space-y-1">
                <label htmlFor="quote" className="block text-sm font-medium text-gray-700">
                    Odaberi ponudu (privitak)
                </label>
                <div className="relative">
                    <DocumentIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                    <select
                        id="quote"
                        className={`block w-full pl-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.quote ? "border-red-500" : "border-gray-300"
                        }`}
                        value={selectedQuoteId}
                        onChange={(e) => setSelectedQuoteId(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                        <option value="">— Odaberi ponudu —</option>
                        {quotes.map((q) => (
                            <option key={q.id} value={q.id}>
                                {`#${q.id} — ${q.items.length} stavki`}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.quote && <p className="text-sm text-red-500">{errors.quote}</p>}
            </div>

            <button
                onClick={handleSend}
                disabled={isSending}
                className="w-full flex justify-center items-center gap-2 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md disabled:opacity-50"
            >
                {isSending ? "Slanje..." : "Pošalji Email"}
            </button>
        </div>
    );
};

export default ConversationsPage;
