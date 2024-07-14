import { Router } from "express";
import { check } from "express-validator";
import AuthController from "../controllers/AuthController";

const router = Router();

router.post(
  "/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("password", "Password must be at least 6 characters long").isLength({
      min: 6,
    }),
  ],
  AuthController.register
);

router.post(
  "/login",
  [
    check("username", "Username is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  AuthController.login
);

export default router;
