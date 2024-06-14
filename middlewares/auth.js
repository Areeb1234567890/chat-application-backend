require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = `${process.env.SECRET_KEY}`;

const authenticateToken = (req, res, next) => {
  const excludedRoutes = ["/api/login", "/api/register", "/"];

  if (excludedRoutes.includes(req.path)) {
    return next();
  }
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized - No token provided" });
  }

  jwt.verify(token, secret, (error, user) => {
    if (error) {
      return res.status(403).json({ msg: "Forbidden - Invalid token" });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
