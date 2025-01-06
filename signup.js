document.addEventListener('DOMContentLoaded', async () => {
    const signupForm = document.getElementById('signup-form');
    const roleSelect = document.getElementById('role');
    const sectionSelect = document.getElementById('section');
    const registerMessage = document.getElementById('register-message');

    const fetchSections = async () => {
        try {
            const response = await fetch('/sections');
            const sections = await response.json();
            sectionSelect.innerHTML = sections.map(section => 
                `<option value="${section.Section_ID}">${section.Section_ID} - ${section.Last_Name}</option>`
            ).join('');
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'Student') {
            sectionSelect.style.display = 'block';
            fetchSections();
        } else {
            sectionSelect.style.display = 'none';
        }
    });

    // Trigger the change event to set the initial state
    roleSelect.dispatchEvent(new Event('change'));

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(signupForm);
        const data = {
            role: formData.get('role'),
            username: formData.get('username'),
            password: formData.get('password'),
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            section: formData.get('section')
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                registerMessage.style.color = 'green';
                registerMessage.textContent = responseData.message;
                setTimeout(() => {
                    document.getElementById('signup-popup').style.display = 'none';
                }, 2000);
            } else {
                registerMessage.style.color = 'red';
                registerMessage.textContent = responseData.message || 'Registration failed';
            }
        } catch (error) {
            console.error('Error:', error);
            registerMessage.style.color = 'red';
            registerMessage.textContent = 'Registration failed: ' + error.message;
        }
    });
});