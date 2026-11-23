-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.tipo_conta (
  id smallint NOT NULL,
  nome character varying NOT NULL DEFAULT ''::character varying UNIQUE CHECK (char_length(nome::text) <= 20),
  CONSTRAINT tipo_conta_pkey PRIMARY KEY (id)
);

CREATE TABLE public.contas_carteira (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL DEFAULT ''::character varying CHECK (char_length(nome::text) <= 100),
  saldo numeric NOT NULL DEFAULT '0'::numeric CHECK (char_length(saldo::text) <= 12),
  tipo smallint NOT NULL,
  id_usuario uuid DEFAULT auth.uid(),
  CONSTRAINT contas_carteira_pkey PRIMARY KEY (id),
  CONSTRAINT contas_carteira_tipo_fkey FOREIGN KEY (tipo) REFERENCES public.tipo_conta(id),
  CONSTRAINT contas_carteira_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);

CREATE TABLE public.categorias (
  id smallint NOT NULL,
  nome character varying NOT NULL CHECK (char_length(nome::text) <= 50),
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);

CREATE TABLE public.tipo_transacoes (
  id smallint NOT NULL,
  nome character varying NOT NULL DEFAULT ''::character varying UNIQUE CHECK (char_length(nome::text) <= 20),
  CONSTRAINT tipo_transacoes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transacoes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  descricao character varying CHECK (char_length(descricao::text) <= 100),
  valor numeric NOT NULL CHECK (char_length(valor::text) <= 12),
  id_categoria smallint NOT NULL,
  id_conta bigint NOT NULL,
  tipo smallint NOT NULL,
  data_transacao date NOT NULL,
  id_usuario uuid,
  CONSTRAINT transacoes_pkey PRIMARY KEY (id),
  CONSTRAINT transacoes_id_conta_fkey FOREIGN KEY (id_conta) REFERENCES public.contas_carteira(id),
  CONSTRAINT transacoes_tipo_fkey FOREIGN KEY (tipo) REFERENCES public.tipo_transacoes(id),
  CONSTRAINT transacoes_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id),
  CONSTRAINT transacoes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);

CREATE TABLE public.metas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_categoria smallint NOT NULL UNIQUE,
  valor_limite numeric NOT NULL CHECK (char_length(valor_limite::text) <= 12 AND valor_limite > 0::numeric),
  id_usuario uuid,
  nome character varying NOT NULL DEFAULT ''::character varying,
  CONSTRAINT metas_pkey PRIMARY KEY (id),
  CONSTRAINT metas_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id),
  CONSTRAINT metas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);

CREATE TABLE public.usuario (
  id uuid NOT NULL,
  nome character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  CONSTRAINT usuario_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);