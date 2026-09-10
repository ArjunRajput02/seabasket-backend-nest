import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUND, JWT_TOKEN_VERSION } from './constant';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Hashing and verifying passwords
export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND);
  return hashedPassword;
};

// Verifying hashed passwords
export const verifyHash = async (plainTextPassword: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
  return isMatch;
};

// Encoding and decoding JWT tokens
export const encode = <T extends object>(data: T): string => {
  return jwt.sign(data, `${JWT_SECRET}_${JWT_TOKEN_VERSION}`);
};

export const decode = <ResT>(token: string): ResT | false => {
  if (token) {
    try {
      return jwt.verify(token, `${process.env.JWT_SECRET}_${JWT_TOKEN_VERSION}`) as ResT;
    } catch (_error) {
      return false;
    }
  }
  return false;
};
