import React from "react";
import {Link} from "react-router-dom";

function Footer() {
    return <>
        <div className="absolute bottom-4 text-gray-500 text-xs flex space-x-4">
            <Link to={"/about-us-page"}><button className="hover:text-gray-300">O nama</button></Link>
            <Link to={"/terms-of-service-page"}><button className="hover:text-gray-300">Uvjeti poslovanja</button></Link>
            <Link to={"privacy-policy-page"}><button className="hover:text-gray-300">Izjava o privatnosti</button></Link>
            <Link to={"/contact-page"}><button className="hover:text-gray-300">Kontakt</button></Link>
        </div>
    </>
}

export default Footer;