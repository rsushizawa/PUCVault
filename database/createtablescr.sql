-- identidade visual
CREATE TABLE privado.identidade_visual (
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

	img_perfil TEXT DEFAULT NULL,
	img_banner TEXT DEFAULT NULL,

	perfil_modificado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	banner_modificado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- usuario
CREATE TABLE privado.usuario (
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nome VARCHAR(75) NOT NULL,
	nome_usuario VARCHAR(20) NOT NULL UNIQUE,
	descricao VARCHAR(100),
	email VARCHAR(50) NOT NULL UNIQUE,
	cargo VARCHAR(15) DEFAULT 'USUARIO',
	status VARCHAR(15) DEFAULT 'ATIVO',
	ultima_mudanca_status TIMESTAMP WITH TIME ZONE,
	criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	excluido_em TIMESTAMP WITH TIME ZONE,
	senha_hash TEXT NOT NULL,
	a2f boolean default false,

	identidade_visual INT NOT NULL UNIQUE,

	CONSTRAINT usuario_cargo
		CHECK (cargo IN ('USUARIO', 'VALIDADOR', 'ADMIN', 'SUPERADMIN')),

	CONSTRAINT usuario_status
		CHECK (status IN ('ATIVO', 'SILENCIADO')),

	FOREIGN KEY (identidade_visual) REFERENCES privado.identidade_visual(id) ON DELETE RESTRICT
);

-- forum
-- uso: CALL publico.inserir_forum(<titulo>, <descricao>, <id do criador>);
CREATE TABLE privado.forum (
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	descricao VARCHAR(100) NOT NULL,
	criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	excluido_em TIMESTAMP WITH TIME ZONE,
	status VARCHAR(20) DEFAULT 'ESPERA',
	status_modificado_em TIMESTAMP WITH TIME ZONE,

	criador INT NOT NULL,
	validador INT,
	identidade_visual INT NOT NULL UNIQUE,

	CONSTRAINT forum_validador_diferente_de_criador
		CHECK (validador IS NULL OR criador != validador),

	CONSTRAINT forum_status
		CHECK (status IN ('ESPERA', 'ATIVO', 'RECUSADO')),

	FOREIGN KEY (criador) REFERENCES privado.usuario(id) ON DELETE RESTRICT,
	FOREIGN KEY (validador) REFERENCES privado.usuario(id) ON DELETE SET NULL,
	FOREIGN KEY (identidade_visual) REFERENCES privado.identidade_visual(id) ON DELETE RESTRICT
);

-- tag
CREATE TABLE privado.tag (
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	tag VARCHAR(20) NOT NULL UNIQUE,
	criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

	criador INT NOT NULL,

	FOREIGN KEY (criador) REFERENCES privado.usuario(id) ON DELETE RESTRICT
);

-- conteudo
CREATE TABLE privado.conteudo (
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conteudo TEXT NOT NULL,
	status VARCHAR(15) DEFAULT 'PUBLICADO',
	criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	criador INT NOT NULL,

	CONSTRAINT conteudo_status
		CHECK (status IN ('PUBLICADO', 'FIXADO')),

	FOREIGN KEY (criador) REFERENCES privado.usuario(id) ON DELETE CASCADE
);

-- postagem
CREATE TABLE privado.postagem (
	id INT PRIMARY KEY REFERENCES privado.conteudo(id) ON DELETE CASCADE,
	titulo VARCHAR(50) NOT NULL,
	arquivo TEXT UNIQUE,
	forum INT NOT NULL,
	arquivo_nome TEXT UNIQUE,
	arquivo_caminho TEXT UNIQUE,

	FOREIGN KEY (forum) REFERENCES privado.forum(id) ON DELETE CASCADE
);

-- comentario
CREATE TABLE privado.comentario (
	id INT PRIMARY KEY REFERENCES privado.conteudo(id) ON DELETE CASCADE,
	conteudo_pai INT NOT NULL,
	nivel SMALLINT NOT NULL DEFAULT 1,

	CONSTRAINT comentario_nivel
		CHECK (nivel BETWEEN 1 AND 5),

	FOREIGN KEY (conteudo_pai) REFERENCES privado.conteudo(id) ON DELETE CASCADE
);

-- denuncia
CREATE TABLE privado.denuncia (
		id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		tipo VARCHAR(30) NOT NULL,
		status VARCHAR(20) DEFAULT 'ABERTA',
		criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		resolvido_em TIMESTAMP WITH TIME ZONE,

		denunciante INT NOT NULL,
		resolvido_por INT,

	CONSTRAINT denuncia_status
		CHECK (status IN ('ABERTA', 'RESOLVIDA', 'IGNORADA')),

	FOREIGN KEY (denunciante) REFERENCES privado.usuario(id) ON DELETE RESTRICT,
	FOREIGN KEY (resolvido_por) REFERENCES privado.usuario(id) ON DELETE SET NULL
);

-- denuncia_usuario
CREATE TABLE privado.denuncia_usuario (
	id INT PRIMARY KEY REFERENCES privado.denuncia(id) ON DELETE CASCADE,
	usuario_denunciado INT NOT NULL,

	FOREIGN KEY (usuario_denunciado) REFERENCES privado.usuario(id) ON DELETE CASCADE
);

-- denuncia_conteudo
CREATE TABLE privado.denuncia_conteudo (
	id INT PRIMARY KEY REFERENCES privado.denuncia(id) ON DELETE CASCADE,
	conteudo_denunciado INT NOT NULL,

	FOREIGN KEY (conteudo_denunciado) REFERENCES privado.conteudo(id) ON DELETE CASCADE
);

-- avaliacao
CREATE TABLE privado.avaliacao (
	usuario INT NOT NULL,
	conteudo INT NOT NULL,
	avaliacao SMALLINT NOT NULL,

	CONSTRAINT valor_avaliacao
		CHECK (avaliacao IN (1, -1)),

	FOREIGN KEY (usuario) REFERENCES privado.usuario(id) ON DELETE CASCADE,
	FOREIGN KEY (conteudo) REFERENCES privado.conteudo(id) ON DELETE CASCADE,

	PRIMARY KEY (usuario, conteudo)
);

-- classificacao
CREATE TABLE privado.classificacao (
	postagem INT NOT NULL,
	tag INT NOT NULL,

	FOREIGN KEY (postagem) REFERENCES privado.postagem(id) ON DELETE CASCADE,
	FOREIGN KEY (tag) REFERENCES privado.tag(id) ON DELETE RESTRICT,

	PRIMARY KEY (postagem, tag)
);

-- seguir_forum
CREATE TABLE privado.seguir_forum (
	usuario INT NOT NULL,
	forum INT NOT NULL,

	FOREIGN KEY (usuario) REFERENCES privado.usuario(id) ON DELETE CASCADE,
	FOREIGN KEY (forum) REFERENCES privado.forum(id) ON DELETE CASCADE,

	PRIMARY KEY (usuario, forum)
);

-- seguir_usuario
CREATE TABLE privado.seguir_usuario (
	seguido INT NOT NULL,
	seguidor INT NOT NULL,

	CONSTRAINT seguido_difere_de_seguidor
		CHECK (seguido != seguidor),

	FOREIGN KEY (seguido) REFERENCES privado.usuario(id) ON DELETE CASCADE,
	FOREIGN KEY (seguidor) REFERENCES privado.usuario(id) ON DELETE CASCADE,

	PRIMARY KEY (seguido, seguidor)
);

-- incluir uma tag a um fórum
CREATE TABLE privado.incluir_tag (
	tag INT NOT NULL,
	forum INT NOT NULL,

	FOREIGN KEY (tag) REFERENCES privado.tag(id) ON DELETE CASCADE,
	FOREIGN KEY (forum) REFERENCES privado.forum(id) ON DELETE CASCADE,

	PRIMARY KEY (tag, forum)
);

-- registro de penalidades (silêncios) aplicados a usuários
-- strikes expiram conforme a duração do silêncio:
--   <= 1 dia -> strike válido por 1 semana
--   <= 3 dias -> strike válido por 3 meses
--   > 3 dias -> strike válido por 6 meses
CREATE TABLE privado.penalidade (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL,
    denuncia_id INT NOT NULL,
    duracao INTERVAL NOT NULL,
    aplicado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    strike_valido_ate TIMESTAMPTZ NOT NULL,
    removido_em TIMESTAMPTZ,

    FOREIGN KEY (usuario_id) REFERENCES privado.usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (denuncia_id) REFERENCES privado.denuncia(id) ON DELETE RESTRICT
);