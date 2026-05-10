const commentService = require('../services/commentServices');
const { ok, fail } = require('../helpers/response');
const { z } = require('zod');

const commentSchema = z.object({
  content: z.string(),
  parentId: z.string().optional(),
});

exports.createComment = async (req, res) => {
  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    return fail(res, 400, validation.error.format());
  }
  const { content, parentId } = validation.data;
  const user_id = req.user.id;
  const father_id = parentId ? Number(parentId) : Number(req.params.father_id);

  try {
    await commentService.createComment(content, user_id, father_id);
    return ok(res, null);

  } catch (error) {
    return fail(res, 500, "internal server error");
  }

};

exports.listComments = async (req, res) => {
  const { post_id } = req.params;
  try {
    const commentResults = await commentService.listComments(post_id);
    const rows = commentResults.rows;
    console.table(rows);
    return ok(res, rows);

  } catch (error) {
    return fail(res, 500, "internal server error");
  }
};
