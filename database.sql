CREATE DATABASE IF NOT EXISTS sistema_choferes;
USE sistema_choferes;

CREATE TABLE IF NOT EXISTS choferes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    dni VARCHAR(20),
    licencia_desde DATE,
    licencia_hasta DATE
);

CREATE TABLE IF NOT EXISTS moviles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    patente VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chofer_nombre VARCHAR(100),
    movil_numero VARCHAR(20),
    fecha DATE,
    entrada TIME,
    salida TIME,
    UNIQUE KEY chofer_fecha (chofer_nombre, fecha)
);