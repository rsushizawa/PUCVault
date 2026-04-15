const forumService = require('../services/forumServices');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { z } = require('zod');


const forumSchema = z.object({
  name: z.string().min(8, "Título(mínimo 8 caracteres)").max(20),
  description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100)
});

exports.print = async (req, res) => {
  try {
    await forumService.printForums();
  } catch (error) {
    console.log('internal server error: ', error.message);
  }
}


exports.getForumId = async (req, res) => {
  const { name } = req.body;
  try {
    const returnvalue = await forumService.searchForums(name);
    const forum_id = returnvalue.rows[0].id;
    res.status(200).json({ message: 'forum id adquired successfully', forum_id });
    return forum_id;


  } catch (error) {
    console.error("CRITICAL ERROR IN /forums: ", error);

    res.status(500).json({
      error: "Error finding forum ID",
      details: error.message
    });
  }
};






exports.createForum = async (req, res) => {

  const validation = forumSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(406).json({ error: "Invalid data", detail: validation.error.format() });
  }

  const { name, description } = validation.data;
  const user_id = req.user.id;

  try {

    await forumService.createForum(name, description, user_id);
    console.log('forum created');
    return res.status(200).json({ message: 'forum created successfully', name, description, user_id });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'forum with this name already exists' });
    }
    console.error("Error creating forum: ", error);

    return res.status(500).json({ error: 'error in server' });
  }
};

const descriptionSchema = z.object({ description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100) });


exports.updateForumDescription = (req, res) => {
  try {
    const validation = descriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }
    const { description } = validation.data;
    const user_id = req.user.id;
    const { forum_id } = req.params;

    forumService.updateForumDescription(forum_id, user_id, description);

    res.status(200).json({ message: "success" });


  } catch (error) {
    res.status(500).json({ error: "server error" });

  }
};

exports.listForumFollowers = (req, res) => {
  try {
    const { forum_id } = req.params;

    forumService.listForumFollowers(forum_id);

    res.status(200).json({ message: "success" });

  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};


exports.validateForum = (req, res) => {
  try {
    const validator_id = req.user.id;
    const { forum_id } = req.params;
    const { forumState } = req.body;
    let status;
    if (forumState === 1) status = 'ATIVO';
    else if (forumState === 0) status = 'RECUSADO';
    else {
      return res.status(400).json({ error: 'invalid input' });
    }

    forumService.validateForum(forum_id, validator_id, status);

    res.status(200).json({ message: "success" });

  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};


exports.follow = async (req, res) => {

  const user_id = req.user.id;
  const { forum_id } = req.params;

  try {
    await forumService.toggleFollowForum(user_id, forum_id);

    res.status(200).json({ message: "success" })
  } catch (error) {

    res.status(500).json({ message: "server error" });
  }
};
