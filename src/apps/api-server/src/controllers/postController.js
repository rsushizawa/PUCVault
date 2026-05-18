const postService = require("../services/postServices");
const contentService = require("../services/contentServices");
const tagService = require("../services/tagServices");
const { z, success } = require("zod");
const { uploadToCloudinary } = require("../utils/cloudinaryUtil");

const cloudinary = require('cloudinary').v2;

const postSchema = z.object({
  title: z.string().min(3, "Título(mínimo 3 caracteres)").max(50),
  content: z.string(),
  filename: z.string().nullable().optional().default(null),
  tags: z.array(z.coerce.number()).max(5, "Você só pode selecionar até 5 tags"),
});

exports.getPosts = async (req, res) => {
  const { forum_id, page_num } = req.params;
  try {
    const rows = await postService.getPost(forum_id, page_num);
    const total = rows.length;

    res.status(200).json({ rows, total });
    console.table(rows);
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};


exports.getSinglePost = async (req, res) => {
  const { post_id } = req.params;

  try {
    const result = await postService.getSinglePost(post_id);

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getFileFromPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await postService.getSinglePost(post_id);
    if (!post[0] || !post[0].arquivo_caminho) {
      return res.status(404).json({ message: 'file not found' });
    }

    const file_id = post[0].arquivo_caminho;
    const original_name = post[0].arquivo_nome;
    const extensao = original_name.split('.').pop().toLowerCase();
    let resourceType = 'image';
    if (['pdf', 'doc', 'docx', 'xls', 'rar', 'zip', 'c', 'cpp', 'txt', 'json'].includes(extensao)) {
      resourceType = 'raw';
    }
    const url_cloudinary = cloudinary.url(file_id, {
      resource_type: resourceType,
      secure: true
    });

    const response = await fetch(url_cloudinary);

    if (!response.ok) {
      throw new Error(`Cloudinary retornou erro: ${response.statusText}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${original_name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return res.status(200).send(buffer);

  } catch (error) {
    console.error("Erro no download:", error);
    return res.status(500).json({ message: 'erro interno', error: error.message });
  }
};

exports.createPosts = async (req, res) => {
  try {
    const file = req.file;
    const original_name = req.file.originalname;
    let file_id = null;


    if (file) {
      try {
        file_id = await uploadToCloudinary(file, null);
      } catch (cloudinaryErr) {
        console.error("cloudinary error:", cloudinaryErr);
        return res.status(500).json({
          error: "Falha no upload do arquivo",
          detail: cloudinaryErr.message
        });
      }
    }

    const { title, content, tags } = req.body;
    const user_id = req.user.id;
    const { forum_id } = req.params;
    const tag_id_array = tags?.rows ? tags.rows.map(row => row.id) : [];

    await postService.createPost(title, content, user_id, forum_id, original_name, file_id, tag_id_array);
    console.log("conexão sucedida createPost");

    return res.status(200).json({ message: "success", file_id });

  } catch (error) {
    console.error("ERRO CRÍTICO NO createPosts:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "internal server error" });
    }
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const user_id = req.user.id;
    const post = await this.getSinglePost(post_id);
    const file_id = post[0].arquivo;

    const deletionResult = await cloudinary.uploader.destroy(file_id, {
      resource_type: 'raw',
      invalidate: true
    });
    post[0].arquivo_caminho = null;
    post[0].arquivo_nome = null;

    console.log("delete file: ", deletionResult);

    await contentService.deleteContent(post_id, user_id);
    res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(500).json({ error: 'internal server error' });
  }

};

exports.userPosts = async (req, res) => {
  try {
    const { user_id, page_num } = req.params;

    console.log('conexão sucedida userPosts');
    const result = await postService.getUserPosts(user_id, page_num);

    console.table(result);


    return res.status(200).json({ message: 'success', result });


  } catch (error) {
    return res.status(500).json({ error: 'internal server error' });
  }
};


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
    await postService.createComment(content, user_id, father_id);
    res.status(200).json({ message: "success" });

  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }

};

exports.listComments = async (req, res) => {
  const { post_id } = req.params;
  try {
    const commentResults = await postService.listComments(post_id);
    const rows = commentResults.rows;
    console.table(rows);

    res.status(200).json({ rows });

  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

exports.upvoteContent = async (req, res) => {
  try {

    const user_id = req.user.id;
    const content_id = req.params;
    const { rating } = req.body;

    await postService.rateContent(user_id, content_id);
    return res.status(200).json({ message: 'post rated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'internal server error', error });
  }
};
exports.downvoteContent = async (req, res) => {
  try {

    const user_id = req.user.id;
    const content_id = req.params;
    const { rating } = req.body;

    await postService.rateContent(user_id, content_id);
    return res.status(200).json({ message: 'post rated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'internal server error', error });
  }
};
