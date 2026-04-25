-- uso: SELECT * FROM publico.dados_login_usuario(p_email := 'usuario@email.com');
-- uso: SELECT * FROM publico.dados_login_usuario(p_nome_usuario := 'joao123');
-- uso: SELECT * FROM publico.listar_usuarios();
-- uso: SELECT * FROM publico.buscar_usuario_por_id(1);
-- uso: SELECT * FROM publico.buscar_usuario_por_nome_usuario('joao123');
-- uso: SELECT * FROM publico.buscar_usuario_por_email('usuario@email.com');
-- uso: SELECT * FROM publico.buscar_forum_por_nome('tecnologia');
-- uso: SELECT * FROM publico.listar_foruns();
-- uso: SELECT * FROM publico.listar_seguidores_forum(1);
-- uso: SELECT * FROM publico.buscar_tags_por_criador(1);
-- uso: SELECT * FROM publico.listar_postagens_forum(1, p_pagina := 1);
-- uso: SELECT * FROM publico.listar_arquivos_forum(1, p_pagina := 1);
-- uso: SELECT * FROM publico.listar_comentarios_postagem(1);
-- uso: SELECT * FROM publico.listar_tags();
-- uso: SELECT * FROM publico.buscar_postagem(1);
-- uso: SELECT * FROM publico.buscar_tags_relevantes('tec', p_limite := 5);

CREATE OR REPLACE FUNCTION publico.dados_login_usuario(
	p_email VARCHAR DEFAULT NULL,
	p_nome_usuario VARCHAR DEFAULT NULL
)
RETURNS SETOF privado.login_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	-- Validar: pelo menos um parâmetro deve ser fornecido
	IF p_email IS NULL AND p_nome_usuario IS NULL THEN
		RAISE EXCEPTION 'É necessário fornecer email ou nome_usuario';
	END IF;
	
	-- Prioridade para email se ambos forem fornecidos
	IF p_email IS NOT NULL THEN
		RETURN QUERY
		SELECT * FROM privado.login_usuario
		WHERE email = p_email;
	ELSE
		RETURN QUERY
		SELECT * FROM privado.login_usuario
		WHERE nome_usuario = p_nome_usuario;
	END IF;
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
	p_id INT
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.perfil_usuario
	WHERE id = p_id;
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
	WHERE forum = p_forum_id
	ORDER BY criado_em DESC
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
	WHERE forum = p_forum_id AND arquivo IS NOT NULL
	ORDER BY criado_em DESC
	LIMIT 20
	OFFSET (p_pagina - 1) * 20;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_comentarios_postagem (
	p_postagem_id INT
)
RETURNS SETOF privado.exibir_comentarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	WITH RECURSIVE arvore AS (
		-- base: comentários diretos da postagem (nível 1)
		SELECT comentario.*
		FROM privado.exibir_comentarios AS comentario
		WHERE comentario.conteudo_pai = p_postagem_id

		UNION ALL

		-- recursão: filhos de cada comentário
		SELECT filho.*
		FROM privado.exibir_comentarios AS filho
		JOIN arvore AS pai
			ON filho.conteudo_pai = pai.id
	)
	SELECT * FROM arvore
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
	p_id INT
)
RETURNS SETOF privado.visualizar_postagem
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	RETURN QUERY
	SELECT * FROM privado.visualizar_postagem
	WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_tags_relevantes (
	p_busca VARCHAR,
	p_limite INT DEFAULT 5
)
RETURNS TABLE (
	id INT,
	tag VARCHAR,
	status VARCHAR,
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
		tag.status,
		COALESCE(usos.total, 0) AS total_usos,
		(
			CASE WHEN tag.status = 'ATIVO' THEN 1000 ELSE 0 END
			+
			CASE
				WHEN tag.tag ILIKE p_busca || '%' THEN 100
				WHEN tag.tag ILIKE '%' || p_busca || '%' THEN 50
				ELSE 0
			END
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
	SELECT tag. *
	FROM privado.tag AS tag
	JOIN privado.incluir_tag AS incluir_tag
		ON incluir_tag.tag = tag.id
	WHERE incluir_tag.forum = p_forum;
END;
$$;