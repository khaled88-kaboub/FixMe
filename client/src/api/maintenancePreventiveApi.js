import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const API = axios.create({
  baseURL: `${API_URL}/api/maintenance-preventive`
});

export const getAllMP = () => API.get("/");
export const getMP = (id) => API.get(`/${id}`);
export const createMP = (data) => API.post("/", data);
export const updateMP = (id, data) => API.put(`/${id}`, data);
export const deleteMP = (id) => API.delete(`/${id}`);
export const markAsDone = (id, data) => API.post(`/${id}/done`, data);
