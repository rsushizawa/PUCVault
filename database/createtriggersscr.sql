-- trigger function para registrar conteúdo removido em privado.log_conteudo
-- uso: acionada pelo trigger trg_log_conteudo antes de DELETE em privado.conteudo
CREATE OR REPLACE FUNCTION privado.fn_log_conteudo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
	INSERT INTO privado.log_conteudo (email, conteudo, criado_em)
	SELECT usuario.email, OLD.conteudo, OLD.criado_em
	FROM privado.usuario AS usuario
	WHERE usuario.id = OLD.criador;

	RETURN OLD;
END;
$$;

-- trigger que dispara antes de deletar um conteúdo e salva o registro em log_conteudo
CREATE OR REPLACE TRIGGER trg_log_conteudo
BEFORE DELETE ON privado.conteudo
FOR EACH ROW
EXECUTE FUNCTION privado.fn_log_conteudo();
