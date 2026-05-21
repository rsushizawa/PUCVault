-- SELECT * FROM publico.dados_login_usuario(p_email := 'usuario@email.com');
-- SELECT * FROM publico.dados_login_usuario(p_nome_usuario := 'joao123');
-- SELECT * FROM publico.listar_usuarios();
-- SELECT * FROM publico.buscar_usuario_por_id(<id>, <id usuario logado>);
-- SELECT * FROM publico.buscar_usuario_por_nome_usuario(<nome_usuario>);
-- SELECT * FROM publico.buscar_usuario_por_email(<email>);
-- SELECT * FROM publico.buscar_forum_por_nome(<nome>);
-- SELECT * FROM publico.buscar_forum_por_id(<id>);
-- SELECT * FROM publico.listar_foruns();
-- SELECT * FROM publico.listar_seguidores_forum(<id forum>);
-- SELECT * FROM publico.buscar_tags_por_criador(<id criador>);
-- SELECT * FROM publico.listar_postagens_forum(<id forum>, <pagina | default 1>, <id usuario logado>);
-- SELECT * FROM publico.listar_arquivos_forum(<id forum>, <pagina | default 1>, <id usuario logado>);
-- SELECT * FROM publico.listar_comentarios_postagem(<id postagem>, <id usuario logado>);
-- SELECT * FROM publico.listar_tags();
-- SELECT * FROM publico.buscar_postagem(<id postagem>, <id usuario logado>);
-- SELECT * FROM publico.buscar_tags_relevantes(<chars>, <limite | default 5>);
-- SELECT * FROM publico.listar_tags_relacionadas_forum(<id forum>);
-- SELECT * FROM publico.listar_postagens_feed(<id usuario>, <pagina | default 1>);
-- SELECT * FROM publico.listar_anos_com_arquivo(<id forum>);
-- SELECT * FROM publico.listar_tags_arquivo_por_ano(<id forum>, <ano>);
-- SELECT * FROM publico.listar_postagens_arquivo(<id forum>, <ano>, <id tag>, <id usuario logado>);
-- SELECT * FROM publico.checar_se_usuario_segue_forum(<id usuario>, <id forum>);
-- SELECT * FROM publico.listar_postagens_usuario(<id usuario>, <pagina | default 1>, <id usuario logado>);
-- SELECT * FROM publico.listar_denuncias();
-- SELECT * FROM publico.listar_penalidades_usuario(<id usuario>);

-- retorna dados para autenticação e remove silêncio expirado automaticamente
CREATE OR REPLACE FUNCTION publico.dados_login_usuario(
	p_id INT DEFAULT NULL,
	p_email VARCHAR DEFAULT NULL,
	p_nome_usuario VARCHAR DEFAULT NULL
)
RETURNS SETOF privado.login_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_usuario_id INT;
BEGIN
	-- 1. Validar parâmetros
	IF p_id IS NULL AND p_email IS NULL AND p_nome_usuario IS NULL THEN
		RAISE EXCEPTION 'É necessário fornecer id, email ou nome_usuario.';
	END IF;

	-- 2. Descobrir o ID do usuário
	IF p_id IS NOT NULL THEN
		v_usuario_id := p_id;
	ELSIF p_email IS NOT NULL THEN
		SELECT id INTO v_usuario_id
		FROM privado.usuario
		WHERE email = p_email;
	ELSE
		SELECT id INTO v_usuario_id
		FROM privado.usuario
		WHERE nome_usuario = p_nome_usuario;
	END IF;

	-- 3. Verificar se o silêncio expirou
	UPDATE privado.penalidade
	SET removido_em = CURRENT_TIMESTAMP
	WHERE usuario_id = v_usuario_id
	  AND removido_em IS NULL
	  AND (aplicado_em + duracao) < CURRENT_TIMESTAMP;

	-- 4. Se algum silêncio expirou, reativar usuário
	IF FOUND THEN
		UPDATE privado.usuario
		SET status = 'ATIVO',
		    ultima_mudanca_status = CURRENT_TIMESTAMP
		WHERE id = v_usuario_id
		  AND status = 'SILENCIADO';
	END IF;

	-- 5. Retornar dados de login
	RETURN QUERY
	SELECT * FROM privado.login_usuario
	WHERE id = v_usuario_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_usuarios()
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.perfil_usuario;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_usuario_por_id (
	p_id INT,
	p_usuario_logado_id INT DEFAULT NULL
)
RETURNS TABLE (
	id INT,
	nome VARCHAR,
	nome_usuario VARCHAR,
	cargo VARCHAR,
	descricao VARCHAR,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	identidade_visual INT,
	a2f boolean,
	img_perfil TEXT,
	img_banner TEXT,
	seguidores BIGINT,
	segue BIGINT,
	karma BIGINT,
	usuario_logado_segue BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		perfil.*,
		CASE
			WHEN p_usuario_logado_id IS NULL THEN FALSE
			ELSE EXISTS (
				SELECT 1
				FROM privado.seguir_usuario AS seguir_usuario
				WHERE seguir_usuario.seguidor = p_usuario_logado_id
				AND seguir_usuario.seguido = p_id
			)
		END AS usuario_logado_segue
	FROM privado.perfil_usuario AS perfil
	WHERE perfil.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_usuario_por_nome_usuario (
	p_nome_usuario VARCHAR
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.perfil_usuario
	WHERE nome_usuario = p_nome_usuario;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_usuario_por_email (
	p_email VARCHAR
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_id INT;
BEGIN
	SELECT id INTO v_id
	FROM privado.usuario
	WHERE email = p_email;

	RETURN QUERY
	SELECT * FROM privado.perfil_usuario
	WHERE id = v_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_forum_por_nome (
	p_nome VARCHAR
)
RETURNS SETOF privado.visualizar_forum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.visualizar_forum
	WHERE nome = p_nome AND status = 'ATIVO';
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_forum_por_id (
	p_id INT
)
RETURNS SETOF privado.visualizar_forum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.visualizar_forum
	WHERE id = p_id AND status = 'ATIVO';
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_foruns()
RETURNS SETOF privado.visualizar_forum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.visualizar_forum
	WHERE status = 'ATIVO';
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_seguidores_forum (
	p_id INT
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT perfil_usuario.*
	FROM privado.perfil_usuario AS perfil_usuario
	JOIN privado.seguir_forum AS seguir_forum
		ON seguir_forum.usuario = perfil_usuario.id
	WHERE seguir_forum.forum = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_tags_por_criador(
	p_id INT
)
RETURNS SETOF privado.tag
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.tag
	WHERE criador = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_postagens_forum (
	p_forum_id INT,
	p_pagina INT DEFAULT 1,
	p_usuario_logado_id INT DEFAULT NULL
)
RETURNS TABLE (
	id INT,
	titulo VARCHAR,
	arquivo_nome TEXT,
	arquivo_caminho TEXT,
	forum INT,
	conteudo TEXT,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	tempo_de_vida INTERVAL,
	criador INT,
	nome_usuario VARCHAR,
	cargo VARCHAR,
	img_perfil TEXT,
	tags VARCHAR[],
	engajamento BIGINT,
	comentarios BIGINT,
	avaliacao_usuario_logado SMALLINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		postagem.*,
		COALESCE(
			(
				SELECT avaliacao.avaliacao
				FROM privado.avaliacao AS avaliacao
				WHERE avaliacao.usuario = p_usuario_logado_id
				  AND avaliacao.conteudo = postagem.id
			),
			0
		)::SMALLINT AS avaliacao_usuario_logado
	FROM privado.visualizar_postagem AS postagem
	WHERE postagem.forum = p_forum_id
	ORDER BY postagem.criado_em DESC
	LIMIT 20
	OFFSET (p_pagina - 1) * 20;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_arquivos_forum (
	p_forum_id INT,
	p_pagina INT DEFAULT 1
)
RETURNS SETOF privado.visualizar_postagem
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT *
	FROM privado.visualizar_postagem
	WHERE forum = p_forum_id AND arquivo_nome IS NOT NULL
	ORDER BY criado_em DESC
	LIMIT 20
	OFFSET (p_pagina - 1) * 20;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_comentarios_postagem (
	p_postagem_id INT,
	p_usuario_id INT DEFAULT NULL
)
RETURNS TABLE (
	id INT,
	conteudo_pai INT,
	nivel SMALLINT,
	conteudo_id INT,
	conteudo TEXT,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	tempo_de_vida INTERVAL,
	nome_usuario VARCHAR,
	cargo VARCHAR,
	img_perfil TEXT,
	engajamento BIGINT,
	avaliacao_usuario_logado SMALLINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	WITH RECURSIVE arvore AS (
		SELECT comentario.*
		FROM privado.exibir_comentarios AS comentario
		WHERE comentario.conteudo_pai = p_postagem_id

		UNION ALL

		SELECT filho.*
		FROM privado.exibir_comentarios AS filho
		JOIN arvore AS pai
			ON filho.conteudo_pai = pai.id
	)
	SELECT
		arvore.*,
		COALESCE(
			(
				SELECT avaliacao.avaliacao
				FROM privado.avaliacao AS avaliacao
				WHERE avaliacao.usuario = p_usuario_id
				AND avaliacao.conteudo = arvore.id
			),
			0
		)::SMALLINT AS avaliacao_usuario_logado
	FROM arvore
	ORDER BY nivel ASC, criado_em ASC;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_tags ()
RETURNS SETOF privado.tag
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.tag;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_postagem (
	p_id INT,
	p_usuario_logado_id INT DEFAULT NULL
)
RETURNS TABLE (
	id INT,
	titulo VARCHAR,
	arquivo_nome TEXT,
	arquivo_caminho TEXT,
	forum INT,
	conteudo TEXT,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	tempo_de_vida INTERVAL,
	criador INT,
	nome_usuario VARCHAR,
	cargo VARCHAR,
	img_perfil TEXT,
	tags VARCHAR[],
	engajamento BIGINT,
	comentarios BIGINT,
	avaliacao_usuario_logado SMALLINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		postagem.*,
		COALESCE(
			(
				SELECT avaliacao.avaliacao
				FROM privado.avaliacao AS avaliacao
				WHERE avaliacao.usuario = p_usuario_logado_id
				AND avaliacao.conteudo = p_id
			),
			0
		)::SMALLINT AS avaliacao_usuario_logado
	FROM privado.visualizar_postagem AS postagem
	WHERE postagem.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_tags_relevantes (
	p_busca VARCHAR,
	p_limite INT DEFAULT 5
)
RETURNS TABLE (
	id INT,
	tag VARCHAR,
	total_usos BIGINT,
	relevancia INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		tag.id,
		tag.tag,
		COALESCE(usos.total, 0) AS total_usos,
		(
			(
				CASE
					WHEN tag.tag ILIKE p_busca || '%' THEN 100
					WHEN tag.tag ILIKE '%' || p_busca || '%' THEN 50
					ELSE 0
				END
			)
			+
			COALESCE(usos.total, 0)
		)::INT AS relevancia

	FROM privado.tag AS tag
	LEFT JOIN (
		SELECT classificacao.tag, COUNT(*) AS total
		FROM privado.classificacao AS classificacao
		GROUP BY classificacao.tag
	) AS usos ON usos.tag = tag.id

	WHERE tag.tag ILIKE '%' || p_busca || '%'

	ORDER BY relevancia DESC
	LIMIT p_limite;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_tags_relacionadas_forum (
	p_forum INT
)
RETURNS SETOF privado.tag
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT tag.*
	FROM privado.tag AS tag
	JOIN privado.incluir_tag AS incluir_tag ON incluir_tag.tag = tag.id
	WHERE incluir_tag.forum = p_forum
	ORDER BY tag.tag ASC;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_postagens_feed (
	p_usuario_id INT,
	p_pagina INT DEFAULT 1
)
RETURNS TABLE (
	id INT,
	titulo VARCHAR,
	arquivo_nome TEXT,
	arquivo_caminho TEXT,
	forum INT,
	conteudo TEXT,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	tempo_de_vida INTERVAL,
	criador INT,
	nome_usuario VARCHAR,
	cargo VARCHAR,
	img_perfil TEXT,
	tags VARCHAR[],
	engajamento BIGINT,
	comentarios BIGINT,
	avaliacao_usuario_logado SMALLINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		postagem.*,
		COALESCE(
			(
				SELECT avaliacao.avaliacao
				FROM privado.avaliacao AS avaliacao
				WHERE avaliacao.usuario = p_usuario_id
				  AND avaliacao.conteudo = postagem.id
			),
			0
		)::SMALLINT AS avaliacao_usuario_logado
	FROM privado.visualizar_postagem AS postagem
	WHERE
		postagem.forum IN (
			SELECT seguir_forum.forum
			FROM privado.seguir_forum AS seguir_forum
			WHERE seguir_forum.usuario = p_usuario_id
		)
		OR
		postagem.criador IN (
			SELECT seguir_usuario.seguido
			FROM privado.seguir_usuario AS seguir_usuario
			WHERE seguir_usuario.seguidor = p_usuario_id
		)
	ORDER BY
		(postagem.engajamento + postagem.comentarios) /
		POWER(EXTRACT(EPOCH FROM NOW() - postagem.criado_em) / 3600 + 2, 1.5) DESC
	LIMIT 20
	OFFSET (p_pagina - 1) * 20;
END;
$$;

-- retorna os anos com postagens com arquivo em um fórum
CREATE OR REPLACE FUNCTION publico.listar_anos_com_arquivo (
	p_forum_id INT
)
RETURNS TABLE (ano INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT DISTINCT EXTRACT(YEAR FROM conteudo.criado_em)::INT AS ano
	FROM privado.postagem AS postagem
	JOIN privado.conteudo AS conteudo ON conteudo.id = postagem.id
	WHERE postagem.forum = p_forum_id
	AND postagem.arquivo_nome IS NOT NULL
	ORDER BY ano DESC;
END;
$$;

-- retorna as tags de postagens com arquivo em um fórum e ano específicos
CREATE OR REPLACE FUNCTION publico.listar_tags_arquivo_por_ano (
	p_forum_id INT,
	p_ano INT
)
RETURNS SETOF privado.tag
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT DISTINCT tag.*
	FROM privado.tag AS tag
	JOIN privado.classificacao AS classificacao
		ON classificacao.tag = tag.id
	JOIN privado.postagem AS postagem
		ON postagem.id = classificacao.postagem
	JOIN privado.conteudo AS conteudo
		ON conteudo.id = postagem.id
	WHERE postagem.forum = p_forum_id
	AND postagem.arquivo_nome IS NOT NULL
	AND EXTRACT(YEAR FROM conteudo.criado_em)::INT = p_ano
	ORDER BY tag.tag ASC;
END;
$$;

-- retorna postagens com arquivo filtradas por fórum, ano e tag
CREATE OR REPLACE FUNCTION publico.listar_postagens_arquivo (
	p_forum_id INT,
	p_ano INT,
	p_tag_id INT
)
RETURNS SETOF privado.visualizar_postagem
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT *
	FROM privado.visualizar_postagem AS postagem
	WHERE postagem.forum = p_forum_id
	AND postagem.arquivo_nome IS NOT NULL
	AND EXTRACT(YEAR FROM postagem.criado_em)::INT = p_ano
	AND p_tag_id IN (
		SELECT classificacao.tag
		FROM privado.classificacao AS classificacao
		WHERE classificacao.postagem = postagem.id
	)
	ORDER BY postagem.criado_em DESC;
END;
$$;

CREATE OR REPLACE FUNCTION publico.checar_se_usuario_segue_forum (
	p_usuario INT,
	p_forum INT
)
RETURNS TABLE (segue BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT EXISTS (
		SELECT 1
		FROM privado.seguir_forum
		WHERE usuario = p_usuario
		AND forum = p_forum
	) AS segue;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_postagens_usuario (
	p_usuario_id INT,
	p_pagina INT DEFAULT 1,
	p_usuario_logado_id INT DEFAULT NULL
)
RETURNS TABLE (
	id INT,
	titulo VARCHAR,
	arquivo_nome TEXT,
	arquivo_caminho TEXT,
	forum INT,
	conteudo TEXT,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	tempo_de_vida INTERVAL,
	criador INT,
	nome_usuario VARCHAR,
	cargo VARCHAR,
	img_perfil TEXT,
	tags VARCHAR[],
	engajamento BIGINT,
	comentarios BIGINT,
	avaliacao_usuario_logado SMALLINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		postagem.*,
		COALESCE(
			(
				SELECT avaliacao.avaliacao
				FROM privado.avaliacao AS avaliacao
				WHERE avaliacao.usuario = p_usuario_logado_id
				  AND avaliacao.conteudo = postagem.id
			),
			0
		)::SMALLINT AS avaliacao_usuario_logado
	FROM privado.visualizar_postagem AS postagem
	WHERE postagem.criador = p_usuario_id
	ORDER BY postagem.criado_em DESC
	LIMIT 20
	OFFSET (p_pagina - 1) * 20;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_denuncias ()
RETURNS TABLE (
	id INT,
	tipo VARCHAR,
	status VARCHAR,
	criado_em TIMESTAMPTZ,
	denunciante VARCHAR,
	usuario_denunciado INT,
	conteudo_denunciado INT,
	denunciado_strikes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		denuncia.id,
		denuncia.tipo,
		denuncia.status,
		denuncia.criado_em,
		usuario.nome_usuario AS denunciante,
		denuncia_usuario.usuario_denunciado,
		denuncia_conteudo.conteudo_denunciado,
		COALESCE(strikes.total, 0) AS denunciado_strikes

	FROM privado.denuncia AS denuncia

	JOIN privado.usuario AS usuario
		ON usuario.id = denuncia.denunciante

	LEFT JOIN privado.denuncia_usuario AS denuncia_usuario
		ON denuncia_usuario.id = denuncia.id

	LEFT JOIN privado.denuncia_conteudo AS denuncia_conteudo
		ON denuncia_conteudo.id = denuncia.id

	LEFT JOIN privado.conteudo AS conteudo
		ON conteudo.id = denuncia_conteudo.conteudo_denunciado

	LEFT JOIN (
		SELECT usuario_id, COUNT(*) AS total
		FROM privado.penalidade
		WHERE removido_em IS NULL
		AND strike_valido_ate > CURRENT_TIMESTAMP
		GROUP BY usuario_id
	) AS strikes ON strikes.usuario_id = COALESCE(
		denuncia_usuario.usuario_denunciado,
		conteudo.criador
	)
	WHERE denuncia.status = 'ABERTA'
	ORDER BY denuncia.criado_em ASC;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_penalidades_usuario (
	p_usuario_id INT
)
RETURNS TABLE (
	id INT,
	usuario_id INT,
	denuncia_id INT,
	duracao INTERVAL,
	aplicado_em TIMESTAMPTZ,
	strike_valido_ate TIMESTAMPTZ,
	removido_em TIMESTAMPTZ,
	strike_vigente BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT
		penalidade.id,
		penalidade.usuario_id,
		penalidade.denuncia_id,
		penalidade.duracao,
		penalidade.aplicado_em,
		penalidade.strike_valido_ate,
		penalidade.removido_em,
		(penalidade.removido_em IS NULL AND penalidade.strike_valido_ate > CURRENT_TIMESTAMP) AS strike_vigente
	FROM privado.penalidade AS penalidade
	WHERE penalidade.usuario_id = p_usuario_id
	ORDER BY penalidade.aplicado_em DESC;
END;
$$;