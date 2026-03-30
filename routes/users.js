/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: "john_doe"
 *         password:
 *           type: string
 *           description: The password of the user
 *           example: "password123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Inicio de sesión exitoso"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Usuario no encontrado"
 */

const express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

/* GET users listing. */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users endpoint
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users endpoint response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado correctamente"
 *       500:
 *         description: Registration error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/* POST users listing. */
router.post('/register', async function(req, res, next) {
  try {
    console.log('🔐 Register attempt received:', req.body);
    const { username, password } = req.body;
    
    console.log('🧂 Generating salt...');
    const salt = bcrypt.genSaltSync(10);
    console.log('🧂 Salt generated:', salt);
    
    console.log('🔐 Hashing password...');
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log('🔐 Password hashed successfully');

    console.log('👤 Creating user object...');
    const newUser = new User({
      username,
      password: hashedPassword
    });
    console.log('👤 User object created:', newUser);
    
    console.log('💾 Saving user to database...');
    await newUser.save();
    console.log('✅ User saved successfully:', newUser.username);
    
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Error en el registro', 'description': error.toString() });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Login error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', async function(req, res, next) {
  try {
    console.log('🔐 Login attempt received:', req.body);
    const { username, password } = req.body;
    
    console.log('👤 Looking for user:', username);
    const user = await User.findOne({ username });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('🔑 Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch ? 'Yes' : 'No');
    
    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    
    console.log('🎟 Creating token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('🎟 Token created successfully');
    
    res.cookie('habitToken', token, { 
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    console.log('✅ Login successful for user:', username);
    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Error en el login', 'description': error.toString() });
  }
});


module.exports = router;
