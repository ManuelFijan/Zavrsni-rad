import apiClient from "./axiosConfig";

export interface UserDto {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    primaryAreaOfWork: string;
}

export async function updateUserProfile(profile: {
    firstName: string;
    lastName: string;
    email: string;
    primaryAreaOfWork: string;
}): Promise<UserDto> {
    const response = await apiClient.put<UserDto>(
        "/api/auth/update",
        profile
    );
    return response.data;
}

export async function getUserProfile(): Promise<UserDto> {
    const token = localStorage.getItem("accessToken");
    const response = await apiClient.get<UserDto>(
        "/api/auth/profile",
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
}