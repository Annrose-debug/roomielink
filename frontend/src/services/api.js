import axios from "axios";
import { storage } from "../utils/storage";

/* ── Axios instance ── */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 12000, // 12 second client-side timeout — shows error before server 15s timeout
});

/* ── Attach Bearer token to every request ── */
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

/* ── Global response interceptor ──
   Clears auth and redirects on 401 (expired/invalid token).
   This saves you from having to check 401 in every page.    */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      storage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ──────────────────────────────────────
   Auth
────────────────────────────────────── */
export const authAPI = {
  register:     (data)  => api.post("/auth/register", data),
  login:        (data)  => api.post("/auth/login",    data),
  getDashboard: ()      => api.get("/auth/dashboard"),
};

/* ──────────────────────────────────────
   Users / Profile
────────────────────────────────────── */
export const userAPI = {
  getProfile:       ()       => api.get("/users/profile"),
  getPublicProfile: (uid)    => api.get(`/users/profile/${uid}`),
  updateProfile:    (data)   => api.put("/users/profile", data),
  uploadProfilePic: (form)   => api.post("/users/profile/picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getPreferences:   ()       => api.get("/users/preferences"),
  updatePreferences:(data)   => api.put("/users/preferences", data),
  // Browse / search other users
  searchUsers: (params) => api.get("/users/search", { params }),
};

/* ──────────────────────────────────────
   Listings
────────────────────────────────────── */
export const listingAPI = {
  getAll:       (params) => api.get("/listings",         { params }),
  getOne:       (id)     => api.get(`/listings/${id}`),
  create:       (form)   => api.post("/listings", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update:       (id, data) => api.put(`/listings/${id}`, data),
  remove:       (id)     => api.delete(`/listings/${id}`),
  toggleSave:   (id)     => api.post(`/listings/${id}/save`),
  getSaved:     ()       => api.get("/listings/saved/mine"),
  getMine:      ()       => api.get("/listings/mine/all"),
};

/* ──────────────────────────────────────
   Messages
────────────────────────────────────── */
export const messageAPI = {
  getConversations:  ()         => api.get("/messages/conversations"),
  getConversation:   (userId)   => api.get(`/messages/conversation/${userId}`),
  send:              (data)     => api.post("/messages/send", data),
  getUnreadCount:    ()         => api.get("/messages/unread-count"),
};

/* ──────────────────────────────────────
   Matches
────────────────────────────────────── */
export const matchAPI = {
  getSuggestions: () => api.get("/matches/suggestions"),
  getMine:        () => api.get("/matches/mine"),
  like:   (userId) => api.post(`/matches/like/${userId}`),
  reject: (userId) => api.post(`/matches/reject/${userId}`),
};

/* ──────────────────────────────────────
   Contact form
────────────────────────────────────── */
export const contactAPI = {
  submit: (data) => api.post("/contact", data),
};

export default api;