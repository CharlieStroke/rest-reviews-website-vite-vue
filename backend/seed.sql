-- =========================================
-- SEED DATA FOR REST-REVIEWS-WEBSITE
-- =========================================

-- Limpiar datos existentes
TRUNCATE TABLE users, establishments, reviews, model_versions, sentiment_results, metrics_snapshots RESTART IDENTITY CASCADE;

-- =========================================
-- 1. USUARIOS
-- =========================================
-- UUIDs válidos (Hexadecimal 0-9, a-f)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Administrador Sistema', 'admin@example.com', 'argon2_hashed_pw', 'admin'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Juan Gerente', 'juan.gerente@rest.com', 'argon2_hashed_pw', 'manager'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Maria Estudiante', 'maria.estu@u.edu', 'argon2_hashed_pw', 'student'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Pedro Cliente', 'pedro.c@gmail.com', 'argon2_hashed_pw', 'student');

-- =========================================
-- 2. ESTABLECIMIENTOS (Asignados al gerente Juan)
-- =========================================
INSERT INTO establishments (id, name, description, category, manager_id) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 'La Parrilla Argentina', 'Asado tradicional y vinos selectos.', 'Restaurante', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Café Central', 'Lugar acogedor para estudiar y buen café.', 'Cafetería', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23', 'Sushi Master', 'Sushi fresco y ambiente moderno.', 'Comida Asiática', NULL);

-- =========================================
-- 3. RESEÑAS
-- =========================================
INSERT INTO reviews (id, user_id, establishment_id, food_score, service_score, price_score, comment) VALUES
-- Maria en La Parrilla
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 5, 4, 3, 'El asado estaba espectacular, aunque algo caro.'),
-- Pedro en La Parrilla (Doble reseña)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 3, 2, 4, 'Servicio muy lento hoy.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 4, 5, 4, 'Volví y el servicio mejoró muchísimo, muy recomendado.'),
-- Maria en Café Central
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 4, 5, 5, 'Perfecto para estudiar con un café latte.');

-- =========================================
-- 4. MODEL VERSIONS
-- =========================================
INSERT INTO model_versions (id, version, accuracy, precision, recall, f1, dataset_size, trained_at) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d41', 'v1.0.0', 0.8950, 0.8800, 0.9100, 0.8948, 5000, now() - interval '2 days');

-- =========================================
-- 5. RESULTADOS DE SENTIMIENTO
-- =========================================
INSERT INTO sentiment_results (review_id, model_version_id, predicted_label, probability) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c31', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d41', 'positive', 0.9820),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c32', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d41', 'negative', 0.8540),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d41', 'positive', 0.9210),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c34', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d41', 'positive', 0.9910);

-- =========================================
-- 6. MÉTRICAS
-- =========================================
INSERT INTO metrics_snapshots (establishment_id, ige, avg_food, avg_service, avg_price, negative_ratio, total_reviews, snapshot_date) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21', 75.50, 4.0, 3.66, 3.66, 0.33, 3, current_date);
