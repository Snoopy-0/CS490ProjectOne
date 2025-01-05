document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
    const announcementList = document.getElementById('announcementList');
    const gradesBtn = document.getElementById('grades-btn');
    const assignmentBtn = document.getElementById('assignment-btn');
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

        // Login button --> logout button
        authBtn.textContent = 'Logout';
        authBtn.href = '#';
        authBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            alert('You have been logged out.');
            window.location.href = 'cs490webpage.html'; // 홈 페이지로 이동
        });

        // 역할에 따른 Add Announcement 버튼 표시
        if (userRole === 'professor') {
            addAnnouncementBtn.style.display = 'block'; // 교수님은 버튼 표시
        }
    } else {
        // Logout Status: Hide To-Do List and Grades
        authBtn.textContent = 'Login';
        authBtn.href = 'login.html';

        // Assignment and grades buttons show alert
        assignmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('You need to log in to access Assignments.');
        });
        gradesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('You need to log in to access Grades.');
        });

    }

    // Sample announcements (from database or API)
    const announcements = [
        {
            title: "Today's Class Update",
            content: "Dear CS490 students, today's class will focus on project milestones.",
            date: "Jan 2, 2025, 7:50 AM",
            postedBy: "Osama Eljabiri"
        },
        {
            title: "Sprint Timeline",
            content: "Work independently on Sprint 2. No class this week.",
            date: "Dec 30, 2024, 7:27 PM",
            postedBy: "Osama Eljabiri"
        },
        {
            title: "Final Exam Reminder",
            content: "The final exam is scheduled for Jan 15, 2025. Please review all project guidelines.",
            date: "Jan 4, 2025, 10:15 AM",
            postedBy: "Osama Eljabiri"
        },
        {
            title: "Assignment 3 Deadline",
            content: "Assignment 3 submissions are due by Jan 5, 2025, at 11:59 PM.",
            date: "Jan 3, 2025, 2:30 PM",
            postedBy: "Osama Eljabiri"
        },
        {
            title: "Project Demo Session",
            content: "Prepare for the project demo session on Jan 10, 2025. Attendance is mandatory.",
            date: "Jan 4, 2025, 4:45 PM",
            postedBy: "Osama Eljabiri"
        }
    ];

     // Render announcements
     const renderAnnouncements = () => {
        announcements.forEach(({ title, content, date, postedBy }) => {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `
                <div class="left">
                    <h3>${title}</h3>
                    <p>${content}</p>
                </div>
                <div class="right">
                    <span class="posted-by">${postedBy}</span>
                    <span class="date">${date}</span>
                </div>
            `;
            announcementList.appendChild(item);
        });
    };

    // Render announcements for all users
    renderAnnouncements();
});
