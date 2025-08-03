import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register new user
export const register = async (req, res, next) => {
  try {
    const { username, password, email, name, agent } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username, email, name, agent, password: hashedPassword
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// Get all users (admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Get current user
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update user (self or admin)
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, agent } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email, agent }, { new: true });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, username } = req.body;
    if (!name || !email || !password || !role || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      username,
      password: hash,
      role
    });
    res.status(201).json({ message: 'User created', user: { _id: user._id, name, email, username, role } });
  } catch (err) {
    next(err);
  }
};

// Update user by admin
export const updateUserById = async (req, res, next) => {
  try {
    const { name, email, username, role, password } = req.body;
    const updateObj = { name, email, username, role };
    if (password) updateObj.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Delete user by admin
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};