document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingID = urlParams.get("bookingID");

    const token = sessionStorage.getItem("authToken");

    if (bookingID) {
        showDeleteConfirmationPopup(bookingID);
    } else {
        console.error('No booking ID provided.');
        alert('No booking ID provided.');
        window.location.href = '/booking.html'; // Redirect back to bookings page
    }

    function showDeleteConfirmationPopup(bookingID) {
        // Create popup elements
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        const popup = document.createElement('div');
        popup.className = 'popup';

        const message = document.createElement('p');
        message.textContent = 'Are you sure you want to bring back this booking?';

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Yes, Bring back';
        confirmButton.addEventListener('click', function () {
            bringbackBooking(bookingID);
            closePopup();
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', function () {
            closePopup();
        });

        popup.appendChild(message);
        popup.appendChild(confirmButton);
        popup.appendChild(cancelButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        function closePopup() {
            document.body.removeChild(overlay);
        }

        function bringbackBooking(bookingID) {
            fetch(`https://localhost:7194/api/Booking/Bringback/${bookingID}`, {
                method: "Patch",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to bring back booking.');
                    }
                    alert('Booking brought back successfully!');
                    window.location.href = '/booking.html'; // Redirect back to bookings page
                })
                .catch(error => {
                    console.error('Error deleting booking:', error);
                    alert('Error deleting booking. Please try again.');
                });
        }
    }
});
