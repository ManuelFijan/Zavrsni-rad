import React, {useEffect, useRef, useState} from "react";
import {getProducts, Product} from "../services/ProductService";
import {
    getQuotes,
    createQuote,
    Quote,
    QuoteItem,
    downloadQuotePdf
} from "../services/QuoteService";
import {
    getProjects,
    addProject,
    updateProject,
    Project,
    ProjectCreatePayload,
    ProjectUpdatePayload
} from "../services/ProjectService";
import {
    EnvelopeIcon,
    FolderPlusIcon,
    PencilIcon,
    PlusCircleIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import {sendEmail} from "../services/EmailService";
import {startOfDay, endOfDay} from 'date-fns';

type SortField = "createdAt" | "id" | "totalAmount";
type SortOrder = "asc" | "desc";

type DialogContent = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
};

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"
            role="status"
        >
            <span className="sr-only">Učitavanje...</span>
        </div>
    </div>
);

const QuotesPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [logoDataURL, setLogoDataURL] = useState<string | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [discount, setDiscount] = useState<number | "">("");
    const [selectedProjectIdForQuote, setSelectedProjectIdForQuote] = useState<string>("");
    const [newQuoteDescription, setNewQuoteDescription] = useState<string>("");

    const [projectFilter, setProjectFilter] = useState<"all" | "none" | string>("all");
    const [startDateFilter, setStartDateFilter] = useState<string>("");
    const [endDateFilter, setEndDateFilter] = useState<string>("");
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [quoteForEmail, setQuoteForEmail] = useState<Quote | null>(null);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [emailFormErrors, setEmailFormErrors] = useState<{ email?: string }>({});
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);

    const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
    const [currentEditingProject, setCurrentEditingProject] = useState<Project | null>(null);
    const [projectFormData, setProjectFormData] = useState<Partial<ProjectCreatePayload & {
        imageUrlFile?: File | null
    }>>({});

    const [dialogState, setDialogState] = useState<DialogContent>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    useEffect(() => {
        (async () => {
            setIsLoadingInitialData(true);
            try {
                const [fetchedProducts, fetchedQuotes, fetchedProjects] = await Promise.all([
                    getProducts(),
                    getQuotes(),
                    getProjects()
                ]);
                setProducts(fetchedProducts.content || []);
                setQuotes(fetchedQuotes);
                setProjects(fetchedProjects);
            } catch (err) {
                console.error("Error fetching initial data:", err);
            } finally {
                setIsLoadingInitialData(false);
            }
        })();
    }, []);

    const displayedQuotes = React.useMemo(() => {
        let filtered = [...quotes];

        if (projectFilter === "none") {
            filtered = filtered.filter(q => !q.projectId);
        } else if (projectFilter !== "all") {
            const pid = parseInt(projectFilter, 10);
            filtered = filtered.filter((q) => q.projectId === pid);
        }

        if (startDateFilter) {
            const filterStartDate = startOfDay(new Date(startDateFilter));
            filtered = filtered.filter(q => new Date(q.createdAt) >= filterStartDate);
        }
        if (endDateFilter) {
            const filterEndDate = endOfDay(new Date(endDateFilter));
            filtered = filtered.filter(q => new Date(q.createdAt) <= filterEndDate);
        }

        const calculateQuoteTotal = (quote: Quote): number => {
            const rawTotal = quote.items.reduce((sum, it) => {
                const prod = products.find(p => p.id === it.productId);
                return prod ? sum + prod.price * it.quantity : sum;
            }, 0);
            const discountValue = quote.discount ?? 0;
            return rawTotal * (100 - discountValue) / 100;
        };

        filtered.sort((a, b) => {
            let valA: number | string, valB: number | string;
            switch (sortField) {
                case "id":
                    valA = a.id;
                    valB = b.id;
                    break;
                case "totalAmount":
                    valA = calculateQuoteTotal(a);
                    valB = calculateQuoteTotal(b);
                    break;
                case "createdAt":
                default:
                    valA = new Date(a.createdAt).getTime();
                    valB = new Date(b.createdAt).getTime();
                    break;
            }

            if (valA < valB) {
                return sortOrder === "asc" ? -1 : 1;
            }
            if (valA > valB) {
                return sortOrder === "asc" ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [quotes, projectFilter, startDateFilter, endDateFilter, sortField, sortOrder, products]);


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
        if (!/^\d*$/.test(qtyStr)) {
            return;
        }
        if (qtyStr === "") {
            setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
            return;
        }
        const qty = parseInt(qtyStr, 10);
        if (isNaN(qty) || qty < 1) {
            setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
        } else {
            setSelectedItems((prev) => {
                const existing = prev.find((i) => i.productId === productId);
                if (existing) return prev.map((item) => item.productId === productId ? {...item, quantity: qty} : item);
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
        } else {
            setLogoDataURL(null);
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
                isSubmittingRef.current = false;
                return;
            }
            const projectId = selectedProjectIdForQuote ? parseInt(selectedProjectIdForQuote, 10) : undefined;
            const newQuoteId = await createQuote(nonZero, logoDataURL, +discount || 0, projectId, newQuoteDescription);

            setIsQuoteModalOpen(false);
            const refreshedQuotes = await getQuotes();
            setQuotes(refreshedQuotes);

            try {
                const pdfBlob = await downloadQuotePdf(newQuoteId);
                window.open(URL.createObjectURL(pdfBlob), "_blank");
            } catch (pdfError) {
                console.error("PDF download error:", pdfError)
                alert("Ponuda kreirana, ali došlo je do greške pri generiranju PDF-a.")
            }

            setSelectedItems([]);
            setDiscount("");
            setLogoDataURL(null);
            setSelectedProjectIdForQuote("");
            setNewQuoteDescription("");
        } catch (err: any) {
            console.error(err);
            alert("Greška pri kreiranju ponude: " + (err.response?.data?.message || err.message));
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const handleDownloadSelectedQuotePdf = async (quoteId: number) => {
        try {
            const pdfBlob = await downloadQuotePdf(quoteId);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        } catch (err: any) {
            console.error("Error downloading PDF for existing quote:", err);
            alert("Greška pri preuzimanju PDF-a: " + (err.response?.data?.message || err.message));
        }
    };

    const handleOpenEmailModal = (quote: Quote) => {
        setQuoteForEmail(quote);
        setRecipientEmail("");
        setRecipientName("");
        setEmailFormErrors({});
        setIsEmailModalOpen(true);
    };

    const handleCloseEmailModal = () => {
        setIsEmailModalOpen(false);
        setQuoteForEmail(null);
    };

    const validateEmailInputs = () => {
        const errors: { email?: string } = {};
        if (!recipientEmail.trim()) {
            errors.email = "Email je obavezan.";
        } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
            errors.email = "Unesite ispravan email.";
        }
        setEmailFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSendQuoteEmail = async () => {
        if (!validateEmailInputs() || !quoteForEmail) return;
        setIsSendingEmail(true);
        try {
            await sendEmail(recipientEmail, recipientName, quoteForEmail.id);
            openDialog('Email Poslan', `Ponuda #${quoteForEmail.id} uspješno poslana na ${recipientEmail}.`, 'success');
            handleCloseEmailModal();
        } catch (err: any) {
            console.error("Greška pri slanju emaila:", err);
            const errorMessage = err.response?.data?.message || "Greška pri slanju emaila.";
            setEmailFormErrors({email: errorMessage});
            openDialog('Greška pri slanju', errorMessage, 'error');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const openDialog = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setDialogState({isOpen: true, title, message, type});
    };

    const openProjectModal = (projectToEdit?: Project) => {
        if (projectToEdit) {
            setCurrentEditingProject(projectToEdit);
            setProjectFormData({
                name: projectToEdit.name,
                address: projectToEdit.address,
                status: projectToEdit.status as ProjectCreatePayload['status'],
                notes: projectToEdit.notes || "",
                imageUrl: projectToEdit.imageUrl || "",
                imageUrlFile: null
            });
        } else {
            setCurrentEditingProject(null);
            setProjectFormData({name: "", address: "", status: "Aktivan", notes: "", imageUrl: "", imageUrlFile: null});
        }
        setIsProjectModalOpen(true);
    };

    const closeProjectModal = () => {
        setIsProjectModalOpen(false);
        setCurrentEditingProject(null);
        setProjectFormData({});
    };

    const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setProjectFormData(prev => ({...prev, [name]: value}));
    };

    const handleProjectImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProjectFormData(prev => ({...prev, imageUrl: reader.result as string, imageUrlFile: file}));
            };
            reader.readAsDataURL(file);
        } else {
            setProjectFormData(prev => ({
                ...prev,
                imageUrlFile: null,
                imageUrl: currentEditingProject?.imageUrl || ""
            }));
        }
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectFormData.name || !projectFormData.address) {
            openDialog('Greška', 'Naziv i adresa projekta su obavezni.', 'error');
            return;
        }

        const newNameLower = projectFormData.name.trim().toLowerCase();
        const duplicateExists = projects.some(p =>
            p.name.trim().toLowerCase() === newNameLower && p.id !== currentEditingProject?.id
        );

        if (duplicateExists) {
            openDialog('Greška', 'Projekt s ovim imenom već postoji. Molimo odaberite drugo ime.', 'error');
            return;
        }

        const payload: Partial<ProjectCreatePayload | ProjectUpdatePayload> = {
            name: projectFormData.name,
            address: projectFormData.address,
            status: projectFormData.status || "Aktivan",
            notes: projectFormData.notes,
        };

        let imageToSend: string | undefined = undefined;
        let removeCurrentImage: boolean | undefined = undefined;

        if (projectFormData.imageUrlFile) {
            imageToSend = projectFormData.imageUrl;
        } else if (currentEditingProject && projectFormData.imageUrl === "" && currentEditingProject.imageUrl !== "") {
            removeCurrentImage = true;
        }
        if (imageToSend !== undefined) {
            payload.imageUrl = imageToSend;
        }
        if (removeCurrentImage !== undefined && currentEditingProject) {
            (payload as ProjectUpdatePayload).removeImage = removeCurrentImage;
            if (removeCurrentImage) payload.imageUrl = undefined;
        }

        try {
            if (currentEditingProject) {
                const updated = await updateProject(currentEditingProject.id, payload as ProjectUpdatePayload);
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                openDialog('Projekt Ažuriran', 'Podaci o projektu su uspješno spremljeni.', 'success');
            } else {
                const added = await addProject(payload as ProjectCreatePayload);
                setProjects(prev => [...prev, added]);
                openDialog('Projekt Dodan', 'Novi projekt je uspješno kreiran.', 'success');
            }
            closeProjectModal();
        } catch (err: any) {
            console.error("Error saving project:", err);
            openDialog('Greška', `Greška pri spremanju projekta: ${err.response?.data?.message || err.message}`, 'error');
        }
    };

    const closeDialog = () => setDialogState({isOpen: false, title: '', message: '', type: 'success'});

    return (
        <>

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Ponude</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => openProjectModal()}
                            className="inline-flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FolderPlusIcon className="h-5 w-5"/>
                            <span>Novi Projekt</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedItems([]);
                                setDiscount("");
                                setLogoDataURL(null);
                                setSelectedProjectIdForQuote("");
                                setNewQuoteDescription("");
                                setIsQuoteModalOpen(true);
                            }}
                            className="inline-flex items-center space-x-2 rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <PlusCircleIcon className="h-5 w-5"/>
                            <span>Kreiraj novu ponudu</span>
                        </button>
                    </div>
                </div>

                {isLoadingInitialData ? (
                    <LoadingSpinner></LoadingSpinner>
                ) : (
                    <>
                        <div className="mb-6 p-4 bg-white shadow rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label htmlFor="projectFilter"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Projekt:
                                    </label>
                                    <div className="flex items-center">
                                        <select
                                            id="projectFilter"
                                            value={projectFilter}
                                            onChange={(e) => setProjectFilter(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 pl-3 pr-10"
                                        >
                                            <option value="all">Sve ponude (svi projekti)</option>
                                            <option value="none">Ponude bez projekta</option>
                                            {projects.map((p) => (
                                                <option key={p.id} value={p.id.toString()}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        {projectFilter !== "all" && projectFilter !== "none" && projects.find(p => p.id === parseInt(projectFilter)) && (
                                            <button
                                                onClick={() => openProjectModal(projects.find(p => p.id === parseInt(projectFilter))!)}
                                                className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                                                title="Uredi odabrani projekt">
                                                <PencilIcon className="h-4 w-4"/>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="startDateFilter"
                                           className="block text-sm font-medium text-gray-700 mb-1">Datum
                                        od:</label>
                                    <input
                                        type="date"
                                        id="startDateFilter"
                                        value={startDateFilter}
                                        onChange={(e) => setStartDateFilter(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 px-3"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDateFilter"
                                           className="block text-sm font-medium text-gray-700 mb-1">Datum
                                        do:</label>
                                    <input
                                        type="date"
                                        id="endDateFilter"
                                        value={endDateFilter}
                                        onChange={(e) => setEndDateFilter(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 px-3"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="sortField" className="block text-sm font-medium text-gray-700 mb-1">Sortiraj
                                        po:</label>
                                    <select
                                        id="sortField"
                                        value={sortField}
                                        onChange={(e) => setSortField(e.target.value as SortField)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 pl-3 pr-10"
                                    >
                                        <option value="createdAt">Datum</option>
                                        <option value="id">ID ponude</option>
                                        <option value="totalAmount">Ukupan iznos</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="sortOrder"
                                           className="block text-sm font-medium text-gray-700 mb-1">Redoslijed:</label>
                                    <select
                                        id="sortOrder"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 pl-3 pr-10"
                                    >
                                        <option value="asc">Uzlazno</option>
                                        <option value="desc">Silazno</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            {displayedQuotes.length === 0 ? (
                                <p className="text-center text-sm text-gray-500 py-10">Nema ponuda za odabrane
                                    filtere.</p>
                            ) : (
                                displayedQuotes.map((q) => {
                                    const rawTotal = q.items.reduce((sum, it) => {
                                        const prod = products.find(p => p.id === it.productId);
                                        return prod ? sum + prod.price * it.quantity : sum;
                                    }, 0);
                                    const discountValue = q.discount ?? 0;
                                    const discountedTotal = rawTotal * (100 - discountValue) / 100;
                                    const projectForQuote = q.projectId ? projects.find(p => p.id === q.projectId) : null;

                                    return (
                                        <div key={q.id}
                                             className="border p-4 rounded-lg shadow hover:shadow-md mb-3 bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-orange-600">Ponuda
                                                        ID: {q.id}</h3>
                                                    {projectForQuote &&
                                                        <p className="text-sm text-gray-600 font-medium">Projekt: {projectForQuote.name}</p>}
                                                    <p className="text-xs text-gray-500">Datum: {new Date(q.createdAt).toLocaleString('hr-HR', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short'
                                                    })}</p>
                                                    {q.logoUrl &&
                                                        <img src={q.logoUrl} alt="Logo ponude"
                                                             className="max-h-12 my-2 border"/>}
                                                    {q.description && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">Opis: {q.description}</p>)}
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleDownloadSelectedQuotePdf(q.id)}
                                                        className="p-2 text-gray-500 hover:text-green-600 focus:outline-none"
                                                        title="Preuzmi PDF"
                                                    >
                                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                                             strokeWidth="1.5"
                                                             stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEmailModal(q)}
                                                        className="p-2 text-gray-500 hover:text-orange-600 focus:outline-none"
                                                        title="Pošalji ponudu emailom"
                                                    >
                                                        <EnvelopeIcon className="h-6 w-6"/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm">Bez rabata: <span
                                                    className="font-medium">{rawTotal.toFixed(2)} €</span></p>
                                                {discountValue > 0 && (<p className="text-sm">Rabat: <span
                                                    className="font-medium">{discountValue}%</span></p>)}
                                                <p className="text-sm font-bold">Ukupno: <span
                                                    className="text-orange-700">{discountedTotal.toFixed(2)} €</span>
                                                </p>
                                                <details className="text-xs mt-1 text-gray-600">
                                                    <summary className="cursor-pointer hover:underline">Prikaži stavke
                                                    </summary>
                                                    <ul className="list-disc pl-5 mt-1">
                                                        {q.items.map((i) => {
                                                            const prod = products.find((p) => p.id === i.productId);
                                                            return prod ? (
                                                                    <li key={prod.id + '-' + i.productId}>{prod.name} x {i.quantity} = {(prod.price * i.quantity).toFixed(2)} €</li>) :
                                                                <li key={i.productId}>Nepoznat proizvod</li>;
                                                        })}
                                                    </ul>
                                                </details>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {isQuoteModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 px-4 py-6">
                        <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                            <button onClick={() => setIsQuoteModalOpen(false)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6"/>
                            </button>
                            <h2 className="text-xl font-bold mb-4">Kreiranje nove ponude</h2>
                            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
                                <div className="flex items-center gap-3">
                                    <label htmlFor="quoteLogoUpload" className="font-medium text-sm text-gray-700">Logo
                                        (opcionalno):</label>
                                    <input id="quoteLogoUpload" type="file" accept="image/*" onChange={handleLogoChange}
                                           className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
                                    {logoDataURL && <img src={logoDataURL} alt="logo preview"
                                                         className="max-h-10 border p-0.5 rounded"/>}
                                </div>
                                <div>
                                    <input type="text" placeholder="Traži proizvod..." value={searchTerm}
                                           onChange={(e) => setSearchTerm(e.target.value)}
                                           className="w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-300 sm:text-sm"/>
                                    {searchTerm.trim() && filteredProducts.length > 0 && (
                                        <div
                                            className="mt-2 rounded border border-gray-200 bg-white p-3 shadow max-h-60 overflow-y-auto">
                                            {filteredProducts.map((p) => {
                                                const qtyStr = getQuantityString(p.id);
                                                const qty = parseInt(qtyStr, 10) || 0;
                                                const displayPrice = qty > 0 ? (p.price * qty).toFixed(2) : p.price.toFixed(2);
                                                return (
                                                    <div key={p.id}
                                                         className="mb-2 flex items-center justify-between py-1">
                                                        <span className="font-medium text-sm">{p.name}</span>
                                                        <div className="flex items-center space-x-1">
                                                            <button type="button" onClick={() => handleDecrement(p.id)}
                                                                    className="rounded bg-gray-200 px-2 py-0.5 text-sm hover:bg-gray-300">–
                                                            </button>
                                                            <input type="text" value={qtyStr}
                                                                   onChange={(e) => handleQuantityInput(p.id, e.target.value)}
                                                                   className="w-12 rounded border-gray-300 px-1 text-center text-sm"/>
                                                            <button type="button" onClick={() => handleIncrement(p.id)}
                                                                    className="rounded bg-gray-200 px-2 py-0.5 text-sm hover:bg-gray-300">+
                                                            </button>
                                                        </div>
                                                        <span
                                                            className="text-sm text-gray-600 w-20 text-right">{displayPrice} €</span>
                                                    </div>);
                                            })}
                                        </div>
                                    )}
                                    {selectedItems.length > 0 && (
                                        <div className="border-t border-gray-200 pt-4 mt-4"><h3
                                            className="text-sm font-medium text-gray-700 mb-2">Odabrani artikli:</h3>
                                            <ul className="max-h-40 overflow-y-auto space-y-1"> {selectedItems.map((item) => {
                                                const prod = products.find((p) => p.id === item.productId);
                                                if (!prod) return null;
                                                return (<li key={item.productId}
                                                            className="flex justify-between items-center text-sm text-gray-800 py-0.5">
                                                    <div><span className="font-medium">{prod.name}</span> <span
                                                        className="text-gray-500"> × {item.quantity}</span></div>
                                                    <div
                                                        className="font-medium"> {(prod.price * item.quantity).toFixed(2)} €
                                                    </div>
                                                </li>);
                                            })} </ul>
                                        </div>)}
                                </div>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="quoteDiscount" className="font-medium text-sm text-gray-700">Rabat
                                        (%)
                                        (opc.):</label>
                                    <input id="quoteDiscount" type="number" min={0} max={100} placeholder="npr. 15"
                                           value={discount} onChange={e => {
                                        const v = e.target.value;
                                        setDiscount(v === "" ? "" : Math.max(0, Math.min(100, +v)));
                                    }} className="w-24 border-gray-300 rounded px-3 py-2 text-sm"/>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="selectedProjectIdForQuote"
                                           className="font-medium text-sm text-gray-700">Projekt (opc.):</label>
                                    <select
                                        id="selectedProjectIdForQuote"
                                        value={selectedProjectIdForQuote}
                                        onChange={(e) => setSelectedProjectIdForQuote(e.target.value)}
                                        className="flex-1 rounded border-gray-300 px-2 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-300 sm:text-sm"
                                    >
                                        <option value="">Nijedan projekt</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id.toString()}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="quoteDescription"
                                           className="block text-sm font-medium text-gray-700">
                                        Opis ponude (opcionalno)
                                    </label>
                                    <textarea
                                        id="quoteDescription"
                                        name="quoteDescription"
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                        value={newQuoteDescription}
                                        onChange={(e) => setNewQuoteDescription(e.target.value)}
                                        placeholder="Unesite kratak opis ponude..."
                                    />
                                </div>
                                <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm mt-2"><p>Ukupno
                                    artikala: {selectedItems.reduce((sum, i) => sum + i.quantity, 0)}</p> <p>Bez
                                    rabata: {getTotal().toFixed(2)} €</p> {discount !== "" && +discount > 0 && (<>
                                    <p>Rabat: {discount}%</p> <p className="font-semibold"> Sa
                                    rabatom: {(getTotal() * (100 - (+discount)) / 100).toFixed(2)} € </p> </>)} </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsQuoteModalOpen(false)}
                                        className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300">Odustani
                                </button>
                                <button type="button" onClick={handleCreateQuote}
                                        className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">Kreiraj
                                    ponudu & PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isProjectModalOpen && (
                    <div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75 px-4 py-6">
                        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                            <button onClick={closeProjectModal}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6"/>
                            </button>
                            <h2 className="text-xl font-bold mb-4">{currentEditingProject ? "Uredi Projekt" : "Dodaj Novi Projekt"}</h2>
                            <form onSubmit={handleSaveProject}
                                  className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
                                <div>
                                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Naziv
                                        Projekta</label>
                                    <input type="text" name="name" id="projectName" value={projectFormData.name || ""}
                                           onChange={handleProjectFormChange} required
                                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="projectAddress"
                                           className="block text-sm font-medium text-gray-700">Adresa</label>
                                    <input type="text" name="address" id="projectAddress"
                                           value={projectFormData.address || ""} onChange={handleProjectFormChange}
                                           required
                                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="projectStatus"
                                           className="block text-sm font-medium text-gray-700">Status</label>
                                    <select name="status" id="projectStatus" value={projectFormData.status || "Aktivan"}
                                            onChange={handleProjectFormChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 pl-3 pr-10">
                                        <option value="Aktivan">Aktivan</option>
                                        <option value="Na čekanju">Na čekanju</option>
                                        <option value="Završen">Završen</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="projectNotes"
                                           className="block text-sm font-medium text-gray-700">Bilješke</label>
                                    <textarea name="notes" id="projectNotes" value={projectFormData.notes || ""}
                                              onChange={handleProjectFormChange} rows={3}
                                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"/>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3 pt-2">
                                    <button type="button" onClick={closeProjectModal}
                                            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300">Odustani
                                    </button>
                                    <button type="submit"
                                            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Spremi
                                        Projekt
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {dialogState.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
                         onClick={closeDialog}>
                        <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl text-center"
                             onClick={(e) => e.stopPropagation()}>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                                {dialogState.type === 'success' ? (
                                    <CheckCircleIcon className="h-10 w-10 text-green-500"/>
                                ) : (
                                    <ExclamationTriangleIcon className="h-10 w-10 text-red-500"/>
                                )}
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">{dialogState.title}</h3>
                            <p className="mt-2 text-sm text-gray-600">{dialogState.message}</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${dialogState.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    U redu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isEmailModalOpen && quoteForEmail && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
                        <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-6">
                            <button onClick={handleCloseEmailModal}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><XMarkIcon
                                className="h-6 w-6"/></button>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><EnvelopeIcon
                                className="h-6 w-6 text-orange-500"/> Slanje ponude #{quoteForEmail.id} emailom </h2>
                            <div className="space-y-1"><label htmlFor="recipientEmail"
                                                              className="block text-sm font-medium text-gray-700"> Email
                                primatelja </label> <input id="recipientEmail" type="email"
                                                           placeholder="Upišite email primatelja"
                                                           className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-sm ${emailFormErrors.email ? "border-red-500" : "border-gray-300"}`}
                                                           value={recipientEmail}
                                                           onChange={(e) => setRecipientEmail(e.target.value)}/> {emailFormErrors.email &&
                                <p className="text-sm text-red-500 mt-0.5">{emailFormErrors.email}</p>} </div>
                            <div className="space-y-1"><label htmlFor="recipientName"
                                                              className="block text-sm font-medium text-gray-700"> Ime
                                primatelja (opcionalno) </label> <input id="recipientName" type="text"
                                                                        placeholder="Unesite ime za personalizaciju emaila"
                                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-sm"
                                                                        value={recipientName}
                                                                        onChange={(e) => setRecipientName(e.target.value)}/>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={handleCloseEmailModal}
                                        className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"> Odustani
                                </button>
                                <button type="button" onClick={handleSendQuoteEmail} disabled={isSendingEmail}
                                        className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"> {isSendingEmail ? "Slanje..." : "Pošalji Email"} </button>
                            </div>
                        </div>
                    </div>)}
            </div>
        </>
    );
};

export default QuotesPage;