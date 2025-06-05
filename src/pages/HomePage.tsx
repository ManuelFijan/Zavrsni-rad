import React, {useEffect, useState} from 'react';
import {Disclosure, Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import {Bars3Icon, BellIcon, XMarkIcon} from '@heroicons/react/24/outline';
import CalendarPage from '../components/Calendar';
import ProductsPage from "./ProductsPage";
import {Link, useNavigate} from 'react-router-dom';
import QuotesPage from "./QuotesPage";
import {clearToken, getToken} from "../services/AuthSession";

const user = {
    name: 'Ivo Ivić',
    email: 'ivo@gmail.com',
    imageUrl: '/images/worker.jpg',
};

const navigation = [
    {name: 'Ponude', href: '#', current: false},
    {name: 'Kalendar', href: '#', current: false},
    {name: 'Baza proizvoda', href: '#', current: false},
];

const userNavigation = [
    {name: 'Vaš profil', href: '/profile'},
    {name: 'Odjava', href: '/'},
];

function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(' ');
}

function HomePage() {
    const [currentNav, setCurrentNav] = useState<string>('Ponude');
    const navigate = useNavigate();

    const handleSignOut = () => {
        clearToken();
        navigate("/");
    };

    const handleNavClick = (navName: string) => {
        setCurrentNav(navName);
    };
    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="min-h-full flex flex-col">
            {/* navigation */}
            <Disclosure as="nav" className="bg-gray-800">
                {({open}) => (
                    <>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                {/* left: logo + nav */}
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <img
                                            alt="Offer Master"
                                            src="/images/logo1.png"
                                            className="h-8 w-8"
                                        />
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="ml-10 flex items-baseline space-x-4">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    aria-current={currentNav === item.name ? 'page' : undefined}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleNavClick(item.name);
                                                    }}
                                                    className={classNames(
                                                        currentNav === item.name
                                                            ? 'bg-gray-900 text-white'
                                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                        'rounded-md px-3 py-2 text-sm font-medium'
                                                    )}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* right: user menu */}
                                <div className="hidden md:block">
                                    <div className="ml-4 flex items-center md:ml-6">
                                        <Menu as="div" className="relative ml-3">
                                            <div>
                                                <MenuButton
                                                    className="relative flex max-w-xs items-center rounded-full
                                     bg-gray-800 text-sm focus:outline-none
                                     focus:ring-2 focus:ring-white
                                     focus:ring-offset-2 focus:ring-offset-gray-800"
                                                >
                                                    <span className="sr-only">Open user menu</span>
                                                    <img
                                                        className="h-8 w-8 rounded-full"
                                                        src={user.imageUrl}
                                                        alt=""
                                                    />
                                                </MenuButton>
                                            </div>
                                            <MenuItems
                                                className="absolute right-0 z-10 mt-2 w-48
                                   origin-top-right rounded-md bg-white py-1
                                   shadow-lg ring-1 ring-black ring-opacity-5
                                   focus:outline-none"
                                            >
                                                {userNavigation.map((item) => (
                                                    <MenuItem key={item.name}>
                                                        {({active}) => {
                                                            if (item.name === "Odjava") {
                                                                return (
                                                                    <button
                                                                        className={classNames(
                                                                            active ? 'bg-gray-100' : '',
                                                                            'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                                                        )}
                                                                        onClick={handleSignOut}
                                                                    >
                                                                        {item.name}
                                                                    </button>
                                                                );
                                                            }
                                                            return (
                                                                <Link
                                                                    to={item.href}
                                                                    className={classNames(
                                                                        active ? 'bg-gray-100' : '',
                                                                        'block px-4 py-2 text-sm text-gray-700'
                                                                    )}
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            );
                                                        }}
                                                    </MenuItem>
                                                ))}
                                            </MenuItems>
                                        </Menu>
                                    </div>
                                </div>

                                {/* mobile menu */}
                                <div className="-mr-2 flex md:hidden">
                                    <Disclosure.Button
                                        className="inline-flex items-center justify-center rounded-md
                               bg-gray-800 p-2 text-gray-400 hover:bg-gray-700
                               hover:text-white focus:outline-none focus:ring-2
                               focus:ring-white focus:ring-offset-2
                               focus:ring-offset-gray-800"
                                    >
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                        )}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="md:hidden">
                            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                                {navigation.map((item) => (
                                    <Disclosure.Button
                                        key={item.name}
                                        as={Link}
                                        to={item.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(item.name);
                                        }}
                                        aria-current={currentNav === item.name ? 'page' : undefined}
                                        className={classNames(
                                            currentNav === item.name
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'block rounded-md px-3 py-2 text-base font-medium'
                                        )}
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ))}
                            </div>
                            <div className="border-t border-gray-700 pb-3 pt-4">
                                <div className="flex items-center px-5">
                                    <div className="shrink-0">
                                        <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt=""/>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-white">{user.name}</div>
                                        <div className="text-sm font-medium text-gray-400">{user.email}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="ml-auto flex-shrink-0 rounded-full
                               bg-gray-800 p-1 text-gray-400 hover:text-white
                               focus:outline-none focus:ring-2 focus:ring-white
                               focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        <span className="sr-only">View notifications</span>
                                        <BellIcon className="h-6 w-6" aria-hidden="true"/>
                                    </button>
                                </div>
                                <div className="mt-3 space-y-1 px-2">
                                    {userNavigation.map((item) => (
                                        <Disclosure.Button
                                            key={item.name}
                                            as={Link}
                                            to={item.href}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavClick(item.name);
                                            }}
                                            className="block rounded-md px-3 py-2 text-base font-medium
                                 text-gray-400 hover:bg-gray-700 hover:text-white"
                                        >
                                            {item.name}
                                        </Disclosure.Button>
                                    ))}
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {currentNav === 'Kalendar' && <CalendarPage/>}
                    {currentNav === 'Baza proizvoda' && <ProductsPage/>}
                    {currentNav === 'Ponude' && <QuotesPage/>}
                </div>
            </main>
        </div>
    );
}

export default HomePage;
