/**
 * @jest-environment jsdom
 */

// ===============================
// IMPORTS
// ===============================
import { Account, User as BankUser, Bank } from "../js/bank.js";
import { User, encryptPIN, BankAuth } from "../js/auth.js";
import * as Dashboard from "../js/dashboard.js";

// Run script.js for side effects
import "../js/script.js";

// ===============================
// DOM SETUP
// ===============================
beforeEach(() => {
  document.body.innerHTML = `
    <div id="floatingMessage"></div>

    <h2 id="welcome"></h2> <!-- ✅ REQUIRED BY dashboard.js -->

    <nav>
      <a id="loginLink"></a>
      <a id="signupLink"></a>
      <a id="accountLink"></a>
      <a id="logoutLink"></a>
    </nav>

    <div id="accounts"></div>

    <input id="name" />
    <input id="pin" />
    <input id="type" />

    <div id="createError"></div>
    <div id="createSuccess"></div>

    <button id="createButton"></button>
    <span id="createButtonText"></span>
    <div id="createSpinner" class="d-none"></div>
  `;

  localStorage.clear();
  Account.existingNumbers.clear();
  jest.useFakeTimers();
});

// ===============================
// encryptPIN
// ===============================
describe("encryptPIN", () => {
  test("encodes PIN with Base64", () => {
    expect(encryptPIN("1234")).toBe(btoa("1234"));
  });
});

// ===============================
// USER
// ===============================
describe("User class", () => {
  test("creates user and verifies PIN", () => {
    const user = new User("Alice", "4321");
    expect(user.verifyPIN("4321")).toBe(true);
    expect(user.verifyPIN("wrong")).toBe(false);
  });

  test("adds an account", () => {
    const user = new User("Bob");
    user.addAccount("checking");
    expect(user.accounts.length).toBe(1);
  });
});

// ===============================
// AUTH
// ===============================
describe("BankAuth", () => {
  test("saves and retrieves users", () => {
    const user = new User("Charlie", "0000");
    BankAuth.saveUser(user);
    expect(BankAuth.getUsers()[0].name).toBe("Charlie");
  });

  test("creates user and auto-login", () => {
    BankAuth.createUser("Dana", "1111");
    expect(BankAuth.getSessionUser().name).toBe("Dana");
  });

  test("throws on duplicate user", () => {
    BankAuth.createUser("Eve", "2222");
    expect(() => BankAuth.createUser("Eve", "3333")).toThrow();
  });

  test("login and logout", () => {
    BankAuth.createUser("Frank", "1234");
    expect(BankAuth.login("Frank", "1234")).toBe(true);
    BankAuth.logout();
    expect(BankAuth.getSessionUser()).toBeNull();
  });
});

// ===============================
// ACCOUNT
// ===============================
describe("Account class", () => {
  test("deposit and withdraw", () => {
    const acc = new Account("checking", 100);
    acc.deposit(50);
    expect(acc.balance).toBe(150);
    expect(acc.withdraw(70)).toBe(true);
    expect(acc.balance).toBe(80);
    expect(acc.withdraw(100)).toBe(false);
  });

  test("formats account number", () => {
    const acc = new Account("savings", 0, [], 1234567890);
    expect(acc.getFormattedAccountNumber()).toBe("1234-5678-90");
  });
});

// ===============================
// BANK
// ===============================
describe("Bank class", () => {
  let bank, alice, bob;

  beforeEach(() => {
    bank = new Bank();
    alice = new BankUser("Alice", "1111");
    bob = new BankUser("Bob", "2222");

    alice.addAccount("checking");
    bob.addAccount("checking");

    alice.accounts[0].deposit(100);

    bank.addUser(alice);
    bank.addUser(bob);
  });

  test("finds users and accounts", () => {
    expect(bank.findUser("Alice")).toBe(alice);
    expect(bank.findAccount(alice.accounts[0].accountNumber).account)
      .toBe(alice.accounts[0]);
  });

  test("transfers funds successfully", () => {
    expect(
      bank.transfer(
        alice.accounts[0].accountNumber,
        bob.accounts[0].accountNumber,
        50,
        "1111"
      )
    ).toBe(true);
  });

  test("fails transfer with wrong PIN", () => {
    expect(
      bank.transfer(
        alice.accounts[0].accountNumber,
        bob.accounts[0].accountNumber,
        50,
        "wrong"
      )
    ).toBe(false);
  });
});


// ===============================
// DASHBOARD (INTEGRATION)
// ===============================
describe("Dashboard functions", () => {
  let user;

  beforeEach(() => {
    document.body.innerHTML = `
      <h2 id="welcome"></h2>
      <div id="accounts"></div>
      <div id="floatingMessage"></div>
    `;

    localStorage.clear();
    user = BankAuth.createUser("TestUser", "0000");
    BankAuth.login("TestUser", "0000");
  });

  test("deposit updates balance", () => {
  user.addAccount("checking");
  BankAuth.saveUser(user);

  Dashboard.loadDashboard();

  const amtInput = document.getElementById("amt0");
  amtInput.value = "100";

  Dashboard.deposit(0);

  const sessionUser = BankAuth.getSessionUser(); 
  expect(sessionUser.accounts[0].balance).toBe(100);
  expect(document.getElementById("acctMsg0").textContent)
    .toMatch(/Deposited/i);
});

  test("withdraw handles insufficient funds", () => {
    user.addAccount("checking");
    BankAuth.saveUser(user); 

    Dashboard.loadDashboard();

    const amtInput = document.getElementById("amt0");
    amtInput.value = "50";

    Dashboard.withdraw(0);

    expect(user.accounts[0].balance).toBe(0);
    expect(document.getElementById("acctMsg0").textContent)
      .toMatch(/Insufficient/i);
  });

  test("interest applies to savings account", () => {
  const acc = user.addAccount("savings");
  acc.balance = 200;
  BankAuth.saveUser(user);

  Dashboard.loadDashboard();
  Dashboard.interest(0);

  const sessionUser = BankAuth.getSessionUser(); 
  expect(sessionUser.accounts[0].balance).toBeCloseTo(204);
});
});