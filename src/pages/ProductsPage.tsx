import React, {useEffect, useRef, useState} from 'react';
import { Product, getProducts, addProduct } from "../services/ProductService";

const ProductsPage: React.FC = () => {

    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
        name: "",
        category: "",
        price: 0,
        description: "",
    });

    const didFetchRef = useRef(false);
    // fetch products from the service
    useEffect(() => {
        console.log("Fetching products...", didFetchRef.current);
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

    const openModal = () => setIsModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false);
        setNewProduct({ name: '', category: '', price: 0, description: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    };

    const isSubmitting = useRef(false);
    // add product to service
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("[handleAddProduct] top - Attempting to add product", newProduct);
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        try {
            const createdProduct = await addProduct(newProduct);
            console.log("[handleAddProduct] got createdProduct:", createdProduct);
            setProducts([...products, createdProduct]);
            closeModal();
        } catch (err: any) {
            alert(err);
        } finally {
            isSubmitting.current = false;
            console.log("[handleAddProduct] done");
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
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Dodaj novi proizvod
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Naziv
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Kategorija
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Cijena (€)
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Opis
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.description}
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                Nema pronađenih proizvoda.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                        ></div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3
                                        className="text-lg leading-6 font-medium text-gray-900"
                                        id="modal-title"
                                    >
                                        Dodaj novi proizvod
                                    </h3>
                                    <div className="mt-2">
                                        <form onSubmit={handleAddProduct}
                                        onKeyDown={event => {
                                            if(event.key==="Enter") {
                                                event.preventDefault();
                                            }
                                        }}>
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Naziv
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={newProduct.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="category"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Kategorija
                                                </label>
                                                <input
                                                    type="text"
                                                    name="category"
                                                    id="category"
                                                    value={newProduct.category}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="price"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Cijena (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    id="price"
                                                    value={newProduct.price}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="description"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Opis
                                                </label>
                                                <textarea
                                                    name="description"
                                                    id="description"
                                                    value={newProduct.description}
                                                    onChange={handleInputChange}
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
                                                    onClick={closeModal}
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