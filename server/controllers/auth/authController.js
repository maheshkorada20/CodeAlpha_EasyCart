import User from '../../models/User.js';
import asyncHandler from '../../utils/asyncHandler.js';
import generateToken from '../../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, adminCode } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let finalRole = 'customer';
  
  // Admin registration logic
  if (role === 'admin') {
    const validCode = process.env.ADMIN_ACCESS_CODE || 'EASYCART_ADMIN_2026';
    if (adminCode === validCode) {
      finalRole = 'admin';
    } else {
      res.status(401);
      throw new Error('Invalid Admin Access Code');
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: finalRole
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token (supports password login and Admin Access Code login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, adminCode } = req.body;
  const validAdminCode = process.env.ADMIN_ACCESS_CODE || 'EASYCART_ADMIN_2026';

  // 1. Direct Admin Access Code authentication
  if (adminCode || password === validAdminCode) {
    const providedCode = (adminCode || password || '').trim();
    if (providedCode === validAdminCode) {
      // Find existing admin or user, or auto-provision admin
      let user = null;
      if (email && email.trim()) {
        user = await User.findOne({ email: email.trim().toLowerCase() });
      }

      if (!user) {
        // Fallback to default admin account
        user = await User.findOne({ role: 'admin' });
      }

      if (!user) {
        // Create an admin user if none exists
        user = await User.create({
          name: email ? email.split('@')[0] : 'EasyCart Admin',
          email: email ? email.trim().toLowerCase() : 'admin@easycart.com',
          password: 'password123',
          role: 'admin',
          phone: '9876543200',
        });
      } else if (user.role !== 'admin') {
        // Elevate existing account to admin privileges
        user.role = 'admin';
        await user.save();
      }

      if (!user.isActive) {
        user.isActive = true;
        await user.save();
      }

      generateToken(res, user._id);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'admin',
        avatar: user.avatar,
      });
    } else {
      res.status(401);
      throw new Error('Invalid Admin Access Code');
    }
  }

  // 2. Standard email + password authentication
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account disabled');
    }
    
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Incorrect current password');
  }
});

// @desc    Unlock / Upgrade to Admin role via Admin Access Code
// @route   POST /api/auth/unlock-admin
// @access  Private
export const unlockAdmin = asyncHandler(async (req, res) => {
  const { adminCode } = req.body;
  const validCode = process.env.ADMIN_ACCESS_CODE || 'EASYCART_ADMIN_2026';

  if (!adminCode || adminCode !== validCode) {
    res.status(401);
    throw new Error('Invalid Admin Access Code. Access denied.');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = 'admin';
  await user.save();

  res.json({
    message: 'Admin access successfully granted!',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
});

// @desc    Auth user with Google (Sign in or auto-register)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address from Google');
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: cleanEmail });

  if (!user) {
    // Generate secure random password for OAuth user
    const randomPassword = 'G_' + Math.random().toString(36).substring(2, 10) + '!Aa' + Date.now();
    user = await User.create({
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: randomPassword,
      phone: '',
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanEmail.split('@')[0])}&background=0284c7&color=fff`,
      role: 'customer',
      isActive: true,
    });
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account disabled');
  }

  generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
  });
});

