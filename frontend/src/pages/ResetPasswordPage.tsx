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
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!regex.test(pw)) {
            setError(
                "Lozinka mora imati najmanje 8 znakova, jedno veliko slovo i jednu brojku."
            );
            return;
        }

        if (pw !== confirm) {
            setError("Lozinke se ne podudaraju.");
            return;
        }
        try {
            await resetPassword(token, pw);
            setSuccess("Lozinka uspješno promijenjena.");
            setTimeout(() => navigate("/sign-in"), 2000);
        } catch {
            setError("Greška pri slanju zahtjeva za reset lozinke.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-full max-w-sm">
                <h2 className="text-xl mb-4">Reset lozinke</h2>

                {error && <p className="text-red-600 mb-2">{error}</p>}
                {success && <p className="text-green-600 mb-2">{success}</p>}

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
