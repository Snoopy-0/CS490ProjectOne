document.addEventListener('DOMContentLoaded', () => {
  const signupBtn = document.getElementById('signup-btn');
  const popup = document.getElementById('signup-popup');
  const closeBtn = document.querySelector('.close');

  signupBtn.addEventListener('click', () => {
      popup.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
      if (event.target == popup) {
          popup.style.display = 'none';
      }
  });
});

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      loginMessage.style.color = 'green';
      loginMessage.textContent = 'Login successful! Redirecting...';
      // Store user information and token in local storage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // Store the token
      // Redirect to the next page
      window.location.href = 'cs490webpage.html';
    } else {
      loginMessage.style.color = 'red';
      loginMessage.textContent = data.message || 'Invalid username or password';
    }
  } catch (err) {
    loginMessage.style.color = 'red';
    loginMessage.textContent = 'An error occurred. Please try again.';
  }
});