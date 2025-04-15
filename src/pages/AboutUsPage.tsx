import {Link} from "react-router-dom";
import React from "react";
import BackButton from "../components/BackButton";

function AboutUsPage() {
    return (
        <>
            <div className="flex items-center justify-center bg-gray-800 text-gray-300">
                <BackButton></BackButton>
                <div className="flex flex-col items-center p-10 rounded-lg shadow-2xl bg-gray-900 w-full max-w-4xl">

                    <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">O nama</h1>
                    <p>Dobro došli u OfferMaster, vašeg pouzdanog partnera za jednostavno i učinkovito kreiranje
                        poslovnih ponuda. Naša inovativna aplikacija, dostupna kao web platforma,
                        dizajnirana je kako bi olakšala proces izrade ponuda za različite vrste poduzeća.</p>

                    <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                    <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Naša misija</h1>
                    <p>Naša misija je pružiti vam alat koji vam omogućuje brzo i precizno sastavljanje profesionalnih
                        ponuda, štedeći vam vrijeme i resurse.
                        Bilo da ste električar, keramičar, vodoinstalater ili radite u nekoj drugoj industriji
                        građevine,
                        naša aplikacija prilagođava se vašim specifičnim potrebama.</p>

                    <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                    <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Ključne značajke</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Baza podataka stavki</h3>
                            <p>
                                Jednostavno dodajte, uređujte i brišite stavke u našoj intuitivnoj bazi podataka.
                                Najčešće korištene stavke uvijek su pri ruci kako biste brže sastavili ponudu.
                            </p>
                        </div>


                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Prilagodljive ponude</h3>
                            <p>
                                Izaberite stavke i količine te generirajte profesionalne
                                PDF ili Word dokumente spremne za preuzimanje i dijeljenje.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Upravljanje ponudama</h3>
                            <p>
                                Nakon izrade, možete modificirati ponude, pregledavati povijest
                                svih prethodnih ponuda i pratiti status svake od njih.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Filtar i pretraga</h3>
                            <p>
                                Filtrirajte stavke po cijeni, nazivu ili
                                učestalosti korištenja kako biste brzo pronašli ono što vam treba.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Slanje ponuda putem Emaila</h3>
                            <p>
                                Direktno iz aplikacije pošaljite ponude svojim klijentima uz personaliziranu poruku.
                                Klijenti mogu prihvatiti ili odbiti ponudu s navođenjem razloga, a vi ćete biti
                                obaviješteni o svakom odgovoru putem obavijesti.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Personalizacija</h3>
                            <p>
                                Učinite svoje ponude prepoznatljivima dodavanjem vlastitog loga
                                koji će se prikazivati u svakom dokumentu.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Default stavke po struci</h3>
                            <p>
                                Odaberite svoju struku na početku i naša aplikacija će vam ponuditi unaprijed
                                definirane stavke specifične za vašu djelatnost, bilo da ste električar, keramičar
                                ili vodoinstalater.
                            </p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">Link za kupnju materijala</h3>
                            <p>
                                Uključujemo direktne linkove na stranice gdje možete kupiti potrebne materijale,
                                olakšavajući vam nabavu svih potrebnih resursa.
                            </p>
                        </div>
                    </div>

                    <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                    <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Zašto odabrati nas</h1>
                    <p>U OfferMasteru, razumijemo izazove s kojima se suočavaju moderna poduzeća u izradi ponuda.
                        Naša aplikacija je razvijena s ciljem pružanja fleksibilnosti, efikasnosti i profesionalnosti,
                        omogućujući vam da se fokusirate na ono što najbolje radite – vođenje svog poslovanja.
                        Pridružite se brojnim zadovoljnim korisnicima koji već koriste naše rješenje za upravljanje
                        ponudama i
                        unaprijedite način na koji poslovno komunicirate sa svojim klijentima.</p>

                    <hr className="border-t-2 border-orange-500 w-1/2 mx-auto my-8"/>

                    <h1 className="text-2xl font-bold text-orange-500 mb-4 text-center">Kontaktirajte nas</h1>
                    <p>Imate pitanja ili trebate podršku?
                        Slobodno nas <Link to={"/contact-page"} className={"text-orange-500"}> kontaktirajte </Link>
                        i naš tim će vam rado pomoći.</p>
                </div>
            </div>
        </>
    )
}

export default AboutUsPage;
