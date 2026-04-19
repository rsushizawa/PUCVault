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

Endereço /user:
  1. PATCH /:user_id/change_role => trocar o cargo do usuário (user_id) 
  2. PATCH /:target_id/follow => seguir o usuário (target_id)

Endereço /tags: 
  1. POST /create => cria a tag 
  2. PATCH /:tag_id/validate => valida a tag 
  3. PATCH /:user_id/print => lista as tags criadas de um usuário 

Endereço /posts:
  1. PATCH /:forum_id/create => cria o post a partir no fórum selecionado
  2. GET /:forum_id/page/:page_num => lista de 20 em 20 posts contidos em um post
