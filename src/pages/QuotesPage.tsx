import React, {useEffect, useRef, useState} from "react";
import {OPEN_SANS_REGULAR} from "../fonts/OpenSans.js";
import {getProducts, Product} from "../services/ProductService";
import {
    getQuotes,
    createQuote,
    Quote,
    QuoteItem,
    getQuote,
    downloadQuotePdf
} from "../services/QuoteService";
import {
    getFolders,
    createFolder,
    addQuoteToFolder,
    Folder
} from "../services/FolderService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

const QuotesPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);

    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [newFolderName, setNewFolderName] = useState<string>("");

    const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [logoDataURL, setLogoDataURL] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [folderFilter, setFolderFilter] = useState<"all" | "none" | string>("all");

    const [discount, setDiscount] = useState<number | "">("");

    const folderlessQuotes = quotes.filter(
        (q) => !folders.some((f) => f.quoteIds.includes(q.id))
    );

    const displayedQuotes = React.useMemo(() => {
        if (folderFilter === "all") return quotes;
        if (folderFilter === "none") return folderlessQuotes;
        const fid = parseInt(folderFilter, 10);
        const folder = folders.find((f) => f.id === fid);
        return folder
            ? quotes.filter((q) => folder.quoteIds.includes(q.id))
            : [];
    }, [folderFilter, quotes, folders]);


    useEffect(() => {
        (async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts.content);

                const fetchedQuotes = await getQuotes();
                setQuotes(fetchedQuotes);

                const fetchedFolders = await getFolders();
                setFolders(fetchedFolders);
            } catch (err) {
                console.error("Error:", err);
            }
        })();
    }, []);

    const filteredProducts = searchTerm.trim()
        ? products.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const getQuantityString = (productId: number) => {
        const found = selectedItems.find((i) => i.productId === productId);
        return found ? String(found.quantity) : "";
    };

    const handleQuantityInput = (productId: number, qtyStr: string) => {
        if (!/^\d+$/.test(qtyStr)) {
            setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
            return;
        }
        const qty = parseInt(qtyStr, 10);
        if (qty < 1) {
            setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
        } else {
            setSelectedItems((prev) => {
                const existing = prev.find((i) => i.productId === productId);
                if (existing) {
                    return prev.map((item) =>
                        item.productId === productId ? {...item, quantity: qty} : item
                    );
                }
                return [...prev, {productId, quantity: qty}];
            });
        }
    };

    const handleDecrement = (productId: number) => {
        const found = selectedItems.find((i) => i.productId === productId);
        if (!found) return;
        const newQty = found.quantity - 1;
        if (newQty < 1) {
            setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
        } else {
            setSelectedItems((prev) =>
                prev.map((i) =>
                    i.productId === productId ? {...i, quantity: newQty} : i
                )
            );
        }
    };

    const handleIncrement = (productId: number) => {
        const found = selectedItems.find((i) => i.productId === productId);
        if (!found) {
            setSelectedItems((prev) => [...prev, {productId, quantity: 1}]);
        } else {
            setSelectedItems((prev) =>
                prev.map((i) =>
                    i.productId === productId ? {...i, quantity: i.quantity + 1} : i
                )
            );
        }
    };

    const getTotal = () => {
        return selectedItems.reduce((sum, item) => {
            const prod = products.find((p) => p.id === item.productId);
            if (!prod) return sum;
            return sum + prod.price * item.quantity;
        }, 0);
    };

    const handleCreateFolder = async () => {
        try {
            if (!newFolderName.trim()) {
                alert("Unesite ime foldera.");
                return;
            }
            const f = await createFolder(newFolderName);
            setFolders((prev) => [...prev, f]);
            setNewFolderName("");
            alert("Folder kreiran!");
        } catch (err: any) {
            alert(err);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64String = ev.target?.result;
                if (typeof base64String === "string") {
                    setLogoDataURL(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const isSubmittingRef = useRef(false);
    const handleCreateQuote = async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        try {
            const nonZero = selectedItems.filter(i => i.quantity > 0);
            if (nonZero.length === 0) {
                alert("Dodajte barem jedan proizvod.");
                return;
            }

            const newQuoteId = await createQuote(nonZero, logoDataURL, +discount || 0);

            const freshQuote = await getQuote(newQuoteId);

            setQuotes(prev => [...prev, freshQuote]);

            if (selectedFolderId) {
                await addQuoteToFolder(selectedFolderId, freshQuote.id);
            }

            const pdfBlob = await downloadQuotePdf(freshQuote.id);
            const blobUrl = URL.createObjectURL(pdfBlob);
            window.open(blobUrl, "_blank");

            setSelectedItems([]);
            setSelectedFolderId(null);
            setLogoDataURL(null);
            setDiscount("");

        } catch (err: any) {
            console.error(err);
            alert("Greška pri kreiranju ponude: " + err.message);
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const handleGeneratePdf = () => {
        const doc = new jsPDF();

        if (logoDataURL) {
            doc.addImage(logoDataURL, "PNG", 150, 10, 40, 20);
        }
        doc.addFileToVFS("OpenSans-Regular.ttf", OPEN_SANS_REGULAR);
        doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");
        doc.setFont("OpenSans");
        doc.setFontSize(16);
        doc.text("Ponuda", 10, 10);
        doc.setFontSize(10);
        doc.text(`Datum: ${new Date().toLocaleDateString()}`, 10, 16);

        doc.setFontSize(12);
        let startY = 30;
        doc.text("Naziv Proizvoda", 10, startY);
        doc.text("Količina", 80, startY);
        doc.text("Jed. Cijena (€)", 110, startY);
        doc.text("Ukupno (€)", 150, startY);

        let yOffset = startY + 10;
        selectedItems.forEach((it) => {
            const prod = products.find((p) => p.id === it.productId);
            if (!prod) return;
            const lineTotal = prod.price * it.quantity;

            doc.text(prod.name, 10, yOffset);
            doc.text(`${it.quantity}`, 80, yOffset);
            doc.text(prod.price.toFixed(2), 110, yOffset);
            doc.text(lineTotal.toFixed(2), 150, yOffset);

            yOffset += 10;
        });

        const total = getTotal();
        doc.setFontSize(14);
        doc.text(`Ukupno: ${total.toFixed(2)} €`, 10, yOffset + 10);

        doc.save("ponuda.pdf");
    };

    return (


        <div className="min-h-screen bg-gray-50 p-6">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Izrada Ponuda</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center space-x-2 rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >

                    <svg
                        className="h-5 w-5"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span>Kreiraj novu ponudu</span>
                </button>
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <span className="sr-only">Zatvori</span>
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4">Kreiranje nove ponude</h2>

                        <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                            <div className="flex items-center gap-3">
                                <label className="font-medium">Logo (opc.):</label>
                                <input type="file" accept="image/*" onChange={handleLogoChange}/>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Traži proizvod..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded border px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
                                />
                                {filteredProducts.length > 0 && (
                                    <div className="mt-2 rounded border bg-white p-3 shadow-inner">
                                        {filteredProducts.map((p) => {
                                            const qtyStr = getQuantityString(p.id);
                                            const qty = parseInt(qtyStr, 10) || 0;
                                            const displayPrice = qty > 0
                                                ? (p.price * qty).toFixed(2)
                                                : p.price.toFixed(2);
                                            return (
                                                <div
                                                    key={p.id}
                                                    className="mb-2 flex items-center justify-between"
                                                >
                                                    <span className="font-medium">{p.name}</span>
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() => handleDecrement(p.id)}
                                                            className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                                                        >
                                                            –
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={qtyStr}
                                                            onChange={(e) => handleQuantityInput(p.id, e.target.value)}
                                                            className="w-12 rounded border px-1 text-center"
                                                        />
                                                        <button
                                                            onClick={() => handleIncrement(p.id)}
                                                            className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                         {displayPrice} €
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {selectedItems.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Pregled artikala</h3>
                                        <ul className="max-h-40 overflow-y-auto space-y-2">
                                            {selectedItems.map((item) => {
                                                const prod = products.find((p) => p.id === item.productId);
                                                if (!prod) return null;
                                                return (
                                                    <li
                                                        key={item.productId}
                                                        className="flex justify-between items-center text-sm text-gray-800"
                                                    >
                                                        <div>
                                                            <span className="font-medium">{prod.name}</span>{" "}
                                                            <span className="text-gray-500">× {item.quantity}</span>
                                                        </div>
                                                        <div className="font-medium">
                                                            {(prod.price * item.quantity).toFixed(2)} €
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="font-medium">Rabat (%) (opc.):</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="npr. 15"
                                    value={discount}
                                    onChange={e => {
                                        const v = e.target.value;
                                        setDiscount(v === "" ? "" : Math.max(0, Math.min(100, +v)));
                                    }}
                                    className="w-24 border rounded px-3 py-2"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <select
                                    value={selectedFolderId ?? ""}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        setSelectedFolderId(isNaN(v) ? null : v);
                                    }}
                                    className="flex-1 rounded border px-2 py-1 shadow-sm focus:border-orange-500 focus:ring-orange-300"
                                >
                                    <option value="">(Bez foldera)</option>
                                    {folders.map((f) => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Novi folder"
                                    className="w-40 rounded border px-2 py-1 shadow-sm"
                                />
                                <button
                                    onClick={handleCreateFolder}
                                    className="rounded bg-orange-600 px-3 py-1 text-white hover:bg-orange-700"
                                >
                                    +
                                </button>
                            </div>

                            <div className="rounded border bg-gray-50 p-3 text-sm">
                                <p>Ukupno artikala: {selectedItems.reduce((sum, i) => sum + i.quantity, 0)}</p>
                                <p>Bez rabata: {getTotal().toFixed(2)} €</p>
                                {discount !== "" && (
                                    <>
                                        <p>Rabat: {discount}%</p>
                                        <p>
                                            Sa rabatom: {(getTotal() * (100 - (+discount)) / 100).toFixed(2)} €
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={handleCreateQuote}
                                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                            >
                                Kreiraj ponudu
                            </button>
                            <button
                                onClick={handleGeneratePdf}
                                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                            >
                                Preuzmi PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center space-x-4">
                <label htmlFor="folderFilter" className="text-sm font-medium text-gray-700">
                    Prikaži ponude iz:
                </label>
                <select
                    id="folderFilter"
                    value={folderFilter}
                    onChange={(e) => setFolderFilter(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                    <option value="all">Sve ponude</option>
                    <option value="none">Bez foldera</option>
                    {folders.map((f) => (
                        <option key={f.id} value={f.id.toString()}>
                            {f.name}
                        </option>
                    ))}
                </select>
            </div>


            <hr/>

            <div>
                {displayedQuotes.length === 0 ? (
                    <p className="text-sm text-gray-500">Nema ponuda za odabrani folder.</p>
                ) : (
                    displayedQuotes.map((q) => {
                        const rawTotal = q.items.reduce((sum, it) => {
                            const prod = products.find(p => p.id === it.productId)
                            return prod ? sum + prod.price * it.quantity : sum
                        }, 0)

                        const discountValue = q.discount ?? 0
                        const discountedTotal = rawTotal * (100 - discountValue) / 100

                        return (
                            <div key={q.id} className="border p-3 rounded mb-2">
                                <p>ID Ponude: {q.id}</p>
                                <p>Datum: {new Date(q.createdAt).toLocaleString()}</p>
                                <p>Bez rabata: {rawTotal.toFixed(2)} €</p>
                                {discountValue > 0 && <p>Rabat: {discountValue}%</p>}
                                <p>Rabat: {discountValue}%</p>
                                <p>Ukupno: {discountedTotal.toFixed(2)} €</p>
                                <ul className="list-disc pl-5">
                                    {q.items.map((i) => {
                                        const prod = products.find((p) => p.id === i.productId);
                                        return prod ? (
                                            <li key={i.productId}>
                                                {prod.name} x {i.quantity} ={" "}
                                                {(prod.price * i.quantity).toFixed(2)} €
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuotesPage;
