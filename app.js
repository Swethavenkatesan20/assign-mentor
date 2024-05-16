const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Mentor = require('./models/Mentor');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://swethavenkatesan20:swethavenkat99@cluster0.v4m62io.mongodb.net/mentor-student', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Mentor API endpoint
app.post('/mentors', async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).send(mentor);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Student API endpoint
app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

// assigning Student to Mentor API
app.put('/assign-mentor/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }

    if (student.mentor) {
      student.previousMentors.push(student.mentor);
    }

    student.mentor = req.body.mentorId;
    await student.save();

    const mentor = await Mentor.findById(req.body.mentorId);
    mentor.students.push(student._id);
    await mentor.save();

    res.send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

// getting all students for a particular mentor API
app.get('/mentors/:mentorId/students', async (req, res) => {
  try {
    const students = await Student.find({ mentor: req.params.mentorId });
    res.send(students);
  } catch (error) {
    res.status(400).send(error);
  }
});

// getting previous mentors for a particular student API
app.get('/students/:studentId/previous-mentors', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('previousMentors');
    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.send(student.previousMentors);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
