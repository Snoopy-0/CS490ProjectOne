document.addEventListener('DOMContentLoaded', async () => {
    const authBtn = document.getElementById('auth-btn'); // Login/Logout button
    const token = localStorage.getItem('token'); // Check JWT token
    const user = JSON.parse(localStorage.getItem('user')); // Get user information
    console.log('Token:', token); // Log the token to the console
    if (token) {
        // Login Status
        authBtn.textContent = 'Logout'; // Change Button text to Logout
        authBtn.href = '#';
        authBtn.addEventListener('click', () => {
            // Logout process
            localStorage.removeItem('token'); // Remove token
            localStorage.removeItem('user'); // Remove user information
            alert('You have been logged out.');
            window.location.reload();
        });

        // Display user information
        if (user) {
            console.log('User information:', user); // Log the user information to the console
            document.getElementById('username').textContent = `Username: ${user.Username}`;
            document.getElementById('id').textContent = `ID: ${user.ID}`;
            document.getElementById('firstname').textContent = `First Name: ${user.First_Name}`;
            document.getElementById('lastname').textContent = `Last Name: ${user.Last_Name}`;
            document.getElementById('major-department').textContent = `Major/Department: ${user.Major_Department}`;

            if (user.Role === 'Student') {
                document.getElementById('total_grade').textContent = `Total Grade: ${user.Total_Grade}`;
                document.getElementById('total_grade').style.display = 'block';
                document.getElementById('section').textContent = `Section: ${user.Section}`;
                document.getElementById('section').style.display = 'block';
                document.getElementById('grades').style.display = 'block';
            } else if (user.Role === 'Professor') {
                document.getElementById('create-assignment-btn').style.display = 'block';
                try {
                    const response = await fetch(`/sections?professorId=${user.ID}`);
                    const sections = await response.json();
                    const sectionsList = document.getElementById('sections-list');
                    sectionsList.innerHTML = sections.map(section => 
                        `<li class="section-item">Section ID: ${section.Section_ID} - Students: ${section.Student_Count}</li>`
                    ).join('');
                    document.getElementById('sections').style.display = 'block';

                    // Populate section dropdown in the create assignment form
                    const sectionSelect = document.getElementById('section-select');
                    sectionSelect.innerHTML = sections.map(section => 
                        `<option value="${section.Section_ID}">${section.Section_ID}</option>`
                    ).join('');
                } catch (error) {
                    console.error('Error fetching sections:', error);
                }
            }
        }
    } else {
        // Logout Status
        authBtn.textContent = 'Login'; // Change Button text to Login
        authBtn.href = 'login.html';
    }

    // Create Assignment Button Click
    const createAssignmentBtn = document.getElementById('create-assignment-btn');
    const createAssignmentPopup = document.getElementById('create-assignment-popup');
    const closeBtn = document.querySelector('.close');

    createAssignmentBtn.addEventListener('click', () => {
        createAssignmentPopup.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        createAssignmentPopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === createAssignmentPopup) {
            createAssignmentPopup.style.display = 'none';
        }
    });

    // Create Assignment Form Submission
    const createAssignmentForm = document.getElementById('create-assignment-form');
    createAssignmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(createAssignmentForm);
        const data = {
            section: formData.get('section'),
            subject: formData.get('subject'),
            post: formData.get('post'),
            attachment_url: formData.get('attachment_url'),
            due_date: formData.get('due_date'),
            points: formData.get('points')
        };

        try {
            const response = await fetch('/create-assignment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                document.getElementById('create-assignment-message').style.color = 'green';
                document.getElementById('create-assignment-message').textContent = responseData.message;
                setTimeout(() => {
                    createAssignmentPopup.style.display = 'none';
                }, 2000);
            } else {
                document.getElementById('create-assignment-message').style.color = 'red';
                document.getElementById('create-assignment-message').textContent = responseData.message || 'Failed to create assignment';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('create-assignment-message').style.color = 'red';
            document.getElementById('create-assignment-message').textContent = 'Failed to create assignment: ' + error.message;
        }
    });
});