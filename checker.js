/* =========================================================================
   SANJEEVANI SETU — SYMPTOM RISK ENGINE
   -------------------------------------------------------------------------
   This is a RULE-BASED system, not a machine learning model. That is a
   deliberate choice for a first version: it is 100% explainable (you can
   point at the exact line that produced a result — important for a health
   tool and for judges), and it needs no training data to start working.
   A real ML model trained on regional health data is the natural v2 upgrade
   — see the note at the bottom of this file.
   ========================================================================= */

// STEP 1: Assign a "weight" to each symptom — how much it should push
// someone toward a higher risk level. Think of this as each symptom
// casting a vote, with some votes worth more than others.
const SYMPTOM_WEIGHTS = {
  fever_mild: 1,
  fever_high: 3,
  cough: 1,
  breathlessness: 4,
  chest_pain: 4,
  body_ache: 1,
  headache_severe: 2,
  vomiting: 2,
  diarrhea: 2,
  blood_in_stool_vomit: 5,
  fainting: 4,
  rash: 1,
};

// STEP 2: Some combinations are dangerous together even if no single
// symptom looks extreme on its own. These are "red flag" combinations —
// if ANY of these match, we skip straight to HIGH risk, no matter the
// score. This mirrors how real triage checklists work.
const RED_FLAG_COMBINATIONS = [
  ["breathlessness", "chest_pain"],
  ["fever_high", "fainting"],
  ["blood_in_stool_vomit"], // serious on its own — single-item "combination"
];

// STEP 3: Certain age groups carry extra risk for the same symptoms
// (a fever behaves very differently in a newborn vs. a healthy adult).
const AGE_GROUP_MULTIPLIER = {
  adult: 1,
  child: 1.5,
  elderly: 1.4,
  pregnant: 1.4,
};

// STEP 4: Turn a numeric score into a risk level using thresholds.
// These thresholds are the kind of thing a real deployment would tune
// using data from doctors — for a hackathon demo, reasonable estimates
// are enough, as long as you can explain the reasoning to judges.
function scoreToLevel(score) {
  if (score >= 7) return "high";
  if (score >= 3) return "medium";
  return "low";
}

// STEP 5: Human-readable guidance for each risk level.
const RESULT_TEXT = {
  low: {
    badge: "Low risk",
    message: "Your symptoms look mild. This is often something your body can handle with rest and fluids.",
    action: "Monitor at home for 48 hours. Seek care if symptoms worsen or new ones appear.",
  },
  medium: {
    badge: "Medium risk",
    message: "Your symptoms are worth having checked, though this does not look like an emergency.",
    action: "Visit your nearest clinic or PHC within the next 2 days.",
  },
  high: {
    badge: "High risk",
    message: "Your symptoms include warning signs that need prompt medical attention.",
    action: "Seek medical care today — go to the nearest hospital or emergency service now.",
  },
};

// STEP 6: The main function — takes the user's selections and returns
// a risk level. Keeping this as one pure function (same input always
// gives the same output, no hidden side effects) makes it easy to test
// and easy to explain line-by-line to judges.
function assessRisk(selectedSymptoms, ageGroup) {
  // 6a. Check red-flag combinations first — these override everything else.
  const hasRedFlag = RED_FLAG_COMBINATIONS.some((combo) =>
    combo.every((symptom) => selectedSymptoms.includes(symptom))
  );
  if (hasRedFlag) return "high";

  // 6b. Otherwise, add up the weights of every symptom the user selected.
  let score = selectedSymptoms.reduce((total, symptom) => {
    return total + (SYMPTOM_WEIGHTS[symptom] || 0);
  }, 0);

  // 6c. Adjust the score for age-group vulnerability.
  const multiplier = AGE_GROUP_MULTIPLIER[ageGroup] || 1;
  score = score * multiplier;

  // 6d. Convert the final score into a level a person can act on.
  return scoreToLevel(score);
}

// STEP 7: Wire the logic up to the HTML form.
const form = document.getElementById("checkerForm");
const resultSection = document.getElementById("result");
const resultBadge = document.getElementById("resultBadge");
const resultMessage = document.getElementById("resultMessage");
const resultAction = document.getElementById("resultAction");
const startOverBtn = document.getElementById("startOver");

// The backend server from the /server folder. If it isn't running, the
// symptom checker itself still works fully — only saving results and
// booking doctors need it. See the try/catch blocks below.
const API_BASE_URL = "http://localhost:3000";

form.addEventListener("submit", async (event) => {
  // Stop the browser from doing its default "reload the page" behaviour.
  event.preventDefault();

  // Collect every checked symptom checkbox into a plain array of strings,
  // e.g. ["fever_high", "cough"].
  const checkedBoxes = form.querySelectorAll('input[name="symptom"]:checked');
  const selectedSymptoms = Array.from(checkedBoxes).map((box) => box.value);

  const ageGroup = document.getElementById("ageGroup").value;

  const level = assessRisk(selectedSymptoms, ageGroup);
  const text = RESULT_TEXT[level];

  // Fill in and reveal the result card.
  resultBadge.textContent = text.badge;
  resultMessage.textContent = text.message;
  resultAction.textContent = text.action;
  resultSection.dataset.level = level;
  resultSection.hidden = false;

  // Scroll the result into view — helpful on mobile where the form is tall.
  resultSection.scrollIntoView({ behavior: "smooth", block: "center" });

  // Save this assessment to the database. This is "fire and forget" —
  // we don't block showing the result on it, since a patient shouldn't
  // wait on a network call just to see their own risk level.
  saveAssessment(selectedSymptoms, ageGroup, level);

  // For medium/high risk, offer real doctors to book with.
  if (level === "medium" || level === "high") {
    showBookingOptions(level);
  } else {
    document.getElementById("booking").hidden = true;
  }
});

startOverBtn.addEventListener("click", () => {
  form.reset();
  resultSection.hidden = true;
  document.getElementById("booking").hidden = true;
  form.scrollIntoView({ behavior: "smooth" });
});

// STEP 8: Send the assessment to the backend so it's stored in the
// database — this is the data the outbreak-map feature would later
// aggregate by region.
async function saveAssessment(symptoms, ageGroup, riskLevel) {
  try {
    await fetch(`${API_BASE_URL}/api/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms, ageGroup, riskLevel, region: "demo-region" }),
    });
  } catch (error) {
    // If the backend isn't running, log it quietly rather than breaking
    // the symptom checker experience for the user.
    console.warn("Could not save assessment — is the backend server running?", error);
  }
}

// STEP 9: Fetch available doctors from the backend and render them as
// selectable cards.
const bookingSection = document.getElementById("booking");
const doctorList = document.getElementById("doctorList");
const bookingForm = document.getElementById("bookingForm");
const bookingWithLabel = document.getElementById("bookingWithLabel");
const selectedDoctorIdInput = document.getElementById("selectedDoctorId");
const bookingConfirmation = document.getElementById("bookingConfirmation");

async function showBookingOptions(riskLevel) {
  bookingSection.hidden = false;
  bookingForm.hidden = true;
  bookingConfirmation.hidden = true;
  doctorList.innerHTML = "Loading doctors…";

  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors`);
    const doctors = await response.json();

    if (doctors.length === 0) {
      doctorList.textContent = "No doctors available right now — please try the nearest clinic directly.";
      return;
    }

    // Build one card per doctor. Using createElement + textContent (rather
    // than inserting raw HTML strings) avoids injecting unescaped data
    // from the database into the page.
    doctorList.innerHTML = "";
    doctors.forEach((doctor) => {
      const card = document.createElement("div");
      card.className = "doctor-card";

      const info = document.createElement("div");
      info.className = "doctor-card-info";
      const name = document.createElement("strong");
      name.textContent = doctor.name;
      const detail = document.createElement("span");
      detail.textContent = `${doctor.specialty} — ${doctor.location}`;
      info.append(name, detail);

      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "btn btn-ghost";
      selectBtn.textContent = "Select";
      selectBtn.addEventListener("click", () => selectDoctor(doctor));

      card.append(info, selectBtn);
      doctorList.appendChild(card);
    });

    // Store the current risk level so it's included with the booking.
    bookingForm.dataset.riskLevel = riskLevel;
  } catch (error) {
    doctorList.textContent = "Couldn't load doctors — make sure the backend server is running (see server/README.md).";
    console.warn(error);
  }
}

function selectDoctor(doctor) {
  selectedDoctorIdInput.value = doctor.id;
  bookingWithLabel.textContent = `Booking with ${doctor.name} (${doctor.location})`;
  bookingForm.hidden = false;
  bookingConfirmation.hidden = true;
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    doctorId: Number(selectedDoctorIdInput.value),
    patientName: document.getElementById("patientName").value,
    patientPhone: document.getElementById("patientPhone").value,
    preferredTime: document.getElementById("preferredTime").value,
    riskLevel: bookingForm.dataset.riskLevel,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (response.ok) {
      bookingConfirmation.textContent = data.message;
      bookingConfirmation.hidden = false;
      bookingForm.hidden = true;
    } else {
      bookingConfirmation.textContent = data.error || "Something went wrong — please try again.";
      bookingConfirmation.hidden = false;
    }
  } catch (error) {
    bookingConfirmation.textContent = "Couldn't reach the server — make sure it's running.";
    bookingConfirmation.hidden = false;
    console.warn(error);
  }
});

/* -------------------------------------------------------------------------
   NEXT STEPS FOR A REAL DEPLOYMENT (good talking points for judges):
   1. Replace SYMPTOM_WEIGHTS with a model trained on real triage data,
      ideally validated by medical professionals.
   2. Log anonymised (selectedSymptoms, ageGroup, level, region) records to
      a database — this is exactly the data the "outbreak early-warning
      map" feature on the homepage would run on.
   3. Add a backend API (Node/Express) so this same logic can also answer
      SMS messages via a service like Twilio, for people without the app.
   ------------------------------------------------------------------------- */