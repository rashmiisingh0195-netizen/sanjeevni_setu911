/* =====================================================
   SANJEEVANI SETU — ACCOUNT REGISTRATION
   ===================================================== */

const API_URL = "http://localhost:3000";


/* =====================================================
   GET ELEMENTS
   ===================================================== */

const registerForm =
    document.getElementById("registerForm");

const fullName =
    document.getElementById("fullName");

const email =
    document.getElementById("email");

const mobile =
    document.getElementById("mobile");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const terms =
    document.getElementById("terms");

const registerBtn =
    document.getElementById("registerBtn");

const buttonText =
    document.getElementById("buttonText");

const loadingSpinner =
    document.getElementById("loadingSpinner");

const formMessage =
    document.getElementById("formMessage");


/* Password strength */

const strength1 =
    document.getElementById("strength1");

const strength2 =
    document.getElementById("strength2");

const strength3 =
    document.getElementById("strength3");

const strength4 =
    document.getElementById("strength4");

const strengthText =
    document.getElementById("strengthText");


/* =====================================================
   ERROR ELEMENTS
   ===================================================== */

const nameError =
    document.getElementById("nameError");

const emailError =
    document.getElementById("emailError");

const mobileError =
    document.getElementById("mobileError");

const passwordError =
    document.getElementById("passwordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");

const termsError =
    document.getElementById("termsError");


/* =====================================================
   HELPER — SHOW FIELD ERROR
   ===================================================== */

function showFieldError(input, errorElement, message) {

    if (input) {
        const box =
            input.closest(".input-box");

        if (box) {
            box.classList.add("error");
        }
    }

    if (errorElement) {
        errorElement.textContent = message;
    }
}


/* =====================================================
   HELPER — CLEAR FIELD ERROR
   ===================================================== */

function clearFieldError(input, errorElement) {

    if (input) {
        const box =
            input.closest(".input-box");

        if (box) {
            box.classList.remove("error");
        }
    }

    if (errorElement) {
        errorElement.textContent = "";
    }
}


/* =====================================================
   HELPER — SHOW FORM MESSAGE
   ===================================================== */

function showFormMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className =
        `form-message show ${type}`;
}


/* =====================================================
   HELPER — CLEAR FORM MESSAGE
   ===================================================== */

function clearFormMessage() {

    formMessage.textContent = "";

    formMessage.className =
        "form-message";

}


/* =====================================================
   PASSWORD STRENGTH
   ===================================================== */

function getPasswordStrength(value) {

    let score = 0;


    if (value.length >= 8) {
        score++;
    }

    if (/[a-z]/.test(value)) {
        score++;
    }

    if (/[A-Z]/.test(value)) {
        score++;
    }

    if (/[0-9]/.test(value)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
        score++;
    }


    return score;
}


/* =====================================================
   UPDATE PASSWORD STRENGTH UI
   ===================================================== */

function updatePasswordStrength() {

    const value =
        password.value;

    const score =
        getPasswordStrength(value);


    const bars = [
        strength1,
        strength2,
        strength3,
        strength4
    ];


    bars.forEach(bar => {

        bar.style.background =
            "#dce5e1";

    });


    if (!value) {

        strengthText.textContent =
            "Use at least 8 characters";

        return;
    }


    if (score <= 1) {

        strength1.style.background =
            "#c54848";

        strengthText.textContent =
            "Weak password";

    } else if (score === 2) {

        strength1.style.background =
            "#d98b45";

        strength2.style.background =
            "#d98b45";

        strengthText.textContent =
            "Fair password";

    } else if (score === 3) {

        strength1.style.background =
            "#d4aa43";

        strength2.style.background =
            "#d4aa43";

        strength3.style.background =
            "#d4aa43";

        strengthText.textContent =
            "Good password";

    } else {

        strength1.style.background =
            "#23855c";

        strength2.style.background =
            "#23855c";

        strength3.style.background =
            "#23855c";

        strength4.style.background =
            "#23855c";

        strengthText.textContent =
            "Strong password";
    }

}


/* =====================================================
   SHOW / HIDE PASSWORD
   ===================================================== */

function setupPasswordToggle(
    input,
    button
) {

    button.addEventListener(
        "click",
        () => {

            if (
                input.type ===
                "password"
            ) {

                input.type = "text";

                button.textContent =
                    "Hide";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                button.textContent =
                    "Show";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


setupPasswordToggle(
    password,
    document.getElementById(
        "passwordToggle"
    )
);


setupPasswordToggle(
    confirmPassword,
    document.getElementById(
        "confirmPasswordToggle"
    )
);


/* =====================================================
   NAME VALIDATION
   ===================================================== */

function validateName() {

    const value =
        fullName.value.trim();


    if (!value) {

        showFieldError(
            fullName,
            nameError,
            "Please enter your full name."
        );

        return false;
    }


    if (value.length < 2) {

        showFieldError(
            fullName,
            nameError,
            "Name must contain at least 2 characters."
        );

        return false;
    }


    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/.test(value)) {

        showFieldError(
            fullName,
            nameError,
            "Please enter a valid name."
        );

        return false;
    }


    clearFieldError(
        fullName,
        nameError
    );

    return true;
}


/* =====================================================
   EMAIL VALIDATION
   ===================================================== */

function validateEmail() {

    const value =
        email.value.trim();


    /*
     * Email is optional.
     */

    if (!value) {

        clearFieldError(
            email,
            emailError
        );

        return true;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(value)) {

        showFieldError(
            email,
            emailError,
            "Please enter a valid email address."
        );

        return false;
    }


    clearFieldError(
        email,
        emailError
    );

    return true;
}


/* =====================================================
   MOBILE VALIDATION
   ===================================================== */

function validateMobile() {

    const value =
        mobile.value.trim();


    if (!value) {

        showFieldError(
            mobile,
            mobileError,
            "Please enter your mobile number."
        );

        return false;
    }


    if (!/^[6-9]\d{9}$/.test(value)) {

        showFieldError(
            mobile,
            mobileError,
            "Enter a valid 10-digit Indian mobile number."
        );

        return false;
    }


    clearFieldError(
        mobile,
        mobileError
    );

    return true;
}


/* =====================================================
   PASSWORD VALIDATION
   ===================================================== */

function validatePassword() {

    const value =
        password.value;


    if (!value) {

        showFieldError(
            password,
            passwordError,
            "Please create a password."
        );

        return false;
    }


    if (value.length < 8) {

        showFieldError(
            password,
            passwordError,
            "Password must contain at least 8 characters."
        );

        return false;
    }


    clearFieldError(
        password,
        passwordError
    );

    return true;
}


/* =====================================================
   CONFIRM PASSWORD VALIDATION
   ===================================================== */

function validateConfirmPassword() {

    const value =
        confirmPassword.value;


    if (!value) {

        showFieldError(
            confirmPassword,
            confirmPasswordError,
            "Please confirm your password."
        );

        return false;
    }


    if (value !== password.value) {

        showFieldError(
            confirmPassword,
            confirmPasswordError,
            "Passwords do not match."
        );

        return false;
    }


    clearFieldError(
        confirmPassword,
        confirmPasswordError
    );

    return true;
}


/* =====================================================
   TERMS VALIDATION
   ===================================================== */

function validateTerms() {

    if (!terms.checked) {

        termsError.textContent =
            "Please accept the Terms of Service and Privacy Policy.";

        return false;
    }


    termsError.textContent = "";

    return true;
}


/* =====================================================
   VALIDATE ENTIRE FORM
   ===================================================== */

function validateForm() {

    const nameValid =
        validateName();

    const emailValid =
        validateEmail();

    const mobileValid =
        validateMobile();

    const passwordValid =
        validatePassword();

    const confirmValid =
        validateConfirmPassword();

    const termsValid =
        validateTerms();


    return (
        nameValid &&
        emailValid &&
        mobileValid &&
        passwordValid &&
        confirmValid &&
        termsValid
    );
}


/* =====================================================
   MOBILE INPUT — ONLY NUMBERS
   ===================================================== */

mobile.addEventListener(
    "input",
    () => {

        mobile.value =
            mobile.value
                .replace(/\D/g, "")
                .slice(0, 10);

    }
);


/* =====================================================
   PASSWORD STRENGTH EVENT
   ===================================================== */

password.addEventListener(
    "input",
    () => {

        updatePasswordStrength();

        clearFieldError(
            password,
            passwordError
        );

    }
);


/* =====================================================
   LIVE VALIDATION
   ===================================================== */

fullName.addEventListener(
    "blur",
    validateName
);

email.addEventListener(
    "blur",
    validateEmail
);

mobile.addEventListener(
    "blur",
    validateMobile
);

password.addEventListener(
    "blur",
    validatePassword
);

confirmPassword.addEventListener(
    "blur",
    validateConfirmPassword
);

confirmPassword.addEventListener(
    "input",
    () => {

        if (confirmPassword.value) {

            validateConfirmPassword();

        }

    }
);


/* =====================================================
   CLEAR ERRORS WHILE USER TYPES
   ===================================================== */

fullName.addEventListener(
    "input",
    () => {

        clearFieldError(
            fullName,
            nameError
        );

        clearFormMessage();

    }
);


email.addEventListener(
    "input",
    () => {

        clearFieldError(
            email,
            emailError
        );

        clearFormMessage();

    }
);


mobile.addEventListener(
    "input",
    () => {

        clearFieldError(
            mobile,
            mobileError
        );

        clearFormMessage();

    }
);


/* =====================================================
   FORM SUBMIT
   ===================================================== */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearFormMessage();


        /* Validate */

        const isValid =
            validateForm();


        if (!isValid) {

            showFormMessage(
                "Please correct the highlighted fields.",
                "error"
            );

            return;
        }


        /* Disable button */

        registerBtn.disabled = true;

        registerBtn.classList.add(
            "loading"
        );

        buttonText.textContent =
            "Creating account...";


        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fullName.value.trim(),
                    email: email.value.trim(),
                    mobile: mobile.value.trim(),
                    password: password.value
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Could not create your account.");
            }

            sessionStorage.setItem("sanjeevaniUser", JSON.stringify(data.user));
            showFormMessage("Account created. Opening your dashboard…", "success");
            buttonText.textContent = "Account Created";
            window.location.href = "dashboard.html";
        } catch (error) {
            showFormMessage(
                error instanceof TypeError
                    ? "Cannot reach the server. Make sure it is running on port 3000."
                    : error.message,
                "error"
            );

            registerBtn.disabled = false;
            registerBtn.classList.remove("loading");
            buttonText.textContent = "Create Account";
        }

    }
);


/* =====================================================
   TERMS / PRIVACY DEMO LINKS
   ===================================================== */

document.getElementById(
    "termsLink"
).addEventListener(
    "click",
    event => {

        event.preventDefault();

        alert(
            "Terms of Service: This demo application is designed for healthcare guidance and service connection. It is not a substitute for professional medical care."
        );

    }
);


document.getElementById(
    "privacyLink"
).addEventListener(
    "click",
    event => {

        event.preventDefault();

        alert(
            "Privacy Policy: Please avoid entering sensitive information that is not required for this demo."
        );

    }
);

