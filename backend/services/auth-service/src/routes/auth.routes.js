"use strict";

const { Router } = require("express");
const { registerController, loginController, refreshController } = require("../controllers/auth.controller");
const { asyncHandler } = require("@gpa/shared");

const router = Router();

router.post("/register", asyncHandler(registerController));
router.post("/login", asyncHandler(loginController));
router.post("/refresh", asyncHandler(refreshController));

module.exports = { default: router };
