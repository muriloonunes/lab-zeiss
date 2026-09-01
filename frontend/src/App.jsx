import {Navigate, Route, Routes} from 'react-router-dom';
import {Navbar} from './components/Navbar/Navbar';
import {Home} from './pages/Home/Home';
import {Footer} from './components/Footer/Footer';

export default function App() {
    return (
        <>
            <Navbar/>
            <main>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/institucional"
                           element={<div>
                               <h2>Institucional</h2></div>}/>
                    <Route path="/servicos"
                           element={<div><h2>Catálogo de Serviços</h2></div>}/>
                    <Route path="/contato" element={<div><h2>Contato</h2></div>}/>
                </Routes>
            </main>
            <Footer/>
        </>
    );
}
