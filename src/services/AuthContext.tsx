import React, { createContext, useState, useEffect } from "react";
import { getToken, clearToken } from "./AuthSession";

interface AuthContextProps {
    isAuthenticated: boolean;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    logout: () => {},
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());

    useEffect(() => {
        setIsAuthenticated(!!getToken());
    }, []);

    const logout = () => {
        clearToken();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};