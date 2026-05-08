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



<<<<<<< HEAD
CREATE OR REPLACE FUNCTION privado.fn_propagar_delete_conteudo()
=======
-- fn_aplicar_penalidade_denuncia(v_peso,v_usuario_alvo)

CREATE OR REPLACE FUNCTION privado.fn_aplicar_penalidade_denuncia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_peso          SMALLINT;
    v_usuario_alvo  INT;
BEGIN
    -- age apenas na transição para RESOLVIDA, evita dupla aplicação
    IF NEW.status != 'RESOLVIDA' OR OLD.status = 'RESOLVIDA' THEN
        RETURN NEW;
    END IF;
 
    -- busca o peso do tipo de denúncia
    SELECT peso_penalidade INTO v_peso
    FROM privado.tipo_denuncia
    WHERE id = NEW.tipo;
 
    -- descobre o infrator: denuncia_usuario ou autor do conteúdo
    SELECT du.usuario_denunciado INTO v_usuario_alvo
    FROM privado.denuncia_usuario AS du
    WHERE du.id = NEW.id;
 
    IF v_usuario_alvo IS NULL THEN
        SELECT c.criador INTO v_usuario_alvo
        FROM privado.denuncia_conteudo AS dc
        JOIN privado.conteudo AS c ON c.id = dc.conteudo_denunciado
        WHERE dc.id = NEW.id;
    END IF;
 
    -- sem alvo identificado, não aplica (não deve ocorrer com dados válidos)
    IF v_usuario_alvo IS NULL THEN
        RETURN NEW;
    END IF;
 
    -- aplica a penalidade no score do infrator
    UPDATE privado.usuario
    SET score_comportamento = score_comportamento + v_peso
    WHERE id = v_usuario_alvo;
 
    -- registra no histórico de penalidades
    INSERT INTO privado.historico_penalidade
        (usuario_id, denuncia_id, pontuacao_aplicada, motivo, aplicado_por)
    VALUES
        (v_usuario_alvo, NEW.id, v_peso, 'Denúncia resolvida', NEW.resolvido_por);
 
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER trg_aplicar_penalidade_denuncia
AFTER UPDATE OF status ON privado.denuncia
FOR EACH ROW EXECUTE FUNCTION privado.fn_aplicar_penalidade_denuncia();



--  Silencia automaticamente ao atingir o limite de score
CREATE OR REPLACE FUNCTION privado.fn_silenciar_por_score()
>>>>>>> c8bedbd (Implementação de sistema para denuncias de usuario)
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
<<<<<<< HEAD
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
=======
    IF NEW.score_comportamento <= -50 AND OLD.status = 'ATIVO' THEN
        UPDATE privado.usuario
        SET
            status = 'SILENCIADO',
            ultima_mudanca_status = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
 
        INSERT INTO privado.historico_penalidade
            (usuario_id, pontuacao_aplicada, motivo, aplicado_por)
        VALUES
            (NEW.id, 0, 'Silenciado automaticamente por score <= -50', NULL);
    END IF;
 
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER trg_silenciar_por_score
AFTER UPDATE OF score_comportamento ON privado.usuario
FOR EACH ROW EXECUTE FUNCTION privado.fn_silenciar_por_score();
 
>>>>>>> c8bedbd (Implementação de sistema para denuncias de usuario)
