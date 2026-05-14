##  /auth

**Definição:** Gerencia o ciclo de vida de autenticação e registro de usuários.

- **GET** `/print/logins`

    - **Definição:** Lista todos os logins registrados no sistema (uso administrativo/debug).
        
    - **Retorno:** `{ rows }`
        
- **POST** `/login`
    
    - **Entrada:** `userEmail` (body), `password` (body)
        
    - **Definição:** Autentica o usuário e gera um token JWT.
        
    - **Retorno:** `{ message, user, token }`
        
- **POST** `/sign-in`
    
    - **Entrada:** `email`, `name`, `username`, `password` (body)
        
    - **Definição:** Cria uma nova conta de usuário com senha criptografada.
        
    - **Retorno:** `{ message, username }`
        

---

##  /feed

**Definição:** Gerencia a visualização de conteúdos globais baseados na atividade do usuário.

- **GET** `/page/:page_num`
    
    - **Entrada:** `page_num` (params), `user_id` (jwt)
        
    - **Definição:** Retorna as postagens do feed personalizado do usuário de forma paginada.
        
    - **Retorno:** `{ rows }`
        

---

##  /forums

**Definição:** Gerencia a criação, moderação e listagem de fóruns e seus arquivos.

- **GET** `/print/forums`
    
    - **Definição:** Lista todos os fóruns cadastrados no banco de dados.
        
    - **Retorno:** `{ rows }`
        
- **PATCH** `/:forum_id/update`
    
    - **Entrada:** `forum_id` (params), `description` (body), `user_id` (jwt)
        
    - **Definição:** Atualiza a descrição de um fórum existente.
        
    - **Retorno:** `{ message: "success" }`
        
- **POST** `/create`
    
    - **Entrada:** `name`, `description` (body), `user_id` (jwt)
        
    - **Definição:** Solicita a criação de um novo fórum.
        
    - **Retorno:** `{ message, name, description, user_id }`
        
- **PATCH** `/:forum_id/validate`
    
    - **Entrada:** `forum_id` (params), `forumState` (body: 0 para RECUSADO, 1 para ATIVO), `validator_id` (jwt)
        
    - **Definição:** Permite que um validador aprove ou recuse a existência de um fórum.
        
    - **Retorno:** `{ message: "success" }`


        
- **POST** `/:forum_id/follow`
    
    - **Entrada:** `forum_id` (params), `user_id` (jwt)
        
    - **Definição:** Alterna (follow/unfollow) o estado de seguimento de um fórum pelo usuário.
        
    - **Retorno:** `{ message: "success" }`
        
- **GET** `/:forum_id/list`
    
    - **Entrada:** `forum_id` (params)
        
    - **Definição:** Lista os seguidores de um fórum específico.
        
    - **Retorno:** `{ message: "success" }`

        (faltando impressao dos foruns de arquivos por pagina)

- **GET** `/:forum_id/files/year`
    
    - **Entrada:** `forum_id` (params)
        
    - **Definição:** Lista os anos que possuem arquivos/posts vinculados naquele fórum.
        
    - **Retorno:** `{ rows }`
        
- **GET** `/:forum_id/files/year/:year`
    
    - **Entrada:** `forum_id`, `year` (params)
        
    - **Definição:** Lista as tags que possuem arquivos no fórum em um ano específico.
        
    - **Retorno:** `{ rows }`
        
- **GET** `/:forum_id/files/year/:year/tag/:tag`
    
    - **Entrada:** `forum_id`, `year`, `tag` (params)
        
    - **Definição:** Lista os arquivos/posts filtrados por fórum, ano e tag.
        
    - **Retorno:** `{ message: "success", results }`
        
- **GET** `/:forum_id`
    
    - **Entrada:** `forum_id` (params), `user_id` (jwt opcional)
        
    - **Definição:** Retorna os detalhes de um único fórum, incluindo total de seguidores e se o usuário logado o segue.
        
    - **Retorno:** `{ response }`
        

---

##  /images

**Definição:** Gerencia o upload e recuperação de imagens de perfil e banner via Cloudinary.

- **PATCH** `/upload/:location`
    
    - **Entrada:** `location` (params: 'perfil' ou 'banner'), `file` (multermemory), `user_id` (jwt)
        
    - **Definição:** Faz o upload de uma imagem, remove a antiga do Cloudinary e atualiza o banco de dados.
        
    - **Retorno:** `{ message: "success", imageId }`
        
- **GET** `/get/:user_id`
    
    - **Entrada:** `user_id` (params)
        
    - **Definição:** Retorna as URLs formatadas (crop/resize) do perfil e banner de um usuário.
        
    - **Retorno:** `{ img_perfil, img_banner }`
        

---

##  /posts

**Definição:** Gerencia a criação de conteúdo, anexos e interação por comentários.

- **POST** `/:forum_id/create`
    
    - **Entrada:** `forum_id` (params), `title`, `content`, `tags` (body), `file` (multer)
        
    - **Definição:** Cria uma nova postagem em um fórum, podendo incluir um anexo.
        
    - **Retorno:** `{ message: "success", file_id }`
        
- **GET** `/:forum_id/page/:page_num`
    
    - **Entrada:** `forum_id`, `page_num` (params)
        
    - **Definição:** Lista as postagens de um fórum específico com paginação.
        
    - **Retorno:** `{ rows , total }`
        
- **POST** `/:father_id/comments/create`
    
    - **Entrada:** `father_id` (params), `content`, `parentId` (body opcional)
        
    - **Definição:** Cria um comentário em um post ou uma resposta a outro comentário.
        
    - **Retorno:** `{ message: "success" }`
        
- **GET** `/:post_id/files`
    
    - **Entrada:** `post_id` (params)
        
    - **Definição:** Busca o anexo de um post no Cloudinary e força o download no navegador.
        
    - **Retorno:** `Buffer (Stream de arquivo)`
        
- **GET** `/:post_id/comments`
    
    - **Entrada:** `post_id` (params)
        
    - **Definição:** Lista todos os comentários associados a um post.
        
    - **Retorno:** `{ rows }`
        
- **GET** `/user/:user_id`
    
    - **Entrada:** `user_id`, `page_num` (params)
        
    - **Definição:** Recupera todas as postagens feitas por um usuário específico.
        
    - **Retorno:** `{ message: "success", result }`
        

---

##  /tags

**Definição:** Gerencia a taxonomia do sistema (categorias de posts).

- **POST** `/create`
    
    - **Entrada:** `name` (body), `user_id` (jwt)
        
    - **Definição:** Sugere/Cria uma nova tag no sistema.
        
    - **Retorno:** `{ message: "success" }`
        
- **PATCH** `/:tag_id/validate`
    
    - **Entrada:** `tag_id` (params), `tagState` (body), `user_id` (jwt)
        
    - **Definição:** Aprova ou recusa uma tag (ação de moderador/validador).
        
    - **Retorno:** `{ message: "success" }`
        
- **GET** `/:user_id/print`
    
    - **Entrada:** `user_id` (params)
        
    - **Definição:** Lista as tags criadas ou associadas a um usuário.
        
    - **Retorno:** `{ rows }`
        
- **GET** `/search`
    
    - **Entrada:** `q` (query string)
        
    - **Definição:** Busca tags por nome (Autocomplete).
        
    - **Retorno:** `{ rows }`
        

---

##  /user

**Definição:** Gerencia perfis, permissões e interações sociais entre usuários.

- **PATCH** `/:user_id/change_role`
    
    - **Entrada:** `user_id` (params), `roleNum` (body: 1-USUARIO, 2-VALIDADOR, 3-ADMIN)
        
    - **Definição:** Altera o nível de permissão de um usuário.
        
    - **Retorno:** `{ message: "success" }`
        
- **PATCH** `/:target_id/follow`
    
    - **Entrada:** `target_id` (params), `user_id` (jwt)
        
    - **Definição:** Segue ou deixa de seguir outro usuário.
        
    - **Retorno:** `{ message: "success" }`
        
- **GET** `/me`
    
    - **Entrada:** `user_id` (jwt)
        
    - **Definição:** Retorna as informações do perfil do usuário logado (exceto a senha).
        
    - **Retorno:** `{ info }`
        
- **GET** `/:user_id`
    
    - **Entrada:** `user_id` (params)
        
    - **Definição:** Retorna informações públicas de um usuário específico.
        
    - **Retorno:** `{ info }`
        
- **PATCH** `/:user_id/description`
    
    - **Entrada:** `user_id` (params), `description` (body)
        
    - **Definição:** Atualiza a biografia/descrição do perfil do usuário.
        
    - **Retorno:** `{ description }`
