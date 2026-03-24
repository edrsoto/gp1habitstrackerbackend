var express = require('express');
var router = express.Router();
const Habit = require('../models/habit');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authenticateToken = (req, res, next) => {
  console.log('Headers recibidos:', req.headers);
  const token = req.headers['Authorization'] || req.headers['authorization'];
  console.log('Token extraído:', token);
  
  if (!token){
    console.log('No se proporcionó token');
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }
  try {
    const tokenWithoutBearer = token.replace('Bearer ', '');
    console.log('Token sin Bearer:', tokenWithoutBearer);
    const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    console.log('Token verificado:', verified);
    req.user = verified;
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/habits', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(500).json({ message: "Error retrieving habits: user not found" });
    }
    const userId = req.user.id;
    const habits = await Habit.find({ 'userId': new mongoose.Types.ObjectId(userId) });
    console.log('Habits encontrados para usuario', userId, ':', habits);
    res.json(habits);
  } catch (err) {
    console.error('Error en GET /habits:', err);
    res.status(500).json({ message: 'Error retrieving habits' });
  }
});

router.post('/habits', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(500).json({ message: "Error adding habits: user not found" });
    }
    const { title, description } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const habit = new Habit({ title, description, userId });
    await habit.save();
    console.log('Habit creado:', habit);
    res.json(habit);
  } catch (err) {
    console.error('Error en POST /habits:', err);
    res.status(400).json({ message: 'Error creating habit' });
  }
});

router.delete('/habits/:id', authenticateToken, async (req, res) => {
  try {
  const { id } = req.params;
    const habit = await Habit.findByIdAndDelete(id);
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting habit' });
  }
});

router.patch('/habits/marksadone/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    habit.lastDone = new Date();
    if (timeDifferenceInHours(habit.lastDone, habit.lastUpdate) < 24) {
      habit.days = timeDifferenceInDays(habit.lastDone, habit.startedAt);
      habit.lastUpdate = new Date();
      habit.save();
      res.status(200).json({ 'message': 'Habit marked as done' });
    } else {
      habit.days = 1;
      habit.lastUpdate = new Date();
      habit.save();
      res.status(200).json({ 'message': 'Habit restarted' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Habit not found' });
  }
});

const timeDifferenceInHours = (date1, date2) => {
    const differenceMs = Math.abs(date1 - date2);
    return differenceMs / (1000 * 60 * 60);
};

const timeDifferenceInDays = (date1, date2) => {
  const differenceMs = Math.abs(date1 - date2);
  return Math.floor(differenceMs / (1000 * 60 * 60 * 24));
};

module.exports = router;
