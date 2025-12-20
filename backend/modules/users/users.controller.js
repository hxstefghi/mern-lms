import asyncHandler from 'express-async-handler';
import User from '../auth/auth.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password')
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  res.json({
    users,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalUsers: count,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, role, firstName, lastName, middleName } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    email,
    password,
    role,
    firstName,
    lastName,
    middleName,
  });

  res.status(201).json({
    _id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    fullName: user.fullName,
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { email, role, firstName, lastName, middleName, isActive, profilePicture } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = email;
  }

  user.role = role || user.role;
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.middleName = middleName !== undefined ? middleName : user.middleName;
  user.isActive = isActive !== undefined ? isActive : user.isActive;
  user.profilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    email: updatedUser.email,
    role: updatedUser.role,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    middleName: updatedUser.middleName,
    fullName: updatedUser.fullName,
    isActive: updatedUser.isActive,
    profilePicture: updatedUser.profilePicture,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();

  res.json({ message: 'User removed successfully' });
});

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private/Admin
export const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;

  const users = await User.find({ role, isActive: true })
    .select('-password')
    .sort({ lastName: 1 });

  res.json(users);
});
