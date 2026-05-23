-- Datos de ejemplo para Innovatech Chile
INSERT INTO products (name, description, price, stock, category) VALUES
  ('Laptop UltraBook Pro', 'Laptop de alto rendimiento para profesionales', 899990, 15, 'Computación'),
  ('Monitor 4K 27"', 'Monitor IPS con resolución 4K y 144Hz', 349990, 30, 'Periféricos'),
  ('Teclado Mecánico RGB', 'Teclado mecánico con switches Cherry MX Red', 89990, 50, 'Periféricos'),
  ('Silla Ergonómica', 'Silla de oficina con soporte lumbar ajustable', 299990, 10, 'Mobiliario'),
  ('Webcam Full HD', 'Cámara web 1080p con micrófono integrado', 49990, 25, 'Periféricos')
ON CONFLICT DO NOTHING;
