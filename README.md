# 🔐 Client-Side Authentication System

A secure, zero-dependency client-side authentication system built with modern semantic **HTML5**, responsive **CSS3**, and **Vanilla ES6+ JavaScript**. It features client-side password hashing via the browser-native **Web Crypto API (SHA-256)**, session lifecycle management, real-time validation, and route guards.

---

## 📋 Feature Checklist Verification

| # | Requirement | Status | Implementation Details |
|---|---|---|---|
| 1 | **Registration page** | ✅ Complete | [`register.html`](file:///e:/vscode/campusnotes/auth-system/register.html) with Username/Email, Password, Show/Hide toggle, and Register button. |
| 2 | **Password validation on registration** | ✅ Complete | Enforces **minimum 8 characters** and **at least 1 number** (`/\d/`) with a dynamic, real-time criteria checklist that updates as you type. |
| 3 | **Duplicate username/email check** | ✅ Complete | Case-insensitive check against `localStorage` user database before registration; displays descriptive error if already taken. |
| 4 | **Login page** | ✅ Complete | [`login.html`](file:///e:/vscode/campusnotes/auth-system/login.html) with Username/Email, Password, Show/Hide toggle, and Sign In button. |
| 5 | **Incorrect credential handling** | ✅ Complete | Displays a uniform error message: *"Invalid username/email or password"* without revealing which field was incorrect (defending against account enumeration). |
| 6 | **Protected / Dashboard page** | ✅ Complete | [`dashboard.html`](file:///e:/vscode/campusnotes/auth-system/dashboard.html) guarded by [`guard.js`](file:///e:/vscode/campusnotes/auth-system/js/guard.js). Direct access without a session immediately redirects to `login.html?redirect=unauthorized`. |
| 7 | **Logout button** | ✅ Complete | Prominent Logout button on the dashboard clears the active session from `localStorage` and redirects to `login.html?logout=true`. |
| 8 | **Zero plaintext passwords** | ✅ Complete | Implemented via native `window.crypto.subtle.digest('SHA-256', ...)` in [`crypto.js`](file:///e:/vscode/campusnotes/auth-system/js/crypto.js). Only 64-character hexadecimal SHA-256 hashes are ever stored or evaluated. |
| 9 | **Basic form validation** | ✅ Complete | Trim checks, non-empty validation, and HTML5 `required` constraints on both login and registration pages. |

---

## 📁 File Structure

```
auth-system/
├── index.html              # Entry router (auto-routes to dashboard or login)
├── login.html              # Login interface
├── register.html           # Registration interface with real-time requirements
├── dashboard.html          # Protected dashboard view
├── README.md               # Documentation & testing guide
├── css/
│   └── styles.css          # Modern, responsive theme and component styling
└── js/
    ├── crypto.js           # SHA-256 cryptographic utility using Web Crypto API
    ├── storage.js          # User database and session persistence abstraction
    ├── auth.js             # Form validation, registration & login handlers
    └── guard.js            # Route protection guard & logout handler
```

---

## 🚀 How to Run and Test

Because this project is built entirely on native web standards and ES modules, you can run it instantly using any static server or modern browser:

### Option 1: Using VS Code Live Server / Python HTTP Server
```bash
# If Python 3 is installed:
cd e:/vscode/campusnotes/auth-system
python -m http.server 3000
# Open http://localhost:3000 in your browser
```

### Option 2: Using Node.js `npx serve` (if installed)
```bash
cd e:/vscode/campusnotes/auth-system
npx.cmd serve .
```

### Option 3: Direct Browser Access
Because JavaScript ES6 Modules (`import`/`export`) are used, modern browsers restrict local file `file://` module loading for CORS safety. Serving through any local web server (such as Python, Node, or VS Code Live Server extension) is recommended.

---

## 🧪 Step-by-Step Test Scenarios

### 1. Route Guard Test (Unauthorized Access)
1. Directly open `dashboard.html` in your browser.
2. **Expected Result**: You are immediately redirected to `login.html?redirect=unauthorized` and a warning banner appears: *"Please log in to access the protected dashboard."*

### 2. Form Validation & Password Requirements Test
1. Go to `register.html`.
2. Click **Register Account** with empty fields.
   - **Expected**: Error banner *"All fields are required"*.
3. Type username `john_doe` and a weak password `abc`.
   - **Expected**: Checklist shows `✗ At least 8 characters` and `✗ At least 1 number`.
4. Type `abcdefgh`.
   - **Expected**: `✓ At least 8 characters` turns green, while `✗ At least 1 number` remains red.
5. Type `abcdefg1`.
   - **Expected**: Both checklist items turn green with `✓`.

### 3. Duplicate User Test
1. Complete registration with `john_doe` and `secret123`.
2. Open `register.html` again and attempt to register another account with username `john_doe`.
   - **Expected**: Error banner *"An account with this username or email already exists."*

### 4. Non-Revealing Login Error Test
1. Go to `login.html`.
2. Enter an incorrect username or wrong password.
3. **Expected**: Generic message *"Invalid username/email or password. Please try again."* (Never reveals whether the username exists).

### 5. Successful Authentication & Dashboard Test
1. Enter valid credentials (`john_doe` / `secret123`).
2. **Expected**: Login success message, followed by automatic redirect to `dashboard.html`.
3. View the **Session & Account Details** card and the **Security Guarantee** card displaying the stored SHA-256 hexadecimal hash digest.

### 6. Logout Test
1. On `dashboard.html`, click **Logout**.
2. **Expected**: Session is cleared, user is redirected to `login.html?logout=true`.
3. Attempting to navigate back with the browser's Back button will redirect back to login.

---

## 🔒 Security Concepts & Session Architecture

### Client-Side (This Project) vs. Server-Side Sessions
- **Client-Side Hashing (This Project)**: Uses `crypto.subtle.digest('SHA-256')`. This demonstrates how modern browsers can perform cryptographic hashing without external libraries, ensuring passwords are never stored in plain text even in client storage.
- **Server-Side Production Authentication**:
  - In a full-stack architecture (e.g., Node.js + Express), passwords should be salted and hashed using **bcrypt** or **Argon2** on the server.
  - Sessions are managed using HTTP-only, secure, `SameSite` cookies storing a cryptographically signed session ID, preventing XSS-based session hijacking as documented in MDN's *"HTTP cookies and sessions"* guide.
