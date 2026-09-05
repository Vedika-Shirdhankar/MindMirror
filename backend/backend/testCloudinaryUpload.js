const fs = require('fs');
const path = require('path');

async function testUpload() {
  const FormData = globalThis.FormData || require('formdata-node').FormData;
  const { Blob } = require('buffer');

  // Let's create a dummy WebM file content
  const dummyWebm = Buffer.from('dummy video content');
  const blob = new Blob([dummyWebm], { type: 'video/webm' });

  const form = new FormData();
  form.append('title', 'Test Cloudinary Upload');
  form.append('note', 'Testing end to end flow');
  form.append('video', blob, 'test-video.webm');

  // We need to login first to get a token, or just mock auth
  // Let's login
  console.log('Logging in...');
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) // Assuming a test user exists, otherwise we'll signup
  });
  
  let token;
  if (loginRes.ok) {
    const data = await loginRes.json();
    token = data.token;
  } else {
    console.log('Login failed, trying signup...');
    const signupRes = await fetch('http://localhost:4000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'testcloudinary@example.com', password: 'password123' })
    });
    const data = await signupRes.json();
    token = data.token;
  }

  console.log('Uploading video...');
  const uploadRes = await fetch('http://localhost:4000/api/videos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });

  const uploadData = await uploadRes.json();
  console.log('Upload response:', JSON.stringify(uploadData, null, 2));
}

testUpload().catch(console.error);
