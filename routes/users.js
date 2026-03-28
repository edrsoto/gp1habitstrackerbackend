var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST users listing. */
router.post('/register', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el registro', 'description': error.toString() });
  }
});

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
