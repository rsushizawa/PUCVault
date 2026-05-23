-- indices para tabela usuario
-- utilizado em: dados_login_usuario, buscar_usuario_por_email, buscar_usuario_por_nome_usuario
CREATE INDEX IF NOT EXISTS idx_usuario_email ON privado.usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_nome_usuario ON privado.usuario(nome_usuario);

-- utilizado em: listar_usuarios (via view perfil_usuario), filtrar usuarios ativos
CREATE INDEX IF NOT EXISTS idx_usuario_status ON privado.usuario(status);
CREATE INDEX IF NOT EXISTS idx_usuario_excluido_em ON privado.usuario(excluido_em);

-- indices para tabela forum
-- utilizado em: buscar_forum_por_nome, listar_foruns
CREATE INDEX IF NOT EXISTS idx_forum_nome ON privado.forum(nome);
CREATE INDEX IF NOT EXISTS idx_forum_status ON privado.forum(status);

-- utilizado em: deletar_usuario (verifica se criou forum)
CREATE INDEX IF NOT EXISTS idx_forum_criador ON privado.forum(criador);

-- indices para tabela tag
-- utilizado em: buscar_tags_relevantes (busca por similaridade)
-- extensao necessaria para busca textual
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_tag_tag_trgm ON privado.tag USING gin (tag gin_trgm_ops);

-- utilizado em: buscar_tags_por_criador, deletar_usuario (verifica se criou tag)
CREATE INDEX IF NOT EXISTS idx_tag_criador ON privado.tag(criador);

-- utilizado em: listar_tags (ordenacao)
CREATE INDEX IF NOT EXISTS idx_tag_tag ON privado.tag(tag);

-- indices para tabela conteudo
-- utilizado em: listar_postagens_forum, listar_arquivos_forum, buscar_postagem (via join)
CREATE INDEX IF NOT EXISTS idx_conteudo_criado_em ON privado.conteudo(criado_em DESC);

-- utilizado em: deletar_conteudo, listar_postagens_feed
CREATE INDEX IF NOT EXISTS idx_conteudo_criador ON privado.conteudo(criador);

-- utilizado em: listar_postagens_forum (filtro por status)
CREATE INDEX IF NOT EXISTS idx_conteudo_status ON privado.conteudo(status);

-- indices para tabela postagem
-- utilizado em: listar_postagens_forum, listar_arquivos_forum
CREATE INDEX IF NOT EXISTS idx_postagem_forum ON privado.postagem(forum);
CREATE INDEX IF NOT EXISTS idx_postagem_forum_criado ON privado.postagem(forum, id DESC);

-- utilizado em: listar_arquivos_forum, listar_anos_com_arquivo, listar_tags_arquivo_por_ano, listar_postagens_arquivo
CREATE INDEX IF NOT EXISTS idx_postagem_arquivo ON privado.postagem(arquivo) WHERE arquivo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_postagem_forum_arquivo ON privado.postagem(forum, id DESC) WHERE arquivo IS NOT NULL;

-- utilizado em: buscar_postagem (ja tem indice da primary key)

-- indices para tabela comentario
-- utilizado em: listar_comentarios_postagem (busca recursiva por conteudo_pai)
CREATE INDEX IF NOT EXISTS idx_comentario_conteudo_pai ON privado.comentario(conteudo_pai);
CREATE INDEX IF NOT EXISTS idx_comentario_conteudo_pai_id ON privado.comentario(conteudo_pai, id);

-- utilizado em: ordenacao dos comentarios
CREATE INDEX IF NOT EXISTS idx_comentario_nivel ON privado.comentario(nivel);

-- indices para tabela classificacao
-- utilizado em: buscar_tags_relevantes (join com classificacao para contar usos)
CREATE INDEX IF NOT EXISTS idx_classificacao_tag ON privado.classificacao(tag);

-- utilizado em: listar_tags_arquivo_por_ano, listar_postagens_arquivo
CREATE INDEX IF NOT EXISTS idx_classificacao_postagem ON privado.classificacao(postagem);

-- indices para tabela avaliacao
-- utilizado em: calculo de karma na view perfil_usuario, engajamento na view visualizar_postagem
CREATE INDEX IF NOT EXISTS idx_avaliacao_conteudo ON privado.avaliacao(conteudo);

-- indices para tabela seguir_forum
-- utilizado em: listar_seguidores_forum
CREATE INDEX IF NOT EXISTS idx_seguir_forum_forum ON privado.seguir_forum(forum);
CREATE INDEX IF NOT EXISTS idx_seguir_forum_usuario ON privado.seguir_forum(usuario);

-- utilizado em: checar_se_usuario_segue_forum, alternar_seguir_forum
CREATE INDEX IF NOT EXISTS idx_seguir_forum_usuario_forum ON privado.seguir_forum(usuario, forum);

-- utilizado em: listar_postagens_feed (subquery com where)
CREATE INDEX IF NOT EXISTS idx_seguir_forum_usuario_forum_list ON privado.seguir_forum(usuario, forum);

-- indices para tabela seguir_usuario
-- utilizado em: listar_postagens_feed (subquery com where seguidor = p_usuario_id)
CREATE INDEX IF NOT EXISTS idx_seguir_usuario_seguidor ON privado.seguir_usuario(seguidor);
CREATE INDEX IF NOT EXISTS idx_seguir_usuario_seguido ON privado.seguir_usuario(seguido);

-- indices para tabela incluir_tag
-- utilizado em: listar_tags_relacionadas_forum
CREATE INDEX IF NOT EXISTS idx_incluir_tag_forum ON privado.incluir_tag(forum);
CREATE INDEX IF NOT EXISTS idx_incluir_tag_tag ON privado.incluir_tag(tag);

-- utilizado em: incluir_tag_forum, remover_tag_forum (verificar existencia)
CREATE INDEX IF NOT EXISTS idx_incluir_tag_forum_tag ON privado.incluir_tag(forum, tag);

-- indices para tabela denuncia
-- utilizado em: deletar_usuario (verifica se fez denuncia)
CREATE INDEX IF NOT EXISTS idx_denuncia_denunciante ON privado.denuncia(denunciante);

-- utilizado em: resolver_denuncia (busca por status)
CREATE INDEX IF NOT EXISTS idx_denuncia_status ON privado.denuncia(status);

-- indices para tabela denuncia_usuario
-- utilizado em: inserir_denuncia_usuario (verifica duplicata)
CREATE INDEX IF NOT EXISTS idx_denuncia_usuario_denunciado ON privado.denuncia_usuario(usuario_denunciado);
CREATE INDEX IF NOT EXISTS idx_denuncia_usuario_denunciante_denunciado ON privado.denuncia_usuario(id, usuario_denunciado);

-- indices para tabela denuncia_conteudo
-- utilizado em: inserir_denuncia_conteudo (verifica duplicata)
CREATE INDEX IF NOT EXISTS idx_denuncia_conteudo_denunciado ON privado.denuncia_conteudo(conteudo_denunciado);
CREATE INDEX IF NOT EXISTS idx_denuncia_conteudo_id_conteudo ON privado.denuncia_conteudo(id, conteudo_denunciado);


--- índices para tabela penalidade
--- utilizado em : resolver_denuncia(COUNT de strikes ainda vingentes por usuário)
CREATE INDEX IF NOT EXISTS idx_penalidade_usuario_strike ON privado.penalidade(usuario_id, strike_valido_ate) WHERE removido_em IS NULL;

--- utilizado em: corpo_denuncia_usuario, corpo_denuncia_postagem, corpo_denuncia_comentario (verificação de penalidades ainda ativas)
CREATE INDEX IF NOT EXISTS idx_penalidade_usuario_vigente ON privado.penalidade(usuario_id, strike_valido_ate DESC)  WHERE removido_em IS NULL;


--- utilizado em : dados_login_usuario(verificar expiração de silenciamento)
CREATE INDEX IF NOT EXISTS idx_penalidade_usuario_validade ON privado.penalidade(usuario_id, aplicado_em);

-- utilizado em: ON DELETE RESTRICT da FK denuncia_id (lookup)
CREATE INDEX IF NOT EXISTS idx_penalidade_denuncia ON privado.penalidade(denuncia_id);
