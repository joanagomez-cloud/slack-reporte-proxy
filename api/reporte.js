module.exports = function handler(req, res) {
  res.status(200).json({ 
    method: req.method,
    body: req.body,
    bodyType: typeof req.body
  });
};
