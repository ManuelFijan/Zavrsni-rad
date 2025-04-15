let usedEmails: string[] = [
    "john@example.com",
    "contact@firma.hr",
];

export async function getUsedEmails(): Promise<string[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...usedEmails]);
        }, 300);
    });
}

export async function sendEmail(
    recipientEmail: string,
    message: string,
    quoteId: number
): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!recipientEmail.trim()) {
                reject("Email adresa ne može biti prazna!");
                return;
            }
            // if new, store it in the used emails
            if (!usedEmails.includes(recipientEmail)) {
                usedEmails.push(recipientEmail);
            }
            console.log(
                `[MOCK] Email poslan na: ${recipientEmail}\n` +
                `Poruka: ${message}\n` +
                `ID ponude: ${quoteId}`
            );
            resolve();
        }, 500);
    });
}
