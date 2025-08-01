document.addEventListener('DOMContentLoaded', () => {
    const passengersContainer = document.getElementById('passengers-container');
    const addPassengerForm = document.getElementById('add-passenger-form');
    const firstPageButton = document.getElementById('first-page');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const lastPageButton = document.getElementById('last-page');
    const pageInfo = document.getElementById('page-info');

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

    addPassengerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const ageInput = document.getElementById('age');

        const newPassenger = {
            name: nameInput.value,
            age: parseInt(ageInput.value)
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPassenger),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            nameInput.value = '';
            ageInput.value = '';

            fetchPassengers();

        } catch (error) {
            console.error('Error en afegir el passatger:', error);
        }
    });

    fetchPassengers(currentPage);
});
