import type { Request, Response } from "express";

export function github_auth(req: Request, res: Response): void {
  const githubAuthUrl = "https://github.com/login/oauth/authorize";

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID as string,
    redirect_uri: process.env.GITHUB_CALLBACK_URL as string,
    scope: "read:user repo",
    allow_signup: "true",
  });

  res.redirect(`${githubAuthUrl}?${params.toString()}`);
}

export async function github_callback (req: Request, res: Response) {
  const { code, error, error_description } = req.query;

  if (error || !code) {
    console.log(`Authentification denied : ${error_description}`);
    return res.redirect(`${process.env.FRONTEND_URL}/login?auth_error=denied`);
  }

  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: process.env.GITHUB_CALLBACK_URL,
        }),
      },
    );

    const data = (await response.json()) as { access_token?: string };
    const accessToken = data.access_token;

    if (!accessToken) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?auth_error=token_failed`,);
    }

    res.cookie("github_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Erreur technique lors de l'échange de token :", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?auth_error=server_error`);
  }
}