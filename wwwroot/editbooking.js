document.addEventListener("DOMContentLoaded", function () {
    const bookingID = new URLSearchParams(window.location.search).get("bookingID");
    const token = sessionStorage.getItem("authToken");

    if (!bookingID) {
        console.error("No booking ID provided.");
        return;
    }

    // Fetch the booking details for the specified ID
    fetch(`https://localhost:7194/api/Booking/${bookingID}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(booking => {
            document.getElementById("facilityDescription").value = booking.facilityDescription;
            document.getElementById("bookingDateFrom").value = booking.bookingDateFrom;
            document.getElementById("bookingDateTo").value = booking.bookingDateTo;
            document.getElementById("bookingStatus").value = booking.bookingStatus;
        })
        .catch(error => console.error("Error fetching booking:", error));

    // Function to handle form submission
    document.getElementById("editBookingForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const updatedBooking = {
            facilityDescription: document.getElementById("facilityDescription").value,
            bookingDateFrom: document.getElementById("bookingDateFrom").value,
            bookingDateTo: document.getElementById("bookingDateTo").value,
            bookingStatus: document.getElementById("bookingStatus").value,
            bookedBy: '',
        };

        // Send the updated booking details to the API
        fetch(`https://localhost:7194/api/Booking/${bookingID}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedBooking)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to update booking.");
                }
                alert("Booking updated successfully!");
                window.location.href = "booking.html"; // Redirect back to booking page
            })
            .catch(error => console.error("Error updating booking:", error));
    });
    document.getElementById('backButton').addEventListener('click', function () {
        window.location.href = '/booking.html';
    });
});
