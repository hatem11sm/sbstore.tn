"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = {
  code: "",
  label: "",
  type: "percent",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const PromosPage = () => {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState("");

  const activeCount = useMemo(
    () => promos.filter((promo) => promo.isActive).length,
    [promos]
  );

  const fetchPromos = async () => {
    try {
      const response = await axios.get("/api/promos");
      setPromos(response.data.data || []);
    } catch (error) {
      toast.error("Impossible de charger les codes promo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
      };

      if (editingId) {
        await axios.put(`/api/promos/${editingId}`, payload);
        toast.success("Code promo mis à jour");
      } else {
        await axios.post("/api/promos", payload);
        toast.success("Code promo créé");
      }

      resetForm();
      fetchPromos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo._id);
    setForm({
      code: promo.code || "",
      label: promo.label || "",
      type: promo.type || "percent",
      value: promo.value ?? "",
      minOrderAmount: promo.minOrderAmount ?? "",
      maxDiscount: promo.maxDiscount ?? "",
      usageLimit: promo.usageLimit ?? "",
      startsAt: formatDateInput(promo.startsAt),
      endsAt: formatDateInput(promo.endsAt),
      isActive: Boolean(promo.isActive),
    });
  };

  const handleToggle = async (promo) => {
    try {
      await axios.put(`/api/promos/${promo._id}`, {
        ...promo,
        startsAt: promo.startsAt ? formatDateInput(promo.startsAt) : "",
        endsAt: promo.endsAt ? formatDateInput(promo.endsAt) : "",
        isActive: !promo.isActive,
      });
      toast.success("Statut promo mis à jour");
      fetchPromos();
    } catch (error) {
      toast.error("Impossible de changer le statut");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/promos/${id}`);
      toast.success("Code promo supprimé");
      if (editingId === id) resetForm();
      fetchPromos();
    } catch (error) {
      toast.error("Impossible de supprimer ce code");
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Promotions
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Codes promo
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Crée des remises gérées côté serveur pour le checkout. Les validations
              passent par l’API, donc les montants restent fiables.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {promos.length}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                Actifs
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">
                {activeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr,1.6fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Modifier le code" : "Créer un code promo"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Annuler
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Code</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="BIENVENUE10"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Libellé</span>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Bienvenue 10%"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="percent">Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Valeur</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Commande min.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({ ...form, minOrderAmount: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Remise max.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Optionnel"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Limite d’utilisation</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Optionnel"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Début</span>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Fin</span>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Code actif dès maintenant
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSaving
                ? "Enregistrement..."
                : editingId
                ? "Mettre à jour le code"
                : "Créer le code promo"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Liste des codes promo
            </h2>
            <p className="text-sm text-slate-500">
              {isLoading ? "Chargement..." : `${promos.length} code(s)`}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {promos.map((promo) => (
              <article
                key={promo._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {promo.code}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          promo.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {promo.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{promo.label}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>
                        {promo.type === "percent"
                          ? `${promo.value}%`
                          : `${promo.value} Dt`}
                      </span>
                      <span>Min: {Number(promo.minOrderAmount || 0).toFixed(2)} Dt</span>
                      <span>Utilisé: {promo.usedCount || 0}</span>
                      <span>
                        Limite: {promo.usageLimit == null ? "Illimitée" : promo.usageLimit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(promo)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      {promo.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(promo)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(promo._id)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {!isLoading && promos.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
                Aucun code promo pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromosPage;
