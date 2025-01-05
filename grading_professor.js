document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const gradingTable = document.getElementById('gradingTable').querySelector('tbody');
    const gradingModal = document.getElementById('gradingModal');
    const closeModal = document.getElementById('closeModal');
    const gradingForm = document.getElementById('gradingForm');
    const gradeInput = document.getElementById('grade');
    const feedbackInput = document.getElementById('feedback');
    const assignmentContent = document.getElementById('assignmentContent');
    const assignmentBtn = document.getElementById('assignment-btn');
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
        // Login button --> logout button
        authBtn.textContent = 'Logout';
        authBtn.href = '#';
        authBtn.addEventListener('click', () => {
            localStorage.removeItem('token'); 
            alert('You have been logged out.');
            window.location.href = 'cs490webpage.html'; 
        });
    } else {
        // Login button setting
        authBtn.textContent = 'Login';
        authBtn.href = 'login.html';
    }

    let assignments = [
        {
            studentName: 'John Doe',
            title: 'Assignment 1',
            submissionDate: '2025-01-02',
            content: 'This is the content of Assignment 1 submitted by John Doe.',
            grade: null,
            feedback: null,
        },
        {
            studentName: 'Jane Smith',
            title: 'Assignment 2',
            submissionDate: '2025-01-01',
            content: 'This is the content of Assignment 2 submitted by Jane Smith.',
            grade: 85,
            feedback: 'Great job!',
        },
        {
            studentName: 'Emily Johnson',
            title: 'Assignment 3',
            submissionDate: '2025-01-03',
            content: 'This is the content of Assignment 3 submitted by Emily Johnson.',
            grade: 90,
            feedback: 'Excellent work on the project!',
        },
        {
            studentName: 'Michael Brown',
            title: 'Assignment 4',
            submissionDate: '2025-01-04',
            content: 'This is the content of Assignment 4 submitted by Michael Brown.',
            grade: null,
            feedback: null,
        },
        {
            studentName: 'Sophia Davis',
            title: 'Assignment 5',
            submissionDate: '2025-01-05',
            content: 'This is the content of Assignment 5 submitted by Sophia Davis.',
            grade: 78,
            feedback: 'Good effort, but needs more detail in analysis.',
        },
    ];


    // 과제 리스트 렌더링
    const renderAssignments = () => {
        gradingTable.innerHTML = '';
        assignments.forEach((assignment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assignment.studentName}</td>
                <td>${assignment.title}</td>
                <td>${assignment.submissionDate}</td>
                <td>${assignment.grade ? 'Graded' : 'Pending'}</td>
            `;
            row.addEventListener('click', () => openGradingModal(index));
            gradingTable.appendChild(row);
        });
    };

    // 모달 열기
    const openGradingModal = (index) => {
        const assignment = assignments[index];
        assignmentContent.textContent = assignment.content;
        gradeInput.value = assignment.grade || '';
        feedbackInput.value = assignment.feedback || '';
        gradingForm.dataset.index = index; // 인덱스를 저장하여 업데이트에 사용
        gradingModal.style.display = 'block';
    };

    // 모달 닫기
    closeModal.addEventListener('click', () => {
        gradingModal.style.display = 'none';
    });

    // 채점 저장
    gradingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = gradingForm.dataset.index;
        const grade = gradeInput.value;
        const feedback = feedbackInput.value;

        // 데이터 업데이트
        assignments[index].grade = grade;
        assignments[index].feedback = feedback;

        // 모달 닫기 및 리스트 업데이트
        gradingModal.style.display = 'none';
        renderAssignments();
        alert('Grade and feedback saved successfully!');
    });

    // 초기 렌더링
    renderAssignments();
});
