import jwt, { VerifyErrors } from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";
import User  from "../db/user";
dotenv.config();
const maxAge = 3 * 24 * 60 * 60;
const secret = process.env.SECRET ? process.env.SECRET: "";

const createToken = (id: string) => {
    return jwt.sign({ id }, secret, { expiresIn: maxAge });
};

// bảo vệ định tuyến cần quyền/đã đăng nhập
const requireAuth = (req: express.Request, res: express.Response) => {
    const token = req.body.jwt;
    if (token && secret) {
      jwt.verify(token, secret, async (err: VerifyErrors | null, decodedToken: any) => {
        if (err) {
          res.cookie('role', '', {maxAge: maxAge * 1});
          res.status(404).send({ status: 404, message: err.message });
        } else {
          let currentUser = await User.findById(decodedToken.id.id);
          let currentRole = currentUser ? currentUser.role: "";
          res.status(200).send({ status: 200, role: currentRole });
        }
      });
    } else {
      res.cookie('role', '', {maxAge: maxAge * 1});
      res.status(404).send({ status: 404, message: "Bad request" });
    }
};

const getUserIdFromToken = (token: string | undefined) => {
    if (!token) {
      return undefined;
    }
  
    try {
      const decodedToken: any = jwt.verify(token, secret);
      return decodedToken.id;
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return undefined;
    }
  };
export {createToken, getUserIdFromToken}