import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { getDefaultWalletForRole } from "../utils/defaultWallets.js";

const buildAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  walletAddress: user.walletAddress || getDefaultWalletForRole(user.role),
  skills: user.skills,
  bio: user.bio
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, walletAddress, skills, bio } = req.body;

    if (!name || !email || !password || !role) {
      const error = new Error("Name, email, password, and role are required");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      walletAddress: walletAddress || getDefaultWalletForRole(role),
      skills: skills || [],
      bio: bio || ""
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: buildAuthUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!user.walletAddress) {
      user.walletAddress = getDefaultWalletForRole(user.role);
      await user.save();
    }

    res.json({
      token: generateToken(user._id),
      user: buildAuthUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};
