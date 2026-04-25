const feedService = require('../services/feedServices');

exports.getFeed = async (req, res) => {
  const { page_num } = req.params;
  const user_id = req.user.id;
  try {
    const result = await feedService.printFeed(user_id, page_num);
    const rows = result.rows;
    console.table(rows);
    res.status(200).json({ rows });
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: "internal server error" });
  }
};
