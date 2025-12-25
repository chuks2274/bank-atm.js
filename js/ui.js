// ui.js
import { BankAuth } from "./auth.js";

// ===============================
// DOM HELPER
// ===============================
export const $ = (id) => document.getElementById(id);

// ===============================
// FLOATING MESSAGE HANDLER
// ===============================
let floatingMsgTimer = null;

export function showMessage(id, message, type = "alert-danger", autoHide = true) {
  const el = $(id);
  if (!el) return;

  el.style.display = "block";

  // Clear any existing timer
  if (floatingMsgTimer) {
    clearTimeout(floatingMsgTimer);
    floatingMsgTimer = null;
  }

  // Remove previous styling classes
  el.classList.remove(
    "d-none",
    "alert",
    "alert-success",
    "alert-danger",
    "alert-warning",
    "text-success",
    "text-danger",
    "text-warning"
  );

  // Apply new styling
  if (type.startsWith("alert-")) {
    el.classList.add("alert", type);
  } else {
    el.classList.add(type);
  }

  el.textContent = message;

  // Auto-hide message after 3 seconds
  if (autoHide) {
    floatingMsgTimer = setTimeout(() => {
      el.classList.add("d-none");
      el.textContent = "";
      floatingMsgTimer = null;
    }, 3000);
  }
}

/**
 * Programmatically hide the floating message.
 * @param {number} delay - Delay before hiding in ms (default: 3000)
 */
export function autoHideFloatingMessage(delay = 3000) {
  const el = $("floatingMessage");
  if (!el) return;

  if (floatingMsgTimer) clearTimeout(floatingMsgTimer);

  floatingMsgTimer = setTimeout(() => {
    el.classList.add("d-none");
    el.textContent = "";
    floatingMsgTimer = null;
  }, delay);
}

// ===============================
// NAVBAR STATE
// ===============================
/**
 * Update navbar links based on login state.
 */
export function updateNavbar() {
  const user = BankAuth.getSessionUser();

  $("loginLink")?.classList.toggle("d-none", !!user);
  $("signupLink")?.classList.toggle("d-none", !!user);
  $("accountLink")?.classList.toggle("d-none", !user);
  $("logoutLink")?.classList.toggle("d-none", !user);
}
