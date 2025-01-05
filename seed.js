const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const connectDB = require('./db');

const seedUsers = async () => {
  await connectDB();

  const users = [
    {
      username: 'professor1',
      password: await bcrypt.hash('password1', 10),
      role: 'professor',
    },
    {
      username: 'student1',
      password: await bcrypt.hash('password2', 10),
      role: 'student',
    },
  ];

  try {
    await User.insertMany(users);
    console.log('Users seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
