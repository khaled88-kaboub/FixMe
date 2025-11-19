import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagementPage.css";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "demandeur",
    password: ""
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://fixme-1.onrender.com/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(
          `https://fixme-1.onrender.com/api/users/${editingUser._id}`,
          formData
        );
        alert("✅ Utilisateur mis à jour !");
      } else {
        await axios.post("https://fixme-1.onrender.com/api/users", formData);
        alert("✅ Nouvel utilisateur ajouté !");
      }
      setFormData({ name: "", email: "", role: "demandeur", password: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Erreur :", err.response?.data || err);
      alert("❌ Erreur lors de l'enregistrement !");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ""
    });
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://fixme-1.onrender.com/api/users/${userToDelete._id}`);
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      closeDeleteModal();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <div className="user-container">
      <h2 className="title">👥 Gestion des Utilisateurs</h2>

      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          name="name"
          placeholder="Nom complet"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {!editingUser && (
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
        )}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="admin">Admin</option>
          <option value="production">Production</option>
          <option value="maintenance">Maintenance</option>
          <option value="methode">Methode</option>
        </select>

        <button type="submit" className="btn-submit">
          {editingUser ? "💾 Mettre à jour" : "➕ Ajouter"}
        </button>
        {editingUser && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setEditingUser(null);
              setFormData({
                name: "",
                email: "",
                role: "demandeur",
                password: ""
              });
            }}
          >
            ❌ Annuler
          </button>
        )}
      </form>

      <h3 className="subtitle">📋 Liste des utilisateurs</h3>

      <table className="user-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Date création</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className={`role-${u.role}`}>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(u)}
                    title="Modifier"
                  >
                    Mettre a jour
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => openDeleteModal(u)}
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()} // empêche fermeture si on clique à l'intérieur
          >
            <h3>⚠️ Confirmation</h3>
            <p>
              Voulez-vous vraiment supprimer l’utilisateur{" "}
              <strong>{userToDelete?.name}</strong> ?
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Annuler
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
