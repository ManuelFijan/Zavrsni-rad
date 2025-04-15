import BackButton from "../components/BackButton";
import React from "react";

function PrivacyPolicyPage() {
    return <div className="flex items-center justify-center bg-gray-800 text-gray-300">
        <BackButton></BackButton>
        <div className="flex flex-col items-center p-10 rounded-lg shadow-2xl bg-gray-900 w-full max-w-4xl">

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Izjava o privatnosti</h1>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">1. Uvod</h1>
            <p>Dobro došli u OfferMaster! Vaša privatnost nam je važna. Ova Izjava o privatnosti opisuje kako
                prikupljamo, koristimo, dijelimo i štitimo vaše podatke kada koristite našu aplikaciju dostupnu putem
                web platforme.</p>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">2. Prikupljanje Podataka</h1>
            <p>
                <h3 className="text-m font-bold text-orange-500 mb-4 text-center">2.1. Osobni Podaci</h3>
                Prikupljamo osobne podatke koje nam dobrovoljno dostavite prilikom registracije i korištenja naše
                aplikacije, uključujući:

                <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                    <li>Ime i prezime</li>
                    <li>Email adresa</li>
                    <li>Kontakt broj</li>
                    <li>Podaci o tvrtki (naziv, adresa, djelatnost)</li>
                </ul>
                <h3 className="text-m font-bold text-orange-500 mb-4 text-center">2.2. Tehnički Podaci</h3>
                Prikupljamo tehničke podatke o vašem uređaju i načinu korištenja aplikacije, uključujući:
                <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                    <li>IP adresa</li>
                    <li>Tip preglednika</li>
                    <li>Operativni sustav</li>
                    <li>Podaci o korištenju aplikacije (npr. vrijeme provedeno unutar aplikacije, često korištene značajke)</li>
                </ul>
            </p>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">3. Korištenje Podataka</h1>
            <p>
                Koristimo prikupljene podatke za:
                <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                    <li>Pružanje i održavanje naše usluge</li>
                    <li>Unapređenje korisničkog iskustva</li>
                    <li>Komunikaciju s vama u vezi s vašim računom ili uslugama</li>
                    <li>Analizu korištenja aplikacije i generiranje izvještaja</li>
                </ul>
            </p>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">4. Dijeljenje Podataka</h1>
            <p>
                Vaši podaci neće biti prodani trećim stranama. Međutim, možemo dijeliti vaše podatke u sljedećim
                slučajevima:
                <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                    <li>S pružateljima usluga koji nam pomažu u poslovanju (npr. hosting, email usluge)</li>
                    <li>Kada je to zakonski obavezno ili potrebno za zaštitu naših prava</li>
                    <li>U slučaju prodaje ili preuzimanja našeg poslovanja, vaši podaci mogu biti preneseni novom
                        vlasniku
                    </li>
                </ul>
            </p>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">5. Sigurnost Podataka</h1>
            <p>
                Implementirali smo odgovarajuće sigurnosne mjere kako bismo zaštitili vaše podatke od neovlaštenog
                pristupa, izmjene, otkrivanja ili uništenja. Ipak, nijedna metoda prijenosa podataka preko interneta ili
                elektroničkog skladištenja nije 100% sigurna, stoga ne možemo garantirati apsolutnu sigurnost.
            </p>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">6. Prava korisnika</h1>
            <p>
                Korisnici imaju pravo:
                <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                    <li>Pristupa vlastitim podacima koje čuvamo</li>
                    <li>Ispravka netočnih podataka</li>
                    <li>Brisanja podataka (uz određene ograničenja)</li>
                    <li>Ograničavanja obrade podataka</li>
                    <li>Prigovora na obradu podataka</li>
                </ul>
                Za ostvarivanje ovih prava, molimo vas da nas kontaktirate putem support@offermaster.hr.
            </p>
            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

            <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">7. Promjene Izjave o Privatnosti</h1>
            <p>Možemo povremeno ažurirati ovu Izjavu o Privatnosti. Sve promjene bit će objavljene na ovoj stranici, a
                vaša daljnja uporaba usluge nakon objave promjena znači da prihvaćate nove uvjete.
            </p>

            <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>
        </div>
    </div>
}

export default PrivacyPolicyPage;