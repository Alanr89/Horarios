CREATE TABLE IF NOT EXISTS rendiciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    es_base TINYINT(1) DEFAULT 0,
    es_chofer TINYINT(1) DEFAULT 0,
    chofer_nombre VARCHAR(100),
    motivo VARCHAR(255),
    patente_caso VARCHAR(20),
    tipo_entrada TINYINT(1) DEFAULT 0,
    tipo_salida TINYINT(1) DEFAULT 0,
    operador VARCHAR(50),
    marca_adelanto TINYINT(1) DEFAULT 0,
    marca_retiro TINYINT(1) DEFAULT 0,
    marca_gastos TINYINT(1) DEFAULT 0,
    marca_rindio TINYINT(1) DEFAULT 0
);