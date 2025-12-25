// script.js
import { BankAuth } from "./auth.js";
import { $, showMessage, updateNavbar } from "./ui.js";
import {
  loadDashboard,
  addAccount,
  deposit,
  withdraw,
  interest,
  showBalance,
  toggleHistory,
  closeAccount,
  transfer
} from "./dashboard.js";

// ===============================
// BUTTON SPINNER HELPERS
// ===============================
function showSpinner(button, textEl, spinnerEl, message) {
  if (button && textEl && spinnerEl) {
    button.disabled = true;
    textEl.textContent = message;
    spinnerEl.classList.remove("d-none");
  }
}

function resetButton(button, textEl, spinnerEl, defaultText) {
  if (button && textEl && spinnerEl) {
    button.disabled = false;
    textEl.textContent = defaultText;
    spinnerEl.classList.add("d-none");
  }
}

// ===============================
// CREATE ACCOUNT
// ===============================
async function createAccount(e) {
  e.preventDefault();

  const nameEl = $("name");
  const pinEl = $("pin");
  const typeEl = $("type");
  const errorEl = $("createError");
  const successEl = $("createSuccess");

  errorEl.textContent = "";
  successEl.textContent = "";

  const name = nameEl?.value.trim();
  const pin = pinEl?.value.trim();
  const type = typeEl?.value;

  if (!name || !pin || !type) return (errorEl.textContent = "All fields are required");
  if (BankAuth.findUser(name)) return (errorEl.textContent = "User already exists");

  const button = $("createButton");
  const btnText = $("createButtonText");
  const spinner = $("createSpinner");

  try {
    showSpinner(button, btnText, spinner, "Creating...");
    await new Promise(r => setTimeout(r, 50));

    const user = BankAuth.createUser(name, pin);
    user.addAccount(type);
    BankAuth.saveUser(user);

    if (!BankAuth.login(user.name, pin)) return (errorEl.textContent = "Login failed after account creation");

    successEl.textContent = "Account created successfully";
    nameEl.value = pinEl.value = typeEl.value = "";

    await new Promise(r => setTimeout(r, 1200));
    window.location.href = "dashboard.html";

  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    resetButton(button, btnText, spinner, "Create Account");
  }
}

// ===============================
// LOGIN
// ===============================
async function loginUser(e) {
  e.preventDefault();

  const nameEl = $("name");
  const pinEl = $("pin");
  const errorEl = $("loginError");
  const successEl = $("loginSuccess");

  errorEl.textContent = "";
  successEl.textContent = "";

  const name = nameEl?.value.trim();
  const pin = pinEl?.value.trim();

  if (!name || !pin) return (errorEl.textContent = "Enter name and PIN");

  const button = $("loginButton");
  const btnText = $("loginButtonText");
  const spinner = $("loginSpinner");

  try {
    showSpinner(button, btnText, spinner, "Logging in...");
    await new Promise(r => setTimeout(r, 200));

    if (!BankAuth.login(name, pin)) return (errorEl.textContent = "Invalid credentials");

    successEl.textContent = "Login successful";
    nameEl.value = pinEl.value = "";

    await new Promise(r => setTimeout(r, 1000));
    window.location.href = "dashboard.html";

  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    resetButton(button, btnText, spinner, "Login");
  }
}

// ===============================
// LOGOUT
// ===============================
function logoutUser() {
  const logoutButtons = [
    { button: $("logoutButton"), text: $("logoutButtonText"), spinner: $("logoutSpinner") },
    { button: $("logoutButtonNavbar"), text: $("logoutButtonTextNavbar"), spinner: $("logoutSpinnerNavbar") }
  ];

  logoutButtons.forEach(b => showSpinner(b.button, b.text, b.spinner, "Logging out..."));

  setTimeout(() => {
    BankAuth.logout();
    updateNavbar();
    window.location.href = "index.html";
    logoutButtons.forEach(b => resetButton(b.button, b.text, b.spinner, "Logout"));
  }, 300);
}

// ===============================
// CONTACT FORM
// ===============================
async function submitContactForm(e) {
  e.preventDefault();

  const fullNameEl = $("fullName");
  const emailEl = $("email");
  const messageEl = $("message");
  const errorEl = $("contactError");
  const successEl = $("contactSuccess");

  errorEl.textContent = "";
  successEl.textContent = "";

  const fullName = fullNameEl?.value.trim();
  const email = emailEl?.value.trim();
  const message = messageEl?.value.trim();

  if (!fullName || !email || !message) {
    errorEl.textContent = "All fields are required";
    setTimeout(() => (errorEl.textContent = ""), 3000);
    return;
  }

  const button = $("contactButton");
  const btnText = $("contactButtonText");
  const spinner = $("contactSpinner");

  try {
    showSpinner(button, btnText, spinner, "Sending...");
    await new Promise(r => setTimeout(r, 1700));

    successEl.textContent = "Message sent successfully!";
    setTimeout(() => (successEl.textContent = ""), 3000);

    fullNameEl.value = emailEl.value = messageEl.value = "";

  } catch (err) {
    errorEl.textContent = err.message;
    setTimeout(() => (errorEl.textContent = ""), 3000);
  } finally {
    resetButton(button, btnText, spinner, "Send Message");
  }
}

// ===============================
// TRANSFER FORM
// ===============================
function handleTransfer(e) {
  e.preventDefault();

  const fromIndex = Number($("fromAccount")?.value);
  const toIndex = Number($("toAccount")?.value);
  const amount = Number($("transferAmount")?.value);

  if (isNaN(fromIndex) || isNaN(toIndex) || isNaN(amount) || fromIndex === toIndex || amount <= 0) {
    return showMessage("floatingMessage", "Invalid transfer details", "alert-danger");
  }

  transfer(fromIndex, toIndex, amount);
}

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  $("loginForm")?.addEventListener("submit", loginUser);
  $("createForm")?.addEventListener("submit", createAccount);
  $("logoutButtonNavbar")?.addEventListener("click", (e) => { e.preventDefault(); logoutUser(); });
  $("transferForm")?.addEventListener("submit", handleTransfer);
  $("contactForm")?.addEventListener("submit", submitContactForm);

  if ($("welcome")) loadDashboard();
  updateNavbar();
});

// ===============================
// GLOBAL WINDOW ASSIGNMENTS
// ===============================
window.createAccount = createAccount;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.updateNavbar = updateNavbar;
window.addAccount = addAccount;
window.deposit = deposit;
window.withdraw = withdraw;
window.interest = interest;
window.showBalance = showBalance;
window.toggleHistory = toggleHistory;
window.closeAccount = closeAccount;
window.transfer = transfer;
window.submitContactForm = submitContactForm;
