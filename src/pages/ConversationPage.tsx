import React, { useEffect, useState } from "react";
import { getUsedEmails, sendEmail } from "../services/EmailService";
import { getQuotes, Quote } from "../services/QuoteService";

const ConversationsPage: React.FC = () => {
    // list of quotes to attach to email
    const [quotes, setQuotes] = useState<Quote[]>([]);
    // list of used email addresses
    const [usedEmails, setUsedEmails] = useState<string[]>([]);

    // form fields
    const [selectedEmail, setSelectedEmail] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

    const [isSending, setIsSending] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const emails = await getUsedEmails();
            setUsedEmails(emails);

            const fetchedQuotes = await getQuotes();
            setQuotes(fetchedQuotes);
        })();
    }, []);

    // send email with mock service
    const handleSendEmail = async () => {
        if (!selectedQuoteId) {
            alert("Molimo odaberite ponudu za privitak.");
            return;
        }
        if (!selectedEmail.trim()) {
            alert("Molimo unesite email adresu ili odaberite iz popisa.");
            return;
        }
        if (!message.trim()) {
            alert("Poruka ne može biti prazna.");
            return;
        }

        try {
            setIsSending(true);
            await sendEmail(selectedEmail, message, selectedQuoteId);
            alert("Email uspješno poslan!");
            setSelectedEmail("");
            setMessage("");
            setSelectedQuoteId(null);
        } catch (err: any) {
            alert(err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Slanje Ponuda Emailom</h2>

            <div className="mb-4">
                <label className="block font-medium">Email adresa primatelja:</label>
                <div className="flex items-center gap-2 mt-1">
                    {/* dropdown of used emails */}
                    <select
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        value={""}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">(Odaberi s popisa)</option>
                        {usedEmails.map((em) => (
                            <option key={em} value={em}>
                                {em}
                            </option>
                        ))}
                    </select>
                    <span>Ili</span>
                    {/* text input for new email */}
                    <input
                        type="text"
                        placeholder="Upiši novi email"
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="border px-2 py-1 rounded w-64"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block font-medium">Poruka:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="border rounded w-full mt-1 p-2"
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium">Odaberi ponudu (privitak):</label>
                {quotes.length === 0 ? (
                    <p className="text-sm text-gray-400">Trenutno nema ponuda.</p>
                ) : (
                    <select
                        onChange={(e) => setSelectedQuoteId(Number(e.target.value))}
                        value={selectedQuoteId ?? ""}
                        className="border px-2 py-1 rounded mt-1"
                    >
                        <option value="">(Odaberi ponudu)</option>
                        {quotes.map((q) => (
                            <option key={q.id} value={q.id}>
                                {`Ponuda #${q.id} - ${q.items.length} stavki`}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-300"
            >
                {isSending ? "Slanje..." : "Pošalji Email"}
            </button>
        </div>
    );
};

export default ConversationsPage;
