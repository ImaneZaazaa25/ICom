import React, { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfil, updateProfil } from "../../api/userApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import useAuth from "../../hooks/useAuth";
import "./Profile.css";

const initialState = { profil: null, loading: true, error: null };

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":   return { profil: null,           loading: true,  error: null };
    case "FETCH_SUCCESS": return { profil: action.payload, loading: false, error: null };
    case "FETCH_ERROR":   return { profil: null,           loading: false, error: action.payload };
    case "UPDATE":        return { ...state, profil: action.payload };
    default: return state;
  }
};

const ROLE_LABELS   = { User: "Client", Admin: "Administrateur" };
const STATUS_LABELS = { ACTIVE: "Actif", INACTIVE: "Inactif" };

const emptyForm = { nom: "", prenom: "", email: "", tel: "", motdepasse: "", confirmMotdepasse: "" };

const Profile = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [editMode,     setEditMode]     = useState(false);
  const [form,         setForm]         = useState(emptyForm);
  const [saveLoading,  setSaveLoading]  = useState(false);
  const [saveError,    setSaveError]    = useState(null);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [clientError,  setClientError]  = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch({ type: "FETCH_START" });
    getProfil()
      .then((data) => dispatch({ type: "FETCH_SUCCESS", payload: data }))
      .catch((err)  => dispatch({ type: "FETCH_ERROR",  payload: err  }));
  }, [user]);

  const openEdit = () => {
    const p = state.profil;
    setForm({
      nom:               p.nom    ?? "",
      prenom:            p.prenom ?? "",
      email:             p.email  ?? "",
      tel:               p.tel    ?? "",
      motdepasse:        "",
      confirmMotdepasse: "",
    });
    setSaveError(null);
    setSaveSuccess(false);
    setClientError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setSaveError(null);
    setClientError(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setClientError(null);
    setSaveSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side guards matching backend constraints
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setClientError("Format d'email invalide.");
      return;
    }
    if (form.motdepasse && form.motdepasse.length < 6) {
      setClientError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (form.motdepasse && form.motdepasse !== form.confirmMotdepasse) {
      setClientError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Build partial DTO — only send non-empty fields
    const dto = {};
    if (form.nom.trim())        dto.nom        = form.nom.trim();
    if (form.prenom.trim())     dto.prenom     = form.prenom.trim();
    if (form.email.trim())      dto.email      = form.email.trim();
    if (form.tel.trim())        dto.tel        = form.tel.trim();
    if (form.motdepasse.trim()) dto.motdepasse = form.motdepasse;

    setSaveError(null);
    setSaveLoading(true);
    try {
      const updated = await updateProfil(dto);
      dispatch({ type: "UPDATE", payload: updated });
      setSaveSuccess(true);
      setEditMode(false);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || err.message || "Erreur lors de la mise à jour"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user)         return null;
  if (state.loading) return <Loader />;
  if (state.error)
    return (
      <ErrorMessage
        message={
          state.error.response?.data?.message ||
          state.error.message ||
          "Erreur lors du chargement du profil"
        }
      />
    );

  const p = state.profil;

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">{(p.prenom?.[0] ?? p.username?.[0] ?? "?").toUpperCase()}</div>
          <div>
            <h1 className="profile-name">{p.prenom} {p.nom}</h1>
            <p className="profile-username">@{p.username}</p>
          </div>
        </div>

        {saveSuccess && !editMode && (
          <p className="profile-success">Profil mis à jour avec succès.</p>
        )}

        {/* View mode */}
        {!editMode && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Mes informations</h2>
              <button className="profile-btn-edit" onClick={openEdit}>
                Modifier
              </button>
            </div>

            <dl className="profile-fields">
              <div className="profile-field">
                <dt>Prénom</dt>
                <dd>{p.prenom || <span className="profile-empty">—</span>}</dd>
              </div>
              <div className="profile-field">
                <dt>Nom</dt>
                <dd>{p.nom || <span className="profile-empty">—</span>}</dd>
              </div>
              <div className="profile-field">
                <dt>Nom d'utilisateur</dt>
                <dd>{p.username}</dd>
              </div>
              <div className="profile-field">
                <dt>Email</dt>
                <dd>{p.email || <span className="profile-empty">—</span>}</dd>
              </div>
              <div className="profile-field">
                <dt>Téléphone</dt>
                <dd>{p.tel || <span className="profile-empty">—</span>}</dd>
              </div>
              <div className="profile-field">
                <dt>Rôle</dt>
                <dd>
                  <span className={`profile-badge profile-badge-role`}>
                    {ROLE_LABELS[p.role] ?? p.role}
                  </span>
                </dd>
              </div>
              <div className="profile-field">
                <dt>Statut</dt>
                <dd>
                  <span className={`profile-badge profile-badge-status-${p.status?.toLowerCase()}`}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Edit mode */}
        {editMode && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Modifier mon profil</h2>
            </div>

            {clientError && <ErrorMessage message={clientError} />}
            {saveError   && <ErrorMessage message={saveError}   />}

            <form className="profile-form" onSubmit={handleSubmit} noValidate>
              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label htmlFor="prenom">Prénom</label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="profile-form-field">
                  <label htmlFor="nom">Nom</label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="profile-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="profile-form-field">
                <label htmlFor="tel">Téléphone</label>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  value={form.tel}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div className="profile-form-divider">
                <span>Changer le mot de passe</span>
                <p className="profile-form-hint">Laissez vide pour conserver le mot de passe actuel</p>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label htmlFor="motdepasse">Nouveau mot de passe</label>
                  <input
                    id="motdepasse"
                    name="motdepasse"
                    type="password"
                    value={form.motdepasse}
                    onChange={handleChange}
                    placeholder="6 caractères minimum"
                    autoComplete="new-password"
                  />
                </div>
                <div className="profile-form-field">
                  <label htmlFor="confirmMotdepasse">Confirmer le mot de passe</label>
                  <input
                    id="confirmMotdepasse"
                    name="confirmMotdepasse"
                    type="password"
                    value={form.confirmMotdepasse}
                    onChange={handleChange}
                    placeholder="Répéter le mot de passe"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="profile-form-note">
                <span>Nom d'utilisateur</span>
                <strong>@{p.username}</strong>
                <span className="profile-form-hint">— non modifiable</span>
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="profile-btn-save" disabled={saveLoading}>
                  {saveLoading ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button
                  type="button"
                  className="profile-btn-cancel"
                  onClick={cancelEdit}
                  disabled={saveLoading}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
