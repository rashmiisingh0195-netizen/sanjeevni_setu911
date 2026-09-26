// language.js

const translations = {
    en: {
        appName: "Sanjeevani Setu",
        tagline: "A bridge to care, in your own language",

        chooseLanguage: "Choose your language",
        continue: "Continue",

        welcome: "Welcome to Sanjeevani Setu",
        healthHelp: "Healthcare help in simple language",

        myHealth: "I am not feeling well",
        findDoctor: "Find a Doctor",
        nearbyHospital: "Nearby Hospital",
        healthInfo: "Health Information",

        name: "Name",
        mobile: "Mobile Number",
        age: "Age",
        village: "Village / City",

        symptoms: "What problem are you facing?",
        fever: "Fever",
        cough: "Cough",
        breathingProblem: "Difficulty in breathing",
        bodyAche: "Body ache",
        headache: "Headache",
        vomiting: "Vomiting",
        diarrhea: "Diarrhea",

        submit: "Check My Symptoms",
        back: "Back",

        lowRisk: "Low Risk",
        mediumRisk: "Medium Risk",
        highRisk: "High Risk",

        lowMessage: "You can monitor your symptoms at home.",
        mediumMessage: "Please visit a nearby health centre or doctor.",
        highMessage: "Please seek medical care as soon as possible.",

        login: "Login",
        register: "Register"
    },

    hi: {
        appName: "संजीवनी सेतु",
        tagline: "आपकी अपनी भाषा में स्वास्थ्य सेवा",

        chooseLanguage: "अपनी भाषा चुनें",
        continue: "आगे बढ़ें",

        welcome: "संजीवनी सेतु में आपका स्वागत है",
        healthHelp: "आसान भाषा में स्वास्थ्य सहायता",

        myHealth: "मेरी तबीयत ठीक नहीं है",
        findDoctor: "डॉक्टर खोजें",
        nearbyHospital: "नजदीकी अस्पताल",
        healthInfo: "स्वास्थ्य जानकारी",

        name: "नाम",
        mobile: "मोबाइल नंबर",
        age: "उम्र",
        village: "गांव / शहर",

        symptoms: "आपको क्या परेशानी है?",
        fever: "बुखार",
        cough: "खांसी",
        breathingProblem: "सांस लेने में दिक्कत",
        bodyAche: "शरीर में दर्द",
        headache: "सिर दर्द",
        vomiting: "उल्टी",
        diarrhea: "दस्त",

        submit: "लक्षण जांचें",
        back: "वापस",

        lowRisk: "कम जोखिम",
        mediumRisk: "मध्यम जोखिम",
        highRisk: "ज्यादा जोखिम",

        lowMessage: "आप घर पर अपने लक्षणों पर नजर रख सकते हैं।",
        mediumMessage: "कृपया नजदीकी स्वास्थ्य केंद्र या डॉक्टर से मिलें।",
        highMessage: "कृपया जल्द से जल्द चिकित्सा सहायता लें।",

        login: "लॉगिन",
        register: "पंजीकरण"
    }
};


// Current selected language
let currentLanguage =
    localStorage.getItem("sanjeevaniLanguage") || "hi";


// Change language
function setLanguage(language) {
    if (!translations[language]) {
        return;
    }

    currentLanguage = language;

    localStorage.setItem(
        "sanjeevaniLanguage",
        language
    );

    applyLanguage();
}


// Get translated text
function t(key) {
    return translations[currentLanguage][key] || key;
}


// Apply translation to HTML
function applyLanguage() {

    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.getAttribute("data-i18n");

        if (translations[currentLanguage][key]) {
            element.textContent =
                translations[currentLanguage][key];
        }

    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {

        const key =
            element.getAttribute("data-i18n-placeholder");

        if (translations[currentLanguage][key]) {
            element.placeholder =
                translations[currentLanguage][key];
        }

    });
}


// Apply when page loads
document.addEventListener("DOMContentLoaded", () => {
    applyLanguage();
});