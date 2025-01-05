document.addEventListener('DOMContentLoaded', () => {
    const addAnnouncementForm = document.getElementById('addAnnouncementForm');
    const authBtn = document.getElementById('auth-btn');
    const gradesBtn = document.getElementById('grades-btn');
    const token = localStorage.getItem('token');

    if (token) {
        // Get a role from JWT token
        const payload = JSON.parse(atob(token.split('.')[1])); // token decoding
        const userRole = payload.role;

        // Assignment button becomes clickable
        assignmentBtn.addEventListener('click', () => {
            window.location.href = 'assignment.html';
        });

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
            localStorage.removeItem('token'); // remove token
            alert('You have been logged out.');
            window.location.reload();
        });

        console.log(`Logged in as ${userRole}`);
    } else {
        // Logout Status: Hide To-Do List and Grades
        toDoList.style.display = 'none';
        grades.style.display = 'none';

        // Assignment and grades buttons show alert
        assignmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('You need to log in to access Assignments.');
        });
        gradesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('You need to log in to access Grades.');
        });

        // Login button setting
        authBtn.textContent = 'Login';
        authBtn.href = 'login.html';
    }

    addAnnouncementForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;

        const newAnnouncement = { title, content };

        // 로컬 스토리지에 저장
        const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        announcements.push(newAnnouncement);
        localStorage.setItem('announcements', JSON.stringify(announcements));

        alert('Announcement added successfully!');
        window.location.href = 'announcement.html'; // Announcement 페이지로 리디렉션
    });
});
