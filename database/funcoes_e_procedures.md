# Funções e Procedures do schema `publico`

Este documento descreve as principais funções e procedures expostas em `publico` para interação do backend com o banco. As funções retornam views ou tabelas derivadas do schema `privado` e as procedures executam operações de mutação e validação.

> Observação: todas as rotinas usam `SECURITY DEFINER` e `SET search_path = ''`, então elas acessam explicitamente os objetos do schema `privado`.

## Funções (SELECT)

### `publico.dados_login_usuario(p_id INT DEFAULT NULL, p_email VARCHAR DEFAULT NULL, p_nome_usuario VARCHAR DEFAULT NULL)`
- Retorno: `SETOF privado.login_usuario`
- Uso: `SELECT * FROM publico.dados_login_usuario(<id | email | nome_usuario>);`
- Descrição: retorna o conjunto de campos necessários para autenticação (id, nome_usuario, cargo, email, status, senha_hash, a2f). Também atualiza automaticamente silêncios expirados para o usuário consultado.
- Índices relevantes:
  - `idx_usuario_email` em `privado.usuario(email)`
  - `idx_usuario_nome_usuario` em `privado.usuario(nome_usuario)`
  - `idx_penalidade_usuario_removido` em `privado.penalidade(usuario_id, removido_em, aplicado_em, duracao) WHERE removido_em IS NULL`

### `publico.listar_usuarios()`
- Retorno: `SETOF privado.perfil_usuario`
- Uso: `SELECT * FROM publico.listar_usuarios();`
- Descrição: retorna todos os perfis de usuário disponíveis na view `privado.perfil_usuario`.
- Índices relevantes:
  - `idx_usuario_status` em `privado.usuario(status)`
  - `idx_usuario_excluido_em` em `privado.usuario(excluido_em)`

### `publico.buscar_usuario_por_id(p_id INT, p_usuario_logado_id INT DEFAULT NULL)`
- Retorno: `TABLE(...)` com campos do perfil do usuário e campo calculado `usuario_logado_segue BOOLEAN`
- Uso: `SELECT * FROM publico.buscar_usuario_por_id(<id>, <id_usuario_logado>);`
- Descrição: busca um usuário pelo id e informa se o usuário logado ainda segue esse perfil.
- Índices relevantes:
  - chave primária `privado.usuario(id)`
  - `idx_seguir_usuario_seguidor` / `idx_seguir_usuario_seguido` para a verificação de seguimento

### `publico.buscar_usuario_por_nome_usuario(p_nome_usuario VARCHAR)`
- Retorno: `SETOF privado.perfil_usuario`
- Uso: `SELECT * FROM publico.buscar_usuario_por_nome_usuario(<nome_usuario>);`
- Descrição: busca perfis por nome de usuário exato.
- Índices relevantes:
  - `idx_usuario_nome_usuario` em `privado.usuario(nome_usuario)`

### `publico.buscar_usuario_por_email(p_email VARCHAR)`
- Retorno: `SETOF privado.perfil_usuario`
- Uso: `SELECT * FROM publico.buscar_usuario_por_email(<email>);`
- Descrição: busca perfis a partir do email do usuário.
- Índices relevantes:
  - `idx_usuario_email` em `privado.usuario(email)`

### `publico.buscar_forum_por_nome(p_nome VARCHAR)`
- Retorno: `SETOF privado.visualizar_forum`
- Uso: `SELECT * FROM publico.buscar_forum_por_nome(<nome>);`
- Descrição: retorna informações do fórum com seu cabeçalho, criador e contagem de seguidores/postagens, apenas se o fórum estiver ATIVO.
- Índices relevantes:
  - `idx_forum_nome` em `privado.forum(nome)`
  - `idx_forum_status` em `privado.forum(status)`

### `publico.buscar_forum_por_id(p_id INT)`
- Retorno: `SETOF privado.visualizar_forum`
- Uso: `SELECT * FROM publico.buscar_forum_por_id(<id>);`
- Descrição: busca fórum ativo pelo id.
- Índices relevantes:
  - chave primária `privado.forum(id)`
  - `idx_forum_status` em `privado.forum(status)`

### `publico.listar_foruns()`
- Retorno: `SETOF privado.visualizar_forum`
- Uso: `SELECT * FROM publico.listar_foruns();`
- Descrição: lista todos os fóruns cujo status corresponde a ativo.
- Índices relevantes:
  - `idx_forum_status` em `privado.forum(status)`

### `publico.listar_seguidores_forum(p_id INT)`
- Retorno: `SETOF privado.perfil_usuario`
- Uso: `SELECT * FROM publico.listar_seguidores_forum(<id_forum>);`
- Descrição: retorna os perfis dos usuários que seguem um fórum específico.
- Índices relevantes:
  - `idx_seguir_forum_forum` em `privado.seguir_forum(forum)`

### `publico.buscar_tags_por_criador(p_id INT)`
- Retorno: `SETOF privado.tag`
- Uso: `SELECT * FROM publico.buscar_tags_por_criador(<id_criador>);`
- Descrição: retorna todas as tags criadas por um determinado usuário.
- Índices relevantes:
  - `idx_tag_criador` em `privado.tag(criador)`

### `publico.listar_postagens_forum(p_forum_id INT, p_pagina INT DEFAULT 1, p_usuario_logado_id INT DEFAULT NULL)`
- Retorno: `TABLE(...)` baseado na view `privado.visualizar_postagem`
- Uso: `SELECT * FROM publico.listar_postagens_forum(<id_forum>, <pagina>, <id_usuario_logado>);`
- Descrição: lista postagens de um fórum com paginação de 20 itens, incluindo engajamento, contagem de comentários, tags e avaliação do usuário logado.
- Índices relevantes:
  - `idx_postagem_forum` em `privado.postagem(forum)`
  - `idx_postagem_forum_criado` em `privado.postagem(forum, id DESC)`
  - `idx_conteudo_criado_em` em `privado.conteudo(criado_em DESC)`
  - `idx_avaliacao_usuario_conteudo` em `privado.avaliacao(usuario, conteudo)`
  - `idx_classificacao_postagem` em `privado.classificacao(postagem)`

### `publico.listar_arquivos_forum(p_forum_id INT, p_pagina INT DEFAULT 1)`
- Retorno: `SETOF privado.visualizar_postagem`
- Uso: `SELECT * FROM publico.listar_arquivos_forum(<id_forum>, <pagina>);`
- Descrição: lista apenas postagens que possuem arquivo em um fórum, com paginação.
- Índices relevantes:
  - `idx_postagem_arquivo` em `privado.postagem(arquivo_nome) WHERE arquivo_nome IS NOT NULL`
  - `idx_postagem_forum_arquivo` em `privado.postagem(forum, id DESC) WHERE arquivo_nome IS NOT NULL`

### `publico.listar_comentarios_postagem(p_postagem_id INT, p_usuario_id INT DEFAULT NULL)`
- Retorno: `TABLE(...)` baseado na view `privado.exibir_comentarios`
- Uso: `SELECT * FROM publico.listar_comentarios_postagem(<id_postagem>, <id_usuario_logado>);`
- Descrição: retorna a árvore de comentários aninhados para uma postagem, com engajamento e avaliação do usuário logado.
- Índices relevantes:
  - `idx_comentario_conteudo_pai` em `privado.comentario(conteudo_pai)`
  - `idx_comentario_conteudo_pai_id` em `privado.comentario(conteudo_pai, id)`
  - `idx_avaliacao_usuario_conteudo` em `privado.avaliacao(usuario, conteudo)`

### `publico.listar_tags()`
- Retorno: `SETOF privado.tag`
- Uso: `SELECT * FROM publico.listar_tags();`
- Descrição: retorna todas as tags registradas.
- Índices relevantes:
  - `idx_tag_tag` em `privado.tag(tag)`

### `publico.buscar_postagem(p_id INT, p_usuario_logado_id INT DEFAULT NULL)`
- Retorno: `TABLE(...)` baseado na view `privado.visualizar_postagem`
- Uso: `SELECT * FROM publico.buscar_postagem(<id_postagem>, <id_usuario_logado>);`
- Descrição: busca uma postagem única com detalhes completos, incluindo tags, engajamento e avaliação do usuário logado.
- Índices relevantes:
  - `idx_avaliacao_usuario_conteudo` em `privado.avaliacao(usuario, conteudo)`

### `publico.buscar_tags_relevantes(p_busca VARCHAR, p_limite INT DEFAULT 5)`
- Retorno: `TABLE(id INT, tag VARCHAR, total_usos BIGINT, relevancia INT)`
- Uso: `SELECT * FROM publico.buscar_tags_relevantes(<texto>, <limite>);`
- Descrição: busca tags por similaridade textual e ordena por relevância combinando correspondência e contagem de uso.
- Índices relevantes:
  - `idx_tag_tag_trgm` em `privado.tag USING gin (tag gin_trgm_ops)`
  - `idx_classificacao_tag` em `privado.classificacao(tag)`

### `publico.listar_tags_relacionadas_forum(p_forum INT)`
- Retorno: `SETOF privado.tag`
- Uso: `SELECT * FROM publico.listar_tags_relacionadas_forum(<id_forum>);`
- Descrição: retorna as tags associadas a um fórum.
- Índices relevantes:
  - `idx_incluir_tag_forum` em `privado.incluir_tag(forum)`

### `publico.listar_postagens_feed(p_usuario_id INT, p_pagina INT DEFAULT 1)`
- Retorno: `TABLE(...)` baseado na view `privado.visualizar_postagem`
- Uso: `SELECT * FROM publico.listar_postagens_feed(<id_usuario>, <pagina>);`
- Descrição: monta o feed do usuário com postagens de fóruns que ele segue ou de usuários que segue, ordenadas por engajamento e frescor.
- Índices relevantes:
  - `idx_seguir_forum_usuario` em `privado.seguir_forum(usuario)`
  - `idx_seguir_forum_usuario_forum` em `privado.seguir_forum(usuario, forum)`
  - `idx_seguir_usuario_seguidor` e `idx_seguir_usuario_seguido` em `privado.seguir_usuario`
  - `idx_postagem_forum` em `privado.postagem(forum)`
  - `idx_avaliacao_usuario_conteudo` em `privado.avaliacao(usuario, conteudo)`

### `publico.listar_anos_com_arquivo(p_forum_id INT)`
- Retorno: `TABLE(ano INT)`
- Uso: `SELECT * FROM publico.listar_anos_com_arquivo(<id_forum>);`
- Descrição: retorna os anos que têm postagens com arquivo em um fórum.
- Índices relevantes:
  - `idx_postagem_forum` em `privado.postagem(forum)`
  - `idx_postagem_arquivo` em `privado.postagem(arquivo_nome) WHERE arquivo_nome IS NOT NULL`

### `publico.listar_tags_arquivo_por_ano(p_forum_id INT, p_ano INT)`
- Retorno: `SETOF privado.tag`
- Uso: `SELECT * FROM publico.listar_tags_arquivo_por_ano(<id_forum>, <ano>);`
- Descrição: retorna as tags que aparecem em postagens com arquivo para um fórum e ano específicos.
- Índices relevantes:
  - `idx_classificacao_postagem` em `privado.classificacao(postagem)`
  - `idx_postagem_forum_arquivo` em `privado.postagem(forum, id DESC) WHERE arquivo_nome IS NOT NULL`

### `publico.listar_postagens_arquivo(p_forum_id INT, p_ano INT, p_tag_id INT)`
- Retorno: `SETOF privado.visualizar_postagem`
- Uso: `SELECT * FROM publico.listar_postagens_arquivo(<id_forum>, <ano>, <id_tag>);`
- Descrição: lista as postagens com arquivo filtradas por fórum, ano e tag.
- Índices relevantes:
  - `idx_postagem_forum_arquivo` em `privado.postagem(forum, id DESC) WHERE arquivo_nome IS NOT NULL`
  - `idx_postagem_arquivo` em `privado.postagem(arquivo_nome) WHERE arquivo_nome IS NOT NULL`
  - `idx_classificacao_postagem` em `privado.classificacao(postagem)`

### `publico.checar_se_usuario_segue_forum(p_usuario INT, p_forum INT)`
- Retorno: `TABLE(segue BOOLEAN)`
- Uso: `SELECT * FROM publico.checar_se_usuario_segue_forum(<id_usuario>, <id_forum>);`
- Descrição: verifica se um usuário segue um determinado fórum.
- Índices relevantes:
  - `idx_seguir_forum_usuario_forum` em `privado.seguir_forum(usuario, forum)`

### `publico.listar_postagens_usuario(p_usuario_id INT, p_pagina INT DEFAULT 1, p_usuario_logado_id INT DEFAULT NULL)`
- Retorno: `TABLE(...)` baseado na view `privado.visualizar_postagem`
- Uso: `SELECT * FROM publico.listar_postagens_usuario(<id_usuario>, <pagina>, <id_usuario_logado>);`
- Descrição: retorna as postagens publicadas por um usuário específico, com paginação e avaliação do usuário logado.
- Índices relevantes:
  - `idx_conteudo_criador` em `privado.conteudo(criador)`
  - `idx_avaliacao_usuario_conteudo` em `privado.avaliacao(usuario, conteudo)`

### `publico.listar_denuncias()`
- Retorno: `TABLE(...)` com dados do denunciante, tipo de denúncia e strikes ativos do denunciado
- Uso: `SELECT * FROM publico.listar_denuncias();`
- Descrição: lista denúncias abertas, juntando dados de usuário, conteúdo denunciado e registros de penalidade ativos.
- Índices relevantes:
  - `idx_denuncia_status` em `privado.denuncia(status)`
  - `idx_denuncia_usuario_id_denunciado` em `privado.denuncia_usuario(id, usuario_denunciado)`
  - `idx_denuncia_conteudo_id_conteudo` em `privado.denuncia_conteudo(id, conteudo_denunciado)`
  - `idx_penalidade_usuario_strike` em `privado.penalidade(usuario_id, strike_valido_ate) WHERE removido_em IS NULL`

### `publico.listar_penalidades_usuario(p_usuario_id INT)`
- Retorno: `TABLE(...)` com histórico de penalidades
- Uso: `SELECT * FROM publico.listar_penalidades_usuario(<id_usuario>);`
- Descrição: traz o histórico de strikes de um usuário e calcula se cada strike ainda está vigente.
- Índices relevantes:
  - `idx_penalidade_usuario_aplicado` em `privado.penalidade(usuario_id, aplicado_em DESC)`

### `publico.listar_denuncias_usuario(p_status VARCHAR DEFAULT 'ABERTA')`
- Retorno: `SETOF privado.corpo_denuncia_usuario`
- Uso: `SELECT * FROM publico.listar_denuncias_usuario(<status>);`
- Descrição: retorna denúncias de usuários em um determinado status.
- Índices relevantes: herda índices de `privado.corpo_denuncia_usuario` e de `privado.denuncia.status`.

### `publico.listar_denuncias_postagem(p_status VARCHAR DEFAULT 'ABERTA')`
- Retorno: `SETOF privado.corpo_denuncia_postagem`
- Uso: `SELECT * FROM publico.listar_denuncias_postagem(<status>);`
- Descrição: retorna denúncias de postagens, incluindo os dados da postagem denunciada.

### `publico.listar_denuncias_comentario(p_status VARCHAR DEFAULT 'ABERTA')`
- Retorno: `SETOF privado.corpo_denuncia_comentario`
- Uso: `SELECT * FROM publico.listar_denuncias_comentario(<status>);`
- Descrição: retorna denúncias de comentários com dados do comentário, conteúdo pai e strikes vigentes.

### `publico.quantidade_arquivos_por_nome(P_nome_arquivo VARCHAR)`
- Retorno: `TABLE(nome VARCHAR, quantidade INT)`
- Uso: `SELECT * FROM publico.quantidade_arquivos_por_nome(<nome_arquivo>);`
- Descrição: conta quantas postagens têm exatamente um nome de arquivo específico.

### `publico.deletar_usuario_retornando_arquivos(p_usuario_id INT, p_tipo_exclusao VARCHAR DEFAULT 'CONTA')`
- Retorno: `TABLE(arquivo TEXT)`
- Uso: `SELECT * FROM publico.deletar_usuario_retornando_arquivos(<id_usuario>, <'CONTA' | 'BANIMENTO'>);`
- Descrição: antes de excluir um usuário, retorna as URLs de imagem de perfil/banner e os caminhos de arquivo das postagens dele. Em seguida, chama a procedure `publico.deletar_usuario` para executar a exclusão.

## Procedures (CALL)

### `publico.inserir_usuario(p_nome VARCHAR, p_nome_usuario VARCHAR, p_email VARCHAR, p_senha_hash VARCHAR)`
- Uso: `CALL publico.inserir_usuario(<nome>, <nome_usuario>, <email>, <senha_hash>);`
- Descrição: cria um novo usuário e a identidade visual associada.

### `publico.atualizar_descricao_usuario(p_usuario_id INT, p_nova_descricao VARCHAR)`
- Uso: `CALL publico.atualizar_descricao_usuario(<id_usuario>, <nova_descricao>);`
- Descrição: atualiza a descrição do perfil do usuário.

### `publico.atualizar_nome_usuario(p_usuario_id INT, p_novo_nome VARCHAR)`
- Uso: `CALL publico.atualizar_nome_usuario(<id_usuario>, <novo_nome>);`
- Descrição: altera o nome completo do usuário.

### `publico.atualizar_senha_usuario(p_usuario_id INT, p_nova_senha_hash VARCHAR)`
- Uso: `CALL publico.atualizar_senha_usuario(<id_usuario>, <nova_senha_hash>);`
- Descrição: atualiza a senha do usuário.

### `publico.deletar_usuario(p_usuario_id INT, p_tipo_exclusao VARCHAR DEFAULT 'CONTA')`
- Uso: `CALL publico.deletar_usuario(<id_usuario>, <tipo_exclusao>);`
- Descrição: exclui o usuário e seu conteúdo. Se o usuário tem fóruns, tags ou denúncias, faz soft delete e preserva o histórico; caso contrário, faz hard delete também na identidade visual.
- Observações: o tipo de exclusão pode ser `CONTA` (limpa email) ou `BANIMENTO`.
- Índices relevantes:
  - `idx_forum_criador` em `privado.forum(criador)`
  - `idx_tag_criador` em `privado.tag(criador)`
  - `idx_denuncia_denunciante` em `privado.denuncia(denunciante)`

### `publico.alternar_status_usuario(p_usuario_id INT)`
- Uso: `CALL publico.alternar_status_usuario(<id_usuario>);`
- Descrição: alterna o status entre `ATIVO` e `SILENCIADO`.

### `publico.alterar_cargo_usuario(p_executor_id INT, p_alvo_id INT, p_novo_cargo VARCHAR)`
- Uso: `CALL publico.alterar_cargo_usuario(<id_executor>, <id_alvo>, <novo_cargo>);`
- Descrição: altera o cargo de outro usuário obedecendo regras de hierarquia e permissões entre SUPERADMIN, ADMIN, VALIDADOR e USUARIO.

### `publico.inserir_forum(p_nome VARCHAR, p_descricao VARCHAR, p_criador INT)`
- Uso: `CALL publico.inserir_forum(<nome>, <descricao>, <id_criador>);`
- Descrição: cria um fórum novo apenas se o criador não estiver excluído e não estiver silenciado.

### `publico.validar_forum(p_forum_id INT, p_validador_id INT, p_novo_status VARCHAR)`
- Uso: `CALL publico.validar_forum(<id_forum>, <id_validador>, <'ATIVO' | 'RECUSADO'>);`
- Descrição: permite que VALIDADORES ou cargos superiores validem fóruns que estejam com status `ESPERA`.

### `publico.atualizar_descricao_forum(p_forum_id INT, p_usuario_id INT, p_nova_descricao VARCHAR)`
- Uso: `CALL publico.atualizar_descricao_forum(<id_forum>, <id_usuario>, <nova_descricao>);`
- Descrição: atualiza a descrição do fórum apenas se o usuário for o criador e o fórum estiver ATIVO.

### `publico.atualizar_identidade_visual(p_identidade_visual_id INT, p_campo VARCHAR, p_novo_id TEXT)`
- Uso: `CALL publico.atualizar_identidade_visual(<id_identidade_visual>, <'perfil' | 'banner'>, <novo_id>);`
- Descrição: atualiza a imagem de perfil ou banner em `privado.identidade_visual`.

### `publico.inserir_tag(p_tag VARCHAR, p_criador INT)`
- Uso: `CALL publico.inserir_tag(<tag>, <id_criador>);`
- Descrição: cria uma nova tag. Apenas usuários com cargo `VALIDADOR`, `ADMIN` ou `SUPERADMIN` podem executar.

### `publico.inserir_postagem(p_titulo VARCHAR, p_conteudo TEXT, p_criador INT, p_forum INT, p_arquivo_nome TEXT, p_arquivo_caminho TEXT, p_tags INT[] DEFAULT NULL)`
- Uso: `CALL publico.inserir_postagem(<titulo>, <conteudo>, <id_criador>, <id_forum>, <nome_arquivo>, <caminho_arquivo>, <ids_tags>);`
- Descrição: insere o conteúdo principal, cria a postagem associada e adiciona classificações de tags. Valida o usuário e o status do fórum.

### `publico.inserir_comentario(p_conteudo TEXT, p_criador INT, p_conteudo_pai INT)`
- Uso: `CALL publico.inserir_comentario(<conteudo>, <id_criador>, <id_conteudo_pai>);`
- Descrição: insere um comentário aninhado. O nível de profundidade cresce a cada resposta e é limitado a 5.
- Índices relevantes:
  - `idx_comentario_conteudo_pai` em `privado.comentario(conteudo_pai)`

### `publico.deletar_conteudo(p_conteudo_id INT, p_executor_id INT)`
- Uso: `CALL publico.deletar_conteudo(<id_conteudo>, <id_executor>);`
- Descrição: exclui conteúdo apenas se o executor for o autor ou for `SUPERADMIN`.

### `publico.avaliar_conteudo(p_usuario_id INT, p_conteudo_id INT, p_avaliacao SMALLINT)`
- Uso: `CALL publico.avaliar_conteudo(<id_usuario>, <id_conteudo>, <1 | -1 | 0>);`
- Descrição: insere, atualiza ou remove uma avaliação de conteúdo, impedindo autoavaliação.
- Índices relevantes:
  - `idx_avaliacao_usuario_conteudo` em `privado.avaliacao(usuario, conteudo)`

### `publico.inserir_denuncia_usuario(p_tipo VARCHAR, p_denunciante_id INT, p_denunciado_id INT)`
- Uso: `CALL publico.inserir_denuncia_usuario(<tipo>, <id_denunciante>, <id_denunciado>);`
- Descrição: registra denúncia contra um usuário, evitando duplicatas e auto-denúncia.
- Índices relevantes:
  - `idx_denuncia_usuario_denunciado` em `privado.denuncia_usuario(usuario_denunciado)`

### `publico.inserir_denuncia_conteudo(p_tipo VARCHAR, p_denunciante_id INT, p_conteudo_id INT)`
- Uso: `CALL publico.inserir_denuncia_conteudo(<tipo>, <id_denunciante>, <id_conteudo>);`
- Descrição: registra denúncia contra conteúdo e evita duplicatas e auto-denúncia.
- Índices relevantes:
  - `idx_denuncia_conteudo_denunciado` em `privado.denuncia_conteudo(conteudo_denunciado)`

### `publico.resolver_denuncia(p_denuncia_id INT, p_executor_id INT, p_novo_status VARCHAR, p_punicao SMALLINT DEFAULT NULL, p_tempo_silencio INTERVAL DEFAULT NULL)`
- Uso: `CALL publico.resolver_denuncia(<id_denuncia>, <id_executor>, <'RESOLVIDA' | 'IGNORADA'>, <punição>, <tempo_silencio>);`
- Descrição: resolve denúncias. Apenas `ADMIN` ou `SUPERADMIN` podem agir. Pode marcar como `IGNORADA`, `RESOLVIDA`, excluir conteúdo, silenciar usuário ou banir usuário após golpes repetidos.
- Observações: `p_punicao` pode ser `0` (apaga postagem), `1` (apaga postagem + silencia) ou `2` (banimento de usuário).
- Índices relevantes:
  - `idx_denuncia_status` em `privado.denuncia(status)`
  - `idx_penalidade_usuario_strike` em `privado.penalidade(usuario_id, strike_valido_ate) WHERE removido_em IS NULL`

### `publico.alternar_seguir_forum(p_usuario_id INT, p_forum_id INT)`
- Uso: `CALL publico.alternar_seguir_forum(<id_usuario>, <id_forum>);`
- Descrição: alterna entre seguir e deixar de seguir um fórum ativo.
- Índices relevantes:
  - `idx_seguir_forum_usuario_forum` em `privado.seguir_forum(usuario, forum)`

### `publico.alternar_seguir_usuario(p_seguidor_id INT, p_seguido_id INT)`
- Uso: `CALL publico.alternar_seguir_usuario(<id_seguidor>, <id_seguido>);`
- Descrição: alterna seguimento entre usuários.
- Índices relevantes:
  - `idx_seguir_usuario_seguidor` e `idx_seguir_usuario_seguido` em `privado.seguir_usuario`

### `publico.incluir_tag_forum(p_usuario_id INT, p_forum_id INT, p_tag_id INT)`
- Uso: `CALL publico.incluir_tag_forum(<id_usuario>, <id_forum>, <id_tag>);`
- Descrição: adiciona uma tag a um fórum. Apenas o criador do fórum pode executar.
- Índices relevantes:
  - `idx_incluir_tag_forum_tag` em `privado.incluir_tag(forum, tag)`

### `publico.remover_tag_forum(p_usuario_id INT, p_forum_id INT, p_tag_id INT)`
- Uso: `CALL publico.remover_tag_forum(<id_usuario>, <id_forum>, <id_tag>);`
- Descrição: remove uma tag de fórum. Apenas o criador do fórum pode executar.
- Índices relevantes:
  - `idx_incluir_tag_forum_tag` em `privado.incluir_tag(forum, tag)`

### `publico.atualizar_identidade_visual_forum(p_forum_id INT, p_executor_id INT, p_campo VARCHAR, p_novo_id TEXT)`
- Uso: `CALL publico.atualizar_identidade_visual_forum(<id_forum>, <id_executor>, <'perfil' | 'banner'>, <novo_id>);`
- Descrição: altera a identidade visual de um fórum. Somente o criador, `ADMIN` ou `SUPERADMIN` podem executar.

### `publico.alternar_a2f(p_usuario_id INT)`
- Uso: `CALL publico.alternar_a2f(<id_usuario>);`
- Descrição: alterna o campo booleano de autenticação em duas etapas de um usuário.

### `publico.remover_silencio(p_executor_id INT, p_usuario_id INT)`
- Uso: `CALL publico.remover_silencio(<id_executor>, <id_usuario>);`
- Descrição: remove silêncios ativos de um usuário, restaurando o status para `ATIVO`.
- Índices relevantes:
  - `idx_penalidade_usuario_removido_null` em `privado.penalidade(usuario_id) WHERE removido_em IS NULL`
