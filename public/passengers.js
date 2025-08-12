document.addEventListener('DOMContentLoaded', () => {
    const passengersContainer = document.getElementById('passengers-container');
    const addPassengerForm = document.getElementById('add-passenger-form');
    const firstPageButton = document.getElementById('first-page');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const lastPageButton = document.getElementById('last-page');
    const pageInfo = document.getElementById('page-info');

    // New login form elements
    const loginFormContainer = document.getElementById('login-form-container');
    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');

    const API_URL = 'http://localhost:3000/api/persones';
    let currentPage = 1;
    let totalPages = 1;
    const limit = 20;

    const fetchPassengers = async (page) => {
        try {
            const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const result = await response.json();
            renderPassengers(result.data);
            updatePaginationControls(result.total, result.page, result.limit);
        } catch (error) {
            console.error('No s\'han pogut obtenir els passatgers:', error);
        }
    };

    const renderPassengers = (passengers) => {
        passengersContainer.innerHTML = '';
        passengers.forEach(passenger => {
            const passengerCard = `
                <div class="bg-secondary p-4 rounded-lg shadow-lg">
                    <h3 class="text-xl font-bold text-accent">${passenger.name}</h3>
                    <p class="text-light">Edat: ${passenger.age}</p>
                </div>
            `;
            passengersContainer.innerHTML += passengerCard;
        });
    };

    const updatePaginationControls = (total, page, limit) => {
        totalPages = Math.ceil(total / limit);
        pageInfo.textContent = `Pàgina ${page} de ${totalPages}`;

        firstPageButton.disabled = page <= 1;
        prevPageButton.disabled = page <= 1;
        nextPageButton.disabled = page >= totalPages;
        lastPageButton.disabled = page >= totalPages;
    };

    firstPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage = 1;
            fetchPassengers(currentPage);
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPassengers(currentPage);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPassengers(currentPage);
        }
    });

    lastPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage = totalPages;
            fetchPassengers(currentPage);
        }
    });

    // Store passenger data temporarily for re-submission after login
    let pendingPassengerData = null;

    addPassengerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('jwtToken');
        const nameInput = document.getElementById('name');
        const ageInput = document.getElementById('age');

        const newPassenger = {
            name: nameInput.value,
            age: parseInt(ageInput.value)
        };

        if (!token) {
            // If no token, show login form and store pending passenger data
            loginFormContainer.classList.remove('hidden');
            pendingPassengerData = newPassenger;
            return;
        }

        // If token exists, proceed to add passenger
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newPassenger),
            });

            if (!response.ok) {
                // If 401 or 403, token might be invalid/expired, prompt for login
                if (response.status === 401 || response.status === 403) {
                    alert('Your session has expired or is invalid. Please log in again.');
                    localStorage.removeItem('jwtToken'); // Clear invalid token
                    loginFormContainer.classList.remove('hidden');
                    pendingPassengerData = newPassenger; // Store for re-submission
                    return;
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }

            nameInput.value = '';
            ageInput.value = '';
            pendingPassengerData = null; // Clear pending data on success

            fetchPassengers();

        } catch (error) {
            console.error('Error en afegir el passatger:', error);
            alert('Error adding passenger: ' + error.message);
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

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
                loginFormContainer.classList.add('hidden'); // Hide login form

                // If there was pending passenger data, re-submit it
                if (pendingPassengerData) {
                    // Temporarily set input values to re-trigger addPassengerForm
                    document.getElementById('name').value = pendingPassengerData.name;
                    document.getElementById('age').value = pendingPassengerData.age;
                    addPassengerForm.requestSubmit(); // Programmatically submit the form
                }

            } else {
                alert(`Login failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    });

    fetchPassengers(currentPage);
});
