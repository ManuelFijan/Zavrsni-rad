import {saveToken} from "./AuthSession";
import apiClient from "./axiosConfig";

export interface User {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    primaryAreaOfWork: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    user: User;
}

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
        "/api/auth/login",
        {identifier: email, password}
    );

    const {accessToken, tokenType, user} = response.data;
    const fullToken = `${tokenType} ${accessToken}`;

    saveToken(fullToken);
    apiClient.defaults.headers.common["Authorization"] = fullToken;

    return {accessToken, tokenType, user};
}

export async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    primaryAreaOfWork: string
): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
        "/api/auth/register",
        {firstName, lastName, email, password, primaryAreaOfWork}
    );

    const {accessToken, tokenType, user} = response.data;
    const fullToken = `${tokenType} ${accessToken}`;

    saveToken(fullToken);
    apiClient.defaults.headers.common["Authorization"] = fullToken;

    return {accessToken, tokenType, user};
}