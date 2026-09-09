import './Home.scss';
import {HeroSection} from "../../components/Home/Hero/Hero.jsx";
import {HomeServices} from "../../components/Home/Services/HomeServices.jsx";
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
            <HomeServices/>
            <About/>
            <Infrastructure/>
            <Areas/>
            <CTA/>
        </div>
    );
}