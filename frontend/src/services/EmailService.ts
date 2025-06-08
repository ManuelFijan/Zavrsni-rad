import apiClient from "./axiosConfig";

export async function sendEmail(
    recipientEmail: string,
    message: string,
    quoteId: number
): Promise<void> {
    await apiClient.post(
        `/api/quotes/${quoteId}/email`,
        {},
        {
            params: {
                recipientEmail,
                recipientName: message,
            },
        }
    );
}
