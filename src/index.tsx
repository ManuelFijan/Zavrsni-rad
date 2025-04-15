import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import './index.css';
import {createRoot} from "react-dom/client";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

const root = createRoot(container);
root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
