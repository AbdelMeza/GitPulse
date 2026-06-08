import { Router } from "express";
import { get_user_data } from "../Controllers/user_data.ts";

const githubProfileRoute = Router();

githubProfileRoute.get("/profile", get_user_data);

export default githubProfileRoute;
