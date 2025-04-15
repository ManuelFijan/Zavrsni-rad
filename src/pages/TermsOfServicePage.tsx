import BackButton from "../components/BackButton";
import React from "react";

function TermsOfServicePage() {
    return <>
        <div className="flex items-center justify-center bg-gray-800 text-gray-300">
            <BackButton></BackButton>
            <div className="flex flex-col items-center p-10 rounded-lg shadow-2xl bg-gray-900 w-full max-w-4xl">

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Uvjeti poslovanja</h1>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">1. Prihvaćanje Uvjeta</h1>
                <p>Dobro došli u OfferMaster! Korištenjem naše aplikacije, bilo putem web platforme, desktop aplikacije
                    ili mobilne aplikacije za Android, slažete se s ovim Uvjetima poslovanja ("Uvjeti"). Molimo vas da
                    pažljivo pročitate ove Uvjete prije nego što počnete koristiti našu uslugu. Ako se ne slažete s ovim
                    Uvjetima, molimo vas da ne koristite našu aplikaciju.</p>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">2. Opis Usluge</h1>
                <p>
                    OfferMaster je aplikacija koja omogućuje poduzećima jednostavno i učinkovito kreiranje poslovnih
                    ponuda. Naša usluga uključuje:

                    <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                        <li>Bazu podataka za dodavanje, uređivanje i brisanje stavki.</li>
                        <li>Generiranje profesionalnih PDF ili Word dokumenata za ponude.</li>
                        <li>Modifikaciju postojećih ponuda.</li>
                        <li>Pregled povijesti svih prethodnih ponuda.</li>
                        <li>Filtriranje stavki po cijeni, nazivu ili učestalosti korištenja.</li>
                        <li>Slanje ponuda putem emaila s mogućnošću prihvaćanja ili odbijanja od strane klijenata.</li>
                        <li>Notifikacije o statusu ponuda.</li>
                        <li>Default stavke specifične za različite struke (električari, keramičari, vodoinstalateri,
                            itd.).
                        </li>
                        <li>Mogućnost uploadanja vlastitog loga.</li>
                        <li>Linkove na stranice za kupnju materijala.</li>
                    </ul>
                </p>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">3. Registracija i Korisnički
                    Račun</h1>
                <p>
                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center">3.1. Kreiranje Računa</h3>
                    Da biste koristili naše usluge, potrebno je kreirati korisnički račun. Pri kreiranju računa, dužni
                    ste pružiti točne i potpune informacije te ih ažurirati u slučaju promjena.

                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center">3.2. Sigurnost Računa</h3>
                    Odgovorni ste za čuvanje lozinke i drugih informacija koje omogućuju pristup vašem računu. Obavezni
                    ste odmah nas obavijestiti o bilo kojem neovlaštenom korištenju vašeg računa.
                </p>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">4. Korištenje Usluge</h1>
                <p>
                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center">4.1. Prava i Ograničenja</h3>
                        Korisnicima je dozvoljeno koristiti aplikaciju samo u skladu s ovim Uvjetima. Zabranjeno je:
                    <ul className="list-disc list-inside space-y-2 pl-4 text-gray-300">
                        <li> Reprodukcija, distribucija ili stvaranje izvedenih djela naše aplikacije bez dopuštenja.
                        </li>
                        <li>Korištenje aplikacije za bilo kakve nezakonite svrhe.</li>
                        <li>Pokušaj neovlaštenog pristupa našim sustavima ili podacima drugih korisnika.</li>
                    </ul>
                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center">4.2. Promjene Usluge</h3>
                    OfferMaster zadržava pravo da u bilo kojem trenutku izmijeni ili obustavi dio ili cijelu uslugu
                    bez prethodne najave.
                </p>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">5. Plaćanje i Pretplate</h1>
                <p>
                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center">5.1. Cijene</h3>
                    Sve cijene usluga bit će jasno prikazane na našoj web platformi ili unutar aplikacije. Cijene se
                    mogu mijenjati bez prethodne najave.

                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center"> 5.2. Otkazivanje Pretplate</h3>
                    Korisnici mogu otkazati svoje pretplate u bilo kojem trenutku putem korisničkog računa. Nakon
                    otkazivanja, korisnik će imati pristup uslugama do kraja trenutnog razdoblja pretplate.

                    <h3 className="text-m font-bold text-orange-500 mb-4 text-center"> 5.3. Povrat Sredstava</h3>
                    Politika povrata sredstava bit će jasno definirana u slučaju tehničkih problema ili nezadovoljstva
                    uslugom.
                </p>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">6. Intelektualno Vlasništvo</h1>
                <p>
                    Sva prava na intelektualno vlasništvo vezana uz aplikaciju OfferMaster, uključujući ali ne
                    ograničavajući se na softver, dizajn, logotipove i sadržaj, pripadaju OfferMasteru ili njegovim
                    davateljima licenca.
                </p>
                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">7. Ograničenje Odgovornosti</h1>
                <p>OfferMaster neće biti odgovoran za bilo kakvu izravnu, neizravnu, slučajnu, posebnu ili posljedičnu
                    štetu koja proizlazi iz korištenja ili nemogućnosti korištenja naše aplikacije. Naša usluga pruža se
                    "kakva jest" i "dostupna je" bez ikakvih jamstava, bilo eksplicitnih ili implicitnih.
                </p>

                <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>
            </div>
        </div>
    </>
}

export default TermsOfServicePage;