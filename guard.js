/**
 * Route Guard & Dashboard Controller
 * Enforces session authentication for protected views and handles user logout.
 */

import { StorageService } from './storage.js';

// Immediate Guard Check: Run before rendering any content
(function enforceRouteGuard() {
  const session = StorageService.getCurrentSession();
  if (!session) {
    // Redirect to login page immediately
    window.location.replace('login.html?redirect=unauthorized');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const session = StorageService.getCurrentSession();
  if (!session) {
    window.location.replace('login.html?redirect=unauthorized');
    return;
  }

  // Populate Dashboard UI elements
  populateDashboard(session);

  // Setup Logout action
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  // Setup sample action to clear all demo data if desired
  const clearDbBtn = document.getElementById('clearDbBtn');
  if (clearDbBtn) {
    clearDbBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all registered users and session data?')) {
        localStorage.clear();
        window.location.replace('login.html');
      }
    });
  }
});

/**
 * Fills in the dashboard with authenticated user details.
 */
function populateDashboard(session) {
  const userGreeting = document.getElementById('userGreeting');
  const userBadgeName = document.getElementById('userBadgeName');
  const displayUsername = document.getElementById('displayUsername');
  const displayEmail = document.getElementById('displayEmail');
  const displayLoginTime = document.getElementById('displayLoginTime');
  const displayUserId = document.getElementById('displayUserId');
  const displayHash = document.getElementById('displayHash');
  const displayRegisteredCount = document.getElementById('displayRegisteredCount');

  if (userGreeting) userGreeting.textContent = session.username;
  if (userBadgeName) userBadgeName.textContent = session.username;
  if (displayUsername) displayUsername.textContent = session.username;
  if (displayEmail) displayEmail.textContent = session.email;
  if (displayUserId) displayUserId.textContent = session.userId;

  if (displayLoginTime) {
    const date = new Date(session.loginTimestamp);
    displayLoginTime.textContent = date.toLocaleString();
  }

  // Retrieve user record to display stored hash for security demonstration
  const userRecord = StorageService.findUser(session.username);
  if (userRecord && displayHash) {
    displayHash.textContent = userRecord.passwordHash;
  }

  if (displayRegisteredCount) {
    const allUsers = StorageService.getUsers();
    displayRegisteredCount.textContent = allUsers.length.toString();
  }
}

/**
 * Handles clearing the session and redirecting to the login page.
 */
function handleLogout() {
  StorageService.clearSession();
  window.location.replace('login.html?logout=true');
}
