import './Home.scss';
import {HeroSection} from "../../components/Home/Hero/Hero.jsx";
import {Services} from "../../components/Home/Services/Services.jsx";

export function Home() {
    return (
        <div className="home-wrapper">
            <HeroSection/>
            <Services/>
        </div>
    );
}