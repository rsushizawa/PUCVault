const userService = require('../services/userServices');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { ok, fail } = require('../helpers/response');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

//reportUser(type, reportee_id, reported_id)

exports.changeRole = async (req, res) => {

  const { roleNum } = req.body;
  const executor_id = req.user.id;
  const { user_id } = req.params;

  let newRole;
  if (roleNum === 1) newRole = 'USUARIO';
  else if (roleNum === 2) newRole = 'VALIDADOR';
  else if (roleNum === 3) newRole = 'ADMIN';

  try {
    await userService.changeUserRole(executor_id, user_id, newRole);
    return ok(res, null);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.follow = async (req, res) => {

  const user_id = req.user.id;
  const { target_id } = req.params;

  try {
    await userService.toggleFollowUser(user_id, target_id);
    return ok(res, null);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.me = async (req, res) => {

  const user_id = req.user.id;

  try {
    const userInfo = await userService.getUserInfo(user_id);
    delete userInfo.rows[0].senha_hash;
    const info = userInfo.rows[0];
    console.log(info);
    return ok(res, info);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.userInfo = async (req, res) => {
  const user_id = req.params;
  try {
    const userInfo = await userService.getUserInfo(user_id);
    delete userInfo.rows[0].senha_hash;
    const info = userInfo.rows[0];
    console.log(info);
    return ok(res, info);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

const descriptionSchema = z.object({
  description: z.any()
});

exports.changeDescription = async (req, res) => {
  const user_id = req.user.id;
  const validation = descriptionSchema.safeParse(req.body);

  try {
    const { description } = validation.data;
    await userService.changeDescription(user_id, description);
    return ok(res, { description });
  } catch (error) {
    return fail(res, 500, "server error");
  }
};
