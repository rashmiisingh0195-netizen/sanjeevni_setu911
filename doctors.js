/* =====================================================
   SANJEEVANI SETU — DOCTORS PAGE
   Frontend version
   ===================================================== */


/* =====================================================
   SAMPLE DOCTORS
   Later these will come from:
   GET http://localhost:3000/api/doctors
   ===================================================== */

const doctors = [
    {
        id: 1,
        name: "Dr. Anjali Verma",
        specialty: "General Physician",
        location: "Basantpur PHC",
        phone: "9800000001",
        available: true
    },

    {
        id: 2,
        name: "Dr. Rohit Sharma",
        specialty: "Pediatrician",
        location: "Basantpur PHC",
        phone: "9800000002",
        available: true
    },

    {
        id: 3,
        name: "Dr. Fatima Khan",
        specialty: "General Physician",
        location: "District Hospital, Ranchi",
        phone: "9800000003",
        available: true
    },

    {
        id: 4,
        name: "Dr. Suresh Rao",
        specialty: "Cardiologist",
        location: "District Hospital, Ranchi",
        phone: "9800000004",
        available: false
    },

    {
        id: 5,
        name: "Dr. Meera Singh",
        specialty: "Gynecologist",
        location: "District Hospital, Ranchi",
        phone: "9800000005",
        available: true
    },

    {
        id: 6,
        name: "Dr. Arjun Kumar",
        specialty: "Dermatologist",
        location: "Basantpur PHC",
        phone: "9800000006",
        available: true
    }
];


/* =====================================================
   GET HTML ELEMENTS
   ===================================================== */

const doctorGrid = document.getElementById("doctorGrid");

const noResults = document.getElementById("noResults");

const doctorCount = document.getElementById("doctorCount");

const searchInput = document.getElementById("searchInput");

const specialtyFilter =
    document.getElementById("specialtyFilter");

const locationFilter =
    document.getElementById("locationFilter");

const availabilityFilter =
    document.getElementById("availabilityFilter");

const clearFiltersBtn =
    document.getElementById("clearFiltersBtn");

const resetBtn =
    document.getElementById("resetBtn");

const menuBtn =
    document.getElementById("menuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");


/* =====================================================
   GET INITIALS
   ===================================================== */

function getInitials(name) {

    const cleanName = name
        .replace("Dr.", "")
        .trim();

    const words = cleanName.split(" ");

    if (words.length >= 2) {

        return (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();

    }

    return cleanName
        .substring(0, 2)
        .toUpperCase();
}


/* =====================================================
   CREATE DOCTOR CARD
   ===================================================== */

function createDoctorCard(doctor) {

    const card = document.createElement("article");

    card.className = "doctor-card";

    const availabilityClass =
        doctor.available
            ? "available"
            : "unavailable";

    const availabilityText =
        doctor.available
            ? "Available"
            : "Currently unavailable";

    card.innerHTML = `

        <div class="doctor-top">

            <div class="doctor-avatar">
                ${getInitials(doctor.name)}
            </div>

            <div class="doctor-info">

                <h3>
                    ${doctor.name}
                </h3>

                <div class="specialty">
                    ${doctor.specialty}
                </div>

            </div>

        </div>


        <div class="doctor-details">

            <div class="detail">

                <span class="detail-icon">📍</span>

                <span>
                    ${doctor.location}
                </span>

            </div>


            <div class="detail">

                <span class="detail-icon">📞</span>

                <span>
                    ${doctor.phone}
                </span>

            </div>


            <div>

                <span class="availability ${availabilityClass}">

                    <span class="status-dot"></span>

                    ${availabilityText}

                </span>

            </div>

        </div>


        <button
            class="book-btn"
            data-doctor-id="${doctor.id}"
            ${!doctor.available ? "disabled" : ""}
        >
            ${
                doctor.available
                    ? "Book Appointment"
                    : "Currently Unavailable"
            }
        </button>

    `;

    return card;
}


/* =====================================================
   DISPLAY DOCTORS
   ===================================================== */

function displayDoctors(list) {

    doctorGrid.innerHTML = "";

    doctorCount.textContent =
        `${list.length} doctor${list.length !== 1 ? "s" : ""}`;


    if (list.length === 0) {

        noResults.hidden = false;

        return;
    }


    noResults.hidden = true;


    list.forEach(doctor => {

        const card =
            createDoctorCard(doctor);

        doctorGrid.appendChild(card);

    });


    addBookingListeners();
}


/* =====================================================
   FILTER DOCTORS
   ===================================================== */

function filterDoctors() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    const specialty =
        specialtyFilter.value;

    const location =
        locationFilter.value;

    const availability =
        availabilityFilter.value;


    const filteredDoctors =
        doctors.filter(doctor => {

            const matchesSearch =
                doctor.name
                    .toLowerCase()
                    .includes(searchTerm)
                ||
                doctor.specialty
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesSpecialty =
                specialty === "all"
                ||
                doctor.specialty === specialty;


            const matchesLocation =
                location === "all"
                ||
                doctor.location === location;


            const matchesAvailability =
                availability === "all"
                ||
                (
                    availability === "available"
                    &&
                    doctor.available
                )
                ||
                (
                    availability === "unavailable"
                    &&
                    !doctor.available
                );


            return (
                matchesSearch
                &&
                matchesSpecialty
                &&
                matchesLocation
                &&
                matchesAvailability
            );

        });


    displayDoctors(filteredDoctors);
}


/* =====================================================
   CLEAR FILTERS
   ===================================================== */

function clearFilters() {

    searchInput.value = "";

    specialtyFilter.value = "all";

    locationFilter.value = "all";

    availabilityFilter.value = "all";

    displayDoctors(doctors);
}


/* =====================================================
   BOOK APPOINTMENT
   ===================================================== */

function addBookingListeners() {

    const buttons =
        document.querySelectorAll(".book-btn");


    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const doctorId =
                Number(button.dataset.doctorId);


            const doctor =
                doctors.find(
                    item => item.id === doctorId
                );


            if (!doctor) {
                return;
            }


            /*
             * FRONTEND ONLY FOR NOW
             *
             * Later this button will open:
             * appointment.html
             *
             * and send data to:
             * POST /api/appointments
             */

            sessionStorage.setItem(
                "selectedDoctor",
                JSON.stringify(doctor)
            );


            window.location.href =
                "appointment.html";

        });

    });

}


/* =====================================================
   MOBILE MENU
   ===================================================== */

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("show");

    });

}


/* =====================================================
   FILTER EVENT LISTENERS
   ===================================================== */

searchInput.addEventListener(
    "input",
    filterDoctors
);

specialtyFilter.addEventListener(
    "change",
    filterDoctors
);

locationFilter.addEventListener(
    "change",
    filterDoctors
);

availabilityFilter.addEventListener(
    "change",
    filterDoctors
);

clearFiltersBtn.addEventListener(
    "click",
    clearFilters
);

resetBtn.addEventListener(
    "click",
    clearFilters
);


/* =====================================================
   INITIAL DISPLAY
   ===================================================== */

displayDoctors(doctors);