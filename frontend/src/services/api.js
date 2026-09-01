import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://final-cnc.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// AUTH ENDPOINTS
export const loginAdmin = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const getAdminMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// PUBLIC DESIGNS ENDPOINTS
export const fetchDesigns = async (params = {}) => {
  const response = await api.get("/designs", { params });
  return response.data;
};

export const fetchDesignById = async (id) => {
  const response = await api.get(`/designs/${id}`);
  return response.data;
};

// PUBLIC AI SEARCH ENDPOINTS
export const searchImageSimilarity = async (imageFile, category = "All") => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("category", category);

  const response = await api.post("/designs/search/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// PUBLIC CONTACT FORM
export const submitContactMessage = async (data) => {
  const response = await api.post("/contact", data);
  return response.data;
};

// ADMIN PROTECTED DESIGNS CMS ENDPOINTS
export const fetchAdminDesigns = async (params = {}) => {
  const response = await api.get("/designs/admin/list", { params });
  return response.data;
};

export const createAdminDesign = async (formData, onUploadProgress) => {
  const response = await api.post("/designs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

export const updateAdminDesign = async (id, formData, onUploadProgress) => {
  const response = await api.put(`/designs/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

export const deleteAdminDesign = async (id) => {
  const response = await api.delete(`/designs/${id}`);
  return response.data;
};

export const regenerateDesignAI = async (id) => {
  const response = await api.post(`/designs/${id}/regenerate`);
  return response.data;
};

export const rebuildAllEmbeddings = async () => {
  const response = await api.post("/designs/search/reindex");
  return response.data;
};

// ADMIN PROTECTED CONTACT MESSAGES ENDPOINTS
export const fetchContactMessages = async () => {
  const response = await api.get("/contact");
  return response.data;
};

export const updateMessageStatus = async (id, status) => {
  const response = await api.put(`/contact/${id}`, { status });
  return response.data;
};

export const deleteContactMessage = async (id) => {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
};

export default api;
export { API_BASE_URL };
