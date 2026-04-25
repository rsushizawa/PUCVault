const postService = require("../services/postServices");
const tagService = require("../services/tagServices");
const { z } = require("zod");

const postSchema = z.object({
  title: z.string().min(3, "Título(mínimo 3 caracteres)").max(50),
  content: z.string(),
  filename: z.string().nullable().optional().default(null),
  tags: z.array(z.number()).max(5, "Você só pode selecionar até 5 tags"),
});

exports.getPosts = async (req, res) => {
  const { forum_id, page_num } = req.params;
  try {
    const rows = await postService.getPost(forum_id, page_num);
    res.json({ rows });
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.createPosts = async (req, res) => {
  const validation = postSchema.safeParse(req.body);
  if (!validation.success) {
    return res
      .status(400)
      .json({ error: "invalid data", detail: validation.error.format() });
  }

  const { title, content, filename, tags } = validation.data;
  const user_id = req.user.id;
  const { forum_id } = req.params;

  try {



    const tag_id_array = tags?.rows ? tags.rows.map(row => row.id) : [];



    const file_id = filename ? `${user_id}/${filename}` : null;

    await postService.createPost(title, content, user_id, forum_id, file_id, tag_id_array);

    res.status(200).json({
      message: "success",
      file_id,
      tagsUsed: tag_id_array
    });
  } catch (error) {

    console.error("ERRO CRÍTICO NO createPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};
