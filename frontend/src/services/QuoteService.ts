import apiClient from "./axiosConfig";

export interface QuoteItem {
    productId: number;
    quantity: number;
}

export interface Quote {
    id: number;
    items: QuoteItem[];
    createdAt: string;
    logoUrl?: string;
    folderId?: number;
    discount?: number;
    projectId?: number;
    projectName?: string;
    description?: string;
}

export async function getQuotes(): Promise<Quote[]> {
    const {data} = await apiClient.get<Quote[]>("/api/quotes");
    return data;
}

export const createQuote = async (
    items: QuoteItem[],
    logoBase64: string | null,
    discount: number,
    projectId?: number,
    description?: string
): Promise<number> => {
    const payload = {
        items: items.map(item => ({articleId: item.productId, quantity: item.quantity})),
        logoBase64,
        discount,
        projectId,
        description
    };
    const response = await apiClient.post<number>("/api/quotes", payload);
    return response.data;
};

export async function downloadQuotePdf(quoteId: number): Promise<Blob> {
    const resp = await apiClient.get(`/api/quotes/${quoteId}/pdf`, {
        responseType: "blob",
    });
    return resp.data;
}

export async function getQuote(id: number): Promise<Quote> {
    const {data} = await apiClient.get<Quote>(`/api/quotes/${id}`);
    return data;
}
