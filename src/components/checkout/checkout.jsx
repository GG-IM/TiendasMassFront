import React, { useState, useEffect } from 'react';
import { FaTruck, FaCreditCard, FaCheck, FaShieldAlt, FaLock } from "react-icons/fa";
import { IoReloadCircle } from "react-icons/io5";
import { MapPin, User, Mail, Phone, Truck, Store, Plus, CreditCard } from 'lucide-react';
import { useCarrito } from '../../context/carContext';
import { useUsuario } from '../../context/userContext';
import './checkout.css';


const API_URL = "https://tienditamassback-gqaqcfaqg0b7abcj.canadacentral-01.azurewebsites.net";
// Función auxiliar para determinar el estado del pago (movida fuera del componente)
function determinePaymentStatus(result, paymentMethod, metodosPago = []) {
  console.log('🔍 Determinando estado de pago:', { result, paymentMethod, metodosPago });

  // 1. Si el backend ya especifica el estado, usarlo
  if (result.estadoPago) {
    console.log('✅ Estado del servidor:', result.estadoPago);
    return result.estadoPago;
  }

  // 2. Si hay información explícita de pago exitoso
  if (result.pagoExitoso === true) {
    console.log('✅ Pago marcado como exitoso');
    return 'COMPLETADO';
  }

  if (result.pagoExitoso === false) {
    console.log('❌ Pago marcado como fallido');
    return 'FALLIDO';
  }

  // 3. Si hay ID de transacción, probablemente fue exitoso
  if (result.transaccionId || result.paymentId || result.numeroTransaccion) {
    console.log('✅ Transacción con ID:', result.transaccionId || result.paymentId);
    return 'COMPLETADO';
  }

  // 4. Determinar por tipo de método de pago
  if (Array.isArray(metodosPago) && metodosPago.length > 0) {
    const metodoSeleccionado = metodosPago.find(m => m.id.toString() === paymentMethod);

    if (metodoSeleccionado) {
      console.log('💳 Método seleccionado:', metodoSeleccionado);

      // Métodos que requieren verificación manual
      if (['transferencia', 'deposito', 'efectivo'].includes(metodoSeleccionado.tipo)) {
        console.log('⏳ Método requiere verificación manual');
        return 'PENDIENTE_VERIFICACION';
      }

      // Métodos digitales instantáneos
      if (['tarjeta', 'paypal', 'yape', 'plin'].includes(metodoSeleccionado.tipo)) {
        console.log('✅ Método digital - asumiendo exitoso');
        return 'COMPLETADO';
      }

      // Si el nombre contiene indicadores de método instantáneo
      const nombreMetodo = metodoSeleccionado.nombre.toLowerCase();
      if (nombreMetodo.includes('tarjeta') || nombreMetodo.includes('paypal') ||
        nombreMetodo.includes('yape') || nombreMetodo.includes('plin')) {
        console.log('✅ Método instantáneo por nombre - asumiendo exitoso');
        return 'COMPLETADO';
      }
    }
  }

  // 5. Si el pedido se creó exitosamente, asumir pago completado
  if (result.pedidoId || result.id) {
    console.log('✅ Pedido creado exitosamente - asumiendo pago completado');
    return 'COMPLETADO';
  }

  // 6. Por defecto, pendiente solo si no hay información
  console.log('⚠️ Sin información suficiente - estado pendiente');
  return 'PENDIENTE';
}

export default function Checkout({ activeStep, setActiveStep, formData, setFormData, onChange }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [error, setError] = useState('');
  const [metodosPago, setMetodosPago] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [useGenericMethod, setUseGenericMethod] = useState(true);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // CORREGIDO: Usar las funciones correctas del contexto
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    quitarProducto,
    total: carritoTotal,
    vaciarCarrito
  } = useCarrito();

  // Solo para precargar datos al iniciar
  const { usuario, getAuthHeaders } = useUsuario();

  // Cargar métodos de pago disponibles
  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        const response = await fetch(`${API_URL}/api/metodos-pago`);
        if (response.ok) {
          const metodos = await response.json();
          setMetodosPago(metodos);
          // Establecer el primer método como predeterminado si existe
          if (metodos.length > 0 && !paymentMethod) {
            setPaymentMethod(metodos[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
      }
    };

    cargarMetodosPago();
  }, []);

  // Cargar tarjetas del usuario
  useEffect(() => {
    const cargarTarjetasUsuario = async () => {
      if (!usuario?.id) return;
      try {
        const response = await fetch(`${API_URL}/api/tarjetas-usuario/usuario/${usuario.id}`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const tarjetas = await response.json();
          setUserCards(tarjetas);
        }
      } catch (error) {
        console.error('Error al cargar tarjetas del usuario:', error);
      }
    };

    cargarTarjetasUsuario();
  }, [usuario?.id]);

  // Cargar direcciones del usuario
  useEffect(() => {
    const cargarDirecciones = async () => {
      if (!usuario?.id) return;
      try {
        const response = await fetch(`${API_URL}/api/direcciones/usuario/${usuario.id}`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const direcciones = await response.json();
          setUserAddresses(direcciones);
          // Seleccionar la dirección principal por defecto
          const direccionPrincipal = direcciones.find(d => d.esPrincipal);
          if (direccionPrincipal) {
            setSelectedAddressId(direccionPrincipal.id.toString());
            // Prellenar el formulario con la dirección principal
            onChange('address', direccionPrincipal.calle);
            onChange('city', direccionPrincipal.ciudad);
            onChange('zipCode', direccionPrincipal.codigoPostal);
          }
        }
      } catch (error) {
        console.error('Error al cargar direcciones:', error);
      }
    };

    cargarDirecciones();
  }, [usuario?.id]);

  useEffect(() => {
    if (usuario) {
      if (!formData.fullName) onChange('fullName', usuario.nombre || '');
      if (!formData.email) onChange('email', usuario.email || '');
      if (!formData.phone) onChange('phone', usuario.telefono || '');
      // Ya no precargamos dirección simple, usamos el sistema de direcciones múltiples
    }
  }, [usuario]);

  // Manejar cambio de dirección seleccionada
  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    setUseCustomAddress(false);
    
    if (addressId === 'custom') {
      setUseCustomAddress(true);
      // Limpiar campos de dirección
      onChange('address', '');
      onChange('city', '');
      onChange('zipCode', '');
    } else {
      const selectedAddress = userAddresses.find(addr => addr.id.toString() === addressId);
      if (selectedAddress) {
        onChange('address', selectedAddress.calle);
        onChange('city', selectedAddress.ciudad);
        onChange('zipCode', selectedAddress.codigoPostal);
      }
    }
  };

  // Manejar cambio de método de pago
  const handlePaymentMethodChange = (methodType, methodId) => {
    if (methodType === 'generic') {
      setUseGenericMethod(true);
      setSelectedCardId('');
      setPaymentMethod(methodId);
    } else if (methodType === 'userCard') {
      setUseGenericMethod(false);
      setSelectedCardId(methodId);
      setPaymentMethod('userCard');
    }
  };

  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });

  // Función auxiliar para convertir precio a número
  const parsePrice = (precio) => {
    if (typeof precio === 'number') return precio;
    if (typeof precio === 'string') return parseFloat(precio) || 0;
    return 0;
  };

  // Totales - usando el total del contexto
  const subtotal = carritoTotal;
  const shippingCost = formData.deliveryType === 'pickup' ? 0 : 9.99;
  const taxes = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shippingCost + taxes).toFixed(2);

  // Función para crear el pedido
  const crearPedido = async () => {
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!carrito || carrito.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error('Faltan datos requeridos del usuario');
      }

      // Validar método de pago
      if (!paymentMethod) {
        throw new Error('Debes seleccionar un método de pago');
      }

      // 1. Obtener precios actualizados del backend
      const productIds = carrito.map(item => parseInt(item.id));
      const productosActualizadosResp = await fetch(`${API_URL}/api/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: productIds })
      });
      if (!productosActualizadosResp.ok) {
        throw new Error('No se pudieron obtener los precios actualizados de los productos');
      }
      const productosActualizados = await productosActualizadosResp.json();
      // Mapear por id para acceso rápido
      const productosMap = {};
      productosActualizados.forEach(p => { productosMap[p.id] = p; });

      // 2. Actualizar carrito temporalmente con los precios actuales
      const carritoActualizado = carrito.map(item => {
        const prod = productosMap[item.id];
        return prod ? { ...item, precio: prod.precio } : item;
      });

      // 3. Calcular subtotal, impuestos y total con precios actualizados
      const subtotal = carritoActualizado.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
      const shippingCost = formData.deliveryType === 'pickup' ? 0 : 9.99;
      const taxes = +(subtotal * 0.08).toFixed(2);
      const total = +(subtotal + shippingCost + taxes).toFixed(2);

      // Determinar el método de pago a enviar
      let metodoPagoId = null;
      if (paymentMethod === 'userCard') {
        if (!selectedCardId) {
          throw new Error('Debes seleccionar una tarjeta');
        }
        const metodoTarjeta = metodosPago.find(m => 
          m.tipo === 'tarjeta' || 
          m.nombre?.toLowerCase().includes('tarjeta') ||
          m.nombre?.toLowerCase().includes('visa') ||
          m.nombre?.toLowerCase().includes('mastercard') ||
          m.nombre?.toLowerCase().includes('american express')
        );
        if (metodoTarjeta) {
          metodoPagoId = metodoTarjeta.id;
        } else {
          if (metodosPago.length > 0) {
            metodoPagoId = metodosPago[0].id;
            console.warn('No se encontró método específico de tarjeta, usando:', metodosPago[0].nombre);
          } else {
            throw new Error('No hay métodos de pago disponibles');
          }
        }
      } else {
        metodoPagoId = parseInt(paymentMethod);
      }

      // Construir dirección de envío
      let direccionEnvio = '';
      if (formData.deliveryType === 'delivery') {
        if (useCustomAddress) {
          direccionEnvio = `${formData.address}, ${formData.city} ${formData.zipCode}`;
        } else if (selectedAddressId && selectedAddressId !== 'custom') {
          const selectedAddress = userAddresses.find(addr => addr.id.toString() === selectedAddressId);
          if (selectedAddress) {
            direccionEnvio = `${selectedAddress.calle}, ${selectedAddress.ciudad} ${selectedAddress.codigoPostal}`;
            if (selectedAddress.referencia) {
              direccionEnvio += ` (${selectedAddress.referencia})`;
            }
          }
        }
      } else {
        direccionEnvio = formData.selectedStore;
      }

      // ESTRUCTURA ADAPTADA AL BACKEND
      const pedidoData = {
        usuarioId: usuario?.id || null,
        direccionEnvio: direccionEnvio,
        metodoPagoId: metodoPagoId,
        montoTotal: total, // este total ya tiene impuestos y envío
        detalles: carritoActualizado.map(item => ({
          productoId: parseInt(item.id),
          cantidad: parseInt(item.cantidad)
        }))
      };

      // Agregar información de tarjeta si se seleccionó una del usuario
      if (paymentMethod === 'userCard' && selectedCardId) {
        const selectedCard = userCards.find(card => card.id.toString() === selectedCardId);
        if (selectedCard) {
          pedidoData.tarjetaInfo = {
            tarjetaId: selectedCard.id,
            tipoTarjeta: selectedCard.tipoTarjeta,
            numeroEnmascarado: selectedCard.numeroEnmascarado,
            fechaVencimiento: selectedCard.fechaVencimiento,
            nombreEnTarjeta: selectedCard.nombreEnTarjeta
          };
        }
      }

      console.log('📦 Enviando datos adaptados:', JSON.stringify(pedidoData, null, 2));

      const response = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(usuario?.token && { 'Authorization': `Bearer ${usuario.token}` })
        },
        body: JSON.stringify(pedidoData)
      });

      const responseText = await response.text();
      console.log('📡 Respuesta del servidor:', responseText);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error al parsear respuesta:', e);
        }

        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      const result = JSON.parse(responseText);
      console.log('✅ Pedido creado:', result);
      const metodoSeleccionado = metodosPago.find(m => m.id.toString() === paymentMethod);

      // Determinar estado de pago y detalles del pedido de forma robusta
      const estadoPagoCalculado = determinePaymentStatus(result, paymentMethod, metodosPago);

      // Preferir detalles del servidor, si existen y son válidos
      let detallesPedidos = [];
      if (Array.isArray(result.detallesPedidos) && result.detallesPedidos.length > 0) {
        detallesPedidos = result.detallesPedidos.map((detalle, index) => ({
          id: detalle.id || `detalle_${result.pedidoId}_${index}`,
          cantidad: detalle.cantidad,
          precio: detalle.precio,
          subtotal: detalle.subtotal || (detalle.precio * detalle.cantidad),
          producto: {
            id: detalle.producto?.id || detalle.productoId || carrito[index]?.id,
            nombre: detalle.producto?.nombre || carrito[index]?.nombre || carrito[index]?.title || 'Producto sin nombre'
          }
        }));
      } else {
        // Fallback: usar carrito local
        detallesPedidos = carritoActualizado.map((item, index) => ({
          id: `detalle_${result.pedidoId}_${index}`,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio),
          subtotal: parseFloat(item.precio) * item.cantidad,
          producto: {
            id: item.id,
            nombre: item.nombre || item.title || 'Producto sin nombre'
          }
        }));
      }

      setPedidoCreado({
        id: result.pedidoId || result.id,
        montoTotal: result.montoTotal || total,
        direccionEnvio: result.direccionEnvio || pedidoData.direccionEnvio,
        estado: result.estado || 'PENDIENTE',
        estadoPago: estadoPagoCalculado,
        metodoPago: {
          id: pedidoData.metodoPagoId,
          nombre: metodoSeleccionado?.nombre || result.metodoPago?.nombre || 'Método no especificado'
        },
        detallesPedidos,
        resumen: {
          items: detallesPedidos,
          subtotal: subtotal,
          shippingCost: shippingCost,
          taxes: taxes,
          total: total
        }
      });

      if (vaciarCarrito) {
        vaciarCarrito();
      }

      setActiveStep(3);

    } catch (error) {
      console.error('💥 Error:', error);

      if (error.message.includes('Usuario no encontrado')) {
        setError('Debes estar registrado para realizar un pedido. Por favor inicia sesión.');
      } else if (error.message.includes('Método de pago inválido')) {
        setError('Método de pago no válido. Por favor selecciona otro.');
      } else if (error.message.includes('stock')) {
        setError('Algunos productos no tienen stock suficiente. Revisa tu carrito.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Error de conexión. Verifica que el servidor esté funcionando.');
      } else {
        setError(error.message || 'Error al procesar el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    if (activeStep === 2) {
      // En el paso de pago, crear el pedido
      await crearPedido();
    } else {
      setActiveStep(s => Math.min(s + 1, 3));
    }
  };

  const prev = () => setActiveStep(s => Math.max(s - 1, 1));

  const onCardChange = (field, val) => {
    let value = val;

    // Formatear número de tarjeta con espacios
    if (field === 'number') {
      value = val.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }

    // Formatear fecha de vencimiento
    if (field === 'expiry') {
      value = val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    setCardInfo(ci => ({ ...ci, [field]: value }));
  };

  // Validación del formulario - MEJORADA
  const isStep1Valid = () => {
    if (carrito.length === 0) return false;
    if (!formData.fullName || !formData.email || !formData.phone) return false;

    if (formData.deliveryType === 'delivery') {
      return formData.address && formData.city && formData.zipCode;
    }

    if (formData.deliveryType === 'pickup') {
      return formData.selectedStore;
    }

    return true;
  };

  // Validación del paso 2 - MEJORADA para métodos dinámicos
  const isStep2Valid = () => {
    if (!paymentMethod) return false;

    // Si es una tarjeta del usuario, no necesita validación adicional
    if (paymentMethod === 'userCard' && selectedCardId) {
      return true;
    }

    // Para métodos genéricos, validar según el tipo
    const selectedMethod = metodosPago.find(m => m.id.toString() === paymentMethod);
    if (!selectedMethod) return false;

    const isCardMethod = selectedMethod?.tipo === 'tarjeta' || selectedMethod?.nombre?.toLowerCase().includes('tarjeta');
    
    if (isCardMethod) {
      return cardInfo.number && cardInfo.expiry && cardInfo.cvv && cardInfo.nameOnCard;
    }

    return true;
  };

  // Función para obtener el texto del estado de pago
  const getPaymentStatusText = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'COMPLETADO':
        return 'Completado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'PENDIENTE_VERIFICACION':
        return 'Pendiente de Verificación';
      case 'FALLIDO':
        return 'Fallido';
      default:
        return estado || 'Pendiente';
    }
  };

  // Función para obtener el color del estado de pago
  const getPaymentStatusColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'COMPLETADO':
        return 'green';
      case 'PENDIENTE':
      case 'PENDIENTE_VERIFICACION':
        return 'orange';
      case 'FALLIDO':
        return 'red';
      default:
        return 'orange';
    }
  };

  return (
    <div className="checkout-container">
      {/* ------ HEADER ------ */}
      <header className="checkout-header">
        <div className="header-top">
          <h1>Checkout</h1>
          <div className="secure-header">
            <span className="shield-icon"></span>
            <FaShieldAlt />Compra 100% segura
          </div>
        </div>
        <div className="steps">
          {[
            { id: 1, icon: <FaTruck />, label: 'Envío' },
            { id: 2, icon: <FaCreditCard />, label: 'Pago' },
            { id: 3, icon: <FaCheck />, label: 'Confirmación' }
          ].map(s => (
            <div
              key={s.id}
              className={
                `step ` +
                (activeStep > s.id ? 'completed ' : '') +
                (activeStep === s.id ? 'active' : '')
              }
            >
              <div className="step-content">
                <span className="step-icon">{s.icon}</span>
                <span className="step-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Mostrar errores */}
      {error && (
        <div className="error-message" style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* ------ MAIN LAYOUT ------ */}
      <div className="checkout-main">
        {/* --------- IZQUIERDA --------- */}
        <section className="left">
          {/* Pasos */}
          {activeStep === 1 && (
            <>
              {/* Resumen del Carrito */}
              <div className="section-box payment-section">
                <h2><span>1</span> Resumen de Productos</h2>

                {/* Validación si el carrito está vacío */}
                {carrito.length === 0 ? (
                  <div className="empty-cart">
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  carrito.map(item => (
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.imagen ? `${API_URL}/${item.imagen}` : '/placeholder-image.jpg'}
                        alt={item.nombre}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />

                      <div className="cart-item-info">
                        <strong>{item.title || item.nombre || 'Producto sin nombre'}</strong>
                        <small> S/.{parsePrice(item.precio).toFixed(2)} c/u</small>
                      </div>
                      <div className="cart-item-actions">
                        <button
                          onClick={() => disminuirCantidad(item.id)}
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => aumentarCantidad(item.id)}>
                          +
                        </button>
                        <button
                          className="remove"
                          onClick={() => quitarProducto(item.id)}
                          title="Eliminar producto"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="cart-item-total">
                        S/.{(parsePrice(item.precio) * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Información de Envío */}
              <div className="section-box shipping-form-container active">
                <div className="shipping-header">
                  <div className="shipping-step-badge selected">2</div>
                  <h2 className="shipping-title">Información de Envío</h2>
                </div>
                <div className="delivery-options">
                  <button
                    className={`delivery-btn ${formData.deliveryType === 'delivery' ? 'selected' : ''}`}
                    onClick={() => onChange('deliveryType', 'delivery')}
                  >
                    <Truck className="delivery-icon" />
                    <div>
                      <div className="delivery-label">Envío a Domicilio</div>
                      <div className="delivery-sub">Recibe en tu dirección (S/.{shippingCost.toFixed(2)})</div>
                    </div>
                  </button>
                  <button
                    className={`delivery-btn ${formData.deliveryType === 'pickup' ? 'selected' : ''}`}
                    onClick={() => onChange('deliveryType', 'pickup')}
                  >
                    <Store className="delivery-icon" />
                    <div>
                      <div className="delivery-label">Recojo en Tienda</div>
                      <div className="delivery-sub">Retira en nuestro local (Gratis)</div>
                    </div>
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">
                      <User className="form-icon" />
                      Nombre Completo *
                    </label>
                    <input
                      className="form-input"
                      required
                      value={formData.fullName || ''}
                      onChange={e => onChange('fullName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Mail className="form-icon" />
                      Correo Electrónico *
                    </label>
                    <input
                      className="form-input"
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={e => onChange('email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Phone className="form-icon" />
                      Teléfono *
                    </label>
                    <input
                      className="form-input"
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={e => onChange('phone', e.target.value)}
                    />
                  </div>

                  {formData.deliveryType === 'pickup' && (
                    <div className="form-group full">
                      <label className="form-label">
                        <Store className="form-icon" />
                        Seleccionar Tienda *
                      </label>
                      <select
                        className="form-select"
                        value={formData.selectedStore || ''}
                        onChange={e => onChange('selectedStore', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar tienda</option>
                        <option value="Centro – Av. Principal 123">Centro – Av. Principal 123</option>
                        <option value="Norte – Calle Comercial 456">Norte – Calle Comercial 456</option>
                        <option value="Sur – Plaza Shopping 789">Sur – Plaza Shopping 789</option>
                        <option value="Este – Mall Central 101">Este – Mall Central 101</option>
                      </select>
                    </div>
                  )}

                  {formData.deliveryType === 'delivery' && (
                    <>
                      {/* Selector de direcciones del usuario */}
                      {usuario && userAddresses.length > 0 && (
                        <div className="form-group full">
                          <label className="form-label">
                            <MapPin className="form-icon" />
                            Seleccionar Dirección
                          </label>
                          <div className="address-selector">
                            <select
                              className="form-select"
                              value={selectedAddressId}
                              onChange={(e) => handleAddressChange(e.target.value)}
                            >
                              <option value="">Seleccionar dirección guardada</option>
                              {userAddresses.map(address => (
                                <option key={address.id} value={address.id.toString()}>
                                  {address.nombre} - {address.calle}, {address.ciudad}
                                  {address.esPrincipal && ' (Principal)'}
                                </option>
                              ))}
                              <option value="custom">+ Agregar dirección nueva</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Mostrar dirección seleccionada */}
                      {selectedAddressId && selectedAddressId !== 'custom' && !useCustomAddress && (
                        <div className="form-group full">
                          <div className="selected-address-display">
                            <strong>Dirección seleccionada:</strong>
                            {(() => {
                              const selectedAddress = userAddresses.find(addr => addr.id.toString() === selectedAddressId);
                              return selectedAddress ? (
                                <div className="address-info">
                                  <div>{selectedAddress.calle}</div>
                                  <div>{selectedAddress.ciudad}, {selectedAddress.codigoPostal}</div>
                                  {selectedAddress.referencia && (
                                    <div><small>Referencia: {selectedAddress.referencia}</small></div>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Campos de dirección personalizada */}
                      {(useCustomAddress || !usuario || userAddresses.length === 0) && (
                        <>
                          <div className="form-group full">
                            <label className="form-label">
                              <MapPin className="form-icon" />
                              Dirección *
                            </label>
                            <input
                              className="form-input"
                              required
                              value={formData.address || ''}
                              onChange={e => onChange('address', e.target.value)}
                              placeholder="Calle, número, departamento"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Ciudad *</label>
                            <input
                              className="form-input"
                              required
                              value={formData.city || ''}
                              onChange={e => onChange('city', e.target.value)}
                              placeholder="Lima, Arequipa, etc."
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Código Postal *</label>
                            <input
                              className="form-input"
                              required
                              value={formData.zipCode || ''}
                              onChange={e => onChange('zipCode', e.target.value)}
                              placeholder="15001"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {activeStep === 2 && (
            <div className="section-box payment-section">
              <h2>
                <span>3</span> Método de Pago
              </h2>

              <div className="payment-options">
                {/* Sección de tarjetas guardadas del usuario */}
                {usuario && userCards.length > 0 && (
                  <div className="user-cards-section">
                    <h4>Mis Tarjetas Guardadas</h4>
                    {userCards.map(tarjeta => (
                      <label key={`card-${tarjeta.id}`} className={`payment-option ${paymentMethod === 'userCard' && selectedCardId === tarjeta.id.toString() ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value={`card-${tarjeta.id}`}
                          checked={paymentMethod === 'userCard' && selectedCardId === tarjeta.id.toString()}
                          onChange={() => handlePaymentMethodChange('userCard', tarjeta.id.toString())}
                        />
                        <div className="payment-labels">
                          <strong>{tarjeta.tipoTarjeta}</strong>
                          <small>{tarjeta.numeroEnmascarado}</small>
                          <small>Expira: {tarjeta.fechaVencimiento}</small>
                        </div>
                        <div className="payment-logos">
                          <CreditCard size={20} />
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Separador si hay tarjetas del usuario */}
                {usuario && userCards.length > 0 && metodosPago.length > 0 && (
                  <div className="payment-separator">
                    <span>O usar otro método de pago</span>
                  </div>
                )}

                {/* Métodos de pago genéricos */}
                {metodosPago.length > 0 ? (
                  metodosPago.map(metodo => (
                    <label key={metodo.id} className={`payment-option ${paymentMethod === metodo.id.toString() ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={metodo.id.toString()}
                        checked={paymentMethod === metodo.id.toString()}
                        onChange={() => handlePaymentMethodChange('generic', metodo.id.toString())}
                      />
                      <div className="payment-labels">
                        <strong>{metodo.nombre}</strong>
                        <small>{metodo.descripcion}</small>
                        {metodo.comision > 0 && (
                          <small>Comisión: {metodo.comision}%</small>
                        )}
                      </div>
                      {/* Mostrar logo si existe */}
                      {metodo.logo && (
                        <div className="payment-logos">
                          <img src={metodo.logo} alt={metodo.nombre} />
                        </div>
                      )}
                    </label>
                  ))
                ) : (
                  <div className="no-payment-methods">
                    <p>Cargando métodos de pago...</p>
                  </div>
                )}
              </div>

              {/* Mostrar formularios solo si hay una selección */}
              {paymentMethod && (
                <>
                  {/* Formulario para tarjeta de crédito/débito */}
                  {(() => {
                    const selectedMethod = metodosPago.find(m => m.id.toString() === paymentMethod);
                    const isCardMethod = selectedMethod?.tipo === 'tarjeta' || selectedMethod?.nombre?.toLowerCase().includes('tarjeta');

                    return isCardMethod && (
                      <div className="card-form">
                        <div className="form-row">
                          <label>Número de Tarjeta *</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardInfo.number}
                            onChange={e => onCardChange('number', e.target.value)}
                            maxLength="19"
                            required
                          />
                        </div>
                        <div className="form-row split-2">
                          <div>
                            <label>Fecha de Vencimiento *</label>
                            <input
                              type="text"
                              placeholder="MM/AA"
                              value={cardInfo.expiry}
                              onChange={e => onCardChange('expiry', e.target.value)}
                              maxLength="5"
                              required
                            />
                          </div>
                          <div>
                            <label>CVV *</label>
                            <input
                              type="text"
                              placeholder="123"
                              value={cardInfo.cvv}
                              onChange={e => onCardChange('cvv', e.target.value)}
                              maxLength="4"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <label>Nombre en la Tarjeta *</label>
                          <input
                            type="text"
                            placeholder="Juan Pérez"
                            value={cardInfo.nameOnCard}
                            onChange={e => onCardChange('nameOnCard', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Información para PayPal */}
                  {(() => {
                    const selectedMethod = metodosPago.find(m => m.id.toString() === paymentMethod);
                    const isPayPalMethod = selectedMethod?.tipo === 'paypal' || selectedMethod?.nombre?.toLowerCase().includes('paypal');

                    return isPayPalMethod && (
                      <div className="paypal-info">
                        <p>Serás redirigido a PayPal para completar tu pago de forma segura.</p>
                      </div>
                    );
                  })()}

                  {/* Información para transferencia bancaria */}
                  {(() => {
                    const selectedMethod = metodosPago.find(m => m.id.toString() === paymentMethod);
                    const isBankTransferMethod = selectedMethod?.tipo === 'transferencia' || selectedMethod?.nombre?.toLowerCase().includes('transferencia');

                    return isBankTransferMethod && (
                      <div className="bank-transfer-info">
                        <h4>Datos para Transferencia Bancaria</h4>
                        <div className="bank-details">
                          <p><strong>Banco:</strong> {selectedMethod.datosBanco?.banco || 'Información no disponible'}</p>
                          <p><strong>Número de Cuenta:</strong> {selectedMethod.datosBanco?.cuenta || 'Información no disponible'}</p>
                          <p><strong>Titular:</strong> {selectedMethod.datosBanco?.titular || 'Información no disponible'}</p>
                          <p><strong>Concepto:</strong> Pedido #{selectedMethod.datosBanco?.referencia || 'XXXXX'}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Información para billeteras digitales */}
                  {(() => {
                    const selectedMethod = metodosPago.find(m => m.id.toString() === paymentMethod);
                    const isWalletMethod = selectedMethod?.tipo === 'billetera' ||
                      ['yape', 'plin', 'tunki', 'lukita'].some(wallet =>
                        selectedMethod?.nombre?.toLowerCase().includes(wallet)
                      );

                    return isWalletMethod && (
                      <div className="wallet-info">
                        <p>Serás redirigido a {selectedMethod?.nombre} para completar tu pago.</p>
                        {selectedMethod?.instrucciones && (
                          <div className="payment-instructions">
                            <small>{selectedMethod.instrucciones}</small>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Información genérica para otros métodos */}
                  {(() => {
                    const selectedMethod = metodosPago.find(m => m.id.toString() === paymentMethod);
                    const isGenericMethod = selectedMethod &&
                      !['tarjeta', 'paypal', 'transferencia', 'billetera'].includes(selectedMethod.tipo) &&
                      !selectedMethod.nombre?.toLowerCase().includes('tarjeta') &&
                      !selectedMethod.nombre?.toLowerCase().includes('paypal') &&
                      !selectedMethod.nombre?.toLowerCase().includes('transferencia') &&
                      !['yape', 'plin', 'tunki', 'lukita'].some(wallet =>
                        selectedMethod.nombre?.toLowerCase().includes(wallet)
                      );

                    return isGenericMethod && (
                      <div className="generic-payment-info">
                        <p>Has seleccionado: <strong>{selectedMethod.nombre}</strong></p>
                        {selectedMethod.instrucciones && (
                          <div className="payment-instructions">
                            <p>{selectedMethod.instrucciones}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {activeStep === 3 && pedidoCreado && (
            <div className="section-box confirmation-section">
              <div className="confirmation-content">
                <div className="confirmation-icon">
                  <FaCheck />
                </div>
                <h2>¡Pedido Confirmado!</h2>
                <p>Gracias por tu compra. Tu pedido ha sido procesado exitosamente.</p>

                <div className="order-details">
                  <h3>Detalles del Pedido</h3>
                  <div className="detail-row">
                    <span>Número de Pedido:</span>
                    <strong>#{pedidoCreado.id}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Método de Pago:</span>
                    <strong>{pedidoCreado.metodoPago?.nombre || 'N/A'}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Estado del Pago:</span>
                    <strong style={{ color: getPaymentStatusColor(pedidoCreado.estadoPago) }}>
                      {getPaymentStatusText(pedidoCreado.estadoPago)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Estado del Pedido:</span>
                    <strong>{pedidoCreado.estado}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Dirección de Entrega:</span>
                    <strong>{pedidoCreado.direccionEnvio}</strong>
                  </div>

                </div>

                <div className="order-products">
                  <h3>Productos Pedidos</h3>
                  {(pedidoCreado.detallesPedidos || []).map((item, index) => (
                    <div key={index} className="order-product-item">
                      <span>{item.nombre || item.producto?.nombre || 'Producto sin nombre'}</span>
                      <span>x{item.cantidad}</span>
                      <span>
                        S/.{((item.precio || 0) * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>
                      S/.{(pedidoCreado.montoTotal || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="next-steps">
                  <h3>Próximos Pasos</h3>
                  <p>Recibirás un email de confirmación con los detalles de tu pedido y el seguimiento.</p>
                  <p>Tu pedido será procesado en los próximos días hábiles.</p>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          )}


          {/* Botones */}
          <div className="actions">
            {activeStep > 1 && activeStep < 3 && (
              <button className="btn-secondary" onClick={prev} disabled={loading}>
                Atrás
              </button>
            )}
            {activeStep < 3 && (
              <button
                className="btn-primary"
                onClick={next}
                disabled={
                  loading ||
                  (activeStep === 1 && !isStep1Valid()) ||
                  (activeStep === 2 && !isStep2Valid())
                }
              >
                {loading ? 'Procesando...' : activeStep === 2 ? 'Realizar Pedido' : 'Continuar'}
              </button>
            )}
          </div>
        </section>

        {/* --------- LATERAL: Resumen del Pedido --------- */}
        <aside className="right">
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>

            {/* Mostrar productos */}
            <div className="order-items">
              {activeStep === 3 && pedidoCreado ? (
                (pedidoCreado.detallesPedidos || []).map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.nombre || item.producto?.nombre || 'Producto sin nombre'}</span>
                      <span className="item-quantity">x{item.cantidad}</span>
                    </div>
                    <span className="item-price">S/.{((item.precio || 0) * item.cantidad).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                carrito.length > 0 ? (
                  carrito.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.title || item.nombre}</span>
                        <span className="item-quantity">x{item.cantidad}</span>
                      </div>
                      <span className="item-price">S/.{(parsePrice(item.precio) * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div>No hay productos en el carrito.</div>
                )
              )}
            </div>

            <hr />

            {/* Mostrar resumen de costos */}
            <div className="summary-row">
              <span>Subtotal ({activeStep === 3 ? (pedidoCreado?.detallesPedidos?.length || 0) : carrito.length} productos)</span>
              <span>
                S/.{(activeStep === 3 ? (pedidoCreado?.resumen?.subtotal || 0) : subtotal).toFixed(2)}
              </span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span>
                S/.{(activeStep === 3 ? (pedidoCreado?.resumen?.shippingCost || 0) : shippingCost).toFixed(2)}
              </span>
            </div>
            <div className="summary-row">
              <span>Impuestos</span>
              <span>
                S/.{(activeStep === 3 ? (pedidoCreado?.resumen?.taxes || 0) : taxes).toFixed(2)}
              </span>
            </div>
            <div className="summary-total">
              <strong>Total</strong>
              <strong>
                S/.{(activeStep === 3 ? (pedidoCreado?.resumen?.total || pedidoCreado?.montoTotal || 0) : total).toFixed(2)}
              </strong>
            </div>

            <div className="secure-box">
              <p><FaLock /> Pago 100% seguro</p>
              <p><IoReloadCircle /> Devoluciones fáciles 30 días</p>
            </div>

            {activeStep < 3 && (
              <button
                className="place-order"
                onClick={next}
                disabled={
                  loading ||
                  (activeStep === 1 && !isStep1Valid()) ||
                  (activeStep === 2 && !isStep2Valid())
                }
              >
                {loading ? 'Procesando...' : activeStep === 1 ? 'Continuar' : 'Realizar Pedido'}
              </button>
            )}
          </div>
        </aside>


      </div>
    </div>
  );
}
