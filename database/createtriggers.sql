-- fn_sem_autoavaliacao(avaliacao.USUARIO|avaliacao.CONTEUDO->conteudo.CRIADOR)
-- fn_propagar_delete_conteudo(conteudo.ID|comentario.CONTEUDO_PAI)


CREATE OR REPLACE FUNCTION privado.fn_sem_autoavaliacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_criador INT;
BEGIN
    SELECT criador INTO v_criador
    FROM privado.conteudo
    WHERE id = NEW.conteudo;

    IF v_criador = NEW.usuario THEN
        RAISE EXCEPTION 'O autor não pode avaliar o próprio conteúdo.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_sem_autoavaliacao
BEFORE INSERT OR UPDATE ON privado.avaliacao
FOR EACH ROW EXECUTE FUNCTION privado.fn_sem_autoavaliacao();



CREATE OR REPLACE FUNCTION privado.fn_propagar_delete_conteudo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM privado.conteudo
    WHERE id IN (
        SELECT id FROM privado.comentario
        WHERE conteudo_pai = OLD.id
    );

    RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER trg_propagar_delete_conteudo
BEFORE DELETE ON privado.conteudo
FOR EACH ROW EXECUTE FUNCTION privado.fn_propagar_delete_conteudo();
