-- Add Solar Panels
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_hidden) 
VALUES 
('Monocrystalline Solar Panel 400W', 'High-efficiency mono panel with 20.4% conversion rate', 299.99, 'solar_panels', '/images/products/mono-400w.jpg', 50, false),
('Polycrystalline Solar Panel 350W', 'Cost-effective poly panel for residential use', 249.99, 'solar_panels', '/images/products/poly-350w.jpg', 75, false),
('Bifacial Solar Panel 450W', 'Dual-sided panel for maximum energy capture', 399.99, 'solar_panels', '/images/products/bifacial-450w.jpg', 30, false);

-- Add Inverters
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_hidden)
VALUES
('Microinverter 300W', 'Individual panel optimization for better performance', 129.99, 'inverters', '/images/products/micro-300w.jpg', 100, false),
('String Inverter 5kW', 'Reliable string inverter for residential systems', 899.99, 'inverters', '/images/products/string-5kw.jpg', 25, false),
('Hybrid Inverter 7.6kW', 'Smart inverter with battery compatibility', 1499.99, 'inverters', '/images/products/hybrid-7.6kw.jpg', 20, false);

-- Add Batteries
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_hidden)
VALUES
('Lithium Battery 10kWh', 'High-capacity lithium storage solution', 4999.99, 'batteries', '/images/products/lithium-10kwh.jpg', 15, false),
('Lead-Acid Battery 5kWh', 'Traditional reliable storage option', 1999.99, 'batteries', '/images/products/lead-acid-5kwh.jpg', 30, false),
('Smart Battery 15kWh', 'Advanced battery with monitoring system', 6999.99, 'batteries', '/images/products/smart-15kwh.jpg', 10, false);

-- Add Mounting Systems
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_hidden)
VALUES
('Roof Mount Kit', 'Complete roof mounting solution for 6 panels', 299.99, 'mounting', '/images/products/roof-mount.jpg', 40, false),
('Ground Mount System', 'Adjustable ground mounting system', 499.99, 'mounting', '/images/products/ground-mount.jpg', 25, false),
('Tilt Mount Kit', 'Adjustable tilt mounting solution', 399.99, 'mounting', '/images/products/tilt-mount.jpg', 35, false);

-- Add Accessories
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_hidden)
VALUES
('Solar Cable 10m', 'UV-resistant PV cable pair (positive and negative)', 49.99, 'accessories', '/images/products/solar-cable.jpg', 200, false),
('MC4 Connectors Pack', 'Pack of 5 pairs of MC4 connectors', 29.99, 'accessories', '/images/products/mc4-connectors.jpg', 150, false),
('Solar Panel Cleaner', 'Professional cleaning solution 1L', 19.99, 'accessories', '/images/products/panel-cleaner.jpg', 100, false);