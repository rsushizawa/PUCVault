# Documentação do Esquema Publico

## Visão Geral
Este documento descreve todas as **procedures** (escrita) e **functions** (leitura) disponíveis no esquema `publico` do banco de dados, bem como as **views** utilizadas para consulta.

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

**Retorno:** Nenhum

---

### 2. `atualizar_nome_usuario`
**Descrição:** Atualiza o nome de um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_novo_nome | VARCHAR | Novo nome do usuário |

**Retorno:** Nenhum

---

### 3. `atualizar_senha_usuario`
**Descrição:** Atualiza a senha de um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_nova_senha_hash | VARCHAR | Nova hash da senha |

**Retorno:** Nenhum

---

### 4. `deletar_usuario`
**Descrição:** Remove um usuário (soft delete se tiver vínculos, hard delete caso contrário).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |

**Retorno:** Nenhum

---

### 5. `alternar_status_usuario`
**Descrição:** Alterna o status do usuário entre 'ATIVO' e 'SILENCIADO'.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |

**Retorno:** Nenhum

---

### 6. `alterar_cargo_usuario`
**Descrição:** Altera o cargo de um usuário (regras de permissão aplicadas).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_executor_id | INT | ID do usuário que está realizando a ação |
| p_alvo_id | INT | ID do usuário que terá o cargo alterado |
| p_novo_cargo | VARCHAR | Novo cargo ('USUARIO', 'VALIDADOR', 'ADMIN', 'SUPERADMIN') |

**Retorno:** Nenhum

---

### 7. `atualizar_identidade_visual`
**Descrição:** Atualiza a imagem de perfil ou banner de uma identidade visual.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_identidade_visual_id | INT | ID da identidade visual |
| p_campo | VARCHAR | Campo a atualizar ('perfil' ou 'banner') |
| p_novo_id | TEXT | Novo ID da imagem (Cloudflare Images) |

**Retorno:** Nenhum

---

### 8. `inserir_forum`
**Descrição:** Insere um novo fórum (status inicial 'ESPERA').
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome | VARCHAR | Nome do fórum |
| p_descricao | VARCHAR | Descrição do fórum |
| p_criador | INT | ID do usuário criador |

**Retorno:** Nenhum

---

### 9. `validar_forum`
**Descrição:** Valida ou recusa um fórum em espera.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_validador_id | INT | ID do usuário validador |
| p_novo_status | VARCHAR | 'ATIVO' ou 'RECUSADO' |

**Retorno:** Nenhum

---

### 10. `atualizar_descricao_forum`
**Descrição:** Atualiza a descrição de um fórum (apenas o criador e apenas se ativo).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_usuario_id | INT | ID do usuário (deve ser o criador) |
| p_nova_descricao | VARCHAR | Nova descrição |

**Retorno:** Nenhum

---

### 11. `inserir_tag`
**Descrição:** Insere uma nova tag (status inicial 'ESPERA').
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tag | VARCHAR | Nome da tag |
| p_criador | INT | ID do usuário criador |

**Retorno:** Nenhum

---

### 12. `validar_tag`
**Descrição:** Valida ou recusa uma tag em espera.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tag_id | INT | ID da tag |
| p_validador_id | INT | ID do usuário validador |
| p_novo_status | VARCHAR | 'ATIVO' ou 'RECUSADO' |

**Retorno:** Nenhum

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

**Retorno:** Nenhum

---

### 14. `inserir_comentario`
**Descrição:** Insere um comentário em uma postagem ou outro comentário (máx. 5 níveis).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_conteudo | TEXT | Conteúdo do comentário |
| p_criador | INT | ID do usuário criador |
| p_conteudo_pai | INT | ID da postagem ou comentário pai |

**Retorno:** Nenhum

---

### 15. `deletar_conteudo`
**Descrição:** Remove um conteúdo (postagem ou comentário).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_conteudo_id | INT | ID do conteúdo |
| p_executor_id | INT | ID do usuário executor (criador ou SUPERADMIN) |

**Retorno:** Nenhum

---

### 16. `avaliar_conteudo`
**Descrição:** Avalia um conteúdo com like (1), dislike (-1) ou remove avaliação (0).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_conteudo_id | INT | ID do conteúdo |
| p_avaliacao | SMALLINT | 1 (like), -1 (dislike), 0 (remover) |

**Retorno:** Nenhum

---

### 17. `inserir_denuncia_usuario`
**Descrição:** Registra uma denúncia contra um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tipo | VARCHAR | Tipo da denúncia |
| p_denunciante_id | INT | ID do usuário denunciante |
| p_denunciado_id | INT | ID do usuário denunciado |

**Retorno:** Nenhum

---

### 18. `inserir_denuncia_conteudo`
**Descrição:** Registra uma denúncia contra um conteúdo.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_tipo | VARCHAR | Tipo da denúncia |
| p_denunciante_id | INT | ID do usuário denunciante |
| p_conteudo_id | INT | ID do conteúdo denunciado |

**Retorno:** Nenhum

---

### 19. `resolver_denuncia`
**Descrição:** Resolve ou ignora uma denúncia aberta.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_denuncia_id | INT | ID da denúncia |
| p_executor_id | INT | ID do usuário executor (ADMIN ou SUPERADMIN) |
| p_novo_status | VARCHAR | 'RESOLVIDA' ou 'IGNORADA' |

**Retorno:** Nenhum

---

### 20. `alternar_seguir_forum`
**Descrição:** Segue ou deixa de seguir um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário |
| p_forum_id | INT | ID do fórum |

**Retorno:** Nenhum

---

### 21. `alternar_seguir_usuario`
**Descrição:** Segue ou deixa de seguir um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_seguidor_id | INT | ID do seguidor |
| p_seguido_id | INT | ID do usuário a ser seguido |

**Retorno:** Nenhum

---

### 22. `incluir_tag_forum`
**Descrição:** Relaciona uma tag a um fórum (apenas o criador do fórum pode fazer isso).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário (deve ser o criador do fórum) |
| p_forum_id | INT | ID do fórum |
| p_tag_id | INT | ID da tag |

**Retorno:** Nenhum

---

### 23. `remover_tag_forum`
**Descrição:** Remove a relação entre uma tag e um fórum (apenas o criador do fórum pode fazer isso).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_usuario_id | INT | ID do usuário (deve ser o criador do fórum) |
| p_forum_id | INT | ID do fórum |
| p_tag_id | INT | ID da tag |

**Retorno:** Nenhum

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

**Colunas retornadas (na ordem):**
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

**Colunas retornadas (na ordem):**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do usuário |
| 2 | nome | VARCHAR | Nome completo do usuário |
| 3 | nome_usuario | VARCHAR | Nome de usuário |
| 4 | status | VARCHAR | Status do usuário (ATIVO/SILENCIADO) |
| 5 | criado_em | TIMESTAMPTZ | Data de criação da conta |
| 6 | img_perfil | TEXT | ID da imagem de perfil (Cloudflare) |
| 7 | img_banner | TEXT | ID da imagem de banner (Cloudflare) |
| 8 | seguidores | BIGINT | Número de seguidores do usuário |
| 9 | segue | BIGINT | Número de usuários que este usuário segue |
| 10 | karma | BIGINT | Pontuação total do usuário (soma das avaliações recebidas) |

---

### 3. `buscar_usuario_por_id`
**Descrição:** Busca um usuário pelo ID.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do usuário |

**Retorno:** SETOF `privado.perfil_usuario`

**Colunas retornadas:** As mesmas de `privado.perfil_usuario`

---

### 4. `buscar_usuario_por_nome_usuario`
**Descrição:** Busca um usuário pelo nome de usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome_usuario | VARCHAR | Nome de usuário |

**Retorno:** SETOF `privado.perfil_usuario`

**Colunas retornadas:** As mesmas de `privado.perfil_usuario`

---

### 5. `buscar_usuario_por_email`
**Descrição:** Busca um usuário pelo email.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_email | VARCHAR | Email do usuário |

**Retorno:** SETOF `privado.perfil_usuario`

**Colunas retornadas:** As mesmas de `privado.perfil_usuario`

---

### 6. `buscar_forum_por_nome`
**Descrição:** Busca fóruns ativos pelo nome.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_nome | VARCHAR | Nome do fórum |

**Retorno:** SETOF `privado.visualizar_forum`

**Colunas retornadas (na ordem):**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do fórum |
| 2 | nome | VARCHAR | Nome do fórum |
| 3 | descricao | VARCHAR | Descrição do fórum |
| 4 | criado_em | TIMESTAMPTZ | Data de criação do fórum |
| 5 | status | VARCHAR | Status do fórum (ATIVO) |
| 6 | nome_usuario | VARCHAR | Nome de usuário do criador |
| 7 | img_perfil | TEXT | ID da imagem de perfil do fórum |
| 8 | img_banner | TEXT | ID da imagem de banner do fórum |
| 9 | seguidores | BIGINT | Número total de seguidores do fórum |

---

### 7. `listar_foruns`
**Descrição:** Lista todos os fóruns ativos.
**Parâmetros:** Nenhum

**Retorno:** SETOF `privado.visualizar_forum`

**Colunas retornadas:** As mesmas de `privado.visualizar_forum`

---

### 8. `listar_seguidores_forum`
**Descrição:** Lista todos os seguidores de um fórum.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do fórum |

**Retorno:** SETOF `privado.perfil_usuario`

**Colunas retornadas:** As mesmas de `privado.perfil_usuario`

---

### 9. `buscar_tags_por_criador`
**Descrição:** Busca todas as tags criadas por um usuário.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID do usuário criador |

**Retorno:** SETOF `privado.tag`

**Colunas retornadas (na ordem):**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID da tag |
| 2 | tag | VARCHAR | Nome da tag |
| 3 | status | VARCHAR | Status da tag (ATIVO/ESPERA/RECUSADO) |
| 4 | criado_em | TIMESTAMPTZ | Data de criação da tag |
| 5 | status_modificado_em | TIMESTAMPTZ | Data da última modificação de status |
| 6 | criador | INT | ID do usuário criador |
| 7 | validador | INT | ID do usuário que validou/recusou |

---

### 10. `listar_postagens_forum`
**Descrição:** Lista as postagens de um fórum com paginação.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_pagina | INT | Número da página (padrão: 1) |

**Retorno:** SETOF `privado.visualizar_postagem`
**Paginação:** 20 resultados por página

**Colunas retornadas (na ordem):**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID da postagem |
| 2 | titulo | VARCHAR | Título da postagem |
| 3 | arquivo | TEXT | ID do arquivo anexado (Cloudflare) |
| 4 | forum | INT | ID do fórum |
| 5 | conteudo | TEXT | Conteúdo da postagem |
| 6 | status | VARCHAR | Status do conteúdo |
| 7 | criado_em | TIMESTAMPTZ | Data de criação da postagem |
| 8 | tempo_de_vida | INTERVAL | Tempo desde a criação (NOW() - criado_em) |
| 9 | nome_usuario | VARCHAR | Nome de usuário do criador |
| 10 | cargo | VARCHAR | Cargo do criador |
| 11 | img_perfil | TEXT | ID da imagem de perfil do criador |
| 12 | tags | TEXT[] | Array de nomes das tags associadas |
| 13 | engajamento | BIGINT | Soma das avaliações (likes - dislikes) |
| 14 | comentarios | BIGINT | Número total de comentários na postagem |

---

### 11. `listar_arquivos_forum`
**Descrição:** Lista todas as postagens que possuem arquivo anexado em um fórum com paginação.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum_id | INT | ID do fórum |
| p_pagina | INT | Número da página (padrão: 1) |

**Retorno:** SETOF `privado.visualizar_postagem`
**Paginação:** 20 resultados por página

**Colunas retornadas:** As mesmas de `privado.visualizar_postagem` (apenas com `arquivo IS NOT NULL`)

---

### 12. `listar_comentarios_postagem`
**Descrição:** Lista todos os comentários de uma postagem de forma hierárquica (recursiva), ordenados por nível e data de criação.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_postagem_id | INT | ID da postagem |

**Retorno:** SETOF `privado.exibir_comentarios`

**Colunas retornadas (na ordem):**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do comentário |
| 2 | conteudo_pai | INT | ID do conteúdo pai (postagem ou comentário) |
| 3 | nivel | SMALLINT | Nível do comentário na árvore (1 a 5) |
| 4 | conteudo_id | INT | ID do conteúdo associado |
| 5 | conteudo | TEXT | Conteúdo do comentário |
| 6 | status | VARCHAR | Status do comentário |
| 7 | criado_em | TIMESTAMPTZ | Data de criação do comentário |
| 8 | tempo_de_vida | INTERVAL | Tempo desde a criação (NOW() - criado_em) |
| 9 | nome_usuario | VARCHAR | Nome de usuário do criador |
| 10 | cargo | VARCHAR | Cargo do criador |
| 11 | img_perfil | TEXT | ID da imagem de perfil do criador |
| 12 | engajamento | BIGINT | Soma das avaliações (likes - dislikes) do comentário |

---

### 13. `listar_tags`
**Descrição:** Lista todas as tags do sistema.
**Parâmetros:** Nenhum

**Retorno:** SETOF `privado.tag`

**Colunas retornadas:** As mesmas de `privado.tag`

---

### 14. `buscar_postagem`
**Descrição:** Busca uma postagem pelo ID.
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_id | INT | ID da postagem |

**Retorno:** SETOF `privado.visualizar_postagem`

**Colunas retornadas:** As mesmas de `privado.visualizar_postagem`

---

### 15. `buscar_tags_relevantes`
**Descrição:** Busca tags relevantes baseado em um termo de busca, ordenadas por relevância (status, correspondência, usos).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_busca | VARCHAR | Termo de busca |
| p_limite | INT | Número máximo de resultados (padrão: 5) |

**Retorno:** TABLE
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID da tag |
| 2 | tag | VARCHAR | Nome da tag |
| 3 | status | VARCHAR | Status da tag |
| 4 | total_usos | BIGINT | Número de usos da tag em postagens |
| 5 | relevancia | INT | Pontuação de relevância calculada |

---

### 16. `listar_tags_relacionadas_forum`
**Descrição:** Lista todas as tags relacionadas a um fórum (através da tabela `incluir_tag`).
**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_forum | INT | ID do fórum |

**Retorno:** SETOF `privado.tag`

**Colunas retornadas:** As mesmas de `privado.tag`

---

## VIEWS (Estruturas de Dados)

### 1. `privado.login_usuario`
**Descrição:** Utilizada para autenticação de usuários. Retorna apenas usuários não excluídos.
**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do usuário |
| 2 | nome_usuario | VARCHAR | Nome de usuário |
| 3 | email | VARCHAR | Email do usuário |
| 4 | status | VARCHAR | Status do usuário (ATIVO/SILENCIADO) |
| 5 | senha_hash | VARCHAR | Hash da senha |

---

### 2. `privado.perfil_usuario`
**Descrição:** Utilizada para exibir a página de perfil de um usuário. Inclui informações de perfil, contagem de seguidores, seguidos e karma.
**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do usuário |
| 2 | nome | VARCHAR | Nome completo do usuário |
| 3 | nome_usuario | VARCHAR | Nome de usuário |
| 4 | status | VARCHAR | Status do usuário (ATIVO/SILENCIADO) |
| 5 | criado_em | TIMESTAMPTZ | Data de criação da conta |
| 6 | img_perfil | TEXT | ID da imagem de perfil (Cloudflare) |
| 7 | img_banner | TEXT | ID da imagem de banner (Cloudflare) |
| 8 | seguidores | BIGINT | Número de seguidores do usuário |
| 9 | segue | BIGINT | Número de usuários que este usuário segue |
| 10 | karma | BIGINT | Pontuação total do usuário (soma das avaliações recebidas) |

---

### 3. `privado.visualizar_forum`
**Descrição:** Utilizada para exibir o cabeçalho/informações de um fórum.
**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do fórum |
| 2 | nome | VARCHAR | Nome do fórum |
| 3 | descricao | VARCHAR | Descrição do fórum |
| 4 | criado_em | TIMESTAMPTZ | Data de criação do fórum |
| 5 | status | VARCHAR | Status do fórum (ATIVO/ESPERA/RECUSADO) |
| 6 | nome_usuario | VARCHAR | Nome de usuário do criador |
| 7 | img_perfil | TEXT | ID da imagem de perfil do fórum |
| 8 | img_banner | TEXT | ID da imagem de banner do fórum |
| 9 | seguidores | BIGINT | Número total de seguidores do fórum |

---

### 4. `privado.visualizar_postagem`
**Descrição:** Utilizada para exibir postagens com todas as informações agregadas (tags, engajamento, comentários, etc.).
**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID da postagem |
| 2 | titulo | VARCHAR | Título da postagem |
| 3 | arquivo | TEXT | ID do arquivo anexado (Cloudflare) |
| 4 | forum | INT | ID do fórum |
| 5 | conteudo | TEXT | Conteúdo da postagem |
| 6 | status | VARCHAR | Status do conteúdo |
| 7 | criado_em | TIMESTAMPTZ | Data de criação da postagem |
| 8 | tempo_de_vida | INTERVAL | Tempo desde a criação (NOW() - criado_em) |
| 9 | nome_usuario | VARCHAR | Nome de usuário do criador |
| 10 | cargo | VARCHAR | Cargo do criador |
| 11 | img_perfil | TEXT | ID da imagem de perfil do criador |
| 12 | tags | TEXT[] | Array de nomes das tags associadas |
| 13 | engajamento | BIGINT | Soma das avaliações (likes - dislikes) |
| 14 | comentarios | BIGINT | Número total de comentários na postagem |

---

### 5. `privado.exibir_comentarios`
**Descrição:** Utilizada para exibir comentários de forma hierárquica com informações do criador e engajamento.
**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID do comentário |
| 2 | conteudo_pai | INT | ID do conteúdo pai (postagem ou comentário) |
| 3 | nivel | SMALLINT | Nível do comentário na árvore (1 a 5) |
| 4 | conteudo_id | INT | ID do conteúdo associado |
| 5 | conteudo | TEXT | Conteúdo do comentário |
| 6 | status | VARCHAR | Status do comentário |
| 7 | criado_em | TIMESTAMPTZ | Data de criação do comentário |
| 8 | tempo_de_vida | INTERVAL | Tempo desde a criação (NOW() - criado_em) |
| 9 | nome_usuario | VARCHAR | Nome de usuário do criador |
| 10 | cargo | VARCHAR | Cargo do criador |
| 11 | img_perfil | TEXT | ID da imagem de perfil do criador |
| 12 | engajamento | BIGINT | Soma das avaliações (likes - dislikes) do comentário |

---

### 6. `privado.tag`
**Descrição:** Tabela base de tags disponível para consulta direta (não é uma view, mas uma tabela).

**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | id | INT | ID da tag |
| 2 | tag | VARCHAR | Nome da tag |
| 3 | status | VARCHAR | Status da tag (ATIVO/ESPERA/RECUSADO) |
| 4 | criado_em | TIMESTAMPTZ | Data de criação da tag |
| 5 | status_modificado_em | TIMESTAMPTZ | Data da última modificação de status |
| 6 | criador | INT | ID do usuário criador |
| 7 | validador | INT | ID do usuário que validou/recusou |

---

### 7. `privado.incluir_tag`
**Descrição:** Tabela de relacionamento entre tags e fóruns (quais tags estão disponíveis em cada fórum).

**Colunas:**
| Ordem | Coluna | Tipo | Descrição |
|-------|--------|------|-----------|
| 1 | tag | INT | ID da tag |
| 2 | forum | INT | ID do fórum |