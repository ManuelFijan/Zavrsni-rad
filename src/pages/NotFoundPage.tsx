import {Link} from "react-router-dom";

function NotFoundPage() {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-gray-300 px-4">

        <h1 className="text-4xl font-bold mb-4">Greška</h1>
        <p className="text-lg mb-8 text-center">
            Nažalost, dogodila se greška. Molimo pokušajte ponovno ili se vratite na početnu stranicu.
        </p>

        <Link to="/">
            <button
                className="px-6 py-3 bg-orange-500 text-gray-900 font-semibold rounded-md hover:bg-orange-600 transition-colors duration-300">
                Povratak na početnu stranicu
            </button>
        </Link>
    </div>
}

export default NotFoundPage;