var express = require('express');
var router = express.Router();
var Habit = require('../models/habit'); 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Error retriving habits' });
  }
});

router.post('/habits', async (req, res) => {
  try {
  const { title, description } = req.body;
  const habit = new Habit({ title, description });
  await habit.save();
  res.json(habit);
  } catch (err) {
    res.status(400).json({ message: 'Error creating habit' });
  }
});

router.delete('/habits/:id', async (req, res) => {
  try {
  const { id } = req.params;
    const habit = await Habit.findByIdAndDelete(id);
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting habit' });
  }
});

module.exports = router;
