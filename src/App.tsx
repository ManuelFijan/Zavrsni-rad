import './App.css';
import {Route, Routes} from "react-router-dom";
import Landing from "./components/Landing";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ProfilePage from "./pages/ProfilePage";
import {AuthProvider} from "./services/AuthContext";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path={"/"} element={<Landing/>}></Route>
                <Route path={"/sign-in"} element={<LoginPage/>}></Route>
                <Route path={"/register"} element={<RegisterPage/>}></Route>
                <Route path={"/homepage"} element={<HomePage/>}></Route>
                <Route path={"/about-us-page"} element={<AboutUsPage/>}></Route>
                <Route path={"/contact-page"} element={<ContactPage/>}></Route>
                <Route path={"/privacy-policy-page"} element={<PrivacyPolicyPage/>}></Route>
                <Route path={"/terms-of-service-page"} element={<TermsOfServicePage/>}></Route>
                <Route path={"/error"} element={<NotFoundPage></NotFoundPage>}></Route>
                <Route path={"/profile"} element={<ProfilePage/>}/>

                <Route path={"*"} element={<NotFoundPage/>}></Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;