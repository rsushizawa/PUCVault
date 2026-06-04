-- CALL publico.inserir_usuario(<nome>, <nome de usuário>, <email>, <senha hash>);
-- CALL publico.atualizar_nome_usuario(<id do usuário>, <novo nome>);
-- CALL publico.atualizar_senha_usuario(<id do usuário>, <nova senha hash>);
-- CALL publico.deletar_usuario(<id do usuário>);
-- CALL publico.alternar_status_usuario(<id do usuário>);
-- CALL publico.alterar_cargo_usuario(<id do executor>, <id do alvo>, <novo cargo>);
-- CALL publico.atualizar_identidade_visual(<id da identidade visual>, <campo ('perfil' | 'banner')>, <novo id da imagem>);
-- CALL publico.inserir_forum(<titulo>, <descricao>, <id do criador>);
-- CALL publico.validar_forum(<id do fórum>, <id do validador>, <'ATIVO' | 'RECUSADO'>);
-- CALL publico.atualizar_descricao_forum(<id do fórum>, <id do usuário>, <nova descrição>);
-- CALL publico.inserir_tag(<tag>, <id do criador>);
-- CALL publico.inserir_postagem(<titulo>, <conteudo>, <id do criador>, <id do fórum>, <id do arquivo>, <ids das tags>);
-- CALL publico.inserir_comentario(<conteudo>, <id do criador>, <id do conteudo pai>);
-- CALL publico.deletar_conteudo(<id do conteudo>, <id do executor>);
-- CALL publico.avaliar_conteudo(<id do usuário>, <id do conteudo>, <avaliação (1 | -1 | 0 para remover)>);
-- CALL publico.inserir_denuncia_usuario(<tipo>, <id do denunciante>, <id do denunciado>);
-- CALL publico.inserir_denuncia_conteudo(<tipo>, <id do denunciante>, <id do conteudo denunciado>);
-- CALL publico.resolver_denuncia(<id da denúncia>, <id do executor>, <'RESOLVIDA' | 'IGNORADA'>);
-- CALL publico.alternar_seguir_forum(<id do usuário>, <id do fórum>);
-- CALL publico.alternar_seguir_usuario(<id do seguidor>, <id do seguido>);
-- CALL publico.incluir_tag_forum(<id do usuário>, <id do fórum>, <id da tag>);
-- CALL publico.remover_tag_forum(<id do usuário>, <id do fórum>, <id da tag>);

-- procedure para inserção de usuário atualizada
-- uso: CALL publico.inserir_usuario(<nome>, <nome de usuário>, <email>, <senha hash>);
CREATE PROCEDURE publico.inserir_usuario (
	p_nome VARCHAR,
	p_nome_usuario VARCHAR,
	p_email VARCHAR,
	p_senha_hash VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_identidade_visual INT;
BEGIN
	INSERT INTO privado.identidade_visual (img_perfil, img_banner)
	VALUES (NULL, NULL)
	RETURNING id INTO v_identidade_visual;

	INSERT INTO privado.usuario (nome, nome_usuario, email, senha_hash, identidade_visual)
	VALUES (p_nome, p_nome_usuario, p_email, p_senha_hash, v_identidade_visual);
END;
$$;

-- procedure para atualizar descrição do usuário
-- uso: CALL publico.atualizar_descricao_usuario(<id do usuário>, <nova descrição>);
CREATE PROCEDURE publico.atualizar_descricao_usuario (
	p_usuario_id INT,
	p_nova_descricao VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	UPDATE privado.usuario
	SET descricao = p_nova_descricao
	WHERE id = p_usuario_id;
END;
$$;

-- uso: CALL publico.atualizar_nome_usuario(<id do usuário>, <novo nome>);
CREATE PROCEDURE publico.atualizar_nome_usuario (
	p_usuario_id INT,
	p_novo_nome VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	UPDATE privado.usuario
	SET nome = p_novo_nome
	WHERE id = p_usuario_id;
END;
$$;

-- uso: CALL publico.atualizar_senha_usuario(<id do usuário>, <nova senha hash>);
CREATE PROCEDURE publico.atualizar_senha_usuario (
	p_usuario_id INT,
	p_nova_senha_hash VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	UPDATE privado.usuario
	SET senha_hash = p_nova_senha_hash
	WHERE id = p_usuario_id;
END;
$$;

-- uso: CALL publico.deletar_usuario(<id usuário>);
-- Sempre faz soft delete (excluido_em) + apaga conteúdo.
-- Hard delete só ocorre se o usuário não tem fóruns, tags OU denúncias.
-- uso: CALL publico.deletar_usuario(<id usuário>, <tipo exclusão>);
-- tipo_exclusao: 'BANIMENTO' (mantém email) | 'CONTA' (libera email)s
CREATE OR REPLACE PROCEDURE publico.deletar_usuario (
	p_usuario_id INT,
	p_tipo_exclusao VARCHAR DEFAULT 'CONTA'
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_identidade_visual INT;
	v_tem_forum BOOLEAN;
	v_tem_tag BOOLEAN;
	v_tem_denuncia BOOLEAN;
	v_cargo VARCHAR(15);
BEGIN
	SELECT identidade_visual, cargo INTO v_identidade_visual, v_cargo
	FROM privado.usuario
	WHERE id = p_usuario_id;

	IF v_cargo = 'SUPERADMIN' THEN
		RAISE EXCEPTION 'Um usuário SUPERADMIN não pode ser deletado / banido';
	END IF;

	SELECT
		EXISTS (SELECT 1 FROM privado.forum    WHERE criador     = p_usuario_id),
		EXISTS (SELECT 1 FROM privado.tag      WHERE criador     = p_usuario_id),
		EXISTS (SELECT 1 FROM privado.denuncia WHERE denunciante = p_usuario_id)
	INTO v_tem_forum, v_tem_tag, v_tem_denuncia;

	-- Sempre apaga o conteúdo do usuário
	DELETE FROM privado.conteudo
	WHERE criador = p_usuario_id;

	IF v_tem_forum OR v_tem_tag OR v_tem_denuncia THEN
		-- Soft delete: preserva fóruns, tags e denúncias
		IF p_tipo_exclusao = 'CONTA' THEN
			UPDATE privado.usuario
			SET email = NULL,
			    excluido_em = CURRENT_TIMESTAMP
			WHERE id = p_usuario_id;
		ELSE
			UPDATE privado.usuario
			SET excluido_em = CURRENT_TIMESTAMP
			WHERE id = p_usuario_id;
		END IF;
	ELSE
		-- Nada pendente: pode fazer hard delete
		DELETE FROM privado.usuario
		WHERE id = p_usuario_id;

		DELETE FROM privado.identidade_visual
		WHERE id = v_identidade_visual;
	END IF;
END;
$$;

-- alterna entre status ATIVO e SILENCIADO do usuário
-- uso: CALL publico.alternar_status_usuario(<id do usuário>);
CREATE PROCEDURE publico.alternar_status_usuario (
	p_usuario_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	UPDATE privado.usuario
		SET
		status = CASE
			WHEN status = 'ATIVO' THEN 'SILENCIADO'
			ELSE 'ATIVO'
		END,
		ultima_mudanca_status = CURRENT_TIMESTAMP
	WHERE id = p_usuario_id;
END;
$$;

-- altera cargo de outro usuário com regras de permissão e segurança
-- uso: CALL publico.alterar_cargo_usuario(<id do executor>, <id do alvo>, <novo cargo>);
CREATE PROCEDURE publico.alterar_cargo_usuario (
	p_executor_id INT,
	p_alvo_id INT,
	p_novo_cargo VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_cargo_executor VARCHAR(15);
	v_cargo_alvo VARCHAR(15);
BEGIN
	SELECT
		MAX(CASE WHEN id = p_executor_id THEN cargo END),
		MAX(CASE WHEN id = p_alvo_id THEN cargo END)
	INTO v_cargo_executor, v_cargo_alvo
	FROM privado.usuario
	WHERE id IN (p_executor_id, p_alvo_id);

	IF p_executor_id = p_alvo_id THEN
		RAISE EXCEPTION 'Usuário não pode alterar o próprio cargo.';
	END IF;

	IF p_novo_cargo NOT IN ('USUARIO', 'VALIDADOR', 'ADMIN', 'SUPERADMIN') THEN
		RAISE EXCEPTION 'Cargo inválido: %.', p_novo_cargo;
	END IF;

	IF v_cargo_executor = 'SUPERADMIN' THEN
		IF v_cargo_alvo = 'SUPERADMIN' THEN
			RAISE EXCEPTION 'SUPERADMIN não pode alterar o cargo de outro SUPERADMIN.';
		END IF;
		IF p_novo_cargo = 'SUPERADMIN' THEN
			RAISE EXCEPTION 'O cargo SUPERADMIN só pode ser concedido diretamente no banco.';
		END IF;
	ELSIF v_cargo_executor = 'ADMIN' THEN
		IF v_cargo_alvo IN ('SUPERADMIN', 'ADMIN') THEN
			RAISE EXCEPTION 'ADMIN não pode alterar o cargo de SUPERADMIN ou ADMIN.';
		END IF;
		IF p_novo_cargo IN ('ADMIN', 'SUPERADMIN') THEN
			RAISE EXCEPTION 'ADMIN não pode conceder o cargo de ADMIN ou SUPERADMIN.';
		END IF;
	ELSE
		RAISE EXCEPTION 'Permissão negada: cargo insuficiente para alterar cargos.';
	END IF;

	UPDATE privado.usuario
	SET cargo = p_novo_cargo
	WHERE id = p_alvo_id;
END;
$$;

-- cria um fórum novo se o criador estiver ativo e não excluído
-- uso: CALL publico.inserir_forum(<titulo>, <descricao>, <id do criador>);
CREATE PROCEDURE publico.inserir_forum (
	p_nome VARCHAR,
	p_descricao VARCHAR,
	p_criador INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_identidade_visual INT;
	v_status_criador VARCHAR(15);
	v_excluido_criador TIMESTAMP WITH TIME ZONE;
BEGIN
	SELECT usuario.status, usuario.excluido_em
	INTO v_status_criador, v_excluido_criador
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_criador;

	IF v_excluido_criador IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode criar fórum.';
	END IF;

	IF v_status_criador = 'SILENCIADO' THEN
		RAISE EXCEPTION 'Usuário silenciado não pode criar fórum.';
	END IF;

	INSERT INTO privado.identidade_visual (img_perfil, img_banner)
	VALUES (NULL, NULL)
	RETURNING id INTO v_identidade_visual;

	INSERT INTO privado.forum (nome, descricao, criador, identidade_visual)
	VALUES (p_nome, p_descricao, p_criador, v_identidade_visual);
END;
$$;

-- valida fórum em espera apenas por validador/admin
-- uso: CALL publico.validar_forum(<id do fórum>, <id do validador>, <'ATIVO' | 'RECUSADO'>);
CREATE PROCEDURE publico.validar_forum (
	p_forum_id INT,
	p_validador_id INT,
	p_novo_status VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_status_forum VARCHAR(20);
	v_cargo_validador VARCHAR(15);
BEGIN
	SELECT forum.status, usuario.cargo
	INTO v_status_forum, v_cargo_validador
	FROM privado.forum AS forum
	JOIN privado.usuario AS usuario ON usuario.id = p_validador_id
	WHERE forum.id = p_forum_id;

	IF v_status_forum != 'ESPERA' THEN
		RETURN;
	END IF;

	IF v_cargo_validador = 'USUARIO' THEN
		RAISE EXCEPTION 'Permissão negada: cargo insuficiente para validar fórum.';
	END IF;

	IF p_novo_status NOT IN ('ATIVO', 'RECUSADO') THEN
		RAISE EXCEPTION 'Status inválido: %. Use ''ATIVO'' ou ''RECUSADO''.', p_novo_status;
	END IF;

	UPDATE privado.forum
	SET
		status = p_novo_status,
		status_modificado_em = CURRENT_TIMESTAMP,
		validador = p_validador_id
	WHERE id = p_forum_id;
END;
$$;

-- atualiza descrição apenas se o usuário for criador e o fórum estiver ATIVO
-- uso: CALL publico.atualizar_descricao_forum(<id do fórum>, <id do usuário>, <nova descrição>);
CREATE PROCEDURE publico.atualizar_descricao_forum (
	p_forum_id INT,
	p_usuario_id INT,
	p_nova_descricao VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_criador_forum INT;
	v_status_forum VARCHAR(20);
BEGIN
	SELECT forum.criador, forum.status
	INTO v_criador_forum, v_status_forum
	FROM privado.forum AS forum
	WHERE forum.id = p_forum_id;

	IF v_status_forum != 'ATIVO' THEN
		RETURN;
	END IF;

	IF v_criador_forum != p_usuario_id THEN
		RETURN;
	END IF;

	UPDATE privado.forum
	SET descricao = p_nova_descricao
	WHERE id = p_forum_id;
END;
$$;

-- atualiza imagem de perfil ou banner na identidade visual
-- uso: CALL publico.atualizar_identidade_visual(<id da identidade visual>, <campo ('perfil' | 'banner')>, <novo id da imagem>);
CREATE PROCEDURE publico.atualizar_identidade_visual (
	p_identidade_visual_id INT,
	p_campo VARCHAR,
	p_novo_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	IF p_campo = 'perfil' THEN
		UPDATE privado.identidade_visual
		SET img_perfil = p_novo_id,
		    perfil_modificado_em = CURRENT_TIMESTAMP
		WHERE id = p_identidade_visual_id;
	ELSIF p_campo = 'banner' THEN
		UPDATE privado.identidade_visual
		SET img_banner = p_novo_id,
		    banner_modificado_em = CURRENT_TIMESTAMP
		WHERE id = p_identidade_visual_id;
	ELSE
		RAISE EXCEPTION 'Campo inválido: %. Use ''perfil'' ou ''banner''.', p_campo;
	END IF;
END;
$$;

-- uso: CALL publico.inserir_tag(<tag>, <id do criador>);
-- somente usuários com cargo VALIDADOR ou superior podem criar tags
CREATE PROCEDURE publico.inserir_tag (
	p_tag VARCHAR,
	p_criador INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_cargo_criador VARCHAR(15);
	v_excluido_criador TIMESTAMP WITH TIME ZONE;
	v_status_criador VARCHAR(15);
BEGIN
	SELECT usuario.cargo, usuario.excluido_em, usuario.status
	INTO v_cargo_criador, v_excluido_criador, v_status_criador
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_criador;

	IF v_excluido_criador IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode criar tag.';
	END IF;

	IF v_status_criador = 'SILENCIADO' THEN
		RAISE EXCEPTION 'Usuário silenciado não pode criar tag.';
	END IF;

	IF v_cargo_criador NOT IN ('VALIDADOR', 'ADMIN', 'SUPERADMIN') THEN
		RAISE EXCEPTION 'Permissão negada: cargo insuficiente para criar tags.';
	END IF;

	INSERT INTO privado.tag (tag, criador)
	VALUES (p_tag, p_criador);
END;
$$;

-- insere conteúdo, postagem e classificações de tags com validação de usuário e fórum ativo
-- uso: CALL publico.inserir_postagem(<titulo>, <conteudo>, <id do criador>, <id do fórum>, <nome do arquivo>, <caminho do arquivo>, <ids das tags>);
CREATE OR REPLACE PROCEDURE publico.inserir_postagem (
  p_titulo VARCHAR,
  p_conteudo TEXT,
  p_criador INT,
  p_forum INT,
  p_arquivo_nome TEXT,
  p_arquivo_caminho TEXT,
  p_tags INT[] DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_conteudo_id INT;
  v_status_usuario VARCHAR(15);
  v_status_forum VARCHAR(20);
BEGIN
  -- 1. Validar Usuário (Status e Exclusão)
  SELECT status, excluido_em INTO v_status_usuario
  FROM privado.usuario
  WHERE id = p_criador AND excluido_em IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário inexistente ou excluído.';
  END IF;

  IF v_status_usuario = 'SILENCIADO' THEN
    RAISE EXCEPTION 'Usuário silenciado não pode criar postagem.';
  END IF;

  -- 2. Validar se o Fórum está ATIVO
  SELECT status INTO v_status_forum
  FROM privado.forum
  WHERE id = p_forum;

  IF v_status_forum IS NULL OR v_status_forum != 'ATIVO' THEN
    RAISE EXCEPTION 'Postagens só podem ser criadas em fóruns ativos.';
  END IF;

  -- 3. Inserir na tabela pai (conteudo)
  INSERT INTO privado.conteudo (conteudo, criador)
  VALUES (p_conteudo, p_criador)
  RETURNING id INTO v_conteudo_id;

  -- 4. Inserir na tabela filha (postagem) - CORRIGIDO NOMES E VALORES
  INSERT INTO privado.postagem (id, titulo, arquivo_nome, arquivo_caminho, forum)
  VALUES (v_conteudo_id, p_titulo, p_arquivo_nome, p_arquivo_caminho, p_forum);

  -- 5. Inserir Tags (usando DISTINCT para evitar erros de duplicata no array)
  IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
    INSERT INTO privado.classificacao (postagem, tag)
    SELECT DISTINCT v_conteudo_id, t_id
    FROM UNNEST(p_tags) AS t_id;
  END IF;

END;
$$;

-- insere comentário aninhado, respeitando limite de profundidade
-- uso: CALL publico.inserir_comentario(<conteudo>, <id do criador>, <id do conteudo pai>);
CREATE PROCEDURE publico.inserir_comentario (
	p_conteudo TEXT,
	p_criador INT,
	p_conteudo_pai INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_conteudo INT;
	v_status_criador VARCHAR(15);
	v_excluido_criador TIMESTAMP WITH TIME ZONE;
	v_nivel_pai SMALLINT;
	v_nivel SMALLINT;
BEGIN
	SELECT usuario.status, usuario.excluido_em
	INTO v_status_criador, v_excluido_criador
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_criador;

	IF v_excluido_criador IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode comentar.';
	END IF;

	IF v_status_criador = 'SILENCIADO' THEN
		RAISE EXCEPTION 'Usuário silenciado não pode comentar.';
	END IF;

	SELECT comentario.nivel
	INTO v_nivel_pai
	FROM privado.comentario AS comentario
	WHERE comentario.id = p_conteudo_pai;

	v_nivel := COALESCE(v_nivel_pai + 1, 1);

	IF v_nivel > 5 THEN
		RETURN;
	END IF;

	INSERT INTO privado.conteudo (conteudo, criador)
	VALUES (p_conteudo, p_criador)
	RETURNING id INTO v_conteudo;

	INSERT INTO privado.comentario (id, conteudo_pai, nivel)
	VALUES (v_conteudo, p_conteudo_pai, v_nivel);
END;
$$;

-- remove conteúdo apenas pelo autor ou SUPERADMIN
-- uso: CALL publico.deletar_conteudo(<id do conteudo>, <id do executor>);
CREATE PROCEDURE publico.deletar_conteudo (
	p_conteudo_id INT,
	p_executor_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_criador_conteudo INT;
	v_cargo_executor VARCHAR(15);
BEGIN
	SELECT conteudo.criador, usuario.cargo
	INTO v_criador_conteudo, v_cargo_executor
	FROM privado.conteudo AS conteudo
	JOIN privado.usuario AS usuario ON usuario.id = p_executor_id
	WHERE conteudo.id = p_conteudo_id;

	IF v_criador_conteudo != p_executor_id AND v_cargo_executor != 'SUPERADMIN' THEN
		RETURN;
	END IF;

	DELETE FROM privado.conteudo
	WHERE id = p_conteudo_id;
END;
$$;

-- insere/atualiza/remove avaliação de conteúdo; impede autoavaliação
-- uso: CALL publico.avaliar_conteudo(<id do usuário>, <id do conteudo>, <avaliação (1 | -1 | 0)>);
CREATE OR REPLACE PROCEDURE publico.avaliar_conteudo (
	p_usuario_id INT,
	p_conteudo_id INT,
	p_avaliacao SMALLINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
 v_status_usuario VARCHAR(15);
	v_excluido_usuario TIMESTAMP WITH TIME ZONE;
	v_criador_conteudo INT;
	v_avaliacao_atual SMALLINT;
BEGIN
	-- Buscar dados do usuário
	SELECT usuario.status, usuario.excluido_em
	INTO v_status_usuario, v_excluido_usuario
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_usuario_id;

	-- Verificar se usuário existe
	IF v_status_usuario IS NULL AND v_excluido_usuario IS NULL THEN
		RAISE EXCEPTION 'Usuário com ID % não encontrado.', p_usuario_id;
	END IF;

	-- Verificar se usuário está excluído
	IF v_excluido_usuario IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode avaliar conteúdo.';
	END IF;

	-- Verificar se usuário está silenciado
	IF v_status_usuario = 'SILENCIADO' THEN
		RAISE EXCEPTION 'Usuário silenciado não pode avaliar conteúdo.';
	END IF;

	SELECT criador INTO v_criador_conteudo
	FROM privado.conteudo
	WHERE id = p_conteudo_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Conteúdo com ID % não encontrado.', p_conteudo_id;
	END IF;

	IF v_criador_conteudo = p_usuario_id THEN
		RAISE EXCEPTION 'Usuário não pode avaliar o próprio conteúdo.';
	END IF;

	-- Buscar avaliação atual
	SELECT avaliacao.avaliacao
	INTO v_avaliacao_atual
	FROM privado.avaliacao AS avaliacao
	WHERE avaliacao.usuario = p_usuario_id
	AND avaliacao.conteudo = p_conteudo_id;

	-- Remover avaliação
	IF p_avaliacao = 0 THEN
		IF v_avaliacao_atual IS NOT NULL THEN
			DELETE FROM privado.avaliacao
			WHERE usuario = p_usuario_id
			AND conteudo = p_conteudo_id;
		END IF;
		RETURN;
	END IF;

	-- Validar valor da avaliação
	IF p_avaliacao NOT IN (1, -1) THEN
		RAISE EXCEPTION 'Avaliação inválida: use 1 (upvote), -1 (downvote) ou 0 (remover).';
	END IF;

	-- Se já tem a mesma avaliação, não faz nada
	IF v_avaliacao_atual IS NOT NULL AND v_avaliacao_atual = p_avaliacao THEN
		RETURN;
	END IF;

	-- Inserir ou atualizar
	IF v_avaliacao_atual IS NULL THEN
		INSERT INTO privado.avaliacao (usuario, conteudo, avaliacao)
		VALUES (p_usuario_id, p_conteudo_id, p_avaliacao);
	ELSE
		UPDATE privado.avaliacao
		SET avaliacao = p_avaliacao
		WHERE usuario = p_usuario_id
		AND conteudo = p_conteudo_id;
	END IF;
END;
$$;

-- registra denúncia de usuário, evitando duplicatas e auto-denúncia
-- uso: CALL publico.inserir_denuncia_usuario(<tipo>, <id do denunciante>, <id do denunciado>);
CREATE OR REPLACE PROCEDURE publico.inserir_denuncia_usuario (
	p_tipo VARCHAR,
	p_denunciante_id INT,
	p_denunciado_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_status_denunciante VARCHAR(15);
	v_excluido_denunciante TIMESTAMP WITH TIME ZONE;
	v_excluido_denunciado TIMESTAMP WITH TIME ZONE;
	v_denuncia INT;
	v_duplicata BOOLEAN;
BEGIN
	SELECT usuario.status, usuario.excluido_em
	INTO v_status_denunciante, v_excluido_denunciante
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_denunciante_id;

	IF v_excluido_denunciante IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode denunciar.';
	END IF;

	IF v_status_denunciante = 'SILENCIADO' THEN
		RAISE EXCEPTION 'Usuário silenciado não pode denunciar.';
	END IF;

	IF p_denunciante_id = p_denunciado_id THEN
		RAISE EXCEPTION 'Usuário não pode denunciar a si mesmo.';
	END IF;

	SELECT usuario.excluido_em
	INTO v_excluido_denunciado
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_denunciado_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Usuário denunciado não encontrado.';
	END IF;

	IF v_excluido_denunciado IS NOT NULL THEN
		RAISE EXCEPTION 'Não é possível denunciar um usuário excluído.';
	END IF;

	SELECT EXISTS (
		SELECT 1
		FROM privado.denuncia AS denuncia
		JOIN privado.denuncia_usuario AS denuncia_usuario ON denuncia_usuario.id = denuncia.id
		WHERE denuncia.denunciante = p_denunciante_id
		AND denuncia_usuario.usuario_denunciado = p_denunciado_id
	) INTO v_duplicata;

	IF v_duplicata THEN
		RETURN;
	END IF;

	INSERT INTO privado.denuncia (tipo, denunciante)
	VALUES (p_tipo, p_denunciante_id)
	RETURNING id INTO v_denuncia;

	INSERT INTO privado.denuncia_usuario (id, usuario_denunciado)
	VALUES (v_denuncia, p_denunciado_id);
END;
$$;

-- registra denúncia de conteúdo, evitando duplicatas e auto-denúncia
-- uso: CALL publico.inserir_denuncia_conteudo(<tipo>, <id do denunciante>, <id do conteudo>);
CREATE PROCEDURE publico.inserir_denuncia_conteudo (
	p_tipo VARCHAR,
	p_denunciante_id INT,
	p_conteudo_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_status_denunciante VARCHAR(15);
	v_excluido_denunciante TIMESTAMP WITH TIME ZONE;
	v_denuncia INT;
	v_duplicata BOOLEAN;
	v_criador_conteudo INT;
BEGIN
	SELECT usuario.status, usuario.excluido_em
	INTO v_status_denunciante, v_excluido_denunciante
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_denunciante_id;

	IF v_excluido_denunciante IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode denunciar.';
	END IF;

	IF v_status_denunciante = 'SILENCIADO' THEN
		RAISE EXCEPTION 'Usuário silenciado não pode denunciar.';
	END IF;

	SELECT conteudo.criador
	INTO v_criador_conteudo
	FROM privado.conteudo AS conteudo
	WHERE conteudo.id = p_conteudo_id;

	IF v_criador_conteudo = p_denunciante_id THEN
		RAISE EXCEPTION 'Usuário não pode denunciar o próprio conteúdo.';
	END IF;

	SELECT EXISTS (
		SELECT 1
		FROM privado.denuncia AS denuncia
		JOIN privado.denuncia_conteudo AS denuncia_conteudo ON denuncia_conteudo.id = denuncia.id
		WHERE denuncia.denunciante = p_denunciante_id
		AND denuncia_conteudo.conteudo_denunciado = p_conteudo_id
	) INTO v_duplicata;

	IF v_duplicata THEN
		RETURN;
	END IF;

	INSERT INTO privado.denuncia (tipo, denunciante)
	VALUES (p_tipo, p_denunciante_id)
	RETURNING id INTO v_denuncia;

	INSERT INTO privado.denuncia_conteudo (id, conteudo_denunciado)
	VALUES (v_denuncia, p_conteudo_id);
END;
$$;

-- uso: CALL publico.resolver_denuncia(<id denúncia>, <id executor>, <'RESOLVIDA' | 'IGNORADA'>, <punição>, <tempo silêncio>);
-- punicao: 0 = exclui postagem, 1 = exclui postagem + silencia, 2 = exclui usuário
-- tempo_silencio: INTERVAL (ex: '1 hour', '12 hours', '1 day', '3 days', '7 days')
CREATE OR REPLACE PROCEDURE publico.resolver_denuncia (
	p_denuncia_id INT,
	p_executor_id INT,
	p_novo_status VARCHAR,
	p_punicao SMALLINT DEFAULT NULL,
	p_tempo_silencio INTERVAL DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_status_denuncia VARCHAR(20);
	v_cargo_executor VARCHAR(15);
	v_conteudo_denunciado INT;
	v_usuario_denunciado INT;
	v_criador_conteudo INT;
	v_strike_valido_ate TIMESTAMPTZ;
	v_total_strikes INT;
BEGIN
	-- 1. Buscar dados da denúncia + cargo do executor
	SELECT denuncia.status, usuario.cargo, dc.conteudo_denunciado, du.usuario_denunciado
	INTO v_status_denuncia, v_cargo_executor, v_conteudo_denunciado, v_usuario_denunciado
	FROM privado.denuncia AS denuncia
	JOIN privado.usuario AS usuario ON usuario.id = p_executor_id
	LEFT JOIN privado.denuncia_conteudo AS dc ON dc.id = denuncia.id
	LEFT JOIN privado.denuncia_usuario AS du ON du.id = denuncia.id
	WHERE denuncia.id = p_denuncia_id;

	-- 2. Validações
	IF v_status_denuncia != 'ABERTA' THEN
		RETURN;
	END IF;

	IF v_cargo_executor NOT IN ('ADMIN', 'SUPERADMIN') THEN
		RAISE EXCEPTION 'Permissão negada: cargo insuficiente para resolver denúncia.';
	END IF;

	IF p_novo_status NOT IN ('RESOLVIDA', 'IGNORADA') THEN
		RAISE EXCEPTION 'Status inválido: %. Use ''RESOLVIDA'' ou ''IGNORADA''.', p_novo_status;
	END IF;

	-- 3. Marcar denúncia como resolvida
	UPDATE privado.denuncia
	SET status = p_novo_status,
	    resolvido_em = CURRENT_TIMESTAMP,
	    resolvido_por = p_executor_id
	WHERE id = p_denuncia_id;

	-- 4. Se IGNORADA ou sem punição, encerra aqui
	IF p_novo_status = 'IGNORADA' OR p_punicao IS NULL THEN
		RETURN;
	END IF;

	-- 5. Aplicar punição
	IF p_punicao = 0 THEN
		-- Exclui apenas a postagem denunciada
		IF v_conteudo_denunciado IS NOT NULL THEN
			DELETE FROM privado.conteudo WHERE id = v_conteudo_denunciado;
		END IF;

	ELSIF p_punicao = 1 THEN
		-- Exclui a postagem
		IF v_conteudo_denunciado IS NOT NULL THEN
			SELECT criador INTO v_criador_conteudo
			FROM privado.conteudo WHERE id = v_conteudo_denunciado;

			DELETE FROM privado.conteudo WHERE id = v_conteudo_denunciado;
		ELSE
			-- Denúncia de usuário: pegar o denunciado
			v_criador_conteudo := v_usuario_denunciado;
		END IF;

		-- Silencia o criador do conteúdo
		IF v_criador_conteudo IS NOT NULL THEN
			-- Calcular strike_valido_ate conforme a regra
			IF p_tempo_silencio IS NULL THEN
				p_tempo_silencio := INTERVAL '3 days';
			END IF;

			v_strike_valido_ate := CURRENT_TIMESTAMP +
				CASE
					WHEN p_tempo_silencio <= INTERVAL '1 day' THEN INTERVAL '7 days'
					WHEN p_tempo_silencio <= INTERVAL '3 days' THEN INTERVAL '3 months'
					ELSE INTERVAL '6 months'
				END;

			-- Registrar penalidade
			INSERT INTO privado.penalidade (usuario_id, denuncia_id, duracao, strike_valido_ate)
			VALUES (v_criador_conteudo, p_denuncia_id, p_tempo_silencio, v_strike_valido_ate);

			-- Silenciar usuário
			UPDATE privado.usuario
			SET status = 'SILENCIADO',
			    ultima_mudanca_status = CURRENT_TIMESTAMP
			WHERE id = v_criador_conteudo;

			-- Contar strikes vigentes
			SELECT COUNT(*) INTO v_total_strikes
			FROM privado.penalidade
			WHERE usuario_id = v_criador_conteudo
			  AND strike_valido_ate > CURRENT_TIMESTAMP;

			-- Se 4 ou mais strikes, excluir usuário
			IF v_total_strikes >= 4 THEN
				CALL publico.deletar_usuario(v_criador_conteudo, 'BANIMENTO');
			END IF;
		END IF;

	ELSIF p_punicao = 2 THEN
		-- Descobrir quem excluir
		IF v_conteudo_denunciado IS NOT NULL THEN
			SELECT criador INTO v_criador_conteudo
			FROM privado.conteudo WHERE id = v_conteudo_denunciado;
		ELSE
			v_criador_conteudo := v_usuario_denunciado;
		END IF;

		-- Excluir usuário com banimento
		IF v_criador_conteudo IS NOT NULL THEN
			CALL publico.deletar_usuario(v_criador_conteudo, 'BANIMENTO');
		END IF;
	END IF;
END;
$$;

-- alterna entre seguir e deixar de seguir um fórum ativo
-- uso: CALL publico.alternar_seguir_forum(<id do usuário>, <id do fórum>);
CREATE PROCEDURE publico.alternar_seguir_forum (
	p_usuario_id INT,
	p_forum_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_excluido_usuario TIMESTAMP WITH TIME ZONE;
	v_status_forum VARCHAR(20);
	v_ja_segue BOOLEAN;
BEGIN
	SELECT usuario.excluido_em, forum.status
	INTO v_excluido_usuario, v_status_forum
	FROM privado.usuario AS usuario
	JOIN privado.forum AS forum ON forum.id = p_forum_id
	WHERE usuario.id = p_usuario_id;

	IF v_excluido_usuario IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode seguir fórum.';
	END IF;

	IF v_status_forum != 'ATIVO' THEN
		RETURN;
	END IF;

	SELECT EXISTS (
		SELECT 1
		FROM privado.seguir_forum AS seguir_forum
		WHERE seguir_forum.usuario = p_usuario_id
		AND seguir_forum.forum = p_forum_id
	) INTO v_ja_segue;

	IF v_ja_segue THEN
		DELETE FROM privado.seguir_forum
		WHERE usuario = p_usuario_id
		AND forum = p_forum_id;
	ELSE
		INSERT INTO privado.seguir_forum (usuario, forum)
		VALUES (p_usuario_id, p_forum_id);
	END IF;
END;
$$;

-- alterna entre seguir e deixar de seguir um usuário
-- uso: CALL publico.alternar_seguir_usuario(<id do seguidor>, <id do seguido>);
CREATE PROCEDURE publico.alternar_seguir_usuario (
	p_seguidor_id INT,
	p_seguido_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_excluido_seguidor TIMESTAMP WITH TIME ZONE;
	v_ja_segue BOOLEAN;
BEGIN
	SELECT usuario.excluido_em
	INTO v_excluido_seguidor
	FROM privado.usuario AS usuario
	WHERE usuario.id = p_seguidor_id;

	IF v_excluido_seguidor IS NOT NULL THEN
		RAISE EXCEPTION 'Usuário excluído não pode seguir usuários.';
	END IF;

	SELECT EXISTS (
		SELECT 1
		FROM privado.seguir_usuario AS seguir_usuario
		WHERE seguir_usuario.seguidor = p_seguidor_id
		AND seguir_usuario.seguido = p_seguido_id
	) INTO v_ja_segue;

	IF v_ja_segue THEN
		DELETE FROM privado.seguir_usuario
		WHERE seguidor = p_seguidor_id
		AND seguido = p_seguido_id;
	ELSE
		INSERT INTO privado.seguir_usuario (seguidor, seguido)
		VALUES (p_seguidor_id, p_seguido_id);
	END IF;
END;
$$;
