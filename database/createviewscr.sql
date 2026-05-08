-- usado para autentificação
CREATE OR REPLACE VIEW privado.login_usuario AS
SELECT
	usuario.id,
	usuario.nome_usuario,
	usuario.email,
	usuario.status,
	usuario.senha_hash
	FROM privado.usuario AS usuario

	WHERE usuario.excluido_em IS NULL
	ORDER BY usuario.id;

-- usado para exibir a página de perfil de um usuário
CREATE OR REPLACE VIEW privado.perfil_usuario AS
SELECT
	usuario.id,
	usuario.nome,
	usuario.nome_usuario,
	usuario.cargo,
	usuario.descricao,
	usuario.status,
	usuario.criado_em,
	usuario.identidade_visual,

	identidade_visual.img_perfil,
	identidade_visual.img_banner,

	COUNT (DISTINCT seguido.seguido) AS seguidores,
	COUNT (DISTINCT segue.seguidor) AS segue,
	COALESCE(karma.total, 0) AS karma

	FROM privado.usuario AS usuario
	JOIN privado.identidade_visual AS identidade_visual
		ON identidade_visual.id = usuario.identidade_visual
	LEFT JOIN privado.seguir_usuario AS seguido
		ON seguido.seguido = usuario.id
	LEFT JOIN privado.seguir_usuario AS segue
		ON segue.seguidor = usuario.id
	LEFT JOIN (
		SELECT conteudo.criador, SUM(avaliacao.avaliacao) AS total
		FROM privado.conteudo AS conteudo
		JOIN privado.avaliacao AS avaliacao
			ON avaliacao.conteudo = conteudo.id
		GROUP BY conteudo.criador
	) AS karma ON karma.criador = usuario.id

	WHERE usuario.excluido_em IS NULL

	GROUP BY
		usuario.id,
		usuario.nome,
		usuario.nome_usuario,
		usuario.cargo,
		usuario.descricao,
		usuario.status,
		usuario.criado_em,
		usuario.identidade_visual,
		identidade_visual.img_perfil,
		identidade_visual.img_banner,
		karma.total;

-- usado para exibir o "cabeçalho" do fórum
CREATE OR REPLACE VIEW privado.visualizar_forum AS
SELECT
	-- informações do fórum
	forum.id,
	forum.nome,
	forum.descricao,
	forum.criado_em,
	forum.status,
	
	-- informações do criado
	usuario.nome_usuario,

	-- identidade visual
	iddv.img_perfil,
	iddv.img_banner,

	-- subqueries info
	-- quantidade de seguidores do fórum
	COALESCE(seguidores.total, 0) AS seguidores

	FROM privado.forum AS forum
	JOIN privado.identidade_visual AS iddv
		ON iddv.id = forum.identidade_visual

	JOIN privado.usuario AS usuario
		ON usuario.id = forum.criador

	LEFT JOIN (
		SELECT seguir_forum.forum, COUNT(*) AS total
		FROM privado.seguir_forum AS seguir_forum
		GROUP BY seguir_forum.forum
	) AS seguidores ON seguidores.forum = forum.id;

CREATE OR REPLACE VIEW privado.visualizar_postagem AS
SELECT
	postagem.id,
	postagem.titulo,
	postagem.arquivo,
	postagem.forum,

	conteudo.conteudo,
	conteudo.status,
	conteudo.criado_em,

	-- tempo de vida da postagem
	NOW() - conteudo.criado_em AS tempo_de_vida,

	-- informações do criador
	usuario.id AS criador,
	usuario.nome_usuario,
	usuario.cargo,

	identidade_visual.img_perfil,

	-- tags da postagem em array
	(
		SELECT ARRAY_AGG(tag.tag ORDER BY classificacao.tag ASC)
		FROM privado.classificacao AS classificacao
		JOIN privado.tag AS tag
			ON tag.id = classificacao.tag
		WHERE classificacao.postagem = postagem.id
	) AS tags,

	-- engajamento: soma de upvotes e downvotes
	COALESCE(engajamento.total, 0) AS engajamento,

	-- total de comentários
	COALESCE(comentarios.total, 0) AS comentarios

	FROM privado.postagem AS postagem

	JOIN privado.conteudo AS conteudo
		ON conteudo.id = postagem.id

	JOIN privado.usuario AS usuario
		ON usuario.id = conteudo.criador

	JOIN privado.identidade_visual AS identidade_visual
		ON identidade_visual.id = usuario.identidade_visual

	LEFT JOIN (
		SELECT avaliacao.conteudo, SUM(avaliacao.avaliacao) AS total
		FROM privado.avaliacao AS avaliacao
		GROUP BY avaliacao.conteudo
	) AS engajamento ON engajamento.conteudo = postagem.id

	LEFT JOIN (
		SELECT comentario.conteudo_pai, COUNT(*) AS total
		FROM privado.comentario AS comentario
		GROUP BY comentario.conteudo_pai
	) AS comentarios ON comentarios.conteudo_pai = postagem.id;

CREATE OR REPLACE VIEW privado.exibir_comentarios AS
SELECT
	comentario.id,
	comentario.conteudo_pai,
	comentario.nivel,

	conteudo.id AS conteudo_id,
	conteudo.conteudo,
	conteudo.status,
	conteudo.criado_em,

	-- tempo de vida do comentário
	NOW() - conteudo.criado_em AS tempo_de_vida,

	-- informações do criador
	usuario.nome_usuario,
	usuario.cargo,
	identidade_visual.img_perfil,

	-- engajamento do comentário
	COALESCE(engajamento.total, 0) AS engajamento

	FROM privado.comentario AS comentario

	JOIN privado.conteudo AS conteudo
		ON conteudo.id = comentario.id

	JOIN privado.usuario AS usuario
		ON usuario.id = conteudo.criador

	JOIN privado.identidade_visual AS identidade_visual
		ON identidade_visual.id = usuario.identidade_visual
		
	LEFT JOIN (
		SELECT avaliacao.conteudo, SUM(avaliacao.avaliacao) AS total
		FROM privado.avaliacao AS avaliacao
		GROUP BY avaliacao.conteudo
	) AS engajamento ON engajamento.conteudo = comentario.id;

-- cabeçalho base de toda denúncia — traz denunciante, sem denunciado (vem nas especializadas)
CREATE OR REPLACE VIEW privado.cabecalho_denuncia AS
SELECT
	denuncia.id                 AS denuncia_id,
	denuncia.tipo               AS denuncia_tipo,
	denuncia.status             AS denuncia_status,
	denuncia.criado_em          AS denuncia_criado_em,
	denuncia.resolvido_em       AS denuncia_resolvido_em,

	denunciante.id              AS denunciante_id,
	denunciante.nome_usuario    AS denunciante_usuario,
	iddv_denunciante.img_perfil AS denunciante_img_perfil

	FROM privado.denuncia AS denuncia
	JOIN privado.usuario AS denunciante
		ON denunciante.id = denuncia.denunciante
	JOIN privado.identidade_visual AS iddv_denunciante
		ON iddv_denunciante.id = denunciante.identidade_visual;

-- denúncia de usuário — cabeçalho + perfil completo do denunciado
CREATE OR REPLACE VIEW privado.corpo_denuncia_usuario AS
SELECT
	cabecalho.*,
	perfil_usuario.*

	FROM privado.cabecalho_denuncia AS cabecalho
	JOIN privado.denuncia_usuario AS denuncia_usuario
		ON denuncia_usuario.id = cabecalho.denuncia_id
	JOIN privado.perfil_usuario AS perfil_usuario
		ON perfil_usuario.id = denuncia_usuario.usuario_denunciado;

-- denúncia de postagem — cabeçalho + postagem denunciada
CREATE OR REPLACE VIEW privado.corpo_denuncia_postagem AS
SELECT
	cabecalho.*,
	postagem.*

	FROM privado.cabecalho_denuncia AS cabecalho
	JOIN privado.denuncia_conteudo AS denuncia_conteudo
		ON denuncia_conteudo.id = cabecalho.denuncia_id
	JOIN privado.visualizar_postagem AS postagem
		ON postagem.id = denuncia_conteudo.conteudo_denunciado;

-- denúncia de comentário — cabeçalho + comentário denunciado + dados brutos do conteudo pai
CREATE OR REPLACE VIEW privado.corpo_denuncia_comentario AS
SELECT
	cabecalho.*,

	-- comentário denunciado
	comentario.*,

	-- conteudo pai (dados brutos — pode ser postagem ou comentário)
	conteudo_pai.id         AS pai_id,
	conteudo_pai.conteudo   AS pai_conteudo,
	conteudo_pai.status     AS pai_status,
	conteudo_pai.criado_em  AS pai_criado_em,
	conteudo_pai.criador    AS pai_criador

	FROM privado.cabecalho_denuncia AS cabecalho
	JOIN privado.denuncia_conteudo AS denuncia_conteudo
		ON denuncia_conteudo.id = cabecalho.denuncia_id
	JOIN privado.exibir_comentarios AS comentario
		ON comentario.id = denuncia_conteudo.conteudo_denunciado
	JOIN privado.conteudo AS conteudo_pai
		ON conteudo_pai.id = comentario.conteudo_pai;
