# Documentação do Banco de Dados - Sistema de Fóruns

## Sumário
- Visão Geral
- Schema Público (Procedures e Functions)
- Views do Schema Privado
- Índices do Schema Privado
- Estrutura das Tabelas

## Visão Geral

O banco de dados é estruturado em dois schemas:
- publico: Contém procedures, functions e views para operações da aplicação
- privado: Contém tabelas e views internas, com dados sensíveis e regras de negócio

## Schema Público (Procedures e Functions)

### Gerenciamento de Usuários

| Procedure | Parâmetros | Descrição |
|-----------|------------|-----------|
| inserir_usuario | nome, nome_usuario, email, senha_hash | Cria um novo usuário no sistema |
| atualizar_nome_usuario | id_usuario, novo_nome | Atualiza o nome de exibição do usuário |
| atualizar_senha_usuario | id_usuario, nova_senha_hash | Altera a senha do usuário |
| deletar_usuario | id_usuario | Remove logicamente um usuário (soft delete) |
| alternar_status_usuario | id_usuario | Alterna entre ATIVO e SILENCIADO |
| alterar_cargo_usuario | id_executor, id_alvo, novo_cargo | Altera cargo do usuário (requer permissões) |
| atualizar_identidade_visual | id_identidade_visual, campo, novo_id_imagem | Atualiza perfil ou banner do usuário |

### Gerenciamento de Fóruns

| Procedure | Parâmetros | Descrição |
|-----------|------------|-----------|
| inserir_forum | titulo, descricao, id_criador | Cria um novo fórum (status inicial: ESPERA) |
| validar_forum | id_forum, id_validador, status | Valida ou recusa um fórum (ATIVO/RECUSADO) |
| atualizar_descricao_forum | id_forum, id_usuario, nova_descricao | Atualiza a descrição do fórum |

### Gerenciamento de Tags

| Procedure | Parâmetros | Descrição |
|-----------|------------|-----------|
| inserir_tag | tag, id_criador | Cria uma nova tag no sistema |
| incluir_tag_forum | id_usuario, id_forum, id_tag | Associa uma tag a um fórum |

### Gerenciamento de Conteúdo

| Procedure | Parâmetros | Descrição |
|-----------|------------|-----------|
| inserir_postagem | titulo, conteudo, id_criador, id_forum, id_arquivo, ids_tags | Cria uma nova postagem com tags opcionais |
| inserir_comentario | conteudo, id_criador, id_conteudo_pai | Adiciona um comentário (suporta até 5 níveis) |
| deletar_conteudo | id_conteudo, id_executor | Remove logicamente um conteúdo |
| avaliar_conteudo | id_usuario, id_conteudo, avaliacao | Avalia conteúdo (1=upvote, -1=downvote, 0=remover) |

### Gerenciamento de Denúncias

| Procedure | Parâmetros | Descrição |
|-----------|------------|-----------|
| inserir_denuncia_usuario | tipo, id_denunciante, id_denunciado | Registra denúncia contra usuário |
| inserir_denuncia_conteudo | tipo, id_denunciante, id_conteudo | Registra denúncia contra conteúdo |
| resolver_denuncia | id_denuncia, id_executor, status | Resolve ou ignora denúncia (RESOLVIDA/IGNORADA) |

### Sistema de Seguir

| Procedure | Parâmetros | Descrição |
|-----------|------------|-----------|
| alternar_seguir_forum | id_usuario, id_forum | Seguir/deixar de seguir um fórum |
| alternar_seguir_usuario | id_seguidor, id_seguido | Seguir/deixar de seguir um usuário |

### Functions de Consulta (SELECT)

#### Usuários

| Function | Parâmetros | Retorno | Descrição |
|----------|------------|---------|-----------|
| dados_login_usuario | email_ou_nome_usuario | TABLE | Autenticação de usuário (email ou nome) |
| listar_usuarios | - | TABLE | Lista todos os usuários ativos |
| buscar_usuario_por_id | id | TABLE | Busca usuário pelo ID |
| buscar_usuario_por_nome_usuario | nome_usuario | TABLE | Busca usuário pelo nome de usuário |
| buscar_usuario_por_email | email | TABLE | Busca usuário pelo e-mail |

#### Fóruns

| Function | Parâmetros | Retorno | Descrição |
|----------|------------|---------|-----------|
| buscar_forum_por_nome | nome | TABLE | Busca fórum pelo nome |
| buscar_forum_por_id | id | TABLE | Busca fórum pelo ID |
| listar_foruns | - | TABLE | Lista todos os fóruns ativos |
| listar_seguidores_forum | id | TABLE | Lista seguidores de um fórum |

#### Tags

| Function | Parâmetros | Retorno | Descrição |
|----------|------------|---------|-----------|
| buscar_tags_por_criador | id_criador | TABLE | Lista tags criadas por um usuário |
| listar_tags | - | TABLE | Lista todas as tags do sistema |
| buscar_tags_relevantes | chars, quantidade | TABLE | Busca tags similares (usando pg_trgm) |
| listar_tags_relacionadas_forum | id_forum | TABLE | Lista tags associadas a um fórum |

#### Postagens e Comentários

| Function | Parâmetros | Retorno | Descrição |
|----------|------------|---------|-----------|
| listar_postagens_forum | id_forum, offset_pagina | TABLE | Lista postagens de um fórum (20/página) |
| listar_comentarios_postagem | id_postagem | TABLE | Lista comentários de uma postagem |
| buscar_postagem | id_postagem | TABLE | Busca detalhes completos de uma postagem |
| listar_postagens_feed | id_usuario, offset_pagina | TABLE | Feed personalizado (fóruns seguidos) |
| listar_postagens_usuario | id_usuario, p_pagina | TABLE | Lista postagens de um usuário |

#### Arquivos

| Function | Parâmetros | Retorno | Descrição |
|----------|------------|---------|-----------|
| listar_arquivos_forum | id_forum, offset_pagina | TABLE | Lista arquivos de um fórum (20/página) |
| listar_anos_com_arquivo | id_forum | TABLE | Lista anos com arquivos no fórum |
| listar_tags_arquivo_por_ano | id_forum, ano | TABLE | Lista tags de arquivos por ano |
| listar_postagens_arquivo | id_forum, ano, id_tag | TABLE | Lista postagens de arquivo filtradas |

#### Utilitários

| Function | Parâmetros | Retorno | Descrição |
|----------|------------|---------|-----------|
| checar_se_usuario_segue_forum | id_usuario, id_forum | TABLE | Verifica se usuário segue um fórum |

## Views do Schema Privado

| View | Descrição | Utilizada para |
|------|-----------|----------------|
| login_usuario | Dados básicos para autenticação | Login/Autenticação |
| perfil_usuario | Perfil completo com seguidores, seguindo e karma | Página de perfil do usuário |
| visualizar_forum | Cabeçalho do fórum com seguidores | Exibição do fórum |
| visualizar_postagem | Postagem completa com tags, engajamento e comentários | Visualização de postagem |
| exibir_comentarios | Comentários com informações do autor e engajamento | Exibição de comentários |
| cabecalho_denuncia | Cabeçalho base das denúncias | Listagem de denúncias |
| corpo_denuncia_usuario | Denúncia de usuário com perfil completo | Detalhe de denúncia de usuário |
| corpo_denuncia_postagem | Denúncia de postagem com conteúdo | Detalhe de denúncia de postagem |
| corpo_denuncia_comentario | Denúncia de comentário com dados do conteúdo pai | Detalhe de denúncia de comentário |

## Índices do Schema Privado

### Tabela usuario

| Índice | Coluna(s) | Utilização |
|--------|-----------|-------------|
| idx_usuario_email | email | Login e busca por email |
| idx_usuario_nome_usuario | nome_usuario | Login e busca por nome |
| idx_usuario_status | status | Filtro de usuários ativos |
| idx_usuario_excluido_em | excluido_em | Soft delete |

### Tabela forum

| Índice | Coluna(s) | Utilização |
|--------|-----------|-------------|
| idx_forum_nome | nome | Busca por nome do fórum |
| idx_forum_status | status | Filtro por status |
| idx_forum_criador | criador | Verificação de criação |

### Tabela tag

| Índice | Coluna(s) | Utilização |
|--------|-----------|-------------|
| idx_tag_tag_trgm | tag (GIN) | Busca textual similar (pg_trgm) |
| idx_tag_criador | criador | Busca tags por criador |
| idx_tag_tag | tag | Ordenação de tags |

### Tabela conteudo

| Índice | Coluna(s) | Utilização |
|--------|-----------|-------------|
| idx_conteudo_criado_em | criado_em DESC | Ordenação por data |
| idx_conteudo_criador | criador | Busca por autor |
| idx_conteudo_status | status | Filtro de status |

### Tabela postagem

| Índice | Coluna(s) | Utilização |
|--------|-----------|-------------|
| idx_postagem_forum | forum | Busca por fórum |
| idx_postagem_forum_criado | forum, id DESC | Paginação de postagens |
| idx_postagem_arquivo | arquivo (WHERE NOT NULL) | Busca de arquivos |
| idx_postagem_forum_arquivo | forum, id DESC (WHERE NOT NULL) | Arquivos por fórum |

### Tabela comentario

| Índice | Coluna(s) | Utilização |
|--------|-----------|-------------|
| idx_comentario_conteudo_pai | conteudo_pai | Busca hierárquica |
| idx_comentario_conteudo_pai_id | conteudo_pai, id | Ordenação de comentários |
| idx_comentario_nivel | nivel | Filtro por nível |

### Tabelas de Relacionamento

| Tabela | Índice | Utilização |
|--------|--------|-------------|
| classificacao | idx_classificacao_tag, idx_classificacao_postagem | Filtros de tags |
| avaliacao | idx_avaliacao_conteudo | Cálculo de karma e engajamento |
| seguir_forum | idx_seguir_forum_forum, idx_seguir_forum_usuario, idx_seguir_forum_usuario_forum, idx_seguir_forum_usuario_forum_list | Seguidores e feed |
| seguir_usuario | idx_seguir_usuario_seguidor, idx_seguir_usuario_seguido | Rede de seguidores |
| incluir_tag | idx_incluir_tag_forum, idx_incluir_tag_tag, idx_incluir_tag_forum_tag | Tags de fóruns |
| denuncia | idx_denuncia_denunciante, idx_denuncia_status | Gestão de denúncias |
| denuncia_usuario | idx_denuncia_usuario_denunciado, idx_denuncia_usuario_denunciante_denunciado | Prevenção de duplicatas |
| denuncia_conteudo | idx_denuncia_conteudo_denunciado, idx_denuncia_conteudo_id_conteudo | Prevenção de duplicatas |

### Extensão Utilizada

CREATE EXTENSION IF NOT EXISTS pg_trgm;

A extensão pg_trgm é necessária para busca textual similar em tags através do índice idx_tag_tag_trgm.

## Estrutura das Tabelas

### Tabelas Principais

| Tabela | Descrição | Chaves Estrangeiras |
|--------|-----------|---------------------|
| identidade_visual | Imagens de perfil e banner | - |
| usuario | Usuários do sistema | identidade_visual |
| forum | Fóruns de discussão | criador, validador, identidade_visual |
| tag | Tags do sistema | criador |
| conteudo | Base para postagens e comentários | criador |
| postagem | Postagens (herda conteúdo) | forum |
| comentario | Comentários (herda conteúdo) | conteudo_pai |
| denuncia | Denúncias gerais | denunciante, resolvido_por |

### Tabelas de Relacionamento

| Tabela | Relacionamento | Cardinalidade |
|--------|---------------|---------------|
| denuncia_usuario | Denúncia → Usuário | N:N (via denúncia) |
| denuncia_conteudo | Denúncia → Conteúdo | N:N (via denúncia) |
| avaliacao | Usuário → Conteúdo | N:N (avaliação única) |
| classificacao | Postagem → Tag | N:N |
| seguir_forum | Usuário → Fórum | N:N |
| seguir_usuario | Usuário → Usuário | N:N (auto-relacionamento) |
| incluir_tag | Tag → Fórum | N:N |

### Constraints e Validações

- Cargos: USUARIO, VALIDADOR, ADMIN, SUPERADMIN
- Status de usuário: ATIVO, SILENCIADO
- Status de fórum: ESPERA, ATIVO, RECUSADO
- Status de conteúdo: PUBLICADO, FIXADO
- Status de denúncia: ABERTA, RESOLVIDA, IGNORADA
- Níveis de comentário: 1 a 5
- Avaliação: 1 (upvote), -1 (downvote)
