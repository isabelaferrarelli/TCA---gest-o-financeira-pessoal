DROP DATABASE banco;
CREATE DATABASE banco;
\c banco;

CREATE TABLE usuario(
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipo_conta(
    id INTEGER PRIMARY KEY,
    nome VARCHAR(20)NOT NULL UNIQUE
);

CREATE TABLE contas_carteira(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    saldo NUMERIC(12,2) NOT NULL DEFAULT 0,
    tipo INTEGER NOT NULL REFERENCES tipo_conta(id),
    cpf_usuario VARCHAR(11) NOT NULL REFERENCES usuario(cpf)
);

CREATE TABLE categorias(
    id INTEGER PRIMARY KEY, 
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_transacoes(
    id INTEGER PRIMARY KEY,
    nome VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE transacoes(
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100),
    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    id_categoria INTEGER REFERENCES categorias(id),
    id_conta INTEGER NOT NULL REFERENCES contas_carteira(id),
    cpf_usuario VARCHAR(11) NOT NULL REFERENCES usuario(cpf),
    tipo INTEGER NOT NULL REFERENCES tipo_transacoes(id),
    data_transacao DATE NOT NULL,
    pago BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE metas(
    id SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id),
    cpf_usuario VARCHAR(11) NOT NULL REFERENCES usuario(cpf),
    valor_limite NUMERIC (12,2) NOT NULL CHECK (valor_limite > 0),
    UNIQUE (cpf_usuario, id_categoria)
);

INSERT INTO tipo_conta(id, nome)
VALUES 
(1, 'Corrente'),
(2, 'Poupanca'),
(3, 'Carteira'),
(4, 'Investimento');

INSERT INTO tipo_transacoes(id, nome)
VALUES
(1, 'Receita'),
(2, 'Despesa');

INSERT INTO categorias(id, nome)
VALUES
(1, 'Moradia'), 
(2, 'Alimentacao'),
(3, 'Transporte'),
(4, 'Saude'),
(5, 'Educacao'), 
(6, 'Lazer'),
(7, 'Assinaturas'),
(8, 'Dividas e parcelamentos'),
(9, 'Poupanca e investimentos'),
(10, 'Compras'),
(11, 'Outros');
