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
	JOIN privado.incluir_tag AS incluir_tag
		ON incluir_tag.tag = tag.id
	WHERE incluir_tag.forum = p_forum
	ORDER BY tag.tag ASC;
END;
$$;

CREATE OR REPLACE FUNCTION publico.listar_postagens_feed (
	p_usuario_id INT,
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

-- retorna os anos que possuem postagens com arquivo em um fórum
-- uso: SELECT * FROM publico.listar_anos_com_arquivo(<id do fórum>);
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
	JOIN privado.conteudo AS conteudo
		ON conteudo.id = postagem.id
	WHERE postagem.forum = p_forum_id
	AND postagem.arquivo IS NOT NULL
	ORDER BY ano DESC;
END;
$$;

-- retorna as tags que possuem postagens com arquivo em um fórum e ano específicos
-- uso: SELECT * FROM publico.listar_tags_arquivo_por_ano(<id do fórum>, <ano>);
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
	AND postagem.arquivo IS NOT NULL
	AND EXTRACT(YEAR FROM conteudo.criado_em)::INT = p_ano
	ORDER BY tag.tag ASC;
END;
$$;

-- retorna postagens com arquivo filtradas por fórum, ano e tag
-- uso: SELECT * FROM publico.listar_postagens_arquivo(<id do fórum>, <ano>, <id da tag>);
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
	AND postagem.arquivo IS NOT NULL
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


CREATE OR REPLACE FUNCTION privado.verificar_e_silenciar_usuario(p_usuario_id INT) 
RETURNS VOID AS $$
DECLARE
    v_score INT;
    v_status_atual VARCHAR(15);
BEGIN
    SELECT score_comportamento, status INTO v_score, v_status_atual
    FROM privado.usuario
    WHERE id = p_usuario_id;

    -- Limite de score para silenciar o usuário 
    IF v_score <= -50 AND v_status_atual = 'ATIVO' THEN
        UPDATE privado.usuario
        SET status = 'SILENCIADO',
            ultima_mudanca_status = CURRENT_TIMESTAMP
        WHERE id = p_usuario_id;

        INSERT INTO privado.historico_penalidade (
            usuario_id, tipo_penalidade, pontuacao_aplicada, motivo, aplicado_por
        )
        VALUES (
            p_usuario_id, 'Silenciado Automaticamente', 0, 'Score de comportamento abaixo do limite (-50)', NULL
        );
    END IF;
END;
$$
LANGUAGE plpgsql;
