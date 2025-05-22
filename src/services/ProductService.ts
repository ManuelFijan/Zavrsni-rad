import apiClient from "./axiosConfig";

export type MeasureUnit = "M2" | "M3" | "KOM";

interface RawProduct {
    articleId: number;
    name: string;
    category: string;
    price: number;
    description: string;
    measureUnit: MeasureUnit;
}

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    measureUnit: MeasureUnit;
}

export interface PaginatedProducts {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

function normalizeProduct(raw: RawProduct): Product {
    return {
        id: raw.articleId,
        name: raw.name,
        category: raw.category,
        price: raw.price,
        description: raw.description,
        measureUnit: raw.measureUnit,
    };
}

export async function getProducts(
    page: number = 0,
    size: number = 20,
    search?: string
): Promise<PaginatedProducts> {
    const params: any = {page, size};
    if (search) params.search = search;
    const response = await apiClient.get<{
        content: RawProduct[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
    }>("/articles", {params});
    const data = response.data;
    return {
        ...data,
        content: data.content.map(normalizeProduct),
    };
}

export async function createProduct(
    product: Omit<Product, "id">
): Promise<Product> {
    const response = await apiClient.post<RawProduct>("/articles", product);
    return normalizeProduct(response.data);
}

export async function updateProduct(
    id: number,
    product: Omit<Product, "id">
): Promise<Product> {
    const response = await apiClient.put<RawProduct>(`/articles/${id}`, product);
    return normalizeProduct(response.data);
}
