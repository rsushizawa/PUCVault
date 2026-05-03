# Documentação do Esquema Publico

## Visão Geral
Este documento descreve todas as **procedures** (escrita) e **functions** (leitura) disponíveis no esquema `publico` do banco de dados, bem como as **views** e **índices** utilizados para otimização.

---

## ÍNDICES IMPLEMENTADOS

### Tabela `usuario`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_usuario_email` | B-Tree | `email` | Busca por email (`dados_login_usuario`, `buscar_usuario_por_email`) |
| `idx_usuario_nome_usuario` | B-Tree | `nome_usuario` | Busca por nome de usuário (`dados_login_usuario`, `buscar_usuario_por_nome_usuario`) |
| `idx_usuario_status` | B-Tree | `status` | Filtro por status (`perfil_usuario`, `listar_usuarios`) |
| `idx_usuario_excluido_em` | B-Tree | `excluido_em` | Filtro de usuários não excluídos (`login_usuario`, `perfil_usuario`) |
| `idx_forum_criador` | B-Tree | `criador` | Verificação de fóruns criados (`deletar_usuario`) |

### Tabela `forum`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_forum_nome` | B-Tree | `nome` | Busca por nome (`buscar_forum_por_nome`) |
| `idx_forum_status` | B-Tree | `status` | Filtro por status (`listar_foruns`, `visualizar_forum`) |
| `idx_forum_criador` | B-Tree | `criador` | Verificação de fóruns criados (`deletar_usuario`) |

### Tabela `tag`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_tag_tag_trgm` | GIN (pg_trgm) | `tag` | Busca textual por similaridade (`buscar_tags_relevantes`) |
| `idx_tag_criador` | B-Tree | `criador` | Busca tags por criador (`buscar_tags_por_criador`, `deletar_usuario`) |
| `idx_tag_tag` | B-Tree | `tag` | Ordenação por nome (`listar_tags`) |

### Tabela `conteudo`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_conteudo_criado_em` | B-Tree | `criado_em DESC` | Ordenação cronológica (`listar_postagens_forum`, `listar_arquivos_forum`) |
| `idx_conteudo_criador` | B-Tree | `criador` | Busca de conteúdo por criador (`deletar_conteudo`, `listar_postagens_feed`) |
| `idx_conteudo_status` | B-Tree | `status` | Filtro por status das views |

### Tabela `postagem`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_postagem_forum` | B-Tree | `forum` | Filtro por fórum (`listar_postagens_forum`, `listar_arquivos_forum`) |
| `idx_postagem_forum_criado` | B-Tree | `forum, id DESC` | Ordenação combinada com filtro de fórum |
| `idx_postagem_arquivo` | B-Tree (parcial) | `arquivo` WHERE `arquivo IS NOT NULL` | Filtro de postagens com arquivo (`listar_arquivos_forum`) |
| `idx_postagem_forum_arquivo` | B-Tree (parcial) | `forum, id DESC` WHERE `arquivo IS NOT NULL` | Filtro combinado de fórum + arquivo |

### Tabela `comentario`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_comentario_conteudo_pai` | B-Tree | `conteudo_pai` | CTE recursiva (`listar_comentarios_postagem`) |
| `idx_comentario_conteudo_pai_id` | B-Tree | `conteudo_pai, id` | Ordenação dentro da recursão |
| `idx_comentario_nivel` | B-Tree | `nivel` | Ordenação por nível |

### Tabela `classificacao`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_classificacao_tag` | B-Tree | `tag` | Agrupamento para contagem de usos (`buscar_tags_relevantes`) |
| `idx_classificacao_postagem` | B-Tree | `postagem` | JOIN com postagem (`listar_tags_arquivo_por_ano`, `listar_postagens_arquivo`) |

### Tabela `avaliacao`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_avaliacao_conteudo` | B-Tree | `conteudo` | Cálculo de engajamento e karma (`visualizar_postagem`, `perfil_usuario`) |

### Tabela `seguir_forum`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_seguir_forum_forum` | B-Tree | `forum` | Listagem de seguidores (`listar_seguidores_forum`) |
| `idx_seguir_forum_usuario` | B-Tree | `usuario` | Verificação se usuário segue (`alternar_seguir_forum`) |
| `idx_seguir_forum_usuario_forum` | B-Tree | `usuario, forum` | Verificação combinada (`checar_se_usuario_segue_forum`) |
| `idx_seguir_forum_usuario_forum_list` | B-Tree | `usuario, forum` | Subquery do feed (`listar_postagens_feed`) |

### Tabela `seguir_usuario`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_seguir_usuario_seguidor` | B-Tree | `seguidor` | Listagem de quem o usuário segue (`listar_postagens_feed`) |
| `idx_seguir_usuario_seguido` | B-Tree | `seguido` | Contagem de seguidores (`perfil_usuario`) |

### Tabela `incluir_tag`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_incluir_tag_forum` | B-Tree | `forum` | Tags relacionadas a um fórum (`listar_tags_relacionadas_forum`) |
| `idx_incluir_tag_tag` | B-Tree | `tag` | Verificação de tag em fórum |
| `idx_incluir_tag_forum_tag` | B-Tree | `forum, tag` | Verificação combinada (`incluir_tag_forum`, `remover_tag_forum`) |

### Tabela `denuncia`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_denuncia_denunciante` | B-Tree | `denunciante` | Verificação de denúncias feitas (`deletar_usuario`) |
| `idx_denuncia_status` | B-Tree | `status` | Filtro por status (`resolver_denuncia`) |

### Tabela `denuncia_usuario`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_denuncia_usuario_denunciado` | B-Tree | `usuario_denunciado` | Verificação de duplicata (`inserir_denuncia_usuario`) |
| `idx_denuncia_usuario_denunciante_denunciado` | B-Tree | `id, usuario_denunciado` | JOIN para verificação de duplicata |

### Tabela `denuncia_conteudo`
| Índice | Tipo | Colunas | Benefício |
|--------|------|---------|-----------|
| `idx_denuncia_conteudo_denunciado` | B-Tree | `conteudo_denunciado` | Verificação de duplicata (`inserir_denuncia_conteudo`) |
| `idx_denuncia_conteudo_id_conteudo` | B-Tree | `id, conteudo_denunciado` | JOIN para verificação de duplicata |

---

## PROCEDURES (Operações de Escrita)

### 1. `inserir_usuario`
**Descrição:** Insere um novo usuário no sistema.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome | VARCHAR | Nome completo do usuário |
| p_nome_usuario | VARCHAR | Nome de usuário único |
| p_email | VARCHAR | Email do usuário |
| p_senha_hash | VARCHAR | Hash da senha |

**Índices beneficiados:** Nenhum (operação de INSERT)

---

### 2. `atualizar_nome_usuario`
**Descrição:** Atualiza o nome de um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_novo_nome | VARCHAR | Novo nome do usuário |

**Índices beneficiados:** `idx_usuario_*` (indiretamente, na cláusula WHERE pela PK)

---

### 3. `atualizar_senha_usuario`
**Descrição:** Atualiza a senha de um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_nova_senha_hash | VARCHAR | Nova hash da senha |

**Índices beneficiados:** Nenhum específico

---

### 4. `deletar_usuario`
**Descrição:** Remove um usuário (soft delete se tiver vínculos, hard delete caso contrário).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |

**Índices beneficiados:**
- `idx_forum_criador` - Verifica se criou fórum
- `idx_tag_criador` - Verifica se criou tag
- `idx_denuncia_denunciante` - Verifica se fez denúncia

---

### 5. `alternar_status_usuario`
**Descrição:** Alterna o status do usuário entre 'ATIVO' e 'SILENCIADO'.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |

**Índices beneficiados:** Nenhum específico

---

### 6. `alterar_cargo_usuario`
**Descrição:** Altera o cargo de um usuário (regras de permissão aplicadas).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_executor_id | INT | ID do usuário que está realizando a ação |
| p_alvo_id | INT | ID do usuário que terá o cargo alterado |
| p_novo_cargo | VARCHAR | Novo cargo ('USUARIO', 'VALIDADOR', 'ADMIN', 'SUPERADMIN') |

**Índices beneficiados:** Nenhum específico

---

### 7. `atualizar_identidade_visual`
**Descrição:** Atualiza a imagem de perfil ou banner de uma identidade visual.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_identidade_visual_id | INT | ID da identidade visual |
| p_campo | VARCHAR | Campo a atualizar ('perfil' ou 'banner') |
| p_novo_id | TEXT | Novo ID da imagem (Cloudflare Images) |

**Índices beneficiados:** Nenhum específico

---

### 8. `inserir_forum`
**Descrição:** Insere um novo fórum (status inicial 'ESPERA').
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome | VARCHAR | Nome do fórum |
| p_descricao | VARCHAR | Descrição do fórum |
| p_criador | INT | ID do usuário criador |

**Índices beneficiados:** Nenhum (operação de INSERT)

---

### 9. `validar_forum`
**Descrição:** Valida ou recusa um fórum em espera.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_validador_id | INT | ID do usuário validador |
| p_novo_status | VARCHAR | 'ATIVO' ou 'RECUSADO' |

**Índices beneficiados:**
- `idx_forum_status` - Verifica status atual do fórum

---

### 10. `atualizar_descricao_forum`
**Descrição:** Atualiza a descrição de um fórum (apenas o criador e apenas se ativo).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_usuario_id | INT | ID do usuário (deve ser o criador) |
| p_nova_descricao | VARCHAR | Nova descrição |

**Índices beneficiados:** Nenhum específico

---

### 11. `inserir_tag`
**Descrição:** Insere uma nova tag.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tag | VARCHAR | Nome da tag |
| p_criador | INT | ID do usuário criador |

**Índices beneficiados:** Nenhum (operação de INSERT)
**Observação:** Tags agora são ATIVAS por padrão (não requerem validação)

---

### 12. `validar_tag`
**Descrição:** Valida ou recusa uma tag em espera.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tag_id | INT | ID da tag |
| p_validador_id | INT | ID do usuário validador |
| p_novo_status | VARCHAR | 'ATIVO' ou 'RECUSADO' |

**Índices beneficiados:** Nenhum (procedimento removido - tags não precisam mais validação)

---

### 13. `inserir_postagem`
**Descrição:** Insere uma nova postagem em um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_titulo | VARCHAR | Título da postagem |
| p_conteudo | TEXT | Conteúdo da postagem |
| p_criador | INT | ID do usuário criador |
| p_forum | INT | ID do fórum |
| p_arquivo | TEXT | ID do arquivo (Cloudflare Images) |
| p_tags | INT[] | Array de IDs das tags (opcional) |

**Índices beneficiados:** Nenhum (operação de INSERT)

---

### 14. `inserir_comentario`
**Descrição:** Insere um comentário em uma postagem ou outro comentário (máx. 5 níveis).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_conteudo | TEXT | Conteúdo do comentário |
| p_criador | INT | ID do usuário criador |
| p_conteudo_pai | INT | ID da postagem ou comentário pai |

**Índices beneficiados:** Nenhum (operação de INSERT)

---

### 15. `deletar_conteudo`
**Descrição:** Remove um conteúdo (postagem ou comentário).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_conteudo_id | INT | ID do conteúdo |
| p_executor_id | INT | ID do usuário executor (criador ou SUPERADMIN) |

**Índices beneficiados:**
- `idx_conteudo_criador` - Verifica se executor é o criador

---

### 16. `avaliar_conteudo`
**Descrição:** Avalia um conteúdo com like (1), dislike (-1) ou remove avaliação (0).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_conteudo_id | INT | ID do conteúdo |
| p_avaliacao | SMALLINT | 1 (like), -1 (dislike), 0 (remover) |

**Índices beneficiados:** Nenhum específico

---

### 17. `inserir_denuncia_usuario`
**Descrição:** Registra uma denúncia contra um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tipo | VARCHAR | Tipo da denúncia |
| p_denunciante_id | INT | ID do usuário denunciante |
| p_denunciado_id | INT | ID do usuário denunciado |

**Índices beneficiados:**
- `idx_denuncia_usuario_denunciado` - Verificação de duplicata
- `idx_denuncia_usuario_denunciante_denunciado` - JOIN para duplicata

---

### 18. `inserir_denuncia_conteudo`
**Descrição:** Registra uma denúncia contra um conteúdo.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tipo | VARCHAR | Tipo da denúncia |
| p_denunciante_id | INT | ID do usuário denunciante |
| p_conteudo_id | INT | ID do conteúdo denunciado |

**Índices beneficiados:**
- `idx_denuncia_conteudo_denunciado` - Verificação de duplicata
- `idx_denuncia_conteudo_id_conteudo` - JOIN para duplicata

---

### 19. `resolver_denuncia`
**Descrição:** Resolve ou ignora uma denúncia aberta.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_denuncia_id | INT | ID da denúncia |
| p_executor_id | INT | ID do usuário executor (ADMIN ou SUPERADMIN) |
| p_novo_status | VARCHAR | 'RESOLVIDA' ou 'IGNORADA' |

**Índices beneficiados:**
- `idx_denuncia_status` - Verifica status atual da denúncia

---

### 20. `alternar_seguir_forum`
**Descrição:** Segue ou deixa de seguir um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_forum_id | INT | ID do fórum |

**Índices beneficiados:**
- `idx_seguir_forum_usuario_forum` - Verifica se já segue

---

### 21. `alternar_seguir_usuario`
**Descrição:** Segue ou deixa de seguir um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_seguidor_id | INT | ID do seguidor |
| p_seguido_id | INT | ID do usuário a ser seguido |

**Índices beneficiados:** Nenhum específico

---

### 22. `incluir_tag_forum`
**Descrição:** Relaciona uma tag a um fórum (apenas o criador do fórum pode fazer).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário (deve ser o criador do fórum) |
| p_forum_id | INT | ID do fórum |
| p_tag_id | INT | ID da tag |

**Índices beneficiados:**
- `idx_incluir_tag_forum_tag` - Verifica se tag já está relacionada

---

### 23. `remover_tag_forum`
**Descrição:** Remove a relação entre uma tag e um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário (deve ser o criador do fórum) |
| p_forum_id | INT | ID do fórum |
| p_tag_id | INT | ID da tag |

**Índices beneficiados:**
- `idx_incluir_tag_forum_tag` - Verifica se tag está relacionada

---

## FUNCTIONS (Operações de Leitura)

### 1. `dados_login_usuario`
**Descrição:** Busca dados de login de um usuário por email ou nome de usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_email | VARCHAR | Email do usuário (opcional) |
| p_nome_usuario | VARCHAR | Nome de usuário (opcional) |

**Retorno:** SETOF `privado.login_usuario`

**Índices beneficiados:**
- `idx_usuario_email` - Busca por email
- `idx_usuario_nome_usuario` - Busca por nome de usuário
- `idx_usuario_excluido_em` - Filtro de usuários não excluídos

**Colunas retornadas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do usuário |
| 2 | nome_usuario | VARCHAR | Nome de usuário |
| 3 | email | VARCHAR | Email do usuário |
| 4 | status | VARCHAR | Status do usuário (ATIVO/SILENCIADO) |
| 5 | senha_hash | VARCHAR | Hash da senha |

---

### 2. `listar_usuarios`
**Descrição:** Lista todos os usuários.
**Parâmetros:** Nenhum

**Retorno:** SETOF `privado.perfil_usuario`

**Índices beneficiados:**
- `idx_usuario_excluido_em` - Filtro de exclusão (via view)
- `idx_usuario_status` - Filtro de status (via view)
- `idx_avaliacao_conteudo` - Cálculo de karma (via view)

**Colunas retornadas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do usuário |
| 2 | nome | VARCHAR | Nome completo do usuário |
| 3 | nome_usuario | VARCHAR | Nome de usuário |
| 4 | status | VARCHAR | Status do usuário (ATIVO/SILENCIADO) |
| 5 | criado_em | TIMESTAMPTZ | Data de criação da conta |
| 6 | img_perfil | TEXT | ID da imagem de perfil |
| 7 | img_banner | TEXT | ID da imagem de banner |
| 8 | seguidores | BIGINT | Número de seguidores |
| 9 | segue | BIGINT | Número de usuários que segue |
| 10 | karma | BIGINT | Pontuação total (soma de avaliações recebidas) |

---

### 3. `buscar_usuario_por_id`
**Descrição:** Busca um usuário pelo ID.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do usuário |

**Retorno:** SETOF `privado.perfil_usuario`

**Índices beneficiados:** PK (acesso direto)

---

### 4. `buscar_usuario_por_nome_usuario`
**Descrição:** Busca um usuário pelo nome de usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome_usuario | VARCHAR | Nome de usuário |

**Retorno:** SETOF `privado.perfil_usuario`

**Índices beneficiados:**
- `idx_usuario_nome_usuario` - Busca exata pelo nome

---

### 5. `buscar_usuario_por_email`
**Descrição:** Busca um usuário pelo email.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_email | VARCHAR | Email do usuário |

**Retorno:** SETOF `privado.perfil_usuario`

**Índices beneficiados:**
- `idx_usuario_email` - Busca exata pelo email

---

### 6. `buscar_forum_por_nome`
**Descrição:** Busca fóruns ativos pelo nome.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome | VARCHAR | Nome do fórum |

**Retorno:** SETOF `privado.visualizar_forum`

**Índices beneficiados:**
- `idx_forum_nome` - Busca pelo nome
- `idx_forum_status` - Filtro por status 'ATIVO'

---

### 7. `buscar_forum_por_id`
**Descrição:** Busca um fórum ativo pelo ID.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do fórum |

**Retorno:** SETOF `privado.visualizar_forum`

**Índices beneficiados:** PK (acesso direto)

---

### 8. `listar_foruns`
**Descrição:** Lista todos os fóruns ativos.
**Parâmetros:** Nenhum

**Retorno:** SETOF `privado.visualizar_forum`

**Índices beneficiados:**
- `idx_forum_status` - Filtro por status 'ATIVO'
- `idx_seguir_forum_forum` - Contagem de seguidores (via view)

---

### 9. `listar_seguidores_forum`
**Descrição:** Lista todos os seguidores de um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do fórum |

**Retorno:** SETOF `privado.perfil_usuario`

**Índices beneficiados:**
- `idx_seguir_forum_forum` - JOIN com seguir_forum

---

### 10. `buscar_tags_por_criador`
**Descrição:** Busca todas as tags criadas por um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do usuário criador |

**Retorno:** SETOF `privado.tag`

**Índices beneficiados:**
- `idx_tag_criador` - Filtro pelo criador

**Colunas retornadas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID da tag |
| 2 | tag | VARCHAR | Nome da tag |
| 3 | criado_em | TIMESTAMPTZ | Data de criação da tag |
| 4 | criador | INT | ID do usuário criador |

---

### 11. `listar_postagens_forum`
**Descrição:** Lista as postagens de um fórum com paginação.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_pagina | INT | Número da página (padrão: 1) |

**Retorno:** SETOF `privado.visualizar_postagem` (20 por página)

**Índices beneficiados:**
- `idx_postagem_forum_criado` - Filtro por fórum + ordenação por ID
- `idx_conteudo_criado_em` - Ordenação cronológica
- `idx_avaliacao_conteudo` - Cálculo de engajamento (via view)

---

### 12. `listar_arquivos_forum`
**Descrição:** Lista postagens com arquivo anexado em um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_pagina | INT | Número da página (padrão: 1) |

**Retorno:** SETOF `privado.visualizar_postagem` (20 por página)

**Índices beneficiados:**
- `idx_postagem_forum_arquivo` - Filtro por fórum + arquivo não nulo

---

### 13. `listar_comentarios_postagem`
**Descrição:** Lista comentários de uma postagem de forma hierárquica (recursiva).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_postagem_id | INT | ID da postagem |

**Retorno:** SETOF `privado.exibir_comentarios`

**Índices beneficiados:**
- `idx_comentario_conteudo_pai` - CTE recursiva (busca por pai)
- `idx_comentario_conteudo_pai_id` - Ordenação dentro da recursão
- `idx_comentario_nivel` - Ordenação por nível

---

### 14. `listar_tags`
**Descrição:** Lista todas as tags do sistema.
**Parâmetros:** Nenhum

**Retorno:** SETOF `privado.tag`

**Índices beneficiados:**
- `idx_tag_tag` - Ordenação por nome

---

### 15. `buscar_postagem`
**Descrição:** Busca uma postagem pelo ID.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID da postagem |

**Retorno:** SETOF `privado.visualizar_postagem`

**Índices beneficiados:** PK (acesso direto)

---

### 16. `buscar_tags_relevantes`
**Descrição:** Busca tags por similaridade textual com ranking de relevância.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_busca | VARCHAR | Termo de busca |
| p_limite | INT | Número máximo de resultados (padrão: 5) |

**Retorno:** TABLE (id INT, tag VARCHAR, total_usos BIGINT, relevancia INT)

**Índices beneficiados:**
- `idx_tag_tag_trgm` - Busca textual por similaridade (GIN trigram)
- `idx_classificacao_tag` - Contagem de usos da tag

---

### 17. `listar_tags_relacionadas_forum`
**Descrição:** Lista todas as tags associadas a um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum | INT | ID do fórum |

**Retorno:** SETOF `privado.tag`

**Índices beneficiados:**
- `idx_incluir_tag_forum` - JOIN com incluir_tag por fórum

---

### 18. `listar_postagens_feed`
**Descrição:** Gera feed personalizado para um usuário baseado nos fóruns e usuários que segue, ordenado por relevância (algoritmo de Reddit).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_pagina | INT | Número da página (padrão: 1) |

**Retorno:** SETOF `privado.visualizar_postagem` (20 por página)

**Índices beneficiados:**
- `idx_seguir_forum_usuario_forum_list` - Subquery de fóruns seguidos
- `idx_seguir_usuario_seguidor` - Subquery de usuários seguidos
- `idx_conteudo_criador` - Busca por criador
- `idx_conteudo_criado_em` - Cálculo de relevância temporal

---

### 19. `listar_anos_com_arquivo`
**Descrição:** Retorna os anos que possuem postagens com arquivo em um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |

**Retorno:** TABLE (ano INT)

**Índices beneficiados:**
- `idx_postagem_arquivo` - Filtro de arquivo não nulo
- `idx_conteudo_criado_em` - Extração do ano

---

### 20. `listar_tags_arquivo_por_ano`
**Descrição:** Retorna as tags de postagens com arquivo em um fórum e ano específicos.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_ano | INT | Ano |

**Retorno:** SETOF `privado.tag`

**Índices beneficiados:**
- `idx_postagem_arquivo` - Filtro de arquivo não nulo
- `idx_postagem_forum` - Filtro por fórum
- `idx_classificacao_postagem` - JOIN com classificacao
- `idx_conteudo_criado_em` - Filtro por ano

---

### 21. `listar_postagens_arquivo`
**Descrição:** Retorna postagens com arquivo filtradas por fórum, ano e tag.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_ano | INT | Ano |
| p_tag_id | INT | ID da tag |

**Retorno:** SETOF `privado.visualizar_postagem`

**Índices beneficiados:**
- `idx_postagem_forum_arquivo` - Filtro por fórum + arquivo
- `idx_classificacao_postagem` - Filtro por tag
- `idx_conteudo_criado_em` - Filtro por ano

---

### 22. `checar_se_usuario_segue_forum`
**Descrição:** Verifica se um usuário segue um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario | INT | ID do usuário |
| p_forum | INT | ID do fórum |

**Retorno:** TABLE (segue BOOLEAN)

**Índices beneficiados:**
- `idx_seguir_forum_usuario_forum` - Verificação combinada

---

## VIEWS (Estruturas de Dados)

### 1. `privado.login_usuario`
**Descrição:** Utilizada para autenticação de usuários.
**Índices beneficiados:** `idx_usuario_excluido_em`

---

### 2. `privado.perfil_usuario`
**Descrição:** Utilizada para exibir a página de perfil de um usuário.
**Índices beneficiados:** `idx_usuario_excluido_em`, `idx_avaliacao_conteudo`, `idx_seguir_usuario_seguido`, `idx_seguir_usuario_seguidor`

---

### 3. `privado.visualizar_forum`
**Descrição:** Utilizada para exibir informações de um fórum.
**Índices beneficiados:** `idx_seguir_forum_forum`

---

### 4. `privado.visualizar_postagem`
**Descrição:** Utilizada para exibir postagens com informações agregadas.
**Índices beneficiados:** `idx_avaliacao_conteudo`, `idx_comentario_conteudo_pai`, `idx_classificacao_postagem`

---

### 5. `privado.exibir_comentarios`
**Descrição:** Utilizada para exibir comentários com informações do criador e engajamento.
**Índices beneficiados:** `idx_avaliacao_conteudo`
