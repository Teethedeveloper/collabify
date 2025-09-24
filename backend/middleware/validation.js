// middleware/validation.js
import { body, validationResult } from "express-validator";

// Example: validate user registration input
export const validateRegister = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("display_name")
    .notEmpty()
    .withMessage("Display name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// Example: validate message input
export const validateMessage = [
  body("content").notEmpty().withMessage("Message content cannot be empty"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
