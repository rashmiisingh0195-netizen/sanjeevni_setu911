// This file runs on every page that includes it (index.html and checker.html).
// Right now it only has one job: open/close the mobile navigation menu.

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    // toggle() adds the class if it's missing, removes it if it's present.
    // This is how we open/close the menu with a single button.
    mainNav.classList.toggle("open");
  });
}
