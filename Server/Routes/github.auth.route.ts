import { Router } from "express";
import { github_auth, github_callback } from "../Controllers/github_auth.ts";

const githubAuthRouter = Router();

githubAuthRouter.get("/auth/github", github_auth);

githubAuthRouter.get("/auth/callback", github_callback);

export default githubAuthRouter;
