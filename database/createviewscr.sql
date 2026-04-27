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
	usuario.status,
	usuario.criado_em,

	identidade_visual.img_perfil,
	identidade_visual.img_banner,

	-- qtd que segue o usuário -> u = seguido
	COUNT (DISTINCT seguido.seguido) AS seguidores,
	-- qtd que o usuário sege -> u = segue
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
		usuario.status,
		usuario.criado_em,
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

drop view privado.visualizar_postagem cascade;

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