/* =========================================================================
   DATABASE SETUP
   -------------------------------------------------------------------------
   We're using SQLite via the "better-sqlite3" library. Why SQLite for a
   hackathon project?
     - It's just a single file on disk (sanjeevani.db) — no separate
       database server to install, configure, or keep running.
     - "better-sqlite3" is synchronous, which makes the code below much
       easier to read than callback- or promise-based alternatives —
       important when your team has mixed experience levels.
     - When you're ready for production with many simultaneous users,
       you'd migrate to PostgreSQL — the SQL below would need only small
       changes, since the concepts (tables, rows, queries) are the same.
   ========================================================================= */

const Database = require("better-sqlite3");
const path = require("path");

// This creates (or opens, if it already exists) a file called
// sanjeevani.db in the same folder as this script.
const db = new Database(path.join(__dirname, "sanjeevani.db"));

// STEP 1: Define the shape of our data with SQL "CREATE TABLE" statements.
// "IF NOT EXISTS" means this is safe to run every time the server starts —
// it won't wipe existing data.
db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    available INTEGER NOT NULL DEFAULT 1  -- 1 = true, 0 = false (SQLite has no boolean type)
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symptoms TEXT NOT NULL,       -- stored as a JSON string, e.g. '["fever_high","cough"]'
    age_group TEXT NOT NULL,
    risk_level TEXT NOT NULL,     -- 'low' | 'medium' | 'high'
    region TEXT,                  -- for the future outbreak-map feature
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    risk_level TEXT,
    preferred_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested',  -- 'requested' | 'confirmed' | 'completed'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );
`);

// STEP 2: Seed a few sample doctors, but only if the table is currently
// empty — otherwise every server restart would keep duplicating them.
const doctorCount = db.prepare("SELECT COUNT(*) AS count FROM doctors").get();

if (doctorCount.count === 0) {
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialty, location, phone, available)
    VALUES (?, ?, ?, ?, ?)
  `);

  const sampleDoctors = [
    ["Dr. Anjali Verma", "General Physician", "Basantpur PHC", "9800000001", 1],
    ["Dr. Rohit Sharma", "Pediatrician", "Basantpur PHC", "9800000002", 1],
    ["Dr. Fatima Khan", "General Physician", "District Hospital, Ranchi", "9800000003", 1],
    ["Dr. Suresh Rao", "Cardiologist", "District Hospital, Ranchi", "9800000004", 0],
  ];

  // A transaction groups multiple inserts into one atomic operation —
  // either all rows are saved, or none are, if something fails midway.
  const insertMany = db.transaction((doctors) => {
    for (const doctor of doctors) insertDoctor.run(...doctor);
  });
  insertMany(sampleDoctors);

  console.log(`Seeded ${sampleDoctors.length} sample doctors.`);
}

// Export the db connection so server.js can run queries against it.
module.exports = db;
