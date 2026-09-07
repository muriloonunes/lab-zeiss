import './Institutional.scss';
import { Hero } from '../../components/Institutional/Hero/Hero';
import { Alliance } from '../../components/Institutional/Alliance/Alliance';
import { History } from '../../components/Institutional/History/History';
import { Leadership } from '../../components/Institutional/Leadership/Leadership';
import { Pillars } from '../../components/Institutional/Pillars/Pillars';
import { Team } from '../../components/Institutional/Team/Team';
import { CTA } from '../../components/Institutional/CTA/CTA';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export function Institutional() {
    useScrollToTop();

    return (
        <div className="institutional-page">
            <div className="inst-blob-container" aria-hidden="true">
                <div className="inst-blob inst-blob--hero"></div>
                <div className="inst-blob inst-blob--middle"></div>
                <div className="inst-blob inst-blob--bottom"></div>
            </div>
            <Hero />
            <Alliance />
            {/*<History />*/}
            <Leadership />
            <Pillars />
            <Team />
            <CTA />
        </div>
    );
}
