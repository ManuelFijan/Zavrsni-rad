// product type
export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
}

// mock "in-memory database" array
let productsDb: Product[] = [
    {
        id: 1,
        name: "Cijev CU 5m",
        category: "Građevinski Materijal",
        price: 30.0,
        description: "Opis",
    },
    {
        id: 2,
        name: "Čavao",
        category: "Građevinski Materijal",
        price: 1.0,
        description: "Opis",
    },
    {
        id: 3,
        name: "Cement",
        category: "Građevinski Materijal",
        price: 15.0,
        description: "Opis",
    },
]

// fetching products from the "database"
export async function getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(productsDb);
        }, 300);
    });
}

let nextId = 100;
// adding a product to the "database"
export async function addProduct(newProduct: Omit<Product, "id">): Promise<Product> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("[addProduct] CALLED with:", newProduct);
            if (
                !newProduct.name ||
                !newProduct.category ||
                newProduct.price === undefined ||
                !newProduct.description
            ) {
                reject("Molimo popunite sva polja.");
            } else {
                const product: Product = { id: nextId++, ...newProduct };
                //productsDb.push(product);
                resolve(product);
            }
        }, 300);
    });
}