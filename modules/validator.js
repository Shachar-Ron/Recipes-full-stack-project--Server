const { body, validationResult } = require("express-validator");
const RegisterValidationRules = [
  // username must be an email
  body("username")
    .isLength({ min: 3, max: 8 })
    .withMessage("username must be with length between 3-8")
    .isAlpha()
    .withMessage("username must contain only letters"),
  // password must be at least 5 chars long
  body("password")
    .isLength({ min: 5, max: 10 })
    .withMessage("password must be with length between 5-10")
    .isAlphanumeric()
    .withMessage("password must contain only letters and numbers")
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  // throw { status: 422, message: extractedErrors };
  throw { status: 422, message: "input rules don't validate" };
};

module.exports = {
  RegisterValidationRules,
  validate
};
