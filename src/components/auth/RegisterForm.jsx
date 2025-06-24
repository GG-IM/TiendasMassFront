import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AuthStyles.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RegisterForm({ switchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '¡Oops!',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          password: formData.password,
          direccion: formData.address || ""

        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ahora puedes iniciar sesión',
          confirmButtonText: 'OK'
        }).then(() => {
          switchToLogin(); // Redirige al login después de cerrar el alert
        });
      } else {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message || 'Error al registrarse',
      });
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al conectar con el servidor',
      });
    }
  };


  return (
    <div className="form-container">
      <h2 className="form-title">Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ingresa tu nombre"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="********"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-confirmPassword">Confirmar contraseña</label>
          <input
            id="register-confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="********"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Registrarse
        </button>

        <div className="form-footer">
          <p>
            ¿Ya tienes cuenta?
            <button
              type="button"
              onClick={switchToLogin}
              className="switch-form-button"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;