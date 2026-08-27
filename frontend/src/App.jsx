import {Navigate, Route, Routes} from 'react-router-dom';
import {Navbar} from './components/Navbar/Navbar';
import {Home} from './pages/Home/Home';

export default function App() {
    return (
        <>
            <Navbar/>
            <main>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/home" element={<Navigate to="/" replace/>}/>
                    <Route path="/institucional"
                           element={<div style={{padding: '8rem 2rem 4rem'}}><h2>Institucional</h2></div>}/>
                    <Route path="/servicos"
                           element={<div style={{padding: '8rem 2rem 4rem'}}><h2>Catálogo de Serviços</h2></div>}/>
                    <Route path="/contato" element={<div style={{padding: '8rem 2rem 4rem'}}><h2>Contato</h2></div>}/>
                </Routes>
            </main>
        </>
    );
}
