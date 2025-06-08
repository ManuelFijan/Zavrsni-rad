import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import {login, forgotPassword} from "../services/AuthService";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [statusMsg, setStatusMsg] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [forgotError,   setForgotError]   = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        if (!email || !password) {
            alert("Molimo vas da unesete email i lozinku.");
            return;
        }

        try {
            const {accessToken, user} = await login(email, password);
            console.log("JWT:", accessToken, "User:", user);
            navigate("/homepage");
        } catch (err: any) {
            if (err.response?.status === 401) {
                setErrorMessage("Email ili lozinka su pogrešni, pokušajte ponovno");
            } else {
                setErrorMessage(err.response?.data?.message || "Dogodila se greška. Pokušajte ponovno.");
            }
        }
    };

    const handleForgotSubmit = async () => {
        setForgotError("");
        if (!forgotEmail) {
            setForgotError("Unesite email.");
            return;
        }
        try {
            await forgotPassword(forgotEmail);
            setStatusMsg("Ako je email registriran, primit ćete upute.");
            setTimeout(() => {
                setShowModal(false);
                setStatusMsg("");
                setForgotEmail("");
            }, 3000);
        } catch (e: any) {
            setForgotError("Greška pri slanju emaila.");
        }
    };

    return (
        <>
            <BackButton/>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <Logo/>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Prijavite se u svoj račun
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                    {errorMessage && (
                        <div className="my-4 rounded bg-red-100 border border-red-300 text-red-700 px-4 py-2">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Lozinka
                                </label>
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        className="font-semibold text-orange-500 hover:text-orange-300"
                                        onClick={() => setShowModal(true)}
                                    >
                                        Zaboravljena lozinka?
                                    </button>

                                    {showModal && (
                                        <div
                                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                                <h3 className="text-lg font-medium mb-4">Zaboravljena lozinka</h3>
                                                <p className="mb-4">Unesite email za čiji račun želite resetirati lozinku:</p>

                                                {forgotError && (
                                                    <div className="my-2 rounded bg-red-100 border border-red-300 text-red-700 px-4 py-2">
                                                        {forgotError}
                                                    </div>
                                                )}

                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={forgotEmail}
                                                    onChange={e => setForgotEmail(e.target.value)}
                                                    className="w-full border rounded px-3 py-2 mb-4"
                                                />
                                                {statusMsg && <p className="text-green-600 mb-4">{statusMsg}</p>}
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        className="mr-2 px-4 py-2"
                                                        onClick={() => {
                                                            setShowModal(false);
                                                            setStatusMsg("");
                                                            setForgotError("");
                                                        }}
                                                    >
                                                        Otkaži
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="bg-orange-500 text-white px-4 py-2 rounded"
                                                        onClick={handleForgotSubmit}
                                                    >
                                                        Pošalji
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Prijava
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Nemate račun?{' '}
                        <Link
                            to="/register"
                            className="font-semibold leading-6 text-orange-500 hover:text-orange-300"
                        >
                            Registrirajte se
                        </Link>
                        {" "} i izgradite uspjeh s našim ponudama.
                    </p>
                </div>
            </div>
        </>
    );
}

export default LoginPage;
