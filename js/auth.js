import { Account } from "./bank.js";

/* ======================================================
   UTILITY HELPERS
====================================================== */

/**
 * Encrypts a PIN using Base64.
 * NOTE: This is for demo purposes only.
 * Real applications must use secure hashing.
 */
export function encryptPIN(pin) {
  return btoa(pin);
}

/* ======================================================
   USER MODEL
====================================================== */

export class User {
  constructor(name, pin = null) {
    this.name = name;
    this.accounts = [];
    this.encryptedPIN = pin ? encryptPIN(pin) : null;
  }

  verifyPIN(pin) {
    return this.encryptedPIN === encryptPIN(pin);
  }

  addAccount(type) {
    const account = new Account(type);
    this.accounts.push(account);
    return account;
  }
}

/* ======================================================
   AUTH & STORAGE SERVICE
====================================================== */

export class BankAuth {
  static USERS_KEY = "demo_bank_users";
  static SESSION_KEY = "demo_bank_session";

  /* ------------------------------
     User Persistence
  ------------------------------ */

  static getUsers() {
    const stored = JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];

    return stored.map(rawUser => {
      const user = new User(rawUser.name);
      user.encryptedPIN = rawUser.encryptedPIN;

      user.accounts = (rawUser.accounts || []).map(acc => {
        const account = new Account(
          acc.type,
          acc.balance ?? 0,
          Array.isArray(acc.transactions) ? acc.transactions : [],
          acc.accountNumber ?? Date.now()
        );

        Account.existingNumbers.add(account.accountNumber);
        return account;
      });

      return user;
    });
  }

  static saveUsers(users) {
    const sanitized = users.map(user => ({
      name: user.name,
      encryptedPIN: user.encryptedPIN,
      accounts: user.accounts
    }));

    localStorage.setItem(this.USERS_KEY, JSON.stringify(sanitized));
  }

  static saveUser(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.name === user.name);

    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }

    this.saveUsers(users);
  }

  /* ------------------------------
     User Lookup
  ------------------------------ */

  static findUser(name) {
    return this.getUsers().find(user => user.name === name) || null;
  }

  /* ------------------------------
     Authentication
  ------------------------------ */

  static createUser(name, pin) {
    const users = this.getUsers();

    if (users.some(user => user.name === name)) {
      throw new Error("User already exists");
    }

    const user = new User(name, pin);
    users.push(user);
    this.saveUsers(users);

    // Auto-login after registration
    this.login(name, pin);

    return user;
  }

  static login(name, pin) {
    const user = this.findUser(name);
    if (!user) return false;

    if (!user.verifyPIN(pin)) return false;

    localStorage.setItem(this.SESSION_KEY, name);
    return true;
  }

  static logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static getSessionUser() {
    const username = localStorage.getItem(this.SESSION_KEY);
    return username ? this.findUser(username) : null;
  }
}
