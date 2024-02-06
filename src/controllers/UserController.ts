import fs from "fs";
import { Request, Response } from "express";
import sha1 from "sha1";
import path from "path";

import { generateTokens } from "../utils/auth.utils";
import SqlUtils from "../utils/sql.utils";
import { generateRandomCode } from "../utils/generate.utils";
import MailUtils from "../utils/mail.utils";

//DEFINE
export default class UserController {
  static async login(req: Request, res: Response) {
    try {
      const { userId, password } = req.body;
      const user = await SqlUtils.selectUserById(req.app.locals.db, userId);
      console.log("user", user);
      if (!user) {
        return res.status(404).json({
          message: `User not found!`,
        });
      }
      if (sha1(password) !== user.Password) {
        return res.status(403).json({
          message: `Password incorrect!`,
        });
      }
      if (!user.Employed) {
        return res.status(403).json({
          message: `User is not an employee!`,
        });
      }
      const { UserId, FullName, Discipline, JobTitle, Email, ...rest } = user;

      const newtokens = generateTokens({
        UserId,
        FullName,
        Discipline,
        JobTitle,
      });
      //Send response
      res.cookie("rt", newtokens.refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "strict",
      });
      return res.status(200).json({
        message: `Login success!`,
        data: newtokens.accessToken,
      });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
  //Logout
  static async logout(req: Request, res: Response) {
    try {
      res.clearCookie("rt");
      return res.status(200).json({ message: "Logout success" });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
  //Create user
  static async register(req: Request, res: Response) {
    const {
      userId,
      email,
      fullName,
      discipline,
      jobTitle,
      sex,
      employed,
      startWorkingDate,
      ...rest
    } = req.body;
    try {
      return res.status(201).json({ message: "Add member successful!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something is broken!" });
    }
  }
  static async forgot(req: Request, res: Response) {
    const { id } = req.body;
    try {
      const user = await SqlUtils.selectUserById(req.app.locals.db, id);
      if (!user) {
        return res.status(404).json({
          message: `User not found!`,
        });
      }
      if (!user.Employed) {
        return res.status(403).json({
          message: `User is not an employee!`,
        });
      }
      const { UserId, Email } = user;
      const settings = await SqlUtils.selectUserSettings(
        req.app.locals.db,
        UserId
      );
      if (!settings) {
        return res.status(404).json({
          message: `User settings not found!`,
        });
      }
      // const { Token } = settings;
      // if (Token) {
      //     return res.status(200).json({
      //         message: `Token have been sent to your email. Please check!`,
      //     });
      // }

      if (!Email) {
        return res.status(404).json({
          message: `Email not found!`,
        });
      }
      const token = generateRandomCode();
      //Save code to database
      await SqlUtils.updateSettings(req.app.locals.db, UserId, token);
      //Format email
      const emailTemplatePath = path.join(
        __dirname,
        "../templates/email/reset-password-template.html"
      );
      const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
      const emailContent = emailTemplate.replace("{{ token }}", token);

      const mailer = new MailUtils();
      await mailer.sendEmail(
        [Email],
        [],
        `TBF Polaris | Reset Password | ${UserId}`,
        emailContent
      );
      //

      return res.status(200).json({
        message: "An email have just sent to your email. Please check!",
        data: Email,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something is broken!" });
    }
  }
  static async submit(req: Request, res: Response) {
    const { userId, token, newPassword, confirmPassword } = req.body;
    try {
      const user = await SqlUtils.selectUserById(req.app.locals.db, userId);
      if (!user) {
        return res.status(404).json({
          message: `User not found!`,
        });
      }
      if (!user.Employed) {
        return res.status(403).json({
          message: `User is not an employee!`,
        });
      }
      const { UserId } = user;
      const settings = await SqlUtils.selectUserSettings(
        req.app.locals.db,
        UserId
      );
      if (!settings) {
        return res.status(404).json({
          message: `User settings not found!`,
        });
      }
      const { Token } = settings;
      if (!Token) {
        return res.status(404).json({
          message: `Token is not found!`,
        });
      }
      if (Token !== token) {
        return res.status(403).json({
          message: `Token is not correct!`,
        });
      }
      //Change password
      if (!newPassword || newPassword !== confirmPassword) {
        return res.status(406).json({
          message: `Missing password or password confirm failed!`,
        });
      }
      const pass = sha1(newPassword);
      await SqlUtils.updateUserPassword(req.app.locals.db, UserId, pass);
      //Clear token
      await SqlUtils.updateSettings(req.app.locals.db, UserId, "");

      return res.status(200).json({
        message: "Reset password success!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something is broken!" });
    }
  }
  static async refreshToken(req: Request, res: Response) {
    try {
      const user = req.user;
      // const rt = req.cookies.rt;
      const find = SqlUtils.selectUserById(req.app.locals.db, user.UserId);
      if (!find) {
        return res.status(404).json({
          message: "Not found",
        });
      }
      //Store token and ip for check later
      const newTokens = generateTokens({
        UserId: user.UserId,
        FullName: user.FullName,
        Discipline: user.Discipline,
        JobTitle: user.JobTitle,
        Email: user.Email,
      });
      //Response
      res.cookie("rt", newTokens.refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "strict",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      return res.status(200).json({
        message: "Refresh tokens success",
        data: newTokens.accessToken,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  }
  static async check(req: Request, res: Response) {
    return res.status(200).json({ message: "I'm fine!" });
  }
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await SqlUtils.selectAllUsers(req.app.locals.db);
      return res
        .status(200)
        .json({ message: "Get users success!", data: users });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error!" });
    }
  }
}
