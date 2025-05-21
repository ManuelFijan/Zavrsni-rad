import React, {useState} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import {resetPassword} from "../services/AuthService";

function ResetPasswordPage() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const navigate = useNavigate();

    const [pw, setPw] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pw !== confirm) {
            setError("Lozinke se ne podudaraju.");
            return;
        }
        try {
            await resetPassword(token, pw);
            alert("Lozinka uspješno promijenjena.");
            navigate("/login");
        } catch {
            setError("Pogreška pri resetiranju lozinke.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-full max-w-sm">
                <h2 className="text-xl mb-4">Reset lozinke</h2>
                {error && <p className="text-red-600 mb-2">{error}</p>}
                <input
                    type="password"
                    placeholder="Nova lozinka"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-3"
                />
                <input
                    type="password"
                    placeholder="Potvrdi lozinku"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white px-3 py-2 rounded"
                >
                    Postavi novu lozinku
                </button>
            </form>
        </div>
    );
}

export default ResetPasswordPage;
