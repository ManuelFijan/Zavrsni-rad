import React, {useEffect, useState, useCallback} from 'react';
import {Product, getProducts, createProduct, updateProduct} from "../services/ProductService";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/20/solid";

const CATEGORY_LABELS: Record<string, string> = {
    USLUGA: "Usluga",
    GRAĐEVINSKI_MATERIJAL: "Građevinski materijal",
};

const PAGE_SIZE = 20;

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [addErrorMessage, setAddErrorMessage] = useState<string | null>(null);
    const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

    const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
        name: "",
        category: "",
        price: 0,
        description: "",
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const pageData = await getProducts(currentPage, PAGE_SIZE, searchQuery);
                setProducts(pageData.content);
                setTotalPages(pageData.totalPages);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        })();
    }, [currentPage, searchQuery]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    }, []);

    const openAddModal = () => {
        setAddErrorMessage(null);
        setIsAddModalOpen(true);
    };
    const closeAddModal = () => {
        setAddErrorMessage(null);
        setIsAddModalOpen(false);
        setNewProduct({name: '', category: '', price: 0, description: ''});
    };

    const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProduct(newProduct);
            setCurrentPage(0);
            closeAddModal();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setAddErrorMessage("Ovaj proizvod već postoji. Unesite drugačiji naziv.");
            } else {
                setAddErrorMessage("Spremanje nije uspjelo. Pokušajte ponovno.");
            }
        }
    };

    const openEditModal = (product: Product) => {
        setEditErrorMessage(null);
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditErrorMessage(null);
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        if (editingProduct) {
            setEditingProduct({
                ...editingProduct,
                [name]: name === 'price' ? parseFloat(value) : value,
            });
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        try {
            await updateProduct(editingProduct.id, {
                name: editingProduct.name,
                category: editingProduct.category,
                price: editingProduct.price,
                description: editingProduct.description,
            });
            setCurrentPage(0);
            closeEditModal();
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 409) {
                setEditErrorMessage("Ovaj proizvod već postoji. Unesite drugačiji naziv.");
            } else {
                setEditErrorMessage("Spremanje nije uspjelo. Pokušajte ponovno.");
            }
        }
    };

    const prevPage = () => setCurrentPage(p => Math.max(p - 1, 0));
    const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages - 1));

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Baza proizvoda</h2>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Pretraži proizvode..."
                    className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4 md:mb-0"
                />
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Dodaj novi proizvod
                </button>
            </div>

            <div className="flex justify-center items-center mb-4">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600"/>
                </button>
                <span className="mx-2 text-sm text-gray-600">
                        {currentPage + 1} / {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRightIcon className="w-6 h-6 text-gray-600"/>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naziv</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorija</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cijena
                            (€)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{CATEGORY_LABELS[product.category] ?? product.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                    onClick={() => openEditModal(product)}
                                    className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded hover:bg-orange-700"
                                >
                                    Uredi
                                </button>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                Nema pronađenih proizvoda.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mb-4">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600"/>
                </button>
                <span className="mx-2 text-sm text-gray-600">
                     {currentPage + 1} / {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRightIcon className="w-6 h-6 text-gray-600"/>
                </button>
            </div>

            {isAddModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"
                              aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">

                            {addErrorMessage && (
                                <div
                                    className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700"
                                    role="alert"
                                >
                                    <strong className="font-semibold">Greška: </strong>
                                    <span className="block sm:inline">{addErrorMessage}</span>
                                </div>
                            )}

                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Dodaj novi proizvod
                                    </h3>
                                    <div className="mt-2">
                                        <form onSubmit={e => {
                                            setAddErrorMessage(null);
                                            handleAddProduct(e);
                                        }}
                                        >
                                            <div className="mb-4">
                                                <label htmlFor="name"
                                                       className="block text-sm font-medium text-gray-700">
                                                    Naziv
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={newProduct.name}
                                                    onChange={handleAddInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="category"
                                                       className="block text-sm font-medium text-gray-700">
                                                    Kategorija
                                                </label>
                                                <select
                                                    name="category"
                                                    id="category"
                                                    value={newProduct.category}
                                                    onChange={handleAddInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                                ocus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                >
                                                    <option value="" disabled className="text-gray-400">
                                                        Odaberite kategoriju
                                                    </option>
                                                    <option value="USLUGA">Usluga</option>
                                                    <option value="GRAĐEVINSKI_MATERIJAL">Građevinski materijal</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="price"
                                                       className="block text-sm font-medium text-gray-700">
                                                    Cijena (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    id="price"
                                                    value={newProduct.price}
                                                    onChange={handleAddInputChange}
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="description"
                                                       className="block text-sm font-medium text-gray-700">
                                                    Opis
                                                </label>
                                                <textarea
                                                    name="description"
                                                    id="description"
                                                    value={newProduct.description}
                                                    onChange={handleAddInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                ></textarea>
                                            </div>
                                            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="submit"
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                >
                                                    Dodaj proizvod
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeAddModal}
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                >
                                                    Odustani
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {
                isEditModalOpen && editingProduct && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 text-center">
                            <div
                                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                aria-hidden="true"
                            ></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
                            <div
                                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <h3
                                            className="text-lg leading-6 font-medium text-gray-900"
                                            id="modal-title"
                                        >
                                            Uredi proizvod
                                        </h3>

                                        {editErrorMessage && (
                                            <div
                                                className="mt-3 mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700"
                                                role="alert"
                                            >
                                                <strong className="font-semibold">Greška: </strong>
                                                <span className="block sm:inline">{editErrorMessage}</span>
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <form onSubmit={handleUpdateProduct}>
                                                <div className="mb-4">
                                                    <label htmlFor="edit-name"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Naziv
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="edit-name"
                                                        value={editingProduct.name}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="category"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Kategorija
                                                    </label>
                                                    <select
                                                        name="category"
                                                        id="category"
                                                        value={editingProduct.category}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                                ocus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                    >
                                                        <option value="" disabled className="text-gray-400">
                                                            Odaberite kategoriju
                                                        </option>
                                                        <option value="USLUGA">Usluga</option>
                                                        <option value="GRAĐEVINSKI_MATERIJAL">Građevinski materijal
                                                        </option>
                                                    </select>
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="edit-price"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Cijena (€)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        id="edit-price"
                                                        value={editingProduct.price}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label htmlFor="edit-description"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Opis
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        id="edit-description"
                                                        value={editingProduct.description}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    ></textarea>
                                                </div>
                                                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                    >
                                                        Spremi promjene
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={closeEditModal}
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                    >
                                                        Odustani
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

        </div>
    );
};

export default ProductsPage;
