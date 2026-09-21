/* =========================================================================
   SANJEEVANI SETU — API SERVER
   -------------------------------------------------------------------------
   This is the "backend" — the part of the app that runs on a server
   (not in the user's browser), and is the only part allowed to talk
   directly to the database. The frontend (checker.js) sends requests
   here over HTTP, using fetch().

   To run this server:
     1. cd server
     2. npm install
     3. npm start
   Then it listens on http://localhost:3000
   ========================================================================= */

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

// STEP 1: Middleware — code that runs on every request before it reaches
// our routes below.
app.use(cors());          // Allows the frontend (opened as a local file, or
                           // a different port) to call this API without
                           // the browser blocking it for security reasons.
app.use(express.json());  // Lets us read JSON sent in a request body as
                           // req.body, instead of raw text.

/* -------------------------------------------------------------------------
   ROUTE: Save a symptom assessment
   Called by checker.js every time someone completes the symptom checker.
   This is also exactly the data your "outbreak early-warning map"
   feature would later read from, grouped by region and date.
   ------------------------------------------------------------------------- */
app.post("/api/assessments", (req, res) => {
  const { symptoms, ageGroup, riskLevel, region } = req.body;

  // Basic validation — never trust data coming from the client.
  if (!symptoms || !ageGroup || !riskLevel) {
    return res.status(400).json({ error: "symptoms, ageGroup, and riskLevel are required" });
  }

  const insert = db.prepare(`
    INSERT INTO assessments (symptoms, age_group, risk_level, region)
    VALUES (?, ?, ?, ?)
  `);
  const result = insert.run(JSON.stringify(symptoms), ageGroup, riskLevel, region || "unspecified");

  res.status(201).json({ id: result.lastInsertRowid, message: "Assessment saved" });
});

/* -------------------------------------------------------------------------
   ROUTE: List available doctors
   Called by checker.js to show real booking options for medium/high risk
   results. Supports an optional ?specialty= filter, e.g.
   /api/doctors?specialty=Pediatrician
   ------------------------------------------------------------------------- */
app.get("/api/doctors", (req, res) => {
  const { specialty } = req.query;

  let doctors;
  if (specialty) {
    doctors = db
      .prepare("SELECT * FROM doctors WHERE available = 1 AND specialty = ?")
      .all(specialty);
  } else {
    doctors = db.prepare("SELECT * FROM doctors WHERE available = 1").all();
  }

  res.json(doctors);
});

/* -------------------------------------------------------------------------
   ROUTE: Book an appointment
   Called when a patient picks a doctor and submits the booking form.
   ------------------------------------------------------------------------- */
app.post("/api/appointments", (req, res) => {
  const { doctorId, patientName, patientPhone, riskLevel, preferredTime } = req.body;

  if (!doctorId || !patientName || !patientPhone || !preferredTime) {
    return res.status(400).json({
      error: "doctorId, patientName, patientPhone, and preferredTime are required",
    });
  }

  // Confirm the doctor actually exists before booking against them.
  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: "No doctor found with that id" });
  }

  const insert = db.prepare(`
    INSERT INTO appointments (doctor_id, patient_name, patient_phone, risk_level, preferred_time)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = insert.run(doctorId, patientName, patientPhone, riskLevel || null, preferredTime);

  res.status(201).json({
    id: result.lastInsertRowid,
    message: `Appointment requested with ${doctor.name} at ${doctor.location}`,
  });
});

/* -------------------------------------------------------------------------
   ROUTE: Look up a patient's appointments by phone number
   A simple stand-in for patient login, good enough for a hackathon demo.
   ------------------------------------------------------------------------- */
app.get("/api/appointments/:phone", (req, res) => {
  const appointments = db
    .prepare(
      `SELECT appointments.*, doctors.name AS doctor_name, doctors.location
       FROM appointments
       JOIN doctors ON doctors.id = appointments.doctor_id
       WHERE patient_phone = ?
       ORDER BY created_at DESC`
    )
    .all(req.params.phone);

  res.json(appointments);
});

/* -------------------------------------------------------------------------
   ROUTE: Basic aggregate stats — the seed of the outbreak-map feature.
   Returns how many assessments of each risk level came from each region.
   ------------------------------------------------------------------------- */
app.get("/api/stats/regions", (req, res) => {
  const stats = db
    .prepare(
      `SELECT region, risk_level, COUNT(*) AS count
       FROM assessments
       GROUP BY region, risk_level`
    )
    .all();

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Sanjeevani Setu API running at http://localhost:${PORT}`);
});
