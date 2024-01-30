import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
dotenv.config();
import User from "../db/user";
import Joi from "joi";
import express from "express";
import * as userMiddleware from "../middleware/user"
const maxAge = 3 * 24 * 60 * 60;

const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  });
const signUpUser = async (req: express.Request, res: express.Response) => {
    const { name, email, password } = req.body;
  
    try {
      const validate = await schema.validateAsync(req.body);
  
      const check_user_exist = await User.findOne({ email });
      if (check_user_exist) {
        return res.status(404).send({ status: 404, message: "User already exists!" });
      }
  
      const new_user = {
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      };
  
      const user = await User.create(new_user);
  
      res.status(200).send({ status: 200, user });
    } catch (e) {
      return res.status(400).send(`Sign up error: ${e}`);
    }
};

const schema1 = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  });
  
const loginUser = async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    try {
        const validate = await schema1.validateAsync(req.body);
        const user = await User.findOne ({ email });
        if (user) {
          const passwordIsValid = bcrypt.compareSync(password, user.password);
          if (!passwordIsValid) {
            return res
              .status(400)
              .send({ status: 400, message: "Invalid Email or Password!" });
          }
  
          let token = userMiddleware.createToken( JSON.stringify(user._id));
  
          res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
          res.cookie('role', user.role, { httpOnly: true, maxAge: maxAge * 1000 });
          res.status(200).send( {status: 200, message: user._id, role: user.role, jwt:token });
        } else {
          return res
            .status(404)
            .send({ status: 404, message: "User does not exist!" });
        }
    } catch (e) {
        res.status(400).send(`Login error: ${e}`);
    }
};

const logoutUser = async (req: express.Request, res: express.Response) => {
    try {
      res.cookie('jwt', '', { maxAge: 1 });
      res.cookie('role', '', { maxAge: 1 });
      res.status(200).send("log out successfully");
    } catch (e) {
      res.status(404).send({ status: 404, message: e });
    }
};

const getUserById = async (req: express.Request, res: express.Response) => {
    try {
      const searchedUser = await User.findById(req.params._id);
  
      if (!searchedUser) {
        return res.status(404).send({ status: 404, message: 'User not found' });
      }
  
      return res.status(200).send({ status: 200, user: searchedUser });
    } catch (e) {
      res.status(400).send({ status: 400, message: e });
    }
};

const getCurrentUser = async (req: express.Request, res: express.Response) => {
    try {
      // Retrieve user ID from decoded JWT token
      const id = req.cookies.jwt ? userMiddleware.getUserIdFromToken(req.cookies.jwt) : undefined;
      const userId = id.replace(/["']/g, ''); 
    
      if (!userId) {
        return res.status(401).send({ status: 401, message: 'User not authenticated' });
      }
  
      const currentUser = await User.findById(userId);
  
      if (!currentUser) {
        return res.status(404).send({ status: 404, message: 'User not found' });
      }
  
      return res.status(200).send({ status: 200, user: currentUser });
    } catch (e) {
      res.status(400).send({ status: 400, message: e });
    }
  };
export {signUpUser, loginUser, logoutUser, getUserById, getCurrentUser};