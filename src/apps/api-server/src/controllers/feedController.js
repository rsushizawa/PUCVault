const feedService = require('../services/feedServices');
const { ok, fail } = require('../helpers/response');

exports.getFeed = async (req, res) => {
  const { page_num } = req.params;
  const user_id = req.user.id;
  try {
    const result = await feedService.printFeed(user_id, page_num);
    const rows = result.rows;
    console.table(rows);
    return ok(res, rows);
  } catch (error) {
    console.error("Error in getFeed:", error);
    return fail(res, 500, "internal server error");
  }
};
