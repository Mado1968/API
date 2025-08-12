// public/login.js

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            alert('Login successful!');
            // Redirect to a protected page or update UI
            // window.location.href = '/protected.html'; 

            // Example of making an authenticated request
            const protectedResponse = await fetch('/api/protected', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });
            const protectedData = await protectedResponse.json();
            console.log('Protected data:', protectedData);

        } else {
            alert(`Login failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
    }
});
