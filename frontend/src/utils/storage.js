const TOKEN_KEY = "rl_token";
const USER_KEY = "rl_user";

export const storage = {
  getToken: () => {
    // Check BOTH localStorage and sessionStorage
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token, remember = false) => {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
  },
  
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
  
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  
  setUser: (user, remember = false) => {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};