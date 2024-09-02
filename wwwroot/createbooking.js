document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createBookingForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const bookingData = {
            facilityDescription: document.getElementById('facilityDescription').value,
            bookingDateFrom: document.getElementById('bookingDateFrom').value,
            bookingDateTo: document.getElementById('bookingDateTo').value,
            bookingStatus: document.getElementById('bookingStatus').value,
            bookedBy: '',  // Assuming this is set by the server based on the logged-in user
        };

        const token = sessionStorage.getItem('authToken');

        fetch("https://localhost:7194/api/Booking", {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create booking. Status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                alert('Booking created successfully!');
                window.location.href = '/booking.html'; // Redirect to booking management page
            })
            .catch(error => {
                console.error('Error creating booking:', error);
                alert('Error creating booking. Please try again.');
            });
    });

    document.getElementById('backButton').addEventListener('click', function () {
        window.location.href = '/booking.html';
    });
});
