DROP DATABASE banco;
CREATE DATABASE banco;
\c banco;

CREATE TABLE usuario(
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipo_conta(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20)NOT NULL UNIQUE
);


CREATE TABLE contas_carteira(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    saldo NUMERIC(12,2),
    tipo INTEGER REFERENCES tipo_conta(id),
    cpf_usuario INTEGER REFERENCES usuario(cpf)
);

CREATE TABLE categorias(
    id INTEGER PRIMARY KEY, 
    nome VARCHAR(50),
    tipo INTEGER REFERENCES tipo_categoria(id),
    cpf_usuario INTEGER REFERENCES usuario(cpf)
);

CREATE TABLE tipo_transacoes(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE transacoes(
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100),
    valor NUMERIC(12,2),
    id_categoria INTEGER REFERENCES categorias(id),
    id_conta INTEGER REFERENCES contas_carteira(id),
    cpf_usuario INTEGER REFERENCES usuario(cpf),
    tipo INTEGER REFERENCES tipo_transacoes(id),
    data_transacao DATE NOT NULL,
    pago BOOLEAN NOT NULL
);

CREATE TABLE metas(
    id SERIAL PRIMARY KEY,
    id_categoria INTEGER REFERENCES categorias(id),
    cpf_usuario INTEGER REFERENCES usuario(cpf),
    valor_limite NUMERIC (12,2),
);


INSERT INTO tipo_categoria(nome)
VALUES
("Receita"),
("Despesa"),
("Investimento");

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
(10, 'Compras')
(11, 'Outros');

