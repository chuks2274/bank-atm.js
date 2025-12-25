// dashboard.js
import { BankAuth } from "./auth.js";
import { $, showMessage } from "./ui.js";

// ===============================
// DASHBOARD LOAD
// ===============================
export function loadDashboard() {
  const user = BankAuth.getSessionUser();
  if (!user) return (window.location.href = "login.html");

  $("welcome").innerText = `Welcome, ${user.name}`;
  renderAccounts(user);
}

// ===============================
// ACCOUNT MANAGEMENT
// ===============================
export function addAccount(type) {
  const user = BankAuth.getSessionUser();
  if (!user) return showMessage("floatingMessage", "No active user", "alert-danger");

  user.addAccount(type);
  BankAuth.saveUser(user);

  showMessage(
    "floatingMessage",
    `${type.charAt(0).toUpperCase() + type.slice(1)} account added successfully.`,
    "alert-success"
  );

  setTimeout(() => renderAccounts(user), 100);
}

// ===============================
// CLOSE ACCOUNT
// ===============================
let floatingMsgTimer = null;

export function closeAccount(i) {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const acc = user.accounts[i];
  const floatingMsg = $("floatingMessage");
  if (!floatingMsg) return;

  if (floatingMsgTimer) { clearTimeout(floatingMsgTimer); floatingMsgTimer = null; }

  floatingMsg.style.display = "block";
  floatingMsg.style.pointerEvents = "auto";
  floatingMsg.className = "alert alert-warning shadow-sm floating-msg";
  floatingMsg.innerHTML = `
    <div class="fw-semibold mb-2">
      Are you sure you want to close your <strong>${acc.type}</strong> account?
    </div>
    <div class="text-muted mb-2">
      This action is permanent and all remaining funds will be lost.
    </div>
    <div class="d-flex gap-2 justify-content-end">
      <button type="button" class="btn btn-danger btn-sm confirmCloseBtn">Yes, Close</button>
      <button type="button" class="btn btn-secondary btn-sm cancelCloseBtn">Cancel</button>
    </div>
  `;

  // Confirm close
  floatingMsg.querySelector(".confirmCloseBtn").onclick = (e) => {
    e.preventDefault(); e.stopPropagation();

    user.accounts.splice(i, 1);
    BankAuth.saveUser(user);
    renderAccounts(user);

    showMessage("floatingMessage", `Your ${acc.type} account was closed successfully.`, "alert-success");
  };

  // Cancel close
  floatingMsg.querySelector(".cancelCloseBtn").onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    showMessage("floatingMessage", "Account closure cancelled.", "alert-secondary");
  };
}


// ===============================
// TRANSACTION ACTIONS
// ===============================
export function deposit(i) {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const amtEl = $(`amt${i}`);
  const amount = amtEl ? Number(amtEl.value) : NaN;
  if (isNaN(amount) || amount <= 0) return showMessage(`acctMsg${i}`, "Enter a valid amount", "text-danger");

  const acc = user.accounts[i];
  if (!acc) return;

  acc.deposit(amount);
  BankAuth.saveUser(user);

  if (amtEl) amtEl.value = "";
  showMessage(`acctMsg${i}`, `Deposited $${amount.toFixed(2)}`, "text-success");
  updateHistory(i, acc);
}

export function withdraw(i) {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const amtEl = $(`amt${i}`);
  const amount = amtEl ? Number(amtEl.value) : NaN;
  if (isNaN(amount) || amount <= 0) return showMessage(`acctMsg${i}`, "Enter a valid amount", "text-danger");

  const acc = user.accounts[i];
  if (!acc) return;

  if (acc.balance < amount) return showMessage(`acctMsg${i}`, "Insufficient funds", "text-danger");

  acc.balance -= amount;
  if (!acc.transactions) acc.transactions = [];
  acc.transactions.push({ type: "withdraw", amount: -amount, date: new Date().toLocaleString() });

  BankAuth.saveUser(user);
  if (amtEl) amtEl.value = "";
  showMessage(`acctMsg${i}`, `Withdrew $${amount.toFixed(2)}`, "text-danger");
  updateHistory(i, acc);
}

export function interest(i) {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const acc = user.accounts[i];
  if (!acc || acc.type !== "savings") return showMessage(`acctMsg${i}`, "Savings only", "text-danger");

  const rate = acc.interestRate ?? 0.02;
  const interestAmt = acc.balance * rate;
  if (interestAmt <= 0) return showMessage(`acctMsg${i}`, "No interest to apply", "text-muted");

  acc.balance += interestAmt;
  acc.transactions.push({ type: "interest", amount: interestAmt, date: new Date().toLocaleString() });
  BankAuth.saveUser(user);

  showMessage(`acctMsg${i}`, `Interest applied: +$${interestAmt.toFixed(2)}`, "text-success");
  showBalance(i);
  updateHistory(i, acc);
}

// ===============================
// SHOW BALANCE
// ===============================
export function showBalance(i) {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const acc = user.accounts[i];
  if (!acc) return;

  const el = $(`balance${i}`);
  if (!el) return;

  el.innerText = `Balance: $${acc.balance.toFixed(2)}`;
  el.classList.remove("d-none");
  setTimeout(() => el.classList.add("d-none"), 5000);
}

// ===============================
// TRANSFERS
// ===============================
export function transfer(fromIndex, toIndex, amount, msgTargetId = "floatingMessage") {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const fromAcc = user.accounts[fromIndex];
  const toAcc = user.accounts[toIndex];
  if (!fromAcc || !toAcc) return showMessage(msgTargetId, "Invalid account selection", "text-danger");
  if (isNaN(amount) || amount <= 0) return showMessage(msgTargetId, "Enter a valid amount", "text-danger");
  if (fromAcc.balance < amount) return showMessage(msgTargetId, "Insufficient funds", "text-danger");

  const now = new Date().toLocaleString();
  fromAcc.balance -= amount;
  toAcc.balance += amount;

  fromAcc.transactions.push({ type: "transfer out", amount: -amount, date: now, toAccount: `${toAcc.type} - ${toAcc.accountNumber}` });
  toAcc.transactions.push({ type: "transfer in", amount: amount, date: now, fromAccount: `${fromAcc.type} - ${fromAcc.accountNumber}` });

  BankAuth.saveUser(user);
  showMessage(msgTargetId, `$${amount.toFixed(2)} transferred from this ${fromAcc.type} account to ${toAcc.type} account.`, "alert-success");

  setTimeout(() => renderAccounts(user), 2000);
}

export function transferFromCard(i) {
  const user = BankAuth.getSessionUser();
  if (!user) return;

  const card = document.querySelectorAll("#accounts .card")[i];
  if (!card) return;

  const amtInput = card.querySelector(".transferAmt");
  const amount = amtInput ? parseFloat(amtInput.value) : NaN;
  const toVal = card.querySelector(".transferTo")?.value;
  if (!toVal) return showMessage(`acctMsg${i}`, "Select a valid target account", "text-danger");

  const toIndex = user.accounts.findIndex(a => a.accountNumber === Number(toVal));
  if (toIndex === -1) return showMessage(`acctMsg${i}`, "Select a valid target account", "text-danger");

  transfer(i, toIndex, amount, `acctMsg${i}`);
  if (amtInput) amtInput.value = "";
}

// ===============================
// TRANSACTION HISTORY
// ===============================
export function updateHistory(i, account) {
  if (!account || !account.transactions) return;

  const historyEl = $(`history${i}`);
  if (!historyEl) return;

  const list = historyEl.querySelector("ul.list-group");
  if (!list) return;

  list.innerHTML = account.transactions.length === 0
    ? `<li class="list-group-item text-muted">No transactions yet</li>`
    : account.transactions
        .slice()
        .reverse()
        .map((t, idx) => {
          const originalIndex = account.transactions.length - 1 - idx;
          const typeLabel = t.type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
          const info = t.toAccount ? ` to ${t.toAccount}` : t.fromAccount ? ` from ${t.fromAccount}` : "";
          const amountClass = t.amount < 0 ? "text-danger" : "text-success";
          const displayAmount = t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `+$${t.amount.toFixed(2)}`;

          return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>${typeLabel}</strong>${info}<br>
                <small class="text-muted">${t.date}</small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="${amountClass}">${displayAmount}</span>
                <button type="button" class="btn btn-sm btn-outline-danger deleteTxBtn" data-index="${originalIndex}">&times;</button>
              </div>
            </li>`;
        })
        .join("");

  // Attach delete buttons
  historyEl.querySelectorAll(".deleteTxBtn").forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const txIndex = Number(btn.getAttribute("data-index"));
      account.transactions.splice(txIndex, 1);
      const user = BankAuth.getSessionUser();
      if (user) user.accounts[i].transactions = account.transactions;
      BankAuth.saveUser(user);
      updateHistory(i, account);
    };
  });
}

export function toggleHistory(i) {
  const el = $(`history${i}`);
  if (el) el.classList.toggle("d-none");
}

// ===============================
// RENDER ACCOUNTS (INTERNAL)
// ===============================
function renderAccounts(user) {
  const container = $("accounts");
  if (!container) return;
  container.innerHTML = "";

  user.accounts.forEach((acc, i) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";

    const body = document.createElement("div");
    body.className = "card-body";

    body.innerHTML = `
      <h5 class="card-title text-capitalize">${acc.type} Account - ${acc.accountNumber}</h5>
      <p id="balance${i}" class="fw-bold d-none">Balance: $${acc.balance.toFixed(2)}</p>
      <input id="amt${i}" type="number" class="form-control mb-2" placeholder="Amount">
      <div class="d-flex justify-content-center gap-2 mb-2 flex-wrap"></div>
      <div class="transfer-section mb-2">
        <input type="number" class="form-control transferAmt mb-1" placeholder="Transfer amount">
        <select class="form-select transferTo mb-1">
          <option value="">Select target account</option>
          ${user.accounts.filter((a, idx) => idx !== i).map(a => `<option value="${a.accountNumber}">${a.type} - ${a.accountNumber}</option>`).join("")}
        </select>
        <div class="d-flex justify-content-center my-2">
          <button class="btn btn-sm btn-warning transferBtn">Transfer</button>
        </div>
      </div>
      <div id="history${i}" class="mt-3 d-none">
        <h6>Transaction History</h6>
        <ul class="list-group"></ul>
      </div>
      <div id="acctMsg${i}" class="mt-2"></div>
    `;

    const btnGroup = body.querySelector("div");
    const buttons = [
      createBtn("Deposit", "btn-primary", () => deposit(i)),
      createBtn("Withdraw", "btn-danger", () => withdraw(i)),
      createBtn("Check Balance", "btn-info", () => showBalance(i))
    ];

    if (acc.type === "savings") buttons.push(createBtn("Interest", "btn-success", () => interest(i)));
    buttons.push(
      createBtn("History", "btn-secondary", () => toggleHistory(i)),
      createBtn("Close Account", "btn-outline-danger", () => closeAccount(i))
    );

    btnGroup.append(...buttons);
    card.appendChild(body);
    container.appendChild(card);

    const transferBtn = card.querySelector(".transferBtn");
    if (transferBtn) transferBtn.onclick = () => transferFromCard(i);

    updateHistory(i, acc);
  });
}

// ===============================
// HELPER
// ===============================
function createBtn(text, cls, fn) {
  const btn = document.createElement("button");
  btn.className = `btn btn-sm ${cls}`;
  btn.textContent = text;
  btn.onclick = fn;
  return btn;
}
