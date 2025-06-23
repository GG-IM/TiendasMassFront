create database ecommerce
use ecommerce
 
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  precio_anterior DECIMAL(10, 2),
  descripcion TEXT,
  imagen VARCHAR(255),
  categoria_id INT,
  stock INT DEFAULT 0,
  estado BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  total DECIMAL(10,2),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'pendiente',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  producto_id INT,
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

INSERT INTO categorias (nombre, descripcion) VALUES
('Abarrotes', 'Productos de abarrotes variados'),
('Bebidas', 'Bebidas alcohólicas y no alcohólicas'),
('Lácteos', 'Productos lácteos como leche, quesos y yogures'),
('Confitería', 'Dulces, chocolates y golosinas'),
('Panadería', 'Pan y productos de panadería'),
('Piqueos', 'Snacks y aperitivos'),
('Limpieza', 'Productos para limpieza del hogar'),
('Cuidado Personal', 'Productos de higiene y cuidado personal');

INSERT INTO productos 
  (nombre, marca, precio, precio_anterior, descripcion, imagen, categoria_id, stock, estado) 
VALUES
  -- Abarrotes
  ('Aceite de Girasol', 'La Favorita', 18.00, 20.00, 'Aceite de girasol refinado, 1 litro', 'uploads/productos/aceite_girasol.jpg', 1, 120, TRUE),
  ('Harina de Trigo', 'Molino Real', 7.50, NULL, 'Harina de trigo blanca para todo uso, 1 kg', 'uploads/productos/harina_trigo.jpg', 1, 200, TRUE),

  -- Bebidas
  ('Cerveza Pilsen', 'Backus', 6.50, 7.00, 'Cerveza rubia lager, lata 330 ml', 'uploads/productos/cerveza_pilsen.jpg', 2, 150, TRUE),
  ('Jugo de Mango', 'Del Valle', 4.00, NULL, 'Jugo natural de mango, 1 litro', 'uploads/productos/jugo_mango.jpg', 2, 80, TRUE),

  -- Lácteos
  ('Leche Entera', 'Gloria', 4.50, 5.00, 'Leche entera pasteurizada, 1 litro', 'uploads/productos/leche_entera.jpg', 3, 180, TRUE),
  ('Queso Fresco', 'Santa Rosa', 12.00, NULL, 'Queso fresco de vaca, 500 gramos', 'uploads/productos/queso_fresco.jpg', 3, 90, TRUE),
	
  -- Confitería
  ('Chocolate Negro', 'Nacional', 7.00, 8.00, 'Chocolate negro 70%, barra 100g', 'uploads/productos/chocolate_negro.jpg', 4, 140, TRUE),
  ('Gomitas Frutales', 'Haribo', 5.00, NULL, 'Gomitas de frutas, paquete 150g', 'uploads/productos/gomitas_frutales.jpg', 4, 110, TRUE),

  -- Panadería
  ('Pan Integral', 'Bimbo', 3.00, NULL, 'Pan integral rebanado, 500 gramos', 'uploads/productos/pan_integral.jpg', 5, 130, TRUE),
  ('Bizcocho', 'La Ibérica', 6.50, 7.00, 'Bizcocho tradicional, unidad', 'uploads/productos/bizcocho.jpg', 5, 70, TRUE),

  -- Piqueos
  ('Papas Fritas', 'Lay’s', 4.50, 5.00, 'Papas fritas clásicas, bolsa 120g', 'uploads/productos/papas_fritas.jpg', 6, 160, TRUE),
  ('Maní Salado', 'Supermaní', 3.00, NULL, 'Maní salado, bolsa 100g', 'uploads/productos/mani_salado.jpg', 6, 150, TRUE),

  -- Limpieza
  ('Detergente Líquido', 'Ariel', 15.00, 17.00, 'Detergente líquido para ropa, 1 litro', 'uploads/productos/detergente_ariel.jpg', 7, 100, TRUE),
  ('Limpiador Multiusos', 'Mr. Músculo', 10.00, NULL, 'Limpiador multiusos para hogar, 500 ml', 'uploads/productos/limpiador_mult.jpg', 7, 90, TRUE),

  -- Cuidado Personal
  ('Jabón de Manos', 'Dove', 6.00, 7.00, 'Jabón líquido para manos, 250 ml', 'uploads/productos/jabon_dove.jpg', 8, 120, TRUE),
  ('Champú Anticaspa', 'Head & Shoulders', 18.00, NULL, 'Champú anticaspa, 400 ml', 'uploads/productos/champu_hs.jpg', 8, 85, TRUE);


INSERT INTO productos 
  (nombre, marca, precio, precio_anterior, descripcion, imagen, categoria_id, stock, estado) 
VALUES
  ('Aceite de Girasol1', 'La Favorita', 18.00, 20.00, 'Aceite de girasol refinado, 1 litro', 'uploads/productos/aceite_girasol.jpg', 1, 120, TRUE)
 



SELECT * FROM usuarios;
select * from categorias
select * from pedidos
select * from productos
DELETE FROM productos;

SELECT * FROM productos WHERE id = 1;



