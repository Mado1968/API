document.addEventListener('DOMContentLoaded', () => {
    const passengersContainer = document.getElementById('passengers-container');
    const addPassengerForm = document.getElementById('add-passenger-form');

    const API_URL = 'http://localhost:3000/api/persones';

    const fetchPassengers = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const passengers = await response.json();
            renderPassengers(passengers);
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

    fetchPassengers();
});
