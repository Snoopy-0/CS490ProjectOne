const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      loginMessage.style.color = 'green';
      loginMessage.textContent = 'Login successful! Redirecting...';

      localStorage.setItem('token', data.token);

      window.location.href = 'cs490webpage.html';
    } else {
      loginMessage.style.color = 'red';
      loginMessage.textContent = data.message || 'An error occurred. Please try again.';
    }
  } catch (err) {
    loginMessage.style.color = 'red';
    loginMessage.textContent = 'An error occurred. Please try again.';
  }
});
