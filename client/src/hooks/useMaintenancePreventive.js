import { useEffect, useState } from "react";
import {
  getAllMP,
  createMP,
  updateMP,
  deleteMP,
  markAsDone,
  getMP,
} from "../api/maintenancePreventiveApi";

export default function useMaintenancePreventive() {
  const [mps, setMps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMP = async () => {
    const res = await getAllMP();
    setMps(res.data);
    setLoading(false);
  };

  const addMP = async (data) => {
    await createMP(data);
    await fetchMP();
  };

  const editMP = async (id, data) => {
    await updateMP(id, data);
    await fetchMP();
  };

  const removeMP = async (id) => {
    await deleteMP(id);
    await fetchMP();
  };

  const done = async (id, data) => {
    await markAsDone(id, data);
    await fetchMP();
  };

  return { mps, loading, fetchMP, addMP, editMP, removeMP, done };
}
