import {Link} from "react-router-dom";

interface BackButtonProps {
    to?: string;
}

const BackButton: React.FC<BackButtonProps> = ({to = "/"}) => {
    return <>
        <div className="m-3">
            <Link to={to}>
                <button type="button"
                        className="text-white fixed top-4 left-4 bg-orange-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-orange-500 dark:hover:bg-orange-300 dark:focus:ring-orange-800">
                    <svg className="w-4 h-4 transform rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                    <span className="sr-only">Nazad</span>
                </button>
            </Link>
        </div>
    </>
}

export default BackButton;