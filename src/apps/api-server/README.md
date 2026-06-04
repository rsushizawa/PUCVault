# Documentação da API - PUC Vault

Esta documentação descreve todos os endpoints da API do sistema **PUC Vault**, estruturados de acordo com as rotas reais consumidas e validadas pelo script de automação e testes integrados (`test_api.js`).

---

## 🔐 /auth
**Definição:** Gerencia o ciclo de vida de autenticação, registro de contas e segurança multifator (2FA/PIN).

- **POST** `/auth/sign-in`
  - **Entrada:** `email`, `name`, `username`, `password`, `twofacauth` (body)
  - **Definição:** Inicia o processo de criação de uma nova conta de usuário. Dispara um código de confirmação.
  - **Retorno:** `{ message, username, signupToken }`

- **POST** `/auth/verify-sign-in`
  - **Entrada:** `signupToken` (body), `pin_input` (body)
  - **Definição:** Confirma o cadastro inserindo o PIN enviado ao email. Efetiva a criação da conta.
  - **Retorno:** `{ message, success: true }`

- **POST** `/auth/login`
  - **Entrada:** `userEmail` (body), `password` (body)
  - **Definição:** Autentica o usuário no sistema. Se o 2FA estiver ativado, retorna um token temporário de 2FA.
  - **Retorno (Sem 2FA):** `{ message, user, token }`
  - **Retorno (Com 2FA):** `{ message, twoFacToken, requireTwoFactor: true }`

- **POST** `/auth/verify-login`
  - **Entrada:** `twoFacToken` (body), `pin_input` (body)
  - **Definição:** Valida o PIN de segundo fator (2FA) inserido pelo usuário durante o fluxo de login.
  - **Retorno:** `{ message, user, token }`

- **POST** `/auth/change-password`
  - **Entrada:** `password`, `new_password`, `confirm` (body), `user_id` (jwt)
  - **Definição:** Altera a senha do usuário logado mediante validação da senha atual.
  - **Retorno:** `{ message: "success" }`

- **POST** `/auth/forgot-send-email`
  - **Entrada:** `email` (body)
  - **Definição:** Inicia o fluxo de recuperação de senha, enviando um token PIN para o email informado.
  - **Retorno:** `{ message, pinToken }`

- **POST** `/auth/forgot-password`
  - **Entrada:** `pinToken`, `pin`, `new_password`, `confirm` (body)
  - **Definição:** Consome o token de recuperação e o PIN para redefinir a senha do usuário.
  - **Retorno:** `{ message: "success" }`

- **POST** `/auth/logout`
  - **Entrada:** `user_id` (jwt)
  - **Definição:** Invalida a sessão atual do usuário autenticado no servidor.
  - **Retorno:** `{ message: "success" }`

- **GET** `/auth/print/logins`
  - **Definição:** Rota administrativa/debug para listagem rápida de logins cadastrados.
  - **Retorno:** `{ rows }`

---

## 👤 /user
**Definição:** Gerencia perfis de usuários, biografia, permissões e interações sociais.

- **GET** `/user/me`
  - **Entrada:** `user_id` (jwt)
  - **Definição:** Retorna as informações completas do perfil do usuário atualmente autenticado.
  - **Retorno:** `{ info }`

- **GET** `/user/:id`
  - **Entrada:** `id` (params)
  - **Definição:** Retorna informações públicas detalhadas de um usuário específico.
  - **Retorno:** `{ info }`

- **PATCH** `/user/:id/follow`
  - **Entrada:** `id` (params), `user_id` (jwt)
  - **Definição:** Alterna o estado de seguimento (follow/unfollow) em relação a outro usuário.
  - **Retorno:** `{ message: "success" }`

- **PATCH** `/user/:id/change_role`
  - **Entrada:** `id` (params), `roleNum` (body: 1-USUARIO, 2-VALIDADOR, 3-ADMIN), `user_id` (jwt administrativo)
  - **Definição:** Altera o nível de cargo/permissão de um usuário específico no sistema.
  - **Retorno:** `{ message: "success" }`

- **PATCH** `/user/:id/description`
  - **Entrada:** `id` (params), `description` (body), `user_id` (jwt)
  - **Definição:** Altera o texto de biografia/descrição do perfil do próprio usuário.
  - **Retorno:** `{ description }`

- **PATCH** `/user/:id/toggle-2fa`
  - **Entrada:** `id` (params), `user_id` (jwt)
  - **Definição:** Ativa ou desativa a exigência de Autenticação de Dois Fatores (2FA) para a conta.
  - **Retorno:** `{ message, twoFactorEnabled: boolean }`

- **DELETE** `/user/delete`
  - **Entrada:** `user_id` (jwt)
  - **Definição:** Remove permanentemente a conta do usuário logado (Operação protegida para evitar colisões com palavras reservadas).
  - **Retorno:** `{ message: "success" }`

---

## 🏛️ /forums
**Definição:** Gerencia a criação, moderação, seguidores e indexação cronológica/taxonômica de anexos dos fóruns.

- **POST** `/forums/create`
  - **Entrada:** `name`, `description` (body), `user_id` (jwt)
  - **Definição:** Solicita a criação de um novo fórum na plataforma.
  - **Retorno:** `{ message, id, name, description }`

- **GET** `/forums/print/forums`
  - **Definição:** Retorna todos os fóruns do banco de dados estruturados para exibição.
  - **Retorno:** `[ ...forums ]` ou `{ rows }`

- **GET** `/forums/:id`
  - **Entrada:** `id` (params), `user_id` (jwt opcional)
  - **Definição:** Retorna os metadados de um único fórum, estatísticas de seguidores e se o usuário atual o segue.
  - **Retorno:** `{ forum, followers_count, is_following }`

- **GET** `/forums/by-name/:name`
  - **Entrada:** `name` (params codificado via URL)
  - **Definição:** Busca as informações detalhadas de um fórum através de seu nome exato.
  - **Retorno:** `{ id, name, description, criado_em }`

- **POST** `/forums/:id/follow`
  - **Entrada:** `id` (params), `user_id` (jwt)
  - **Definição:** Segue ou deixa de seguir o fórum especificado pelo ID.
  - **Retorno:** `{ message: "success" }`

- **GET** `/forums/:id/list`
  - **Entrada:** `id` (params)
  - **Definição:** Lista a relação completa de usuários que seguem o fórum.
  - **Retorno:** `{ rows }`

- **GET** `/forums/:forum_id/files/page/:page_num`
  - **Entrada:** `forum_id`, `page_num` (params)
  - **Definição:** Lista todos os arquivos anexados a postagens dentro daquele fórum usando paginação.
  - **Retorno:** `[ ...arquivos ]` ou `{ rows }`

- **GET** `/forums/:forum_id/files/year`
  - **Entrada:** `forum_id` (params)
  - **Definição:** Retorna uma listagem distinta de anos que possuem arquivos indexados naquele fórum.
  - **Retorno:** `[ ...anos ]` ou `{ rows }`

- **GET** `/forums/:forum_id/files/year/:year`
  - **Entrada:** `forum_id`, `year` (params)
  - **Definição:** Lista as tags associadas a arquivos postados no fórum durante o ano especificado.
  - **Retorno:** `[ ...tags ]` or `{ rows }`

- **GET** `/forums/:forum_id/files/year/:year/tag/:tag`
  - **Entrada:** `forum_id`, `year`, `tag` (params)
  - **Definição:** Filtra de forma profunda as postagens contendo arquivos com base no ano e na tag passados.
  - **Retorno:** `{ results }` ou `{ rows }`

- **PATCH** `/forums/:forum_id/validate`
  - **Entrada:** `forum_id` (params), `status` (body), `user_id` (jwt de moderador)
  - **Definição:** Valida o status de ativação ou recusa de um fórum proposto.
  - **Retorno:** `{ message: "success" }`

---

## 📝 /posts
**Definição:** Centraliza a criação de conteúdos textuais, mídias integradas, comentários e avaliação em lote.

- **POST** `/posts/:forum_id/create`
  - **Entrada:** `forum_id` (params), `title`, `content`, `tags` (body opcional), `file` (multer multipart)
  - **Definição:** Publica uma postagem em um fórum, aceitando opcionalmente arrays de tags e um arquivo físico como anexo.
  - **Retorno:** `{ message: "success", file_id }`

- **GET** `/posts/:forum_id/page/:page_num`
  - **Entrada:** `forum_id`, `page_num` (params)
  - **Definição:** Retorna o feed de postagens de um fórum ordenadas de forma paginada.
  - **Retorno:** `{ rows, total }`

- **GET** `/posts/:post_id`
  - **Entrada:** `post_id` (params)
  - **Definição:** Obtém a estrutura e o conteúdo completo de um post específico.
  - **Retorno:** `{ post }`

- **DELETE** `/posts/:post_id/delete`
  - **Entrada:** `post_id` (params), `user_id` (jwt)
  - **Definição:** Remove uma postagem ativa do sistema (Permissão do autor ou moderação).
  - **Retorno:** `{ message: "success" }`

- **POST** `/posts/:post_id/comments/create`
  - **Entrada:** `post_id` (params), `content` (body), `parentId` (body opcional para subcomentários)
  - **Definição:** Cria um comentário ou uma resposta encadeada a outro comentário existente.
  - **Retorno:** `{ message: "success" }`

- **GET** `/posts/:post_id/comments`
  - **Entrada:** `post_id` (params)
  - **Definição:** Recupera a árvore completa de comentários vinculados a uma postagem.
  - **Retorno:** `{ rows }`

- **PATCH** `/posts/rate-content`
  - **Entrada:** `rate_vector` (body: array de objetos contendo `{ conteudo_id, tipo_avaliacao }`), `user_id` (jwt)
  - **Definição:** Processa de forma atômica e em lote as avaliações (upvote/downvote) dadas pelo usuário.
  - **Retorno:** `{ message: "success" }`

---

## 🖼️ /image
**Definição:** Gerencia uploads físicos e geração dinâmica de mídias de perfil e customizações de fórum.

- **PATCH** `/image/upload/:location`
  - **Entrada:** `location` (params: 'perfil' ou 'banner'), `file` (multer multipart), `user_id` (jwt)
  - **Definição:** Sincroniza uma imagem com o Cloudinary e atualiza os caminhos no registro do usuário autenticado.
  - **Retorno:** `{ message: "success", imageId }`

- **PATCH** `/image/:forum_id/upload/:location`
  - **Entrada:** `forum_id` (params), `location` (params), `file` (multer multipart), `user_id` (jwt)
  - **Definição:** Realiza o upload e vinculação da logo ou banner de um fórum específico.
  - **Retorno:** `{ message: "success", imageId }`

- **GET** `/image/get/user/:user_id`
  - **Entrada:** `user_id` (params)
  - **Definição:** Consolida as URLs otimizadas do Cloudinary para o perfil e banner do usuário indicado.
  - **Retorno:** `{ img_perfil, img_banner }`

- **GET** `/image/get/forum/:forum_id`
  - **Entrada:** `forum_id` (params)
  - **Definição:** Consolida as URLs ativas das mídias estruturadas de um fórum.
  - **Retorno:** `{ img_logo, img_banner }`

---

## 🚨 /denuncias
**Definição:** Sistema de auditoria e moderação de conduta para usuários e postagens.

- **POST** `/denuncias/usuario`
  - **Entrada:** `tipo` (body), `usuario_denunciado_id` (body), `user_id` (jwt)
  - **Definição:** Registra uma denúncia contra o perfil de um usuário específico do ecossistema.
  - **Retorno:** `{ message: "success" }`

- **POST** `/denuncias/conteudo`
  - **Entrada:** `tipo` (body), `conteudo_id` (body), `user_id` (jwt)
  - **Definição:** Abre uma denúncia direcionada contra uma postagem ou comentário inadequado.
  - **Retorno:** `{ message: "success" }`

- **GET** `/denuncias/`
  - **Entrada:** `user_id` (jwt de moderador)
  - **Definição:** Recupera a fila global de todas as denúncias pendentes e abertas no banco.
  - **Retorno:** `{ rows }`

- **PATCH** `/denuncias/:denuncia_id/resolver`
  - **Entrada:** `denuncia_id` (params), `novo_status` (body: 'RESOLVIDA' ou 'IGNORADA'), `punicao` (body opcional: 0-Exclui Post, 1-Exclui Post + Silencia, 2-Exclui User), `tempo_silencio` (body opcional INTERVAL: '1 hour', '1 day', etc.), `user_id` (jwt executor)
  - **Definição:** Executa a resolução atômica e aplicação de penalidades através da procedure interna do PostgreSQL, com tratamento limpo e higienizado para chaves condicionais/nulas e validação Zod Schema.
  - **Retorno:** `{ message: "success" }`

---

## 🏷️ /tags (Auxiliares)
- **POST** `/tags/create` | Entrada: `{ name }` (body) | Retorno: `{ message: "success" }`
- **PATCH** `/tags/:tag_id/validate` | Entrada: `{ tagState }` (body) | Retorno: `{ message: "success" }`
- **GET** `/tags/:user_id/print` | Retorno: `{ rows }`
- **GET** `/tags/search?q=...` | Retorno: `{ rows }`

---

## 🌐 /feed (Auxiliares)
- **GET** `/feed/page/:page_num` | Retorno: `{ rows }`
