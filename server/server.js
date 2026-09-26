/* =========================================================================
   SANJEEVANI SETU — API SERVER
   -------------------------------------------------------------------------
   Backend server for the Sanjeevani Setu application.

   To run:
   1. cd server
   2. npm install
   3. npm start

   Server:
   http://localhost:3000
   ========================================================================= */

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = 3000;


/* =========================================================================
   MIDDLEWARE
   ========================================================================= */

app.use(cors());

app.use(express.json());


/* =========================================================================
   ROUTE: Register a new user
   POST /api/register
   ========================================================================= */

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;

        // Basic validation
        if (!name || !password || (!email && !mobile)) {
            return res.status(400).json({
                message: "Name, password, and email or mobile are required"
            });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        // Clean input
        const cleanName = name.trim();
        const cleanEmail = email ? email.trim().toLowerCase() : null;
        const cleanMobile = mobile ? mobile.trim() : null;

        // Check whether email already exists
        if (cleanEmail) {
            const existingEmail = db
                .prepare("SELECT id FROM users WHERE email = ?")
                .get(cleanEmail);

            if (existingEmail) {
                return res.status(409).json({
                    message: "An account with this email already exists"
                });
            }
        }

        // Check whether mobile already exists
        if (cleanMobile) {
            const existingMobile = db
                .prepare("SELECT id FROM users WHERE mobile = ?")
                .get(cleanMobile);

            if (existingMobile) {
                return res.status(409).json({
                    message: "An account with this mobile number already exists"
                });
            }
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const insertUser = db.prepare(`
            INSERT INTO users (
                name,
                email,
                mobile,
                password
            )
            VALUES (?, ?, ?, ?)
        `);

        const result = insertUser.run(
            cleanName,
            cleanEmail,
            cleanMobile,
            hashedPassword
        );

        // Return safe user information
        res.status(201).json({
            message: "Account created successfully",

            user: {
                id: result.lastInsertRowid,
                name: cleanName,
                email: cleanEmail,
                mobile: cleanMobile
            }
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            message: "Unable to create account"
        });
    }
});


/* =========================================================================
   ROUTE: Login
   POST /api/login

   User can log in using:
   - Email
   OR
   - Mobile number
   ========================================================================= */

app.post("/api/login", async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        // Validation
        if (!emailOrMobile || !password) {
            return res.status(400).json({
                message: "Email/mobile and password are required"
            });
        }

        const loginValue = emailOrMobile.trim();

        // Find user by email OR mobile
        const user = db
            .prepare(`
                SELECT *
                FROM users
                WHERE email = ? OR mobile = ?
            `)
            .get(
                loginValue.toLowerCase(),
                loginValue
            );

        // User not found
        if (!user) {
            return res.status(401).json({
                message: "Invalid email/mobile or password"
            });
        }

        // Compare entered password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email/mobile or password"
            });
        }

        // Login successful
        res.status(200).json({
            message: "Login successful",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            message: "Unable to login"
        });
    }
});


/* =========================================================================
   ROUTE: Save a symptom assessment
   POST /api/assessments
   ========================================================================= */

app.post("/api/assessments", (req, res) => {

    const {
        symptoms,
        ageGroup,
        riskLevel,
        region
    } = req.body;


    // Basic validation
    if (!symptoms || !ageGroup || !riskLevel) {

        return res.status(400).json({
            error: "symptoms, ageGroup, and riskLevel are required"
        });
    }


    const insert = db.prepare(`
        INSERT INTO assessments (
            symptoms,
            age_group,
            risk_level,
            region
        )
        VALUES (?, ?, ?, ?)
    `);


    const result = insert.run(
        JSON.stringify(symptoms),
        ageGroup,
        riskLevel,
        region || "unspecified"
    );


    res.status(201).json({
        id: result.lastInsertRowid,
        message: "Assessment saved"
    });
});


/* =========================================================================
   ROUTE: List available doctors
   GET /api/doctors
   ========================================================================= */

app.get("/api/doctors", (req, res) => {

    const { specialty } = req.query;

    let doctors;


    if (specialty) {

        doctors = db
            .prepare(`
                SELECT *
                FROM doctors
                WHERE available = 1
                AND specialty = ?
            `)
            .all(specialty);

    } else {

        doctors = db
            .prepare(`
                SELECT *
                FROM doctors
                WHERE available = 1
            `)
            .all();
    }


    res.json(doctors);
});


/* =========================================================================
   ROUTE: Book an appointment
   POST /api/appointments
   ========================================================================= */

app.post("/api/appointments", (req, res) => {

    const {
        doctorId,
        patientName,
        patientPhone,
        riskLevel,
        preferredTime
    } = req.body;


    // Validation
    if (
        !doctorId ||
        !patientName ||
        !patientPhone ||
        !preferredTime
    ) {

        return res.status(400).json({
            error: "doctorId, patientName, patientPhone, and preferredTime are required"
        });
    }


    // Check doctor
    const doctor = db
        .prepare(`
            SELECT *
            FROM doctors
            WHERE id = ?
        `)
        .get(doctorId);


    if (!doctor) {

        return res.status(404).json({
            error: "No doctor found with that id"
        });
    }


    // Insert appointment
    const insert = db.prepare(`
        INSERT INTO appointments (
            doctor_id,
            patient_name,
            patient_phone,
            risk_level,
            preferred_time
        )
        VALUES (?, ?, ?, ?, ?)
    `);


    const result = insert.run(
        doctorId,
        patientName,
        patientPhone,
        riskLevel || null,
        preferredTime
    );


    res.status(201).json({

        id: result.lastInsertRowid,

        message:
            `Appointment requested with ${doctor.name} at ${doctor.location}`
    });
});


/* =========================================================================
   ROUTE: Look up appointments by phone number
   GET /api/appointments/:phone
   ========================================================================= */

app.get("/api/appointments/:phone", (req, res) => {

    const appointments = db
        .prepare(`
            SELECT
                appointments.*,
                doctors.name AS doctor_name,
                doctors.location
            FROM appointments

            JOIN doctors
            ON doctors.id = appointments.doctor_id

            WHERE patient_phone = ?

            ORDER BY created_at DESC
        `)
        .all(req.params.phone);


    res.json(appointments);
});


/* =========================================================================
   ROUTE: Regional risk statistics
   GET /api/stats/regions
   ========================================================================= */

app.get("/api/stats/regions", (req, res) => {

    const stats = db
        .prepare(`
            SELECT
                region,
                risk_level,
                COUNT(*) AS count

            FROM assessments

            GROUP BY
                region,
                risk_level
        `)
        .all();


    res.json(stats);
});


/* =========================================================================
   START SERVER
   ========================================================================= */

app.listen(PORT, () => {

    console.log(
        `Sanjeevani Setu API running at http://localhost:${PORT}`
    );

});