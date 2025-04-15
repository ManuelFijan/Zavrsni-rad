import BackButton from "../components/BackButton";
import React from "react";
import Footer from "../components/Footer";

function ContactPage() {
    return <div className="flex flex-col min-h-screen bg-gray-800 text-gray-300">
        <div className="flex-grow flex items-center justify-center p-4 relative">
            <BackButton/>


            <div className="flex flex-col items-center p-10 rounded-lg shadow-2xl bg-gray-900 w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">Kontaktirajte nas</h1>

                <div className="w-full mb-8">
                    <h2 className="text-2xl font-semibold text-orange-500 mb-4">Naše kontakt informacije</h2>
                    <div className="space-y-4">
                        <p><strong>Email:</strong> <a href="mailto:support@offermaster.hr"
                                                      className="text-orange-500 underline">support@offermaster.hr</a>
                        </p>
                        <p><strong>Telefon:</strong> +385 1 2345 678</p>
                        <p><strong>Adresa:</strong> Savska cesta 123, 10000 Zagreb, Hrvatska</p>
                    </div>
                </div>

                <div className="w-full">
                    <h2 className="text-2xl font-semibold text-orange-500 mb-4">Pošaljite nam poruku</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Ime i
                                Prezime</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="mt-1 block w-full p-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email
                                Adresa</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="mt-1 block w-full p-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Naslov
                                Poruke</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                required
                                className="mt-1 block w-full p-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Poruka</label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                className="mt-1 block w-full p-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            ></textarea>
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-orange-500 text-gray-900 font-semibold rounded-md hover:bg-orange-600 transition-colors duration-300"
                            >
                                Pošaljite Poruku
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
}

export default ContactPage;