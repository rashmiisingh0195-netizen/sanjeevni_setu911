/* =========================================
   SANJEEVANI SETU — DASHBOARD
   ========================================= */

"use strict";

/* =========================================
   CONFIGURATION
   ========================================= */

const API_BASE_URL = "http://localhost:3000";


/* =========================================
   DOM HELPERS
   ========================================= */

const $ = (selector) => document.querySelector(selector);


/* =========================================
   DOM ELEMENTS
   ========================================= */

const sidebar = $("#sidebar");
const menuBtn = $("#menuBtn");
const sidebarOverlay = $("#sidebarOverlay");

const doctorGrid = $("#doctorGrid");
const refreshDoctors = $("#refreshDoctors");

const assessmentTable = $("#assessmentTable");

const totalAssessments = $("#totalAssessments");
const lowRisk = $("#lowRisk");
const mediumRisk = $("#mediumRisk");
const highRisk = $("#highRisk");

const logoutBtn = $("#logoutBtn");


/* =========================================
   HTML SECURITY
   ========================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   API HELPER
   ========================================= */

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status} ${response.statusText}`
        );
    }

    const contentType =
        response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error("Server did not return JSON.");
    }

    return response.json();
}


/* =========================================
   MOBILE SIDEBAR
   ========================================= */

function openSidebar() {
    if (!sidebar || !sidebarOverlay) {
        return;
    }

    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");

    if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "true");
    }

    sidebarOverlay.setAttribute("aria-hidden", "false");
}


function closeSidebar() {
    if (!sidebar || !sidebarOverlay) {
        return;
    }

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");

    if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");
    }

    sidebarOverlay.setAttribute("aria-hidden", "true");
}


if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        const isOpen = sidebar?.classList.contains("open");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}


if (sidebarOverlay) {
    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );
}


/* Close sidebar with Escape */
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSidebar();
    }
});


/* Close sidebar after navigation */
document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 760) {
            closeSidebar();
        }
    });
});


/* =========================================
   LOAD DOCTORS
   ========================================= */

async function loadDoctors() {
    if (!doctorGrid) {
        console.error("Doctor grid element not found.");
        return;
    }

    doctorGrid.innerHTML = `
        <div class="loading-card">
            <div class="loader" aria-hidden="true"></div>
            <p>Loading doctors...</p>
        </div>
    `;

    try {
        const data = await apiRequest("/api/doctors");

        /*
         * Supports either:
         * [doctor, doctor, ...]
         *
         * or:
         * { doctors: [...] }
         */
        const doctors = Array.isArray(data)
            ? data
            : Array.isArray(data?.doctors)
                ? data.doctors
                : [];

        displayDoctors(doctors);
    } catch (error) {
        console.error("Doctor API error:", error);

        doctorGrid.innerHTML = `
            <div class="loading-card">
                <p>Unable to load doctors.</p>
                <small>
                    Make sure the Sanjeevani Setu API
                    is running on port 3000.
                </small>
            </div>
        `;
    }
}


/* =========================================
   CHECK DOCTOR AVAILABILITY
   ========================================= */

function isDoctorAvailable(doctor) {
    const value = doctor?.available;

    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ||
        String(value).toLowerCase() === "yes"
    );
}


/* =========================================
   DISPLAY DOCTORS
   ========================================= */

function displayDoctors(doctors) {
    if (!doctorGrid) {
        return;
    }

    if (!Array.isArray(doctors) || doctors.length === 0) {
        doctorGrid.innerHTML = `
            <div class="loading-card">
                <p>No doctors available right now.</p>
            </div>
        `;

        return;
    }

    doctorGrid.innerHTML = doctors
        .map((doctor) => {
            const name =
                doctor?.name || "Doctor";

            const specialty =
                doctor?.specialty ||
                "Healthcare Provider";

            const location =
                doctor?.location ||
                "Location unavailable";

            const phone =
                doctor?.phone || "";

            const available =
                isDoctorAvailable(doctor);

            const safeName =
                escapeHTML(name);

            const safeSpecialty =
                escapeHTML(specialty);

            const safeLocation =
                escapeHTML(location);

            const safePhone =
                escapeHTML(phone);

            return `
                <article class="doctor-card">

                    <div class="doctor-top">

                        <div
                            class="doctor-avatar"
                            aria-hidden="true"
                        >
                            👨‍⚕️
                        </div>

                        <div>
                            <div class="doctor-name">
                                ${safeName}
                            </div>

                            <div class="doctor-specialty">
                                ${safeSpecialty}
                            </div>
                        </div>

                        ${
                            available
                                ? `
                                    <div class="available">
                                        <span
                                            class="available-dot"
                                            aria-hidden="true"
                                        ></span>
                                        Available
                                    </div>
                                `
                                : ""
                        }

                    </div>


                    <div class="doctor-details">

                        <div class="doctor-detail">
                            <span aria-hidden="true">📍</span>

                            <span>
                                ${safeLocation}
                            </span>
                        </div>


                        <div class="doctor-detail">
                            <span aria-hidden="true">☎</span>

                            <span>
                                ${safePhone || "Phone unavailable"}
                            </span>
                        </div>

                    </div>


                    ${
                        phone
                            ? `
                                <a
                                    class="call-btn"
                                    href="tel:${encodeURIComponent(
                                        String(phone)
                                    )}"
                                >
                                    Call Doctor
                                </a>
                            `
                            : ""
                    }

                </article>
            `;
        })
        .join("");
}


/* =========================================
   LOAD ASSESSMENTS
   ========================================= */

async function loadAssessments() {
    if (!assessmentTable) {
        console.error(
            "Assessment table element not found."
        );

        return;
    }

    try {
        const data =
            await apiRequest("/api/assessments");

        /*
         * Supports either:
         *
         * [...]
         *
         * or:
         *
         * { assessments: [...] }
         */
        const assessments =
            Array.isArray(data)
                ? data
                : Array.isArray(data?.assessments)
                    ? data.assessments
                    : [];

        displayAssessments(assessments);
        updateSummary(assessments);

    } catch (error) {
        console.warn(
            "Assessment history unavailable:",
            error.message
        );

        displayAssessments([]);
        updateSummary([]);
    }
}


/* =========================================
   GET RISK LEVEL
   ========================================= */

function getRiskLevel(assessment) {
    const value =
        assessment?.risk_level ??
        assessment?.riskLevel ??
        assessment?.risk ??
        "";

    return String(value)
        .trim()
        .toLowerCase();
}


/* =========================================
   GET SYMPTOMS
   ========================================= */

function getSymptoms(assessment) {
    const symptoms =
        assessment?.symptoms;

    if (Array.isArray(symptoms)) {
        return symptoms.join(", ");
    }

    if (
        typeof symptoms === "string" &&
        symptoms.trim() !== ""
    ) {
        return symptoms;
    }

    return "—";
}


/* =========================================
   DISPLAY ASSESSMENTS
   ========================================= */

function displayAssessments(assessments) {
    if (!assessmentTable) {
        return;
    }

    if (
        !Array.isArray(assessments) ||
        assessments.length === 0
    ) {
        assessmentTable.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="empty-state"
                >
                    No assessment history available.
                </td>
            </tr>
        `;

        return;
    }


    assessmentTable.innerHTML =
        assessments
            .slice(0, 10)
            .map((assessment, index) => {

                const risk =
                    getRiskLevel(assessment);

                /*
                 * Only allow known CSS classes.
                 * This prevents arbitrary values
                 * from becoming class names.
                 */
                const validRiskClasses = [
                    "low",
                    "medium",
                    "high"
                ];

                const safeRiskClass =
                    validRiskClasses.includes(risk)
                        ? risk
                        : "";


                const riskLabel =
                    risk
                        ? risk.charAt(0).toUpperCase() +
                          risk.slice(1)
                        : "Unknown";


                const symptoms =
                    getSymptoms(assessment);


                const ageGroup =
                    assessment?.age_group ??
                    assessment?.ageGroup ??
                    "—";


                const region =
                    assessment?.region ??
                    "—";


                const id =
                    assessment?.id ??
                    index + 1;


                return `
                    <tr>

                        <td>
                            Assessment #${escapeHTML(id)}
                        </td>

                        <td>
                            ${escapeHTML(symptoms)}
                        </td>

                        <td>
                            ${escapeHTML(ageGroup)}
                        </td>

                        <td>
                            ${
                                safeRiskClass
                                    ? `
                                        <span
                                            class="risk-badge risk-${safeRiskClass}"
                                        >
                                            ${escapeHTML(
                                                riskLabel
                                            )}
                                        </span>
                                    `
                                    : `
                                        <span class="risk-badge">
                                            ${escapeHTML(
                                                riskLabel
                                            )}
                                        </span>
                                    `
                            }
                        </td>

                        <td>
                            ${escapeHTML(region)}
                        </td>

                    </tr>
                `;
            })
            .join("");
}


/* =========================================
   UPDATE SUMMARY
   ========================================= */

function updateSummary(assessments) {
    if (!Array.isArray(assessments)) {
        return;
    }

    let low = 0;
    let medium = 0;
    let high = 0;


    assessments.forEach((assessment) => {
        const risk =
            getRiskLevel(assessment);

        switch (risk) {
            case "low":
                low++;
                break;

            case "medium":
                medium++;
                break;

            case "high":
                high++;
                break;

            default:
                break;
        }
    });


    if (totalAssessments) {
        totalAssessments.textContent =
            String(assessments.length);
    }

    if (lowRisk) {
        lowRisk.textContent =
            String(low);
    }

    if (mediumRisk) {
        mediumRisk.textContent =
            String(medium);
    }

    if (highRisk) {
        highRisk.textContent =
            String(high);
    }
}


/* =========================================
   REFRESH DOCTORS
   ========================================= */

if (refreshDoctors) {
    refreshDoctors.addEventListener(
        "click",
        async () => {
            refreshDoctors.disabled = true;

            try {
                await loadDoctors();
            } finally {
                refreshDoctors.disabled = false;
            }
        }
    );
}


/* =========================================
   LOGOUT
   ========================================= */

if (logoutBtn) {
    logoutBtn.addEventListener(
        "click",
        () => {
            window.location.href = "index.html";
        }
    );
}


/* =========================================
   WINDOW RESIZE
   ========================================= */

window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
        closeSidebar();
    }
});


/* =========================================
   INITIALIZE DASHBOARD
   ========================================= */

async function initializeDashboard() {
    /*
     * dashboard.js is loaded with "defer",
     * so the HTML is already parsed here.
     */

    await Promise.allSettled([
        loadDoctors(),
        loadAssessments()
    ]);
}


initializeDashboard();
