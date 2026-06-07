import { Router } from "express";

const githubProfileRoute = Router();

githubProfileRoute.get("/profile", async (req, res) => {
  const token = req.cookies.github_token;
  console.log(token)

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "GitPulse-App",
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch user from GitHub" });
    }

    const userData = await response.json();

    return res.json({
      id: userData.id,
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      bio: userData.bio,
      public_repos: userData.public_repos,
    });
  } catch (err) {
    console.error("Erreur profile GitHub :", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default githubProfileRoute;
