import React, {useEffect, useRef, useState} from "react";
import { OPEN_SANS_REGULAR } from "../fonts/OpenSans.js";
import { getProducts, Product } from "../services/ProductService";
import {
    getQuotes,
    createQuote,
    Quote,
    QuoteItem
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

    // on opening, fetch products, quotes, folders
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
                        item.productId === productId ? { ...item, quantity: qty } : item
                    );
                }
                return [...prev, { productId, quantity: qty }];
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
                    i.productId === productId ? { ...i, quantity: newQty } : i
                )
            );
        }
    };

    const handleIncrement = (productId: number) => {
        const found = selectedItems.find((i) => i.productId === productId);
        if (!found) {
            setSelectedItems((prev) => [...prev, { productId, quantity: 1 }]);
        } else {
            setSelectedItems((prev) =>
                prev.map((i) =>
                    i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
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
            const nonZeroItems = selectedItems.filter((i) => i.quantity > 0);
            if (nonZeroItems.length === 0) {
                alert("Dodajte barem jedan proizvod.");
                return;
            }
            const newQuote = await createQuote(nonZeroItems, "");
            setQuotes((prev) => [...prev, newQuote]);

            // if a folder is selected, add quote to it
            if (selectedFolderId) {
                await addQuoteToFolder(selectedFolderId, newQuote.id);
            }
            // reset
            setSelectedItems([]);
            setSelectedFolderId(null);
            alert(`Ponuda kreirana (ID: ${newQuote.id})!`);
        } catch (err: any) {
            alert(err);
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

    // folderless quotes
    const folderlessQuotes = quotes.filter(
        (q) => !folders.some((f) => f.quoteIds.includes(q.id))
    );

    return (
        <div className="min-h-screen bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold mb-4">Izrada Ponuda</h1>

            {/* logo upload */}
            <div className="mb-4 flex items-center gap-2">
                <label className="font-medium">Logo (opcionalno):</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            {/* product search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Traži proizvod..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded w-64"
                />
            </div>

            {/* filtered products + quantity stepper */}
            {filteredProducts.length > 0 && (
                <div className="mb-4 border p-3 rounded">
                    <h2 className="font-medium mb-2">Pronađeni proizvodi:</h2>
                    {filteredProducts.map((p) => {
                        const qtyStr = getQuantityString(p.id);
                        const numericQty = qtyStr === "" ? 0 : parseInt(qtyStr, 10);

                        return (
                            <div key={p.id} className="flex items-center gap-2 mb-2">
                                <span className="w-40">{p.name}</span>
                                <button
                                    className="bg-gray-200 hover:bg-gray-300 rounded px-2"
                                    onClick={() => handleDecrement(p.id)}
                                >
                                    –
                                </button>
                                <input
                                    type="text"
                                    value={qtyStr}
                                    onChange={(e) => handleQuantityInput(p.id, e.target.value)}
                                    className="border w-16 text-center"
                                />
                                <button
                                    className="bg-gray-200 hover:bg-gray-300 rounded px-2"
                                    onClick={() => handleIncrement(p.id)}
                                >
                                    +
                                </button>
                                <span>{(p.price * numericQty).toFixed(2)} €</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* folder picking/creation */}
            <div className="flex items-center gap-2 mb-4 border p-3 rounded">
                <label className="font-medium">Folder:</label>
                <select
                    value={selectedFolderId ?? ""}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSelectedFolderId(isNaN(val) ? null : val);
                    }}
                    className="border p-1 rounded"
                >
                    <option value="">(Bez foldera)</option>
                    {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Novi folder"
                    className="border p-1 w-32"
                />
                <button
                    onClick={handleCreateFolder}
                    className="bg-orange-600 text-white px-3 py-1 rounded"
                >
                    +
                </button>
            </div>

            {/* quote summary */}
            <div className="border p-3 rounded mb-4">
                <p>Ukupno artikala: {selectedItems.reduce((sum, i) => sum + i.quantity, 0)}</p>
                <p>Ukupna cijena: {getTotal().toFixed(2)} €</p>
            </div>

            {/* create pdf */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={handleCreateQuote}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                    Kreiraj ponudu
                </button>
                <button
                    onClick={handleGeneratePdf}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                    Preuzmi PDF
                </button>
            </div>

            <hr />

            {/* show quotes with no folder */}
            <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Ponude bez foldera</h2>
                {folderlessQuotes.length === 0 ? (
                    <p className="text-sm text-gray-500">Nema ponuda.</p>
                ) : (
                    folderlessQuotes.map((q) => {
                        const total = q.items.reduce((sum, it) => {
                            const pr = products.find((p) => p.id === it.productId);
                            if (!pr) return sum;
                            return sum + pr.price * it.quantity;
                        }, 0);

                        return (
                            <div key={q.id} className="border p-3 rounded mb-2">
                                <p>ID Ponude: {q.id}</p>
                                <p>Datum: {q.createdAt.toLocaleString()}</p>
                                <p>Ukupan iznos: {total.toFixed(2)} €</p>
                                <ul className="list-disc pl-5">
                                    {q.items.map((i) => {
                                        const pr = products.find((pp) => pp.id === i.productId);
                                        if (!pr) return null;
                                        return (
                                            <li key={i.productId}>
                                                {pr.name} x {i.quantity} = {(pr.price * i.quantity).toFixed(2)} €
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })
                )}
            </div>

            {/* show folders with quotes in them */}
            <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Mape</h2>
                {folders.length === 0 ? (
                    <p className="text-sm text-gray-500">Nema foldera.</p>
                ) : (
                    folders.map((f) => {
                        const inThisFolder = quotes.filter((q) => f.quoteIds.includes(q.id));
                        return (
                            <div key={f.id} className="border p-3 rounded mb-4">
                                <p className="font-semibold">{f.name}</p>
                                {inThisFolder.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Nema ponuda u ovom folderu.
                                    </p>
                                ) : (
                                    inThisFolder.map((q) => {
                                        const total = q.items.reduce((sum, it) => {
                                            const pr = products.find((p) => p.id === it.productId);
                                            if (!pr) return sum;
                                            return sum + pr.price * it.quantity;
                                        }, 0);

                                        return (
                                            <div key={q.id} className="ml-3 p-2 border rounded mt-2">
                                                <p>
                                                    ID Ponude: {q.id} (Datum:{" "}
                                                    {q.createdAt.toLocaleString()})
                                                </p>
                                                <p>Ukupno: {total.toFixed(2)} €</p>
                                                <ul className="list-disc pl-5">
                                                    {q.items.map((item) => {
                                                        const foundProd = products.find(
                                                            (p) => p.id === item.productId
                                                        );
                                                        if (!foundProd) return null;
                                                        return (
                                                            <li key={foundProd.id}>
                                                                {foundProd.name} x {item.quantity} ={" "}
                                                                {(foundProd.price * item.quantity).toFixed(2)} €
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuotesPage;
