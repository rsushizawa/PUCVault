-- uso: FUNCTION publico.dados_login_usuario(p_email VARCHAR DEFAULT NULL, p_nome_usuario VARCHAR DEFAULT NULL)
-- exemplo: SELECT * FROM publico.dados_login_usuario(p_email := 'usuario@email.com');
-- exemplo: SELECT * FROM publico.dados_login_usuario(p_nome_usuario := 'fulano123');
-- exemplo: SELECT * FROM publico.dados_login_usuario(p_email := 'usuario@email.com', p_nome_usuario := 'fulano123');

-- uso: FUNCTION publico.listar_usuarios()
-- exemplo: SELECT * FROM publico.listar_usuarios();

-- uso: FUNCTION publico.buscar_usuario_por_id(p_id INT)
-- exemplo: SELECT * FROM publico.buscar_usuario_por_id(1);

-- uso: FUNCTION publico.buscar_usuario_por_nome_usuario(p_nome_usuario VARCHAR)
-- exemplo: SELECT * FROM publico.buscar_usuario_por_nome_usuario('fulano123');

-- uso: FUNCTION publico.buscar_usuario_por_email(p_email VARCHAR)
-- exemplo: SELECT * FROM publico.buscar_usuario_por_email('usuario@email.com');

-- uso: FUNCTION publico.buscar_forum_por_nome(p_nome VARCHAR)
-- exemplo: SELECT * FROM publico.buscar_forum_por_nome('Tecnologia');

-- uso: FUNCTION publico.listar_foruns()
-- exemplo: SELECT * FROM publico.listar_foruns();

-- uso: FUNCTION publico.listar_seguidores_forum(p_id INT)
-- exemplo: SELECT * FROM publico.listar_seguidores_forum(1);

-- uso: FUNCTION publico.buscar_tags_por_criador(p_id INT)
-- exemplo: SELECT * FROM publico.buscar_tags_por_criador(1);

-- uso: FUNCTION publico.listar_postagens_forum(p_forum_id INT, p_pagina INT DEFAULT 1)
-- exemplo: SELECT * FROM publico.listar_postagens_forum(1);
-- exemplo: SELECT * FROM publico.listar_postagens_forum(1, 2);

-- uso: FUNCTION publico.listar_arquivos_forum(p_forum_id INT, p_pagina INT DEFAULT 1)
-- exemplo: SELECT * FROM publico.listar_arquivos_forum(1);
-- exemplo: SELECT * FROM publico.listar_arquivos_forum(1, 2);

-- uso: FUNCTION publico.listar_comentarios_postagem(p_postagem_id INT)
-- exemplo: SELECT * FROM publico.listar_comentarios_postagem(1);

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