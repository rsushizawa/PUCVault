const tagService = require('../services/tagServices');
const { z } = require('zod');

const tagSchema = z.object({
  name: z.string().min(2, "Nome para Tag (mínimo 2 caracteres) ").max(20)
});


exports.printUserTags = async (req, res) => {
  const { user_id } = req.params;
  try {
    const res = await tagService.getUserTags(user_id);

    console.table(res.rows);
  } catch (error) {
    console.log('internal server error: ', error.message);
  }
};

exports.createTags = async (req, res) => {
  try {
    const user_id = req.user.id;
    const validation = tagSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }
    const { name } = validation.data;
    await tagService.createTag(name, user_id);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
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
    return res.status(400).json({ error: 'invalid input' });
  }
  try {
    await tagService.validateTag(tag_id, user_id, status);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
    console.error(error);

  }
};

