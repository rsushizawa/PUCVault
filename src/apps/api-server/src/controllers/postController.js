const postService = require('../services/postServices');
const tagService = require('../services/tagServices');
const { z } = require('zod');



const postSchema = z.object({
  title: z.string().min(3, "Título(mínimo 3 caracteres)").max(50),
  content: z.string(),
  filename: z.string().nullable().optional().default(null),
  tags: z.array(z.number()).max(5, "Você só pode selecionar até 5 tags")
});

exports.getPosts = async (req, res) => {
  const { forum_id, page_num } = req.params;
  try {
    const result = await postService.getPost(forum_id, page_num);
    const rows = result.rows;
    const total = rows.length > 0 ? Number(rows[0].total) : 0;
    const posts = rows.map(row => ({
      id: row.id,
      title: row.title,
      body: row.body,
      author: { id: row.author_id, username: row.author_username },
      createdAt: row.created_at,
      tags: row.tags || [],
      voteCount: Number(row.vote_count) || 0,
      commentCount: Number(row.comment_count) || 0,
      fileUrl: row.file_url ?? undefined,
    }));
    res.status(200).json({ posts, total });
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.createPosts = async (req, res) => {
  const validation = postSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "invalid data", detail: validation.error.format() });
  }

  const { title, content, filename, tags } = validation.data;
  const user_id = req.user.id;
  const { forum_id } = req.params;

  try {
    console.time('DB_Tags_Query');

    const createdTags = await tagService.getUserTags(user_id);

    console.timeEnd('DB_Tags_Query');

    const tag_id_array = createdTags?.rows ? createdTags.rows.map(row => row.id) : [];


    const combinedTags = tags.filter(tagId => tag_id_array.includes(tagId));
    if (tags.length > 0 && combinedTags.length === 0) {
      console.log("warning: user tried to used tags that are not his");
    }

    const file_id = filename ? `${user_id}/${filename}` : null;

    await postService.createPost(title, content, user_id, forum_id, file_id, combinedTags);

    res.status(200).json({
      message: "success",
      file_id,
      tagsUsed: combinedTags
    });

  } catch (error) {
    if (console.timeEnd) console.timeEnd('DB_Tags_Query');

    console.error("ERRO CRÍTICO NO createPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};
