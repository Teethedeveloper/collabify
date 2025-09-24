//utility functions
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch (err) {
    return null;
  }
};

/**
 * Hash a password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random room code
 */
const generateRoomCode = (length = 6) => {
  return randomBytes(length).toString("hex").slice(0, length).toUpperCase();
};

/**
 * Wrapper for async controllers (avoid try/catch everywhere)
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Error response helper
 */
const errorHandler = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Success response helper
 */
const sendResponse = (res, statusCode, data, message = "OK") => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateRoomCode,
  catchAsync,
  errorHandler,
  sendResponse,
};

