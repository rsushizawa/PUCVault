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