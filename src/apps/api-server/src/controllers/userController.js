const userService = require('../services/userServices');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

const { ok, paginated, fail } = require('../helpers/response');
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
    if (error.code === 'P0001') {
      return paginated(res, 400, error.message);
    }
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
    if (error.code === '23514') {
      return paginated(res, 400, "user cant follow himself");
    }
    return fail(res, 500, "server error");
  }
};

exports.me = async (req, res) => {

  const user_id = req.user.id;

  try {
    const userInfo = await userService.getUserInfo(user_id, null);
    delete userInfo.rows[0].senha_hash;
    const info = userInfo.rows[0];
    console.log(info);
    return ok(res, info);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.userInfo = async (req, res) => {
  const { user_id } = req.params;
  const logged_id = req.user ? req.user.id : null;
  try {
    const userInfo = await userService.getUserInfo(user_id, logged_id);
    delete userInfo.rows[0].senha_hash;
    const info = userInfo.rows[0];
    return ok(res, info);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.userByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await userService.getUserByUsername(username);
    if (!user) return fail(res, 404, "user not found");
    return ok(res, user);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.followedForums = async (req, res) => {
  const { user_id } = req.params;
  try {
    const forums = await userService.getUserFollowedForums(user_id);
    return ok(res, forums ?? []);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.isFollowing = async (req, res) => {
  const viewer_id = req.user.id;
  const { target_id } = req.params;
  try {
    const result = await userService.checkUserFollow(viewer_id, target_id);
    return ok(res, result);
  } catch (error) {
    return fail(res, 500, "server error");
  }
};

exports.checkForumFollow = async (req, res) => {
  const { user_id, forum_id } = req.params;
  try {
    const result = await userService.checkForumFollow(user_id, forum_id);
    return ok(res, result ?? { follows: false });
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

exports.toggle2FA = async (req, res) => {
  try {
    const user_id = req.user?.id || req.params.user_id;
    if (!user_id) {
      return res.status(400).json({ error: "User ID não identificado" });
    }
    await userService.toggle2FA(user_id);
    const result = await userService.getUserInfo(user_id, null);
    const user = result.rows ? result.rows[0] : (Array.isArray(result) ? result[0] : result);
    const twofactorStatus = user.a2f;
    res.status(200).json({ messsage: `2fa toggled to ${twofactorStatus}` });
  } catch (error) {
    res.status(500).json({ error: 'server error', error });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "User not logged in" });
    }
    await userService.deleteUser(user_id);
    res.status(200).json({ message: `User with id ${user_id} was deleted` });
  } catch (error) {
    res.status(500).json({ error: 'server error ', error });
  }
}
