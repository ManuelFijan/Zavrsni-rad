import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Product, getProducts, addProduct, updateProduct } from "../services/ProductService";

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
        name: "",
        category: "",
        price: 0,
        description: "",
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const didFetchRef = useRef(false);
    useEffect(() => {
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        (async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        })();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewProduct({ name: '', category: '', price: 0, description: '' });
    };

    const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    };

    const isSubmittingRef = useRef(false);
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        try {
            const createdProduct = await addProduct(newProduct);
            setProducts([...products, createdProduct]);
            closeAddModal();
        } catch (err: any) {
            alert(err);
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (editingProduct) {
            setEditingProduct({
                ...editingProduct,
                [name]: name === 'price' ? parseFloat(value) : value,
            });
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            try {
                const updatedProduct = await updateProduct(editingProduct.id, editingProduct);
                setProducts(products.map(prod => prod.id === updatedProduct.id ? updatedProduct : prod));
                closeEditModal();
            } catch (err: any) {
                alert(err);
            }
        }
    };

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

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naziv</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorija</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cijena (€)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
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
                    {filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                Nema pronađenih proizvoda.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Dodaj novi proizvod
                                    </h3>
                                    <div className="mt-2">
                                        <form onSubmit={handleAddProduct}>
                                            <div className="mb-4">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
                                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                    Kategorija
                                                </label>
                                                <input
                                                    type="text"
                                                    name="category"
                                                    id="category"
                                                    value={newProduct.category}
                                                    onChange={handleAddInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
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
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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

            {isEditModalOpen && editingProduct && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3
                                        className="text-lg leading-6 font-medium text-gray-900"
                                        id="modal-title"
                                    >
                                        Uredi proizvod
                                    </h3>
                                    <div className="mt-2">
                                        <form onSubmit={handleUpdateProduct}>
                                            <div className="mb-4">
                                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
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
                                                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                                                    Kategorija
                                                </label>
                                                <input
                                                    type="text"
                                                    name="category"
                                                    id="edit-category"
                                                    value={editingProduct.category}
                                                    onChange={handleEditInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">
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
                                                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
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
