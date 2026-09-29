/**
 * Storage Abstraction Module
 * Manages user accounts and active session persistence via browser localStorage.
 */

const USERS_STORAGE_KEY = 'auth_users_db_v1';
const SESSION_STORAGE_KEY = 'auth_active_session_v1';

export const StorageService = {
  /**
   * Retrieves all registered users from localStorage.
   * @returns {Array<Object>} List of registered user records.
   */
  getUsers() {
    try {
      const rawData = localStorage.getItem(USERS_STORAGE_KEY);
      return rawData ? JSON.parse(rawData) : [];
    } catch (err) {
      console.error('Error reading users from storage:', err);
      return [];
    }
  },

  /**
   * Finds a user matching the given username or email (case-insensitive).
   * @param {string} identifier - The username or email entered by the user.
   * @returns {Object|null} The matched user object or null.
   */
  findUser(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => 
      u.username.toLowerCase() === cleanId || 
      (u.email && u.email.toLowerCase() === cleanId)
    ) || null;
  },

  /**
   * Registers and saves a new user record into storage.
   * @param {Object} userData - User details including username, email, and passwordHash.
   * @returns {Object} The saved user object without sensitive secrets.
   */
  saveUser({ username, email, passwordHash }) {
    const users = this.getUsers();
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      username: username.trim(),
      email: (email || username).trim(),
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  /**
   * Starts a new user session by persisting session data.
   * @param {Object} user - The authenticated user record.
   */
  createSession(user) {
    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      loginTimestamp: new Date().toISOString(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  },

  /**
   * Retrieves current active session if valid.
   * @returns {Object|null} Active session details or null if expired / non-existent.
   */
  getCurrentSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw);
      // Check expiration
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      return session;
    } catch (err) {
      console.error('Error parsing session data:', err);
      this.clearSession();
      return null;
    }
  },

  /**
   * Checks if a user is currently logged in.
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.getCurrentSession() !== null;
  },

  /**
   * Clears the current active session (Logout).
   */
  clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};
