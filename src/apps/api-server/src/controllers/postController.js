const postService = require("../services/postServices");
const tagService = require("../services/tagServices");
const { z } = require("zod");
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

    if (!post[0] || !post[0].arquivo) {
      return res.status(404).json({ message: 'file not found' });
    }

    const partes = post[0].arquivo.trim().split(" ");
    const file_id = partes.pop();
    const original_name = partes.join("_").replace(/[^a-zA-Z0-9.-]/g, '_');

    const url_cloudinary = cloudinary.url(file_id, {
      resource_type: 'raw',
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

    let concat_file_name;

    if (file) {
      try {
        file_id = await uploadToCloudinary(file);
        concat_file_name = original_name + " " + file_id;
      } catch (cloudinaryErr) {
        console.error("cloudinary error:", cloudinaryErr);
        return res.status(500).json({
          error: "Falha no upload do arquivo",
          detail: cloudinaryErr.message
        });
      }
    }

    const { title, content, tags } = req.body;
    const { forum_id } = req.params;
    const tag_id_array = tags?.rows ? tags.rows.map(row => row.id) : [];

    await postService.createPost(title, content, req.user.id, forum_id, concat_file_name, tag_id_array);
    console.log("conexão sucedida createPost");

    return res.status(200).json({ message: "success", file_id });

  } catch (error) {
    console.error("ERRO CRÍTICO NO createPosts:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "internal server error" });
    }
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
