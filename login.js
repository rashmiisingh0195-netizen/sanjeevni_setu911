/* =========================================
   SANJEEVANI SETU — LOGIN JAVASCRIPT
   ========================================= */

"use strict";


/* =========================================
   CONFIGURATION
   ========================================= */

// Your existing Node.js backend
const API_URL = "http://localhost:3000";


/* =========================================
   GET HTML ELEMENTS
   ========================================= */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const rememberMe =
    document.getElementById("rememberMe");

const loginButton =
    document.getElementById("loginButton");

const message =
    document.getElementById("message");

const guestButton =
    document.getElementById("guestButton");

const registerLink =
    document.getElementById("registerLink");

const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================
   SHOW MESSAGE
   ========================================= */

function showMessage(text, type = "") {

    message.textContent = text;

    message.className = "message";

    if (type) {
        message.classList.add(type);
    }
}


/* =========================================
   SHOW / HIDE PASSWORD
   ========================================= */

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "Hide";

        togglePassword.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "Show";

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );
    }

});


/* =========================================
   REMEMBER ME
   ========================================= */

const savedUser =
    localStorage.getItem("sanjeevaniRememberedUser");

if (savedUser) {

    emailInput.value = savedUser;

    rememberMe.checked = true;
}


/* =========================================
   LOGIN FORM
   ========================================= */

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    showMessage("");


    const emailOrMobile =
        emailInput.value.trim();

    const password =
        passwordInput.value.trim();


    /* -----------------------------------------
       BASIC VALIDATION
       ----------------------------------------- */

    if (!emailOrMobile) {

        showMessage(
            "Please enter your email or mobile number.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (!password) {

        showMessage(
            "Please enter your password.",
            "error"
        );

        passwordInput.focus();

        return;
    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        passwordInput.focus();

        return;
    }


    /* -----------------------------------------
       REMEMBER USER
       ----------------------------------------- */

    if (rememberMe.checked) {

        localStorage.setItem(
            "sanjeevaniRememberedUser",
            emailOrMobile
        );

    } else {

        localStorage.removeItem(
            "sanjeevaniRememberedUser"
        );
    }


    /* -----------------------------------------
       DISABLE BUTTON
       ----------------------------------------- */

    loginButton.disabled = true;

    loginButton.textContent = "Signing in...";


    try {

        /*
         * IMPORTANT:
         *
         * This request expects a login API
         * at:
         *
         * POST /api/login
         *
         * We will create that endpoint
         * in your Node.js backend next.
         */

        const response = await fetch(
            `${API_URL}/api/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    emailOrMobile: emailOrMobile,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed. Please check your details."
            );
        }


        /* -----------------------------------------
           LOGIN SUCCESS
           ----------------------------------------- */

        showMessage(
            "Login successful! Redirecting...",
            "success"
        );


        /*
         * Store login information temporarily.
         *
         * The backend should return a user object.
         */

        if (data.user) {

            sessionStorage.setItem(
                "sanjeevaniUser",
                JSON.stringify(data.user)
            );
        }


        /*
         * Redirect to dashboard.
         */

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 1000);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        /*
         * If backend is not running,
         * show a useful message.
         */

        if (
            error.name === "TypeError" ||
            error.message.includes("Failed to fetch")
        ) {

            showMessage(
                "Unable to connect to the server. Make sure your Node.js backend is running on port 3000.",
                "error"
            );

        } else {

            showMessage(
                error.message,
                "error"
            );
        }

    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Sign In";
    }

});


/* =========================================
   CONTINUE AS GUEST
   ========================================= */

guestButton.addEventListener("click", function () {

    /*
     * Guest users can access the symptom checker
     * without creating an account.
     */

    sessionStorage.setItem(
        "sanjeevaniGuest",
        "true"
    );


    window.location.href =
        "checker.html";

});


/* =========================================
   REGISTER BUTTON
   ========================================= */

registerLink.addEventListener("click", function (event) {

    event.preventDefault();


    showMessage(
        "Registration will be available soon.",
        "success"
    );

});


/* =========================================
   FORGOT PASSWORD
   ========================================= */

forgotPassword.addEventListener("click", function (event) {

    event.preventDefault();


    showMessage(
        "Password recovery will be available soon.",
        "success"
    );

});