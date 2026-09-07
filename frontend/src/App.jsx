import {Navigate, Route, Routes} from 'react-router-dom';
import {Navbar} from './components/Navbar/Navbar';
import {Home} from './pages/Home/Home';
import {Institutional} from './pages/Institutional/Institutional';
import {Footer} from './components/Footer/Footer';
import {Services} from "./pages/Services/Services.tsx";

export default function App() {
    return (
        <>
            <Navbar/>
            <main>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/institucional" element={<Institutional/>}/>
                    <Route path="/servicos" element={<Services/>}/>
                    <Route path="/contato" element={<div><h2>Contato</h2></div>}/>
                </Routes>
            </main>
            <Footer/>
        </>
    );
}
