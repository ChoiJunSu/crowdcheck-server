import axios from "axios";
import { URLSearchParams } from "url";

const getOauthEmail = async (provider, code, redirectUri) => {
  let email = null;
  try {
    switch (provider) {
      case "kakao": {
        const params = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "752369a3217c1905b6ce8a71a15eaf8c",
          redirect_uri: redirectUri,
          code,
          client_secret: "LMYsThJdZqYizOZTPrdTcCLr6UnIqUAT",
        });
        const {
          data: { access_token },
        } = await axios.post(
          "https://kauth.kakao.com/oauth/token",
          params.toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );
        const {
          data: { kakao_account },
        } = await axios.get("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        });
        if (kakao_account.has_email) email = kakao_account.email;
        break;
      }

      case "google": {
        const params = new URLSearchParams({
          grant_type: "authorization_code",
          client_id:
            "646489201957-l6859a2jp95c6fles5lcos3tmnlm8eab.apps.googleusercontent.com",
          redirect_uri: redirectUri,
          code,
          client_secret: "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",
        });
        const {
          data: { access_token },
        } = await axios.post(
          "https://oauth2.googleapis.com/token",
          params.toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        );
        email = data.email;
        break;
      }

      case "naver": {
        break;
      }

      default: {
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }

  return email;
};

export const oauthLogin = async (provider, code, redirectUri) => {
  const response = {
    ok: false,
    error: null,
    accessToken: null,
  };
  const email = await getOauthEmail(provider, code, redirectUri);
  console.log(provider, email);
  if (!email) response.error = "Oauth Error";
  else {
  }
  return response;
};
