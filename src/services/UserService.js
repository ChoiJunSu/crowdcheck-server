import UserModel from "../models/UserModel.js";

class UserService {
  static getUserByEmail = async (email) => {
    const response = {
      ok: false,
      error: null,
      user: null,
    };
    try {
      const userFindOneResult = await UserModel.findOne({
        where: {
          email,
        },
      });
      if (!userFindOneResult) {
        response.error = "User not found";
        return response;
      } else {
        response.ok = true;
        response.user = userFindOneResult;
      }
    } catch (error) {
      console.error(error);
      response.error = "Internal error";
    }

    return response;
  };

  static createUser = async (email) => {
    const response = {
      ok: false,
      error: null,
    };
    try {
      const userCreateResult = await UserModel.create({
        email,
      });
      if (!userCreateResult) {
        response.error = "Failed to create user";
        return response;
      }
      response.ok = true;
    } catch (error) {
      console.error(error);
      response.error = "Internal error";
    }

    return response;
  };
}

export default UserService;
