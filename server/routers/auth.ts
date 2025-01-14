import { Router } from "express";
import { register, login, getUserById } from "../controllers/auth.controller";
import { protect } from "../middlewares/protect";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get<{ userId: string }>("/users/:userId", protect, getUserById);

export default authRouter;
