/**
 * @swagger
 * components:
 *   schemas:
 *     Habit:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the habit
 *           example: "60f7b3b3b3b3b3b3b3b3b3"
 *         title:
 *           type: string
 *           description: The title of the habit
 *           example: "Exercise daily"
 *         description:
 *           type: string
 *           description: The description of the habit
 *           example: "Exercise for 30 minutes every day"
 *         userId:
 *           type: string
 *           description: The id of the user who owns this habit
 *           example: "60f7b3b3b3b3b3b3b3b3"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the habit was created
 *           example: "2023-07-20T10:30:00.000Z"
 *     HabitInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the habit
 *           example: "Exercise daily"
 *         description:
 *           type: string
 *           description: The description of the habit
 *           example: "Exercise for 30 minutes every day"
 */

var express = require('express');
var router = express.Router();
const Habit = require('../models/Habit');
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
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get home page
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Home page response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Express"
 */
router.get('/', function(req, res, next) {
  res.json({ title: 'Express' });
});

/**
 * @swagger
 * /habits:
 *   get:
 *     summary: Get all habits for authenticated user
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of habits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Habit'
 *       401:
 *         description: Unauthorized - No token provided
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

/**
 * @swagger
 * /habits:
 *   post:
 *     summary: Create a new habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HabitInput'
 *     responses:
 *       200:
 *         description: Habit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habit'
 *       401:
 *         description: Unauthorized - No token provided
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
