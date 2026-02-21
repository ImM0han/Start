const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // support common token payload keys
    req.user = {
      id: decoded.id || decoded._id || decoded.userId || decoded.sub,
    };

    if (!req.user.id) return res.status(401).json({ msg: "Invalid token payload" });

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
