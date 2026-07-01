require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const user = await User.findOne({});
  
  if (!user) {
    console.log("No user found");
    process.exit(1);
  }

  // Create a token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // Create a dummy video file
  fs.writeFileSync('dummy.webm', 'test content');

  const formData = new FormData();
  formData.append('title', 'Test Video');
  formData.append('note', 'Test note');
  formData.append('video', fs.createReadStream('dummy.webm'));

  console.log("Sending request...");
  const res = await fetch('http://localhost:4000/api/videos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const body = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${body}`);

  fs.unlinkSync('dummy.webm');
  process.exit(0);
}
run();
