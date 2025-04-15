import { Product } from "./ProductService";

export interface QuoteItem {
    productId: number;
    quantity: number;
}

export interface Quote {
    id: number;
    items: QuoteItem[];
    folder: string;
    createdAt: Date;
}

let quotesDb: Quote[] = [];
// help array
let helpQuotes: Quote[] = [];

let nextQuoteId = 1;

export async function getQuotes(): Promise<Quote[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...helpQuotes]);
        }, 300);
    });
}

export async function createQuote(items: QuoteItem[], folder: string): Promise<Quote> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!items || items.length === 0) {
                reject("Ne možete kreirati praznu ponudu.");
                return;
            }
            const newQuote: Quote = {
                id: nextQuoteId++, // increment the counter each time
                items,
                folder,
                createdAt: new Date(),
            };

            helpQuotes.push(newQuote);

            resolve(newQuote);
        }, 300);
    });
}
