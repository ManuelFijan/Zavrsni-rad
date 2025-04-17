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