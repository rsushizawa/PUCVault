const forumService = require("../services/forumServices");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { z } = require("zod");

const forumSchema = z.object({
  name: z.string().min(8, "Título(mínimo 8 caracteres)").max(20),
  description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100),
});

exports.print = async (req, res) => {
  try {
    const result = await forumService.printForums();
    const rows = result.rows;
    console.table(rows);

    res.status(200).json({ rows });
  } catch (error) {
    res
      .status(500)
      .json({ error: "internal server error", details: error.message });
  }
};

exports.files = async (req, res) => {
  const { forum_id, page_num } = req.params;
  try {
    const forumResults = await forumService.listForumFiles(forum_id, page_num);

    console.table(forumResults.rows);
  } catch (error) {
    console.log("internal server error: ", error.message);
  }
};

exports.files = async (req, res) => {
  const { forum_id, page_num } = req.params;
  try {
    const res = await forumService.listForumFiles(forum_id, page_num);

    console.table(res.rows);
  } catch (error) {
    console.log("internal server error: ", error.message);
  }
};

exports.getForumId = async (req, res) => {
  const { name } = req.body;
  try {
    const returnvalue = await forumService.searchForums(name);
    const forum_id = returnvalue.rows[0].id;
    res
      .status(200)
      .json({ message: "forum id adquired successfully", forum_id });
    return forum_id;
  } catch (error) {
    console.error("CRITICAL ERROR IN /forums: ", error);

    res.status(500).json({
      error: "Error finding forum ID",
      details: error.message,
    });
  }
};

exports.listForumFilesYear = async (req, res) => {
  const { forum_id } = req.params;
  try {
    const forumResults = await forumService.listForumFilesYear(forum_id);
    const rows = forumResults.rows;
    console.table(rows);

    res.status(200).json({ rows });
  } catch (error) {
    res.status(500).json({ error: "internal server error: ", error });
  }
};

exports.listPostFilesYear = async (req, res) => {
  const { forum_id, year, tag } = req.params;
  try {
    const forumResults = await forumService.listPostFilesYear(forum_id, year, tag);
    const results = forumResults.rows;
    console.table(results);
    res.status(200).json({ message: "success", results });
  } catch (error) {
    res.status(500).json({ error: "internal server error: ", error });
  }
};

exports.listTagsFilesYear = async (req, res) => {
  const { forum_id, year } = req.params;
  try {
    const forumResults = await forumService.listTagsFilesYear(forum_id, year);
    const rows = forumResults.rows;
    console.table(rows);

    res.status(200).json({ rows });
  } catch (error) {
    res.status(500).json({ error: "internal server error: ", error });
  }
};


exports.createForum = async (req, res) => {
  const validation = forumSchema.safeParse(req.body);
  if (!validation.success) {
    return res
      .status(406)
      .json({ error: "Invalid data", detail: validation.error.format() });
  }

  const { name, description } = validation.data;
  const user_id = req.user.id;

  try {
    await forumService.createForum(name, description, user_id);
    console.log("forum created");
    return res.status(200).json({
      message: "forum created successfully",
      name,
      description,
      user_id,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "forum with this name already exists" });
    }
    console.error("Error creating forum: ", error);

    return res.status(500).json({ error: "error in server" });
  }
};

const descriptionSchema = z.object({
  description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100),
});

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

forumService.listForumFollowers(forum_id);

exports.validateForum = (req, res) => {
  try {
    const validator_id = req.user.id;
    const { forum_id } = req.params;
    const { forumState } = req.body;
    let status;
    if (forumState === 1) status = "ATIVO";
    else if (forumState === 0) status = "RECUSADO";
    else {
      return res.status(400).json({ error: "invalid input" });
    }

    forumService.validateForum(forum_id, validator_id, status);

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
    if (forumState === 1) status = "ATIVO";
    else if (forumState === 0) status = "RECUSADO";
    else {
      return res.status(400).json({ error: "invalid input" });
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

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

exports.getSingleForum = async (req, res) => {
  const user_id = req.user ? req.user.id : null;
  const { forum_id } = req.params;
  try {
    const forum = await forumService.getSingleForum(forum_id);
    const forum_followers = await forumService.listForumFollowers(forum_id);
    let response = {
      ...forum.rows[0],
      ...forum_followers.rows
    };


    if (user_id) {
      const user_follows = await forumService.checkUserForum(user_id, forum_id);
      response.user_status = user_follows.rows[0].segue;
    }
    res.status(200).json(response);
    console.log(response);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
