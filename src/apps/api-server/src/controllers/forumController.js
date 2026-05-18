const forumService = require('../services/forumServices');
const { z } = require('zod');


const forumSchema = z.object({
  name: z.string().min(8, "Título(mínimo 8 caracteres)").max(20),
  description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100)
});

exports.print = async (req, res) => {
  try {
    const result = await forumService.printForums();
    const rows = result.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

exports.files = async (req, res) => {
  const { forum_id, page_num } = req.params;
  try {
    const forumResults = await forumService.listForumFiles(forum_id, page_num);
    console.table(forumResults.rows);
    return ok(res, forumResults.rows);
  } catch (error) {
    console.log('internal server error: ', error.message);
    return fail(res, 500, error.message);
  }
};


exports.getForumId = async (req, res) => {
  const { name } = req.body;
  try {
    const returnvalue = await forumService.searchForums(name);
    const forum_id = returnvalue.rows[0].id;
    return ok(res, { forum_id });

  } catch (error) {
    console.error("CRITICAL ERROR IN /forums: ", error);
    return fail(res, 500, error.message);
  }
};

exports.listForumFilesYear = async (req, res) => {
  const { forum_id } = req.params;
  try {
    const forumResults = await forumService.listForumFilesYear(forum_id);
    const rows = forumResults.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    console.error('listForumFilesYear:', error.message);
    return ok(res, []);
  }
};

exports.listPostFilesYear = async (req, res) => {
  const { forum_id, year, tag } = req.params;
  try {
    const forumResults = await forumService.listPostFilesYear(forum_id, year, tag);
    const results = forumResults.rows;
    console.table(results);
    return ok(res, results);
  } catch (error) {
    return fail(res, 500, "internal server error");
  }
};

exports.listTagsFilesYear = async (req, res) => {
  const { forum_id, year } = req.params;
  try {
    const forumResults = await forumService.listTagsFilesYear(forum_id, year);
    const rows = forumResults.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    return fail(res, 500, "internal server error");
  }
};


exports.createForum = async (req, res) => {

  const validation = forumSchema.safeParse(req.body);
  if (!validation.success) {
    return fail(res, 406, "Invalid data");
  }

  const { name, description } = validation.data;
  const user_id = req.user.id;

  try {
    await forumService.createForum(name, description, user_id);
    console.log('forum created');
    return ok(res, { name, description, user_id });

  } catch (error) {
    if (error.code === '23505') {
      return fail(res, 409, 'forum with this name already exists');
    }
    console.error("Error creating forum: ", error);
    return fail(res, 500, 'error in server');
  }
};

const descriptionSchema = z.object({ description: z.string().min(8, "Descrição(mínimo 8 caracteres)").max(100) });


exports.updateForumDescription = (req, res) => {
  try {
    const validation = descriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return fail(res, 400, validation.error.message);
    }
    const { description } = validation.data;
    const user_id = req.user.id;
    const { forum_id } = req.params;

    forumService.updateForumDescription(forum_id, user_id, description);

    return ok(res, null);

  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.listForumFollowers = (req, res) => {
  try {
    const { forum_id } = req.params;

    forumService.listForumFollowers(forum_id);

    return ok(res, null);

  } catch (error) {
    return fail(res, 500, "server error");
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
      return fail(res, 400, 'invalid input');
    }

    forumService.validateForum(forum_id, validator_id, status);

    return ok(res, null);

  } catch (error) {
    return fail(res, 500, "server error");
  }
};


exports.follow = async (req, res) => {

  const user_id = req.user.id;
  const { forum_id } = req.params;

  try {
    await forumService.toggleFollowForum(user_id, forum_id);
    return ok(res, null);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.getForumByName = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await forumService.searchForums(decodeURIComponent(name));
    if (!result || !result.rows || result.rows.length === 0) {
      return fail(res, 404, 'forum not found');
    }
    return ok(res, result.rows[0]);
  } catch (error) {
    return fail(res, 500, 'server error');
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
    console.log(response);
    return ok(res, response);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};
