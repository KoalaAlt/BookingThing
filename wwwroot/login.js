document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const errorElement = document.getElementById('message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://localhost:7194/api/Authenticate/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Incorrect password or username');
                } else if (response.status >= 500) {
                    throw new Error('Server error, please try again later');
                } else {
                    throw new Error('Login failed');
                }
            }

            const data = await response.json();
            const token = data.token;

            sessionStorage.setItem('authToken', token);

            errorElement.textContent = '';
            window.location.href = '/booking.html';

        } catch (error) {
            errorElement.textContent = error.message;
        }
    });
});