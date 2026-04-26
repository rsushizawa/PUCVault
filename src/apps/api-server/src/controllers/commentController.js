const commentService = require('../services/commentServices');
const { z } = require('zod');

const commentSchema = z.object({
  content: z.string(),
  parentId: z.string().optional(),
});

exports.createComment = async (req, res) => {
  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "invalid data", detail: validation.error.format() });
  }
  const { content, parentId } = validation.data;
  const user_id = req.user.id;
  const father_id = parentId ? Number(parentId) : Number(req.params.father_id);

  try {
    await commentService.createComment(content, user_id, father_id);
    res.status(200).json({ message: "success" });

  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }

};

exports.listComments = async (req, res) => {
  const { post_id } = req.params;
  try {
    const commentResults = await commentService.listComments(post_id);
    const rows = commentResults.rows;
    console.table(rows);

    res.status(200).json({ rows });

  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};
