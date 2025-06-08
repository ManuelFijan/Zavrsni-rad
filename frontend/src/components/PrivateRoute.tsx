import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
};

export default PrivateRoute;
