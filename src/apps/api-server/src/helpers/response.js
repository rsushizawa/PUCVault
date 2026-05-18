exports.ok = (res, data) => res.status(200).json({ data });
exports.paginated = (res, data, total) => res.status(200).json({ data, total });
exports.fail = (res, status, msg) => res.status(status).json({ error: msg });
