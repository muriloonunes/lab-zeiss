import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { InternalLayout } from './components/InternalLayout/InternalLayout';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { Home } from './pages/Home/Home';
import { Institutional } from './pages/Institutional/Institutional';
import { Contact } from './pages/Contact/Contact';
import { Services } from './pages/Services/Services';
import { ServiceDetail } from './pages/ServiceDetail/ServiceDetail';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Internal/Dashboard/Dashboard';
import { Perfil } from './pages/Internal/Perfil/Perfil';
import { Usuarios } from './pages/Internal/Usuarios/Usuarios';
import { Vocabulario } from './pages/Internal/Vocabulario/Vocabulario';
import { Solicitacoes } from './pages/Internal/Solicitacoes/Solicitacoes';
import { Servicos } from './pages/Internal/Servicos/Servicos';
import { Licoes } from './pages/Internal/Licoes/Licoes';
import { Configuracoes } from './pages/Internal/Configuracoes/Configuracoes';

function PublicLayout() {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/institucional" element={<Institutional />} />
                    <Route path="/servicos" element={<Services />} />
                    <Route path="/servicos/:serviceId" element={<ServiceDetail />} />
                    <Route path="/contato" element={<Contact />} />
                </Route>

                {/* Rota de Login */}
                <Route path="/login" element={<Login />} />

                {/* Rotas Protegidas da Área Interna */}
                <Route
                    path="/interno"
                    element={
                        <ProtectedRoute>
                            <ToastProvider>
                                <InternalLayout />
                            </ToastProvider>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="servicos" element={<Servicos />} />
                    <Route path="licoes" element={<Licoes />} />
                    <Route path="solicitacoes" element={<Solicitacoes />} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="vocabulario" element={<Vocabulario />} />
                    <Route
                        path="usuarios"
                        element={
                            <ProtectedRoute roles={['ADMINISTRADOR']}>
                                <Usuarios />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="configuracoes"
                        element={
                            <ProtectedRoute roles={['ADMINISTRADOR']}>
                                <Configuracoes />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/interno" replace />} />
                </Route>

                {/* Fallback Geral */}
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </AuthProvider>
    );
}
