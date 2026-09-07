import './Home.scss';
import {HeroSection} from "../../components/Home/Hero/Hero.jsx";
import {Services} from "../../components/Home/Services/Services.jsx";
import {Infrastructure} from "../../components/Home/Infrastructure/Infrastructure.jsx";
import {About} from "../../components/Home/About/About.jsx";
import {Areas} from "../../components/Home/Areas/Areas.jsx";
import {CTA} from "../../components/Home/CTA/CTA.jsx";
import {useScrollToTop} from "../../hooks/useScrollToTop.ts";

export function Home() {
    useScrollToTop();
    return (
        <div className="home-wrapper">
            <HeroSection/>
            <Services/>
            <About/>
            <Infrastructure/>
            <Areas/>
            <CTA/>
        </div>
    );
}