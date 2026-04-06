-- uso: FUNCTION publico.buscar_usuario_por_id (p_id INT);
-- uso: FUNCTION publico.buscar_usuario_por_nome_usuario (p_nome_usuario VARCHAR)
-- uso: FUNCTION publico.buscar_usuario_por_email (p_email VARCHAR)

CREATE OR REPLACE FUNCTION publico.listar_usuarios()
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM privado.perfil_usuario;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_usuario_por_id (
  p_id INT
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM privado.perfil_usuario
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_usuario_por_nome_usuario (
  p_nome_usuario VARCHAR
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM privado.perfil_usuario
  WHERE nome_usuario = p_nome_usuario;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_usuario_por_email (
  p_email VARCHAR
)
RETURNS SETOF privado.perfil_usuario
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id INT;
BEGIN
  SELECT id INTO v_id
  FROM privado.usuario
  WHERE email = p_email;

  RETURN QUERY
  SELECT * FROM privado.perfil_usuario
  WHERE id = v_id;
END;
$$;

CREATE OR REPLACE FUNCTION publico.buscar_forum_por_nome (
  p_nome VARCHAR
)
-- TODO: criar view de fórum
RETURNS SETOF privado.forum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
BEGIN
  RETURN QUERY
  SELECT * FROM privado.forum
  WHERE nome = p_nome;
END;
$$;