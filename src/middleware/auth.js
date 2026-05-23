import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const { Client, Admin } = models;

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '3y'
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticate = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
// ✅ Handle missing header or "Bearer null"
if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null') {
// if (!authHeader) {
  return res.status(401).json({ error: 'No valid token provided' });
}

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findByPk(decoded.id);
    } else {
      user = await Client.findByPk(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { ...decoded, details: user };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authenticateClient = async (req, res, next) => {
  try {
    console.log("authenticateClient:::",req.headers.authorization)
    await authenticate(req, res, () => {});

    if (req.user.type !== 'client') {
      return res.status(403).json({ error: 'Access denied. Client role required' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Authorization failed' });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticate(req, res, () => {});

    if (req.user.type !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Authorization failed' });
  }
};
