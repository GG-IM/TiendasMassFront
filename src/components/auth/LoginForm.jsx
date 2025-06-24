// LoginForm.jsx - Versión mejorada con mejor manejo de errores
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuario } from '../../context/userContext';
import './AuthStyles.css';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LoginForm({ switchToRegister }) {
  const navigate = useNavigate();
  const { login } = useUsuario();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🚀 Iniciando login...');

      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📨 Respuesta del servidor:', {
        status: response.status,
        ok: response.ok,
        hasToken: !!data.token
      });

      if (response.ok && data.token) {
        console.log('✅ Datos válidos recibidos, procesando login...');

        try {
          // ✅ El contexto maneja automáticamente ambas estructuras
          await login(data, formData.remember);

          console.log('✅ Context actualizado exitosamente');

          // Mostrar mensaje de éxito
          await Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${data.nombre || data.usuario?.nombre || 'Usuario'}`,
            timer: 1500,
            showConfirmButton: false
          });

          const rol = typeof data.usuario?.rol === 'string'
            ? data.usuario.rol
            : data.usuario?.rol?.nombre || data.rol;


          if (rol === 'admin') {
            await Swal.fire({
              icon: 'info',
              title: 'Redirigiendo a panel de administrador',
              timer: 1200,
              showConfirmButton: false
            });
            navigate('/admin');
          } else {
            navigate('/');
          }

        } catch (contextError) {
          console.error('❌ Error en el contexto:', contextError);
          Swal.fire({
            icon: 'error',
            title: 'Error interno',
            text: 'Error al procesar los datos de usuario'
          });
        }

      } else {
        // Manejar errores del servidor
        const errorMessage = data.message || data.error || 'Credenciales inválidas';

        console.log('❌ Login falló:', {
          status: response.status,
          message: errorMessage
        });

        Swal.fire({
          icon: 'error',
          title: getErrorTitle(response.status),
          text: errorMessage
        });
      }

    } catch (error) {
      console.error('❌ Error de red:', error);

      let errorMessage = 'Error de conexión. Verifica tu internet.';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. ¿Está funcionando el backend?';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Función auxiliar para títulos de error más descriptivos
  const getErrorTitle = (status) => {
    switch (status) {
      case 400: return 'Datos inválidos';
      case 401: return 'Credenciales incorrectas';
      case 403: return 'Acceso denegado';
      case 404: return 'Usuario no encontrado';
      case 500: return 'Error del servidor';
      default: return 'Error de autenticación';
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Iniciar Sesión</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="ejemplo@correo.com"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="********"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <label htmlFor="remember">Recordarme</label>
          </div>
          <div className="forgot-password">
            <a href="#" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <div className="form-footer">
          <p>
            ¿No tienes cuenta?
            <button
              type="button"
              onClick={switchToRegister}
              className="switch-form-button"
              disabled={isLoading}
            >
              Regístrate
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;