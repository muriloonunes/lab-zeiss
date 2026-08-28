import './Home.scss';
import {HeroSection} from "../../components/Home/Hero/Hero.jsx";
import {Services} from "../../components/Home/Services/Services.jsx";
import {Infrastructure} from "../../components/Home/Infrastructure/Infrastructure.jsx";
import {About} from "../../components/Home/About/About.jsx";

export function Home() {
    return (
        <div className="home-wrapper">
            <HeroSection/>
            <Services/>
            <About/>
            <Infrastructure/>
        </div>
    );
}