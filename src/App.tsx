// Last deployment: 2026-02-16 12:44
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

import DatosCliente from './pages/booking/DatosCliente'
import Servicios from './pages/booking/Servicios'
import DatosVehiculo from './pages/booking/DatosVehiculo'
import Profesional from './pages/booking/Profesional'
import FechaHora from './pages/booking/FechaHora'
import Resumen from './pages/booking/Resumen'
import Confirmada from './pages/booking/Confirmada'
import ConsultarCita from './pages/ConsultarCita'
import MiPerfil from './pages/MiPerfil'
import ProximaCita from './pages/booking/ProximaCita'

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/booking/servicios" element={<Servicios />} />
                    <Route path="/booking/cliente" element={<DatosCliente />} />
                    <Route path="/booking/vehiculo" element={<DatosVehiculo />} />
                    <Route path="/booking/profesional" element={<Profesional />} />
                    <Route path="/booking/fecha-hora" element={<FechaHora />} />
                    <Route path="/booking/resumen" element={<Resumen />} />
                    <Route path="/booking/confirmada" element={<Confirmada />} />
                    <Route path="/proxima-cita" element={<ProximaCita />} />
                    <Route path="/consultar" element={<ConsultarCita />} />
                    <Route path="/mi-perfil" element={<MiPerfil />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
