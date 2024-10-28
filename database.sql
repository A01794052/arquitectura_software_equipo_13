CREATE TABLE tiposdeusuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_de_usuario VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    curp VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_de_usuario_id INT
);

CREATE TABLE symptomstatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symptomstatus VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE symptoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    symptoms TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symptom_status_id INT NOT NULL
);

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked INT NOT NULL,
    symptom_id INT NOT NULL
);
