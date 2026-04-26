Endereço /auth:

1. GET /print/logins => imprimir informações de todos as contas já criadas
2. POST /login => logar na sua conta inserindo username ou email e sua senha
3. POST /sign-in => criar a sua conta inserindo seu email, nome, username e senha

Endereço /forums:

1. GET /print/forums => imprimir todos os fórums já criados
2. PATCH /:forum_id/update => atualizar a descrição do fórum
3. POST /create => criar fórum
4. PATCH /:forum_id/follow => seguir fórum
5. PATCH /:forum_id/list => listar os usuários que seguem o fórum
6. GET /:id/files/page/:page_num
7. GET /:forum_id/files/year/:year
8. GET /:forum_id/files/year/:year/tag/:tag
   TODO: /:id => get a single forum by id + if the user is loged in: if it is following the page + members of the page

Endereço /user:

1. PATCH /:user_id/change_role => trocar o cargo do usuário (user_id)
2. PATCH /:target_id/follow => seguir o usuário (target_id)
   TODO: /me => should return the current users data like avatar, name, email, cargo etc.

Endereço /tags:

1. POST /create => cria a tag
2. PATCH /:tag_id/validate => valida a tag
3. PATCH /:user_id/print => lista as tags criadas de um usuário
4. GET /search?q= => busca de tags

Endereço /posts:

1. PATCH /:forum_id/create => cria o post a partir no fórum selecionado
2. GET /:forum_id/page/:page_num => lista de 20 em 20 posts contidos em um post
