import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import {register} from "../services/AuthService";

function RegisterPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [primaryBusinessArea, setPrimaryBusinessArea] = useState("Grubi radovi");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!firstName || !lastName || !email || !password || !primaryBusinessArea) {
            alert("Molimo vas da popunite sva polja.");
            return;
        }

        try {
            const response = await register(
                firstName,
                lastName,
                email,
                password,
                primaryBusinessArea
            );
            console.log("Registration success:", response);
            alert(response.message);

            navigate("/homepage");
        } catch (err: any) {
            alert(err);
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
                                    id="registerEmail"
                                    name="registerEmail"
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
                            <label htmlFor="registerPassword"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                Lozinka
                            </label>
                            <div className="mt-2">
                                <input
                                    id="registerPassword"
                                    name="registerPassword"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="primaryBusinessArea"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                Primarno područje poslovanja
                            </label>
                            <div className="mt-2">
                                <select
                                    id="primaryBusinessArea"
                                    name="primaryBusinessArea"
                                    required
                                    value={primaryBusinessArea}
                                    onChange={(e) => setPrimaryBusinessArea(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm sm:leading-6"
                                >
                                    <option>Grubi radovi</option>
                                    <option>Voda i plin</option>
                                    <option>Elektrika</option>
                                    <option>Keramika</option>
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