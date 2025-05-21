import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import {register} from "../services/AuthService";

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function RegisterPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [primaryAreaOfWork, setPrimaryAreaOfWork] = useState("GRUBI_RADOVI");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null)

        if (!PASSWORD_PATTERN.test(password)) {
            setErrorMessage(
                "Lozinka mora imati najmanje 8 znakova, uključujući jedno veliko slovo i jednu brojku."
            );
            return;
        }

        if (!firstName || !lastName || !email || !password || !primaryAreaOfWork) {
            alert("Molimo vas da popunite sva polja.");
            return;
        }

        try {
            const {accessToken, user} = await register(
                firstName, lastName, email, password, primaryAreaOfWork
            );
            console.log("Registration success:", accessToken, user);

            navigate("/homepage");
        } catch (err: any) {
            if (err.response?.status === 409) {
                setErrorMessage(
                    "Ovaj email je već registriran. Ako već imate račun, prijavite se ili upotrijebite drugi email."
                );
            } else {
                setErrorMessage(
                    err.response?.data?.message ||
                    err.message ||
                    "Dogodila se pogreška pri registraciji. Pokušajte ponovno."
                );
            }
        }
    };

    return (
        <>
            <BackButton/>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <Logo/>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Registrirajte se i poboljšajte svoje poslovanje već danas
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                    {errorMessage && (
                        <div
                            className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700"
                            role="alert"
                        >
                            <strong className="font-semibold">Greška: </strong>
                            <span className="block sm:inline">{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">
                                Ime
                            </label>
                            <div className="mt-2">
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                                Prezime
                            </label>
                            <div className="mt-2">
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="registerEmail"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
                                        ring-1 ring-inset ${errorMessage?.toLowerCase().includes("email")
                                        ? "ring-red-500 focus:ring-red-500"
                                        : "ring-gray-300 focus:ring-orange-300"}
                                        placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="registerPassword"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                Lozinka
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                                        errorMessage?.toLowerCase().includes("lozinka")
                                            ? "ring-red-500 focus:ring-red-500"
                                            : "ring-gray-300 focus:ring-orange-300"
                                    } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="primaryAreaOfWork"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                Primarno područje poslovanja
                            </label>
                            <div className="mt-2">
                                <select
                                    id="primaryAreaOfWork"
                                    name="primaryAreaOfWork"
                                    required
                                    value={primaryAreaOfWork}
                                    onChange={(e) => setPrimaryAreaOfWork(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                >
                                    <option value="GRUBI_RADOVI">Grubi radovi</option>
                                    <option value="VODA_I_PLIN">Voda i plin</option>
                                    <option value="ELEKTRIKA">Elektrika</option>
                                    <option value="KERAMIKA">Keramika</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Registracija
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Već imate račun?{' '}
                        <Link
                            to="/sign-in"
                            className="font-semibold leading-6 text-orange-500 hover:text-orange-300"
                        >
                            Prijavite se
                        </Link>
                        {" "} i nastavite s korištenjem naših usluga.
                    </p>
                </div>
            </div>
        </>
    )
}

export default RegisterPage;