document.addEventListener("DOMContentLoaded", function () {
    const bookingsTableBody = document.getElementById('bookingsTable').querySelector('tbody');
    const historyTableBody = document.getElementById('historyTableBody');
    const createBookingButton = document.getElementById("createBookingButton");
    const logoutButton = document.getElementById("logoutButton");
    const searchInput = document.getElementById("searchInput");
    const sortBySelect = document.getElementById("sortBySelect");
    const searchButton = document.getElementById("searchButton");
    const historyButton = document.getElementById("historyButton");
    const historyDropdown = document.getElementById("historyDropdown");

    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        window.location.href = "login.html";
    });

    function fetchBookings(search = "", sortBy = "", descending = false) {
        const token = sessionStorage.getItem("authToken");

        let url = `https://localhost:7194/api/Booking?search=${search}&sortBy=${sortBy}&descending=${descending}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch bookings. Status: " + response.status);
                }
                return response.json();
            })
            .then(data => {
                displayBookings(data);
                displayCancelledBookings(data);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    function displayBookings(bookings) {
        bookingsTableBody.innerHTML = "";

        const filteredBookings = bookings.filter(booking => booking.bookingStatus !== "Cancelled");

        filteredBookings.forEach(booking => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.bookingID}</td>
                <td>${booking.facilityDescription}</td>
                <td>${booking.bookingDateFrom}</td>
                <td>${booking.bookingDateTo}</td>
                <td>${booking.bookingStatus}</td>
                <td>${booking.bookedBy}</td>
                <td><button class="edit-button" data-id="${booking.bookingID}">Edit</button></td>
                <td><button class="cancel-button" data-id="${booking.bookingID}">Cancel</button></td>
            `;

            row.querySelector('.edit-button').addEventListener('click', function () {
                window.location.href = `editbooking.html?bookingID=${booking.bookingID}`;
            });

            row.querySelector('.cancel-button').addEventListener('click', function () {
                window.location.href = `cancelbooking.html?bookingID=${booking.bookingID}`;
            });

            bookingsTableBody.appendChild(row);
        });
    }

    function displayCancelledBookings(bookings) {
        historyTableBody.innerHTML = "";

        const cancelledBookings = bookings.filter(booking => booking.bookingStatus === "Cancelled");

        cancelledBookings.forEach(booking => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.bookingID}</td>
                <td>${booking.facilityDescription}</td>
                <td>${booking.bookingDateFrom} - ${booking.bookingDateTo}</td>
                <td><button class="bringback-button" data-id="${booking.bookingID}">Bring Back</button></td>
                <td><button class="delete-permanent-button" data-id="${booking.bookingID}">Delete Permanently</button></td>
            `;

            row.querySelector('.bringback-button').addEventListener('click', function () {
                window.location.href = `bringbackbooking.html?bookingID=${booking.bookingID}`;
            });
            row.querySelector('.delete-permanent-button').addEventListener('click', function () {
                window.location.href = `deletebooking.html?bookingID=${booking.bookingID}`;
            });

            historyTableBody.appendChild(row);
        });
    }

    historyButton.addEventListener("click", function () {
        if (historyDropdown.style.display === "none" || historyDropdown.style.display === "") {
            historyDropdown.style.display = "block";
        } else {
            historyDropdown.style.display = "none";
        }
    });

    searchButton.addEventListener("click", function () {
        const searchValue = searchInput.value;
        const sortByValue = sortBySelect.value;
        fetchBookings(searchValue, sortByValue, false);
    });

    createBookingButton.addEventListener("click", function () {
        window.location.href = "createbooking.html";
    });

    fetchBookings();
});
