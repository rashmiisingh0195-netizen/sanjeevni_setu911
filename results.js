/* =========================================================
   SANJEEVANI SETU
   HEALTH ASSESSMENT RESULT PAGE
   FRONTEND VERSION
   ========================================================= */


/* ================= DEMO RESULT ================= */

/*
   This demo data is used only when results.html is opened
   directly without data from checker.html.

   Later, checker.js can send the actual result here.
*/

const demoResult = {
    riskLevel: "medium",
    score: 4,

    symptoms: [
        "Fever",
        "Cough",
        "Body Ache"
    ],

    summary:
        "Your symptoms may require attention. Consider consulting a healthcare professional.",

    recommendationTitle:
        "Visit a nearby healthcare professional",

    recommendationText:
        "Based on your assessment, consider visiting a nearby PHC or healthcare professional within the next 1–2 days for further evaluation."
};


/* ================= GET RESULT DATA ================= */

function getAssessmentResult() {

    /*
       First try to get the result saved by checker.js.
    */

    const savedResult =
        sessionStorage.getItem("sanjeevaniAssessment");

    if (savedResult) {

        try {

            return JSON.parse(savedResult);

        } catch (error) {

            console.error(
                "Unable to read assessment result:",
                error
            );

        }
    }


    /*
       If no result is available,
       use demo data.
    */

    return demoResult;
}


/* ================= FORMAT SYMPTOM NAME ================= */

function formatSymptomName(symptom) {

    if (!symptom) {
        return "";
    }

    /*
       Convert values such as:

       fever_high
       chest_pain
       body_ache

       into:

       Fever High
       Chest Pain
       Body Ache
    */

    return symptom
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


/* ================= DISPLAY SYMPTOMS ================= */

function displaySymptoms(symptoms) {

    const symptomsList =
        document.getElementById("symptomsList");


    if (!symptomsList) {
        return;
    }


    symptomsList.innerHTML = "";


    if (!symptoms || symptoms.length === 0) {

        const tag =
            document.createElement("span");

        tag.className = "symptom-tag";

        tag.textContent =
            "No symptoms selected";

        symptomsList.appendChild(tag);

        return;
    }


    symptoms.forEach(symptom => {

        const tag =
            document.createElement("span");

        tag.className = "symptom-tag";

        tag.textContent =
            formatSymptomName(symptom);

        symptomsList.appendChild(tag);

    });
}


/* ================= SET RISK INFORMATION ================= */

function setRiskInformation(result) {

    const riskCard =
        document.getElementById("riskCard");

    const riskIcon =
        document.getElementById("riskIcon");

    const riskLevel =
        document.getElementById("riskLevel");

    const riskSummary =
        document.getElementById("riskSummary");

    const riskScore =
        document.getElementById("riskScore");


    if (!riskCard) {
        return;
    }


    /*
       Normalize the risk level.

       Examples:

       "medium"
       "Medium"
       "MEDIUM RISK"
    */

    const risk =
        String(result.riskLevel || "medium")
            .toLowerCase()
            .replace(" risk", "")
            .trim();


    /*
       Remove previous risk classes.
    */

    riskCard.classList.remove(
        "risk-low",
        "risk-medium",
        "risk-high"
    );


    /*
       LOW RISK
    */

    if (risk === "low") {

        riskCard.classList.add("risk-low");

        riskIcon.textContent = "✓";

        riskLevel.textContent =
            "Low Risk";

        riskSummary.textContent =
            result.summary ||
            "Your symptoms appear to be low risk based on the current assessment.";

        riskScore.textContent =
            result.score ?? "0";
    }


    /*
       HIGH RISK
    */

    else if (risk === "high") {

        riskCard.classList.add("risk-high");

        riskIcon.textContent = "!";

        riskLevel.textContent =
            "High Risk";

        riskSummary.textContent =
            result.summary ||
            "Your symptoms may require prompt medical attention.";

        riskScore.textContent =
            result.score ?? "0";
    }


    /*
       MEDIUM RISK
    */

    else {

        riskCard.classList.add("risk-medium");

        riskIcon.textContent = "!";

        riskLevel.textContent =
            "Medium Risk";

        riskSummary.textContent =
            result.summary ||
            "Your symptoms may require attention.";

        riskScore.textContent =
            result.score ?? "0";
    }
}


/* ================= SET RECOMMENDATION ================= */

function setRecommendation(result) {

    const title =
        document.getElementById(
            "recommendationTitle"
        );

    const text =
        document.getElementById(
            "recommendationText"
        );


    if (!title || !text) {
        return;
    }


    const risk =
        String(result.riskLevel || "medium")
            .toLowerCase()
            .replace(" risk", "")
            .trim();


    /*
       If checker.js already provides
       recommendation text, use it.
    */

    if (result.recommendationTitle) {

        title.textContent =
            result.recommendationTitle;

    }

    else {

        if (risk === "low") {

            title.textContent =
                "Monitor your symptoms";

        }

        else if (risk === "high") {

            title.textContent =
                "Seek medical care today";

        }

        else {

            title.textContent =
                "Consult a healthcare professional";

        }

    }


    if (result.recommendationText) {

        text.textContent =
            result.recommendationText;

    }

    else {

        if (risk === "low") {

            text.textContent =
                "Continue monitoring your symptoms. If they become worse, seek advice from a healthcare professional.";

        }

        else if (risk === "high") {

            text.textContent =
                "Your assessment indicates that you should seek medical attention promptly. If symptoms are severe or worsening, seek emergency care.";

        }

        else {

            text.textContent =
                "Consider visiting a nearby PHC or healthcare professional within the next 1–2 days for further evaluation.";

        }

    }
}


/* ================= EMERGENCY SECTION ================= */

function updateEmergencySection(result) {

    const emergencyCard =
        document.getElementById(
            "emergencyCard"
        );


    if (!emergencyCard) {
        return;
    }


    const risk =
        String(result.riskLevel || "medium")
            .toLowerCase()
            .replace(" risk", "")
            .trim();


    /*
       Keep emergency guidance visible for
       every user, but make the message more
       important for high-risk assessments.
    */

    if (risk === "high") {

        emergencyCard.style.background =
            "#fff1ef";

        emergencyCard.style.borderColor =
            "#f2c9c4";
    }
}


/* ================= MOBILE MENU ================= */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuBtn"
        );

    const navLinks =
        document.getElementById(
            "navLinks"
        );


    if (!menuButton || !navLinks) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "active"
            );

        }
    );


    /*
       Close menu after clicking a link.
    */

    const links =
        navLinks.querySelectorAll("a");


    links.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.classList.remove(
                    "active"
                );

            }
        );

    });
}


/* ================= SAVE TO SESSION ================= */

function saveResultForDashboard(result) {

    /*
       Save the latest assessment so that
       dashboard.html can use it later.

       No backend connection yet.
    */

    try {

        sessionStorage.setItem(
            "latestAssessment",
            JSON.stringify(result)
        );

    } catch (error) {

        console.error(
            "Could not save assessment:",
            error
        );

    }
}


/* ================= PAGE INITIALIZATION ================= */

function initializeResultsPage() {

    const result =
        getAssessmentResult();


    console.log(
        "Assessment result:",
        result
    );


    displaySymptoms(
        result.symptoms
    );


    setRiskInformation(
        result
    );


    setRecommendation(
        result
    );


    updateEmergencySection(
        result
    );


    saveResultForDashboard(
        result
    );


    setupMobileMenu();
}


/* ================= RUN ================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeResultsPage
);