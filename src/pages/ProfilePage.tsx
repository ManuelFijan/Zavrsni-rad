import React, {useEffect, useState} from "react";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import {getUserProfile, updateUserProfile, UserDto} from "../services/UserService";

function ProfilePage() {
    const [formData, setFormData] = useState<UserDto | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        getUserProfile()
            .then((user) => setFormData(user))
            .catch((err) => console.error("Failed to load profile", err));
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        if (!formData) return;
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const updated = await updateUserProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                primaryAreaOfWork: formData.primaryAreaOfWork,
            });
            setFormData(updated);
            setSuccessMessage("Podaci su uspješno ažurirani.");
        } catch (err: any) {
            const status = err.response?.status || err.status;
            if (status === 409) {
                setErrorMessage(
                    "Ovaj email se već koristi. Molimo odaberite drugi."
                );
            } else {
                setErrorMessage(
                    "Došlo je do greške prilikom ažuriranja. Pokušajte ponovno."
                );
            }
            console.error(err);
        }
    };

    return (
        <>
            <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-800 ">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <Logo/>
                    <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-orange-500">
                        Moj profil
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl">
                    <div className="bg-white shadow-md rounded-lg p-8">
                        <BackButton to="/homepage"/>

                        {errorMessage && (
                            <div
                                className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700"
                                role="alert"
                            >
                                <strong className="font-semibold">Greška: </strong>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div
                                className="rounded border border-green-300 bg-green-50 px-4 py-3 text-green-700"
                                role="status"
                            >
                                <strong className="font-semibold">Uspjeh: </strong>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="flex flex-col items-center">

                            </div>

                            <div>
                                <label htmlFor="firstName"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Ime
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData?.firstName ?? ""}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm"
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
                                        value={formData?.lastName ?? ""}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm"
                                    />
                                </div>
                            </div>

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
                                        value={formData?.email ?? ""}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-300 sm:text-sm"
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
                                        id="primaryAreaOfWork"
                                        name="primaryAreaOfWork"
                                        required
                                        value={formData?.primaryAreaOfWork ?? ""}
                                        onChange={handleChange}
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
                                    className="flex w-full justify-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                >
                                    Ažuriraj profil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;