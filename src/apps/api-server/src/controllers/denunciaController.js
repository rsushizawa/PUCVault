const denunciaService = require('../services/denunciaServices');
const { z } = require('zod');

const { ok, paginated, fail } = require('../helpers/response');
// Tipos válidos de denúncia 
const TIPOS_VALIDOS = [
  'CONTEUDO_INADEQUADO',
  'SPAM',
  'PLÁGIO',
  'ASSÉDIO',
  'INFORMACAO_FALSA',
  'OUTRO'
];

const denunciaUsuarioSchema = z.object({
  tipo: z.enum(TIPOS_VALIDOS, { errorMap: () => ({ message: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}` }) }),
  usuario_denunciado_id: z.number().int().positive('ID do usuário denunciado deve ser um inteiro positivo')
});

const denunciaConteudoSchema = z.object({
  tipo: z.enum(TIPOS_VALIDOS, { errorMap: () => ({ message: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}` }) }),
  conteudo_id: z.number().int().positive('ID do conteúdo deve ser um inteiro positivo'),
});

const resolverDenunciaSchema = z.object({
  novo_status: z.enum(['RESOLVIDA', 'IGNORADA'], {
    errorMap: () => ({ message: "Status inválido. Use 'RESOLVIDA' ou 'IGNORADA'" })
  }),
  punicao: z.number().int().min(0, 'O valor deve ser no minimo 0').max(2, 'O valor deve ser no maximo 2').nullable().optional(),
  tempo_silencio: z.string().nullable().optional()
});

/**
 * POST /denuncias/usuario
 * Denuncia um usuário. Requer autenticação.
 */
exports.denunciarUsuario = async (req, res) => {
  const validation = denunciaUsuarioSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Dados inválidos', detail: validation.error.format() });
  }

  const { tipo, usuario_denunciado_id } = validation.data;
  const denunciante_id = req.user.id;

  try {
    await denunciaService.denunciarUsuario(tipo, denunciante_id, usuario_denunciado_id);



    return res.status(201).json({ message: 'success' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'The id does not exist',
        detail: error.detail
      });
    }
    console.error('Erro ao denunciar usuário:', error.message);

    if (error.message?.includes('não pode denunciar a si mesmo')) {
      return res.status(400).json({ error: 'Você não pode denunciar a si mesmo' });
    }
    if (error.message?.includes('silenciado')) {
      return res.status(403).json({ error: 'Usuário silenciado não pode fazer denúncias' });
    }
    if (error.message?.includes('excluído')) {
      return res.status(403).json({ error: 'Conta excluída não pode fazer denúncias' });
    }

    return res.status(500).json({ error: 'internal server error' });
  }
};

/**
 * POST /denuncias/conteudo
 * Denuncia um post ou comentário. Requer autenticação.
 */
exports.denunciarConteudo = async (req, res) => {
  const validation = denunciaConteudoSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Dados inválidos', detail: validation.error.format() });
  }

  const { tipo, conteudo_id } = validation.data;
  const denunciante_id = req.user.id;

  try {
    await denunciaService.denunciarConteudo(tipo, denunciante_id, conteudo_id);
    return res.status(201).json({ message: 'success' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'The id does not exist',
        detail: error.detail
      });
    }
    console.error('Erro ao denunciar conteúdo:', error.message);

    if (error.message?.includes('próprio conteúdo')) {
      return res.status(400).json({ error: 'Você não pode denunciar seu próprio conteúdo' });
    }
    if (error.message?.includes('silenciado')) {
      return res.status(403).json({ error: 'Usuário silenciado não pode fazer denúncias' });
    }
    if (error.message?.includes('excluído')) {
      return res.status(403).json({ error: 'Conta excluída não pode fazer denúncias' });
    }

    return res.status(500).json({ error: 'internal server error' });
  }
};

/**
 * PATCH /denuncias/:denuncia_id/resolver
 * Resolve ou ignora uma denúncia. Requer ADMIN ou SUPERADMIN.
 */
exports.resolverDenuncia = async (req, res) => {
  const validation = resolverDenunciaSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Dados inválidos', detail: validation.error.format() });
  }

  const { novo_status, punicao, tempo_silencio } = validation.data;
  const executor_id = req.user.id;
  const denuncia_id = parseInt(req.params.denuncia_id);

  if (isNaN(denuncia_id)) {
    return res.status(400).json({ error: 'ID da denúncia inválido' });
  }

  try {
    await denunciaService.resolverDenuncia(denuncia_id, executor_id, novo_status, punicao, tempo_silencio);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error('Erro ao resolver denúncia:', error.message);

    if (error.message?.includes('cargo insuficiente')) {
      return res.status(403).json({ error: 'Permissão negada: cargo insuficiente' });
    }

    return res.status(500).json({ error: 'internal server error' });
  }
};

/**
 * GET /denuncias
 * Lista todas as denúncias abertas. Requer ADMIN ou SUPERADMIN.
 */
exports.listarDenuncias = async (req, res) => {
  try {

    const result = await denunciaService.listarDenunciasAbertas();
    console.table(result.rows);
    return res.status(200).json({ message: 'success', denuncias: result.rows });
  } catch (error) {
    console.error('Erro ao listar denúncias:', error.message);
    return res.status(500).json({ error: 'internal server error' });
  }
};
