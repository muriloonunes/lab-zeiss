import {Navigate, Route, Routes, Outlet} from 'react-router-dom';
import {Navbar} from './components/Navbar/Navbar';
import {Footer} from './components/Footer/Footer';
import {Home} from './pages/Home/Home';
import {Institutional} from './pages/Institutional/Institutional';
import {Contact} from "./pages/Contact/Contact.tsx";
import {Services} from "./pages/Services/Services.tsx";
import {ServiceDetail} from "./pages/ServiceDetail/ServiceDetail.tsx";
import {Login} from "./pages/Login/Login.tsx";

function PublicLayout() {
    return (
        <>
            <Navbar/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </>
    );
}

export default function App() {
    return (
        <Routes>
            <Route element={<PublicLayout/>}>
                <Route path="/" element={<Navigate to="/home" replace/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/institucional" element={<Institutional/>}/>
                <Route path="/servicos" element={<Services/>}/>
                <Route path="/servicos/:serviceId" element={<ServiceDetail/>}/>
                <Route path="/contato" element={<Contact/>}/>
            </Route>

            <Route path="/login" element={<Login/>}/>
        </Routes>
    );
}
