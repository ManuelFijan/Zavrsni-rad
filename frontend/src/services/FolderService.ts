import { Quote } from "./QuoteService";

export interface Folder {
    id: number;
    name: string;
    quoteIds: number[];
}

// in-memory folders
let foldersDb: Folder[] = [
    {
        id: 1,
        name: "Glavni Proj. Dokumenti",
        quoteIds: [],
    },
    {
        id: 2,
        name: "Arhiva",
        quoteIds: [],
    }
];

export async function getFolders(): Promise<Folder[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...foldersDb]);
        }, 300);
    });
}

export async function createFolder(name: string): Promise<Folder> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!name.trim()) {
                reject("Naziv foldera ne može biti prazan.");
                return;
            }
            const nextId = foldersDb.length > 0
                ? foldersDb[foldersDb.length - 1].id + 1
                : 1;
            const newFolder: Folder = {
                id: nextId,
                name,
                quoteIds: []
            };
            foldersDb.push(newFolder);
            resolve(newFolder);
        }, 300);
    });
}

export async function addQuoteToFolder(folderId: number, quoteId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const folder = foldersDb.find((f) => f.id === folderId);
            if (!folder) {
                reject("Folder nije pronađen.");
                return;
            }
            if (!folder.quoteIds.includes(quoteId)) {
                folder.quoteIds.push(quoteId);
            }
            resolve();
        }, 300);
    });
}

export function getQuotesInFolder(folder: Folder, allQuotes: Quote[]): Quote[] {
    return folder.quoteIds
        .map((id) => allQuotes.find((q) => q.id === id))
        .filter((quote): quote is Quote => !!quote);
}
