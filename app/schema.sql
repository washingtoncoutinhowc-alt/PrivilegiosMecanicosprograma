CREATE TABLE pessoas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  observacao TEXT,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT
);

CREATE TABLE privilegios (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE elegibilidades (
  id TEXT PRIMARY KEY,
  pessoa_id TEXT NOT NULL REFERENCES pessoas(id),
  privilegio_id TEXT NOT NULL REFERENCES privilegios(id),
  ordem INTEGER NOT NULL,
  observacao TEXT
);

CREATE TABLE regras_sistema (
  id TEXT PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT
);

CREATE TABLE ausencias (
  id TEXT PRIMARY KEY,
  pessoa_id TEXT NOT NULL REFERENCES pessoas(id),
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL,
  motivo TEXT,
  observacao TEXT
);

CREATE TABLE semanas (
  id TEXT PRIMARY KEY,
  numero INTEGER NOT NULL,
  data_quarta TEXT NOT NULL,
  data_sabado TEXT NOT NULL,
  status TEXT NOT NULL,
  gerada_em TEXT
);

CREATE TABLE reunioes (
  id TEXT PRIMARY KEY,
  semana_id TEXT NOT NULL REFERENCES semanas(id),
  data TEXT NOT NULL,
  dia_semana TEXT NOT NULL
);

CREATE TABLE designacoes (
  id TEXT PRIMARY KEY,
  reuniao_id TEXT NOT NULL REFERENCES reunioes(id),
  pessoa_id TEXT NOT NULL REFERENCES pessoas(id),
  privilegio TEXT NOT NULL,
  posicao TEXT,
  origem TEXT NOT NULL,
  observacao TEXT
);

CREATE TABLE ajustes_manuais (
  id TEXT PRIMARY KEY,
  designacao_id TEXT NOT NULL REFERENCES designacoes(id),
  pessoa_anterior_id TEXT NOT NULL REFERENCES pessoas(id),
  pessoa_nova_id TEXT NOT NULL REFERENCES pessoas(id),
  motivo TEXT,
  alterado_em TEXT NOT NULL
);

CREATE TABLE historico (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  semana_id TEXT,
  privilegio TEXT NOT NULL,
  posicao TEXT,
  pessoa_id TEXT,
  origem TEXT NOT NULL,
  observacao TEXT,
  criado_em TEXT NOT NULL
);

CREATE TABLE execucoes_geracao (
  id TEXT PRIMARY KEY,
  periodo_inicio TEXT NOT NULL,
  periodo_fim TEXT NOT NULL,
  status TEXT NOT NULL,
  mensagem TEXT,
  criado_em TEXT NOT NULL
);

CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'viewer')),
  ativo INTEGER NOT NULL DEFAULT 1,
  provedor TEXT NOT NULL DEFAULT 'google',
  criado_em TEXT NOT NULL,
  ultimo_acesso_em TEXT
);
