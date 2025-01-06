const express = require('express');
const connectDB = require('./db');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Connect to the database
let dbConnection;
connectDB().then(connection => {
  dbConnection = connection;

  // Fetch sections route
  app.get('/sections', async (req, res) => {
    const { professorId } = req.query;
    try {
      let query = `SELECT Sections.Section_ID, COUNT(Students.Student_ID) AS Student_Count
                   FROM Sections 
                   LEFT JOIN Students ON Sections.Section_ID = Students.Section`;
      let params = [];
      if (professorId) {
        query += ` WHERE Sections.Professor_ID = ?`;
        params.push(professorId);
      }
      query += ` GROUP BY Sections.Section_ID`;
      const [sections] = await dbConnection.execute(query, params);
      res.json(sections);
    } catch (err) {
      console.error('Error fetching sections:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Login route
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const [rows] = await dbConnection.execute(
        `SELECT Username, 
                ID, 
                First_Name, 
                Last_Name,
                Major_Department,
                Total_Grade,
                Section,
                Role
         FROM (
          SELECT Username, Password, Professor_ID AS ID, First_Name, Last_Name, Department AS Major_Department, NULL AS Total_Grade, NULL AS Section, 'Professor' AS Role FROM Professors
          UNION ALL
          SELECT Username, Password, Student_ID AS ID, First_Name, Last_Name, Major AS Major_Department, Total_Grade, Section, 'Student' AS Role FROM Students
        ) AS users
        WHERE Username = ? AND Password = ?`,
        [username, password]
      );
      if (rows.length > 0) {
        const user = rows[0];
        // Generate JWT token
        const token = jwt.sign({ username: user.Username, role: user.Role }, 'secret_key', { expiresIn: '1h' });
        res.json({ success: true, message: 'Login successful', user, token });
      } else {
        res.json({ success: false, message: 'Invalid username or password' });
      }
    } catch (err) {
      console.error('Error during login:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Register route
  app.post('/register', async (req, res) => {
    const { role, firstname, lastname, email, username, password, section } = req.body;
    try {
      let table = role === 'Professor' ? 'Professors' : 'Students';
      const [result] = await dbConnection.execute(
        `INSERT INTO ${table} (Username, Password, Email, First_Name, Last_Name) VALUES (?, ?, ?, ?, ?)`,
        [username, password, email, firstname, lastname]
      );
      if (result.affectedRows > 0) {
        if (role === 'Professor') {
          const professorId = result.insertId;
          const [sectionResult] = await dbConnection.execute(
            `INSERT INTO Sections (Professor_ID) VALUES (?)`,
            [professorId]
          );
          if (sectionResult.affectedRows > 0) {
            res.json({ success: true, message: 'Registration successful. A new section has been assigned to you.' });
          } else {
            res.json({ success: true, message: 'Registration successful, but failed to assign a new section.' });
          }
        } else {
          const studentId = result.insertId;
          const [studentSectionResult] = await dbConnection.execute(
            `UPDATE Students SET Section = ? WHERE Student_ID = ?`,
            [section, studentId]
          );
          res.json({ success: true, message: 'Registration successful' });
        }
      } else {
        res.json({ success: false, message: 'Registration failed' });
      }
    } catch (err) {
      console.error('Error during registration:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Create assignment route
  app.post('/create-assignment', upload.single('attachment_url'), async (req, res) => {
    const { section, title, post, due_date, points } = req.body;
    const attachment_url = req.file ? req.file.path : null;
    try {
      let query;
      let params = [section, title, post, due_date, points];

      if (attachment_url) {
        query = `INSERT INTO Assignments (Section_ID, Title, Post, Due_Date, Points, Attachment_URL) VALUES (?, ?, ?, ?, ?, ?)`;
        params.push(attachment_url);
      } else {
        query = `INSERT INTO Assignments (Section_ID, Title, Post, Due_Date, Points) VALUES (?, ?, ?, ?, ?)`;
      }

      const [result] = await dbConnection.execute(query, params);
      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Assignment created successfully' });
      } else {
        res.json({ success: false, message: 'Failed to create assignment' });
      }
    } catch (err) {
      console.error('Error creating assignment:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Fetch assignments for professors
  app.get('/assignments/professor/:professorId', async (req, res) => {
    const { professorId } = req.params;
    try {
      const [assignments] = await dbConnection.execute(
        `SELECT a.* 
         FROM Assignments a
         JOIN Sections s ON a.Section_ID = s.Section_ID
         WHERE s.Professor_ID = ?
         ORDER BY a.Due_Date DESC`,
        [professorId]
      );
      res.json(assignments);
    } catch (err) {
      console.error('Error fetching assignments for professor:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Fetch assignments for students
  app.get('/assignments/student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
      const [assignments] = await dbConnection.execute(
        `SELECT a.*, s.Section_ID, s.Professor_ID, sub.Submission_Date 
         FROM Assignments a
         JOIN Sections s ON a.Section_ID = s.Section_ID
         JOIN Students st ON st.Section = s.Section_ID
         LEFT JOIN Submissions sub ON sub.Assignment_ID = a.Assignment_ID AND sub.Student_ID = st.Student_ID
         WHERE st.Student_ID = ?
         ORDER BY a.Due_Date DESC`,
        [studentId]
      );
      res.json(assignments);
    } catch (err) {
      console.error('Error fetching assignments for student:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Fetch grades for students
  app.get('/grades/student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
      const [grades] = await dbConnection.execute(
        `SELECT a.*, s.Section_ID, s.Professor_ID, sub.Grade, sub.Text_Box AS Submission_Text, sub.Comment AS Submission_Comment, sub.Submission_URL 
         FROM Assignments a
         JOIN Sections s ON a.Section_ID = s.Section_ID
         JOIN Students st ON st.Section = s.Section_ID
         LEFT JOIN Submissions sub ON sub.Assignment_ID = a.Assignment_ID AND sub.Student_ID = st.Student_ID
         WHERE st.Student_ID = ?
         ORDER BY a.Due_Date ASC`,
        [studentId]
      );
      res.json(grades);
    } catch (err) {
      console.error('Error fetching grades for student:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Fetch grades for professors
  app.get('/grades/professor/:professorId', async (req, res) => {
    const { professorId } = req.params;
    const { sectionId, assignmentId } = req.query;
    try {
      let query = `SELECT a.*, s.Section_ID, st.Student_ID, sub.Grade 
                   FROM Assignments a
                   JOIN Sections s ON a.Section_ID = s.Section_ID
                   JOIN Students st ON st.Section = s.Section_ID
                   LEFT JOIN Submissions sub ON sub.Assignment_ID = a.Assignment_ID AND sub.Student_ID = st.Student_ID
                   WHERE s.Professor_ID = ?`;
      let params = [professorId];
      if (sectionId) {
        query += ` AND s.Section_ID = ?`;
        params.push(sectionId);
      }
      if (assignmentId) {
        query += ` AND a.Assignment_ID = ?`;
        params.push(assignmentId);
      }
      query += ` ORDER BY a.Due_Date DESC`;
      const [grades] = await dbConnection.execute(query, params);
      res.json(grades);
    } catch (err) {
      console.error('Error fetching grades for professor:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Fetch announcements for students
  app.get('/announcements/student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
      const [announcements] = await dbConnection.execute(
        `SELECT a.*, s.Section_ID 
         FROM Announcements a
         JOIN Sections s ON a.Section_ID = s.Section_ID
         JOIN Students st ON st.Section = s.Section_ID
         WHERE st.Student_ID = ?
         ORDER BY a.Title DESC`,
        [studentId]
      );
      res.json(announcements);
    } catch (err) {
      console.error('Error fetching announcements for student:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Fetch announcements for professors
  app.get('/announcements/professor/:professorId', async (req, res) => {
    const { professorId } = req.params;
    try {
      const [announcements] = await dbConnection.execute(
        `SELECT a.*, s.Section_ID 
         FROM Announcements a
         JOIN Sections s ON a.Section_ID = s.Section_ID
         WHERE s.Professor_ID = ?
         ORDER BY a.Title DESC`,
        [professorId]
      );
      res.json(announcements);
    } catch (err) {
      console.error('Error fetching announcements for professor:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create announcement route
  app.post('/create-announcement', upload.single('attachment'), async (req, res) => {
    const { sectionId, courseId, professorId, title, post } = req.body;
    const attachment_url = req.file ? req.file.path : null;

    try {
      const query = `INSERT INTO Announcements (Section_ID, Course_ID, Professor_ID, Title, Post, Attachment_URL) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [sectionId, courseId, professorId, title, post, attachment_url];

      await dbConnection.execute(query, params);
      res.json({ message: 'Announcement created successfully' });
    } catch (err) {
      console.error('Error creating announcement:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Submit grade route
  app.post('/grade-assignment/:assignmentId/:studentId', async (req, res) => {
    const { assignmentId, studentId } = req.params;
    const { grade } = req.body;

    try {
      const query = `UPDATE Submissions SET Grade = ? WHERE Assignment_ID = ? AND Student_ID = ?`;
      await dbConnection.execute(query, [grade, assignmentId, studentId]);
      res.json({ message: 'Grade submitted successfully' });
    } catch (err) {
      console.error('Error submitting grade:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Upload submission route
  app.post('/submit-assignment/:assignmentId', upload.single('submission-file'), async (req, res) => {
    const { assignmentId } = req.params;
    const { studentId, submission_text, submission_comment } = req.body;
    const submission_file = req.file ? req.file.path : null;
    const submission_date = new Date();

    try {
      let query = `INSERT INTO Submissions (Assignment_ID, Student_ID, Submission_URL, Submission_Date`;
      let params = [assignmentId, studentId, submission_file, submission_date];

      if (submission_text) {
        query += `, Text_Box`;
        params.push(submission_text);
      }

      if (submission_comment) {
        query += `, Comment`;
        params.push(submission_comment);
      }

      query += `) VALUES (?, ?, ?, ?`;
      if (submission_text) query += `, ?`;
      if (submission_comment) query += `, ?`;
      query += `)`;

      await dbConnection.execute(query, params);
      res.json({ message: 'Submission uploaded successfully' });
    } catch (err) {
      console.error('Error uploading submission:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static files from the current directory
  app.use(express.static(path.join(__dirname)));

  // Serve static files from the "public" directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});