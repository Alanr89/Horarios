DROP DATABASE IF EXISTS sistema_choferes;
CREATE DATABASE sistema_choferes;
USE sistema_choferes;

CREATE TABLE choferes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    dni VARCHAR(20),
    licencia_desde DATE,
    licencia_hasta DATE
);

CREATE TABLE moviles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    patente VARCHAR(20)
);

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chofer_nombre VARCHAR(100),
    movil_numero VARCHAR(20),
    fecha DATE,
    entrada TIME,
    salida TIME,
    activo TINYINT(1) DEFAULT 0
);

CREATE TABLE rendiciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    es_base TINYINT(1) DEFAULT 0,
    es_chofer TINYINT(1) DEFAULT 0,
    chofer_nombre VARCHAR(100),
    motivo VARCHAR(255),
    patente_caso VARCHAR(50),
    tipo_entrada TINYINT(1) DEFAULT 0,
    tipo_salida TINYINT(1) DEFAULT 0,
    operador VARCHAR(100),
    marca_adelanto TINYINT(1) DEFAULT 0,
    marca_retiro TINYINT(1) DEFAULT 0,
    marca_gastos TINYINT(1) DEFAULT 0,
    marca_rindio TINYINT(1) DEFAULT 0
);