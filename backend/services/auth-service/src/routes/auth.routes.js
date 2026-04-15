"use strict";

const { Router } = require("express");
const { registerController, loginController } = require("../controllers/auth.controller");
const { asyncHandler } = require("@gpa/shared");

const router = Router();

router.post("/register", asyncHandler(registerController));
router.post("/login", asyncHandler(loginController));

module.exports = { default: router };
