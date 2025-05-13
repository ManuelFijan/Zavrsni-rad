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
}

export async function getQuotes(): Promise<Quote[]> {
    const {data} = await apiClient.get<Quote[]>("/api/quotes");
    return data;
}

export async function createQuote(
    items: QuoteItem[],
    logoBase64: string | null
): Promise<number> {
    const dtoItems = items.map(i => ({
        articleId: i.productId,
        quantity: i.quantity
    }));

    const {data: newQuoteId} = await apiClient.post<number>(
        "/api/quotes",
        {items: dtoItems, logoBase64}
    );

    return newQuoteId;
}

export async function downloadQuotePdf(quoteId: number): Promise<Blob> {
    const resp = await apiClient.get(`/api/quotes/${quoteId}/pdf`, {
        responseType: "blob",
    });
    return resp.data;
}

export async function getQuote(id: number): Promise<Quote> {
    const { data } = await apiClient.get<Quote>(`/api/quotes/${id}`);
    return data;
}
