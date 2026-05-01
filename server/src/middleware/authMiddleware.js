import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Not authorized, token missing");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    return next(error);
  }

  next();
};

