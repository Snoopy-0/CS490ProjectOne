document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const assignmentTable = document.getElementById('assignmentTable').querySelector('tbody');
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    const assignmentModal = document.getElementById('assignmentModal');
    const assignmentForm = document.getElementById('assignmentForm');
    const assignmentTitle = document.getElementById('assignmentTitle');
    const assignmentDescription = document.getElementById('assignmentDescription');
    const assignmentDueDate = document.getElementById('assignmentDueDate');
    const gradesBtn = document.getElementById('grades-btn');

    let editIndex = null;

    const token = localStorage.getItem('token');

    if (token) {
        // Get a role from JWT token
        const payload = JSON.parse(atob(token.split('.')[1])); 
        const userRole = payload.role;

        // Grades button functionality based on role
        gradesBtn.addEventListener('click', () => {
            if (userRole === 'professor') {
                window.location.href = 'grading_professor.html'; // Professor grading page
            } else if (userRole === 'student') {
                window.location.href = 'grading_student.html'; // Student grading page
            } else {
                alert('Invalid user role. Please contact support.');
            }
        });
        
        // Login button --> logout button
        authBtn.textContent = 'Logout';
        authBtn.href = '#';
        authBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            alert('You have been logged out.');
            window.location.href = 'cs490webpage.html';
        });

        if (userRole === 'professor') {
            addAssignmentBtn.style.display = 'block';
        } else {
            addAssignmentBtn.style.display = 'none'; 
        }
    } else {
        authBtn.textContent = 'Login';
        authBtn.href = 'login.html';

        addAssignmentBtn.style.display = 'none';
    }

    if (!assignmentTable) {
        console.error('Assignment table body not found!');
        return;
    }


    // Sample assignment
    const assignments = [
        {
            title: 'Assignment 1',
            description: 'Complete the project proposal document.',
            dueDate: '2025-01-10',
        },
        {
            title: 'Assignment 2',
            description: 'Build the front-end layout for the application.',
            dueDate: '2025-01-15',
        },
        {
            title: 'Assignment 3',
            description: 'Write the API documentation for your project.',
            dueDate: '2025-01-20',
        },
    ];

    // Render assignment list
    const renderAssignments = () => {
        assignmentTable.innerHTML = '';
        assignments.forEach((assignment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assignment.title}</td>
                <td>${assignment.description}</td>
                <td>${assignment.dueDate}</td>
                <td>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            assignmentTable.appendChild(row);
        });
        
        // Attach event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                assignments.splice(index, 1); // Remove assignment
                renderAssignments();
            });
        });
        
    };


    // Initialize empty list
    renderAssignments();
});
