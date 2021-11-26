import { AsyncRouter } from "express-async-router";
import { oauthLogin } from "../services/oauth.js";

const OauthController = AsyncRouter();

OauthController.get("/login", async (req, res, next) => {
  const { provider, code, redirectUri } = req.query;
  const response = await oauthLogin(provider, code, redirectUri);
  console.log(response);
});

export default OauthController;
