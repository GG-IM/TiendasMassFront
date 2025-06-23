import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLogin from '../admin/components/AdminLogin';
import SetupAdmin from '../admin/components/SetupAdmin';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Verificar estado del sistema al cargar
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/setup/status');
      const data = await response.json();
      
      setNeedsSetup(data.needsSetup);
      setCheckingSetup(false);
    } catch (error) {
      console.error('Error al verificar estado del sistema:', error);
      setCheckingSetup(false);
      setNeedsSetup(false); // Asumir que no necesita setup si hay error
    }
  };

  // Si está verificando el setup, mostrar loading
  if (checkingSetup) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Verificando sistema...</p>
        </div>
      </div>
    );
  }

  // Si necesita setup, mostrar componente de setup
  if (needsSetup) {
    return <SetupAdmin />;
  }

  // Si no hay token de admin, redirigir al login
  if (!adminToken || !adminUser) {
    return <AdminLogin />;
  }

  try {
    // Verificar que el usuario sea administrador
    const userData = JSON.parse(adminUser);
    const rolNombre = userData.rol?.nombre?.toLowerCase();
    
    if (!rolNombre || (!rolNombre.includes('admin') && !rolNombre.includes('administrador'))) {
      // Si no es admin, limpiar datos y redirigir al login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return <AdminLogin />;
    }

    // Si es admin, mostrar el contenido protegido
    return children;
  } catch (error) {
    console.error('Error al verificar datos de admin:', error);
    // Si hay error al parsear, limpiar datos y redirigir al login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return <AdminLogin />;
  }
};

export default AdminRoute; 