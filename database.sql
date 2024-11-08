create database imssfinal;
use imssfinal;

CREATE TABLE tiposdeusuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_de_usuario VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO `tiposdeusuarios` (`id`, `tipo_de_usuario`) VALUES
(1, 'paciente'),
(2, 'doctor');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    curp VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_de_usuario_id INT NOT NULL,
    CONSTRAINT fk_tipo_de_usuario
        FOREIGN KEY (tipo_de_usuario_id) REFERENCES tiposdeusuarios(id)
);

INSERT INTO `users` (`id`, `username`, `curp`, `password`, `tipo_de_usuario_id`) VALUES
(1, 'oscar', 'VICO960327HJCLRS06', 'password', 1),
(2, 'fernando', 'beep', 'password', 2);

CREATE TABLE symptomstatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symptomstatus VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO `symptomstatus` (`id`, `symptomstatus`) VALUES
(1, 'nuevo'),
(2, 'resuelto');

CREATE TABLE symptoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    symptoms TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symptom_status_id INT NOT NULL,
    CONSTRAINT fk_symptom_status
        FOREIGN KEY (symptom_status_id) REFERENCES symptomstatus(id)
);

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tiposderecomendaciones(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_de_recomendacion VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO `tiposderecomendaciones` (`id`, `tipo_de_recomendacion`) VALUES
(1, 'IA'),
(2, 'Doctor');

CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked INT NOT NULL,
    symptom_id INT NOT NULL,
    tipo_de_recomendacion_id INT NOT NULL,
    CONSTRAINT fk_symptom_id
        FOREIGN KEY (symptom_id) REFERENCES symptoms(id),
    CONSTRAINT fk_tipo_de_recomendacion
        FOREIGN KEY (tipo_de_recomendacion_id) REFERENCES tiposderecomendaciones(id)
);
