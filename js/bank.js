/* ======================================================
   ACCOUNT CLASS
====================================================== */

export class Account {
  static existingNumbers = new Set();

  constructor(type, balance = 0, transactions = [], accountNumber = null) {
    this.type = type;
    this.balance = balance;
    this.transactions = transactions;
    this.accountNumber = accountNumber || Account.generateUniqueAccountNumber();
    Account.existingNumbers.add(this.accountNumber);
  }

  static generateUniqueAccountNumber() {
    let number;
    do {
      number = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
    } while (Account.existingNumbers.has(number));

    Account.existingNumbers.add(number);
    return number;
  }

  deposit(amount) {
    this.balance += amount;
    this.transactions.push({ type: "deposit", amount, date: new Date() });
  }

  withdraw(amount) {
    if (amount > this.balance) return false;
    this.balance -= amount;
    this.transactions.push({ type: "withdraw", amount, date: new Date() });
    return true;
  }

  getFormattedAccountNumber() {
    return this.accountNumber.toString().replace(/(\d{4})(?=\d)/g, "$1-");
  }
}

/* ======================================================
   USER CLASS
====================================================== */

import { encryptPIN } from "./auth.js";

export class User {
  constructor(name, pin = null) {
    this.name = name;
    this.accounts = [];
    this.encryptedPIN = pin ? encryptPIN(pin) : null;
    this.receipts = [];
  }

  /* ------------------------------
     ACCOUNT MANAGEMENT
  ------------------------------ */

  addAccount(type) {
    const account = new Account(type);
    this.accounts.push(account);
    return account.accountNumber;
  }

  addExistingAccount(accData) {
    const account = new Account(
      accData.type,
      accData.balance,
      accData.transactions,
      accData.accountNumber
    );
    this.accounts.push(account);
    return account.accountNumber;
  }

  getAccountByNumber(number) {
    return this.accounts.find(acc => acc.accountNumber === number);
  }

  /* ------------------------------
     PIN VERIFICATION
  ------------------------------ */

  verifyPIN(inputPIN) {
    return this.encryptedPIN === encryptPIN(inputPIN);
  }

  /* ------------------------------
     RECEIPTS / TRANSACTIONS
  ------------------------------ */

  addReceipt(receipt) {
    this.receipts.push(receipt);
  }

  printReceipts() {
    console.log(`--- Receipts for ${this.name} ---`);
    this.receipts.forEach(r => {
      console.log(
        `${r.date.toLocaleString()}: $${r.amount} ${r.type} ${r.to ? "to " + r.to : "from " + r.from}`
      );
    });
  }
}

/* ======================================================
   BANK CLASS
====================================================== */

export class Bank {
  constructor() {
    this.users = [];
    this.ledger = [];
  }

  /* ------------------------------
     USER MANAGEMENT
  ------------------------------ */

  addUser(user) {
    this.users.push(user);
  }

  findUser(name) {
    return this.users.find(u => u.name === name) || null;
  }

  findAccount(accountNumber) {
    for (const user of this.users) {
      const account = user.getAccountByNumber(accountNumber);
      if (account) return { account, user };
    }
    return null;
  }

  /* ------------------------------
     FUND TRANSFER
  ------------------------------ */

  transfer(fromAccountNumber, toAccountNumber, amount, pin) {
    const fromData = this.findAccount(fromAccountNumber);
    const toData = this.findAccount(toAccountNumber);

    if (!fromData || !toData) return false;
    if (!fromData.user.verifyPIN(pin)) return false;

    if (fromData.account.withdraw(amount)) {
      toData.account.deposit(amount);

      const transaction = {
        from: fromData.account.getFormattedAccountNumber(),
        to: toData.account.getFormattedAccountNumber(),
        amount,
        date: new Date(),
      };
      this.ledger.push(transaction);

      fromData.user.addReceipt({ type: "Sent", to: toData.user.name, amount, date: new Date() });
      toData.user.addReceipt({ type: "Received", from: fromData.user.name, amount, date: new Date() });

      return true;
    }

    return false;
  }

  printLedger() {
    console.log("----- Bank Ledger -----");
    this.ledger.forEach(tx => {
      console.log(`${tx.date.toLocaleString()}: $${tx.amount} from ${tx.from} to ${tx.to}`);
    });
  }
}

/* ======================================================
   EXPORT BANK INSTANCE
====================================================== */

export const bank = new Bank();
