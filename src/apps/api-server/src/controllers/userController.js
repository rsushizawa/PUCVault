const userService = require('../services/userServices');
const roleMiddleware = require('../middlewares/roleMiddleware');
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

    res.status(200).json({ message: "success" })
  } catch (error) {
    res.status(500).json({ message: "server error" });

  }
};

exports.follow = async (req, res) => {

  const user_id = req.user.id;
  const { target_id } = req.params;

  try {
    await userService.toggleFollowUser(user_id, target_id);

    res.status(200).json({ message: "success" })
  } catch (error) {

    res.status(500).json({ message: "server error" });
  }
};

exports.me = async (req, res) => {

  const user_id = req.user.id;

  try {
    const userInfo = await userService.getUserInfo(user_id);
    delete userInfo.rows[0].senha_hash;
    const info = userInfo.rows[0];
    console.log(info);
    res.status(200).json({ info });
  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
};

exports.userInfo = async (req, res) => {
  const user_id = req.params;
  try {
    const userInfo = await userService.getUserInfo(user_id);
    delete userInfo.rows[0].senha_hash;
    const info = userInfo.rows[0];
    console.log(info);
    res.status(200).json({ info });
  } catch (error) {
    res.status(500).json({ message: "server error", error });
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
    res.status(200).json({ description });
  } catch (error) {
    res.status(500).json({ message: 'server error', error });

  }
};
