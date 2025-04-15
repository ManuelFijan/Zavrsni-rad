export interface User {
    firstName: string;
    lastName: string;
    email: string;
    primaryBusinessArea: string;
    profilePicture: string;
}

let mockUser: User = {
    firstName: "Ivo",
    lastName: "Ivić",
    email: "ivo@gmail.com",
    primaryBusinessArea: "Grubi radovi",
    profilePicture: "/images/worker.jpg",
};

// function to get the mock user profile
export async function getUserProfile(): Promise<User> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockUser);
        }, 300);
    });
}

// function to update the mock user profile
export async function updateUserProfile(updates: User): Promise<User> {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockUser = { ...updates };
            resolve(mockUser);
        }, 300);
    });
}
