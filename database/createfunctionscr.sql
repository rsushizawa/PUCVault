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
RETURNS SETOF privado.forum
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

