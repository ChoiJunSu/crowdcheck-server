import { AsyncRouter } from "express-async-router";
import OauthService from "../services/OauthService.js";

const OauthController = AsyncRouter();

OauthController.get("/login", async (req, res, next) => {
  const { provider, code, redirectUri } = req.query;
  return await OauthService.oauthLogin(provider, code, redirectUri);
});

export default OauthController;
