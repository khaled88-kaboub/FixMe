import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/maintenance-preventive"
});

export const getAllMP = () => API.get("/");
export const getMP = (id) => API.get(`/${id}`);
export const createMP = (data) => API.post("/", data);
export const updateMP = (id, data) => API.put(`/${id}`, data);
export const deleteMP = (id) => API.delete(`/${id}`);
export const markAsDone = (id, data) => API.post(`/${id}/done`, data);
