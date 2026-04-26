const commentService = require('../services/commentServices');
const { z } = require('zod');

const commentSchema = z.object({
  content: z.string()
});

exports.createComment = async (req, res) => {
  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "invalid data", detail: validation.error.format() });
  }
  const { content } = validation.data;
  const user_id = req.user.id;
  const father_id = req.params;

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
