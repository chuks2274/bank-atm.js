# Demo Bank – Interactive Browser-Based Banking App

Demo Bank is a modern, responsive, and interactive digital banking application built with HTML5, CSS3/Bootstrap 5, and Vanilla JavaScript. It allows users to create accounts, manage finances, and perform transactions in a secure demo environment.

# Problems Solved

Transaction tracking: Clear ledger and receipt system for all activity.
PIN & security management: Simplified, encrypted PIN authentication for secure access.
Account organization: Create multiple account types and manage balances easily.
Error prevention: Prevents overdrafts and invalid transactions via validation.

# Benefits to Users
Instant account creation without paperwork.
Real-time updates for deposits, withdrawals, and transfers.
Comprehensive dashboard displaying balances and transaction history.
User-friendly interface with responsive, accessible design.
Safe demo environment to explore banking operations without risk.

# Key Features

Authentication: Secure PIN-based login, logout, and account creation.
Accounts: Create, manage, and view checking & savings accounts.
Transactions: Deposit, withdraw, transfer funds, and apply interest.
Dashboard: Dynamic UI, floating notifications, and real-time updates.
Forms & Feedback: Client-side validation, loading spinners, and alert messages.
Responsive Design: Mobile-first layout with Bootstrap 5.
Modular Architecture: ES6 modules separating UI, dashboard, bank logic, and authentication.
Testing: Jest test suite covering authentication, account management, and dashboard actions.

# Tech Stack

Frontend: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES Modules)
Testing: Jest & jsdom
Persistence: LocalStorage for demo data
CI/CD: GitHub Actions workflow for ESLint checks and Vercel deployment

# Modules Overview

script.js – Core controller handling user actions, forms, and UI updates.
dashboard.js – Manages account operations, transactions, and dynamic dashboard rendering.
bank.js – Implements Account, User, and Bank classes for banking logic.
auth.js – Handles user authentication, PIN verification, and session management.
ui.js – Utility module for DOM access, floating messages, and navbar state updates.
style.css – Modern, responsive styling with consistent UX patterns.

# Testing

Unit & Integration Tests:
User creation, login, logout, duplicate prevention
PIN verification and encryption
Account operations (deposit, withdraw, interest)
Bank operations (fund transfer, ledger tracking)
Dashboard UI updates and message rendering

# Purpose

This project demonstrates:
Frontend fundamentals: responsive design, modular architecture, and clean UI.
Real-world banking workflow simulation: secure authentication, transactions, and dashboard state.
Test-driven development mindset: reliable, maintainable, and scalable code.

# How to Use Demo Bank

Clone the Repository: 

git clone <repository-url>
cd <repository-folder>

# Open in Browser

Open index.html to explore the landing page and navigation flow.
Open login.html to create an account or log in.
Explore the dashboard to manage accounts and transactions.

# Run Tests (Optional)

npm install
npm test

# Live Deployment
View the deployed project here: [**Live Demo**](https://)
