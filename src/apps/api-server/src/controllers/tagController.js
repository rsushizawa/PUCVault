const tagService = require('../services/tagServices');
const { ok, fail } = require('../helpers/response');
const { z } = require('zod');

const tagSchema = z.object({
  name: z.string().min(2, "Nome para Tag (mínimo 2 caracteres) ").max(20)
});


exports.printUserTags = async (req, res) => {
  const { user_id } = req.params;
  try {
    const tagsResult = await tagService.getUserTags(user_id);
    const rows = tagsResult.rows;
    console.table(rows);
    return ok(res, rows);

  } catch (error) {
    console.log('internal server error: ', error.message);
    return fail(res, 500, "internal server error");
  }
};

exports.printAllTags = async (req, res) => {
  try {
    const tags = await tagService.listTags();
    console.table(tags.rows);
    return ok(res, tags.rows);
  } catch (error) {
    console.log('internal server error: ', error.message);
    return fail(res, 500, "internal server error");
  }
};



exports.searchTags = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const tagsResult = await tagService.findTags(searchTerm);
    const rows = tagsResult.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    console.log('internal server error: ', error.message);
    return fail(res, 500, "internal server error");
  }
};

exports.createTags = async (req, res) => {
  try {
    const user_id = req.user.id;
    const validation = tagSchema.safeParse(req.body);
    if (!validation.success) {
      return fail(res, 400, validation.error.message);
    }
    const { name } = validation.data;
    await tagService.createTag(name, user_id);
    return ok(res, null);
  } catch (error) {
    return fail(res, 500, "internal server error");
  }
};

exports.validateTags = async (req, res) => {
  const user_id = req.user.id;
  const { tag_id } = req.params;
  const { tagState } = req.body;
  let status;
  if (tagState === 1) status = 'ATIVO';
  else if (tagState === 0) status = 'RECUSADO';
  else {
    return fail(res, 400, 'invalid input');
  }
  try {
    await tagService.validateTag(tag_id, user_id, status);
    return ok(res, null);
  } catch (error) {
    console.error(error);
    return fail(res, 500, "server error");
  }
};
