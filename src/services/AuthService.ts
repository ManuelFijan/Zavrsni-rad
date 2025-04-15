import { saveToken } from "./AuthSession";

export async function login(email: string, password: string): Promise<{ token: string }> {
    return new Promise((resolve, reject) => {
        // simulate a short delay
        setTimeout(() => {
            if (email && password) {
                const token = "MOCK_TOKEN_VALUE";
                saveToken(token);
                resolve({ token });
            } else {
                reject("Invalid credentials");
            }
        }, 500);
    });
}

export async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    primaryBusinessArea: string
): Promise<{ userId: string; message: string; token: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === "existinguser@example.com") {
                reject("Ovaj email je već registriran.");
            } else {
                const token = "NEW_USER_TOKEN_VALUE";
                saveToken(token);
                resolve({
                    userId: "MOCK_USER_ID",
                    message: "Korisnik uspješno kreiran",
                    token,
                });
            }
        }, 500);
    });
}