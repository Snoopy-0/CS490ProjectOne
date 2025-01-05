document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const toDoList = document.getElementById('todolist');
    const grades = document.getElementById('grades');
    const token = localStorage.getItem('token');

    if (token) {
        // Get a role from JWT token
        const payload = JSON.parse(atob(token.split('.')[1])); // token decoding
        const userRole = payload.role;

        // Login Status: Present To-Do List and  Grades
        toDoList.style.display = 'block';
        grades.style.display = 'block';

        // Login button --> logout button
        authBtn.textContent = 'Logout';
        authBtn.href = '#';
        authBtn.addEventListener('click', () => {
            localStorage.removeItem('token'); // remove token
            alert('You have been logged out.');
            window.location.reload(); 
        });

        console.log(`Logged in as ${userRole}`);
    } else {
        // Logout Status: Hide To-Do List and Grades
        toDoList.style.display = 'none';
        grades.style.display = 'none';

        // Login button setting
        authBtn.textContent = 'Login';
        authBtn.href = 'login.html';
    }
});
