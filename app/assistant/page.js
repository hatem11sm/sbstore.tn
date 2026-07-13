"use client";

import { ProductContext } from "@/Context/CreateProduct";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  startTransition,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  BsArrowRight,
  BsCheck2Circle,
  BsLightningCharge,
  BsSearch,
  BsStars,
} from "react-icons/bs";

const prompts = [
  "Je cherche un cadeau pour ma soeur avec 100 DT, style elegant",
  "Compare les meilleurs sacs femme moins de 150 DT",
  "Je veux un produit premium disponible rapidement",
  "Trouve une montre homme fiable avec bon prix",
];

const stopWords = new Set([
  "avec",
  "pour",
  "dans",
  "moins",
  "plus",
  "entre",
  "cherche",
  "trouve",
  "montre",
  "veux",
  "besoin",
  "produit",
  "produits",
  "dt",
  "dinar",
  "dinars",
  "svp",
]);

const intentRules = [
  {
    key: "gift",
    label: "cadeau",
    words: ["cadeau", "anniversaire", "mariage", "surprise", "offrir", "coffret"],
  },
  {
    key: "compare",
    label: "comparaison",
    words: ["compare", "comparaison", "mieux", "meilleur", "choisir", "difference"],
  },
  {
    key: "deal",
    label: "bon prix",
    words: ["prix", "pas cher", "moins", "budget", "promo", "offre"],
  },
  {
    key: "premium",
    label: "premium",
    words: ["premium", "luxe", "elegant", "qualite", "chic", "haut"],
  },
  {
    key: "fast",
    label: "rapide",
    words: ["rapide", "demain", "urgent", "livraison", "disponible"],
  },
];

const styleRules = [
  { key: "elegant", label: "Elegant", words: ["elegant", "chic", "classe", "luxe"] },
  { key: "urban", label: "Urbain", words: ["urbain", "street", "casual", "sport"] },
  { key: "minimal", label: "Minimal", words: ["simple", "minimal", "sobre", "classic"] },
  { key: "bold", label: "Fort", words: ["original", "unique", "tendance", "moderne"] },
];

const audienceRules = [
  { key: "woman", label: "Femme", words: ["femme", "soeur", "mere", "maman", "fiancee", "fille"] },
  { key: "man", label: "Homme", words: ["homme", "pere", "papa", "frere", "mari", "garcon"] },
  { key: "kids", label: "Enfant", words: ["enfant", "kids", "bebe", "fille", "garcon"] },
];

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const moneyValue = (value) => Number(String(value || "").replace(",", "."));

const extractBudget = (query) => {
  const normalized = normalizeText(query);
  const range = normalized.match(/entre\s+(\d+(?:[.,]\d+)?)\s*(?:dt|dinar|dinars)?\s*(?:et|-)\s*(\d+(?:[.,]\d+)?)/);
  if (range) {
    return { min: moneyValue(range[1]), max: moneyValue(range[2]), label: `${range[1]}-${range[2]} DT` };
  }

  const max = normalized.match(/(?:moins de|maximum|max|budget|avec)\s*(\d+(?:[.,]\d+)?)\s*(?:dt|dinar|dinars)?/);
  if (max) {
    return { min: null, max: moneyValue(max[1]), label: `${max[1]} DT max` };
  }

  const any = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:dt|dinar|dinars)/);
  return any ? { min: null, max: moneyValue(any[1]), label: `${any[1]} DT max` } : null;
};

const findRule = (rules, query) =>
  rules.find((rule) => rule.words.some((word) => normalizeText(query).includes(word)));

const getTokens = (query) =>
  normalizeText(query)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));

const detectVendor = (query, vendors = []) => {
  const normalized = normalizeText(query);
  return vendors.find((vendor) => normalized.includes(normalizeText(vendor.name)));
};

const detectCategory = (query, products = []) => {
  const normalized = normalizeText(query);
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  return categories.find((category) => normalized.includes(normalizeText(category)));
};

const buildAgentProfile = ({ query, products, vendors }) => {
  const budget = extractBudget(query);
  const intent = findRule(intentRules, query) || intentRules[1];
  const style = findRule(styleRules, query);
  const audience = findRule(audienceRules, query);
  const vendor = detectVendor(query, vendors);
  const category = detectCategory(query, products);
  const tokens = getTokens(query);

  return {
    budget,
    intent,
    style,
    audience,
    vendor,
    category,
    tokens,
  };
};

const scoreProduct = (product, profile) => {
  let score = 0;
  const reasons = [];
  const searchable = normalizeText(
    [
      product.name,
      product.description,
      product.category,
      product.subcategory,
      product.vendorName,
      product.vendorId?.name,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const price = Number(product.price || 0);

  profile.tokens.forEach((token) => {
    if (searchable.includes(token)) score += 3;
  });

  if (profile.budget?.max && price <= profile.budget.max) {
    score += 8;
    reasons.push("respecte le budget");
  }
  if (profile.budget?.max && price > profile.budget.max) {
    score -= Math.min(7, Math.ceil((price - profile.budget.max) / 20));
  }
  if (profile.budget?.min && price >= profile.budget.min) score += 2;

  if (profile.audience?.key && product.categoryCollectionGroup === profile.audience.key) {
    score += 7;
    reasons.push(`cible ${profile.audience.label.toLowerCase()}`);
  }

  if (profile.vendor && (product.vendorSlug === profile.vendor.slug || product.vendorId?._id === profile.vendor._id)) {
    score += 9;
    reasons.push("vendeur demande");
  }

  if (profile.category && normalizeText(product.category) === normalizeText(profile.category)) {
    score += 6;
    reasons.push("categorie exacte");
  }

  if (profile.intent?.key === "premium" && price >= 80) {
    score += 4;
    reasons.push("positionnement premium");
  }
  if (profile.intent?.key === "deal" && profile.budget?.max && price <= profile.budget.max * 0.82) {
    score += 4;
    reasons.push("marge budget restante");
  }
  if (profile.intent?.key === "gift" && /(coffret|parfum|bijou|montre|sac|lunette|accessoire)/i.test(searchable)) {
    score += 4;
    reasons.push("bon choix cadeau");
  }
  if (profile.style && profile.style.words.some((word) => searchable.includes(word))) {
    score += 3;
    reasons.push(`style ${profile.style.label.toLowerCase()}`);
  }

  if (!reasons.length && score > 0) {
    reasons.push("correspondance catalogue");
  }

  return {
    ...product,
    aiScore: Math.max(0, score),
    aiReasons: reasons.slice(0, 4),
    aiConfidence: score >= 18 ? "forte" : score >= 10 ? "moyenne" : "exploratoire",
  };
};

const buildAgentPlan = (profile, results) => {
  const best = results[0];
  const alternatives = results.slice(1, 4);
  const missing = [];

  if (!profile.budget) missing.push("budget");
  if (!profile.audience) missing.push("profil destinataire");
  if (!profile.style) missing.push("style prefere");

  return {
    diagnosis: best
      ? `Meilleure piste: ${best.name}, car ${best.aiReasons.join(", ")}.`
      : "Je n'ai pas assez de signaux pour recommander un produit precis.",
    nextAction: best
      ? "Ouvrir le meilleur produit puis comparer avec deux alternatives."
      : "Elargir la recherche ou supprimer une contrainte.",
    alternatives,
    missing,
  };
};

const AgentBadge = ({ children }) => (
  <span className="border border-black/10 bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-black/60">
    {children}
  </span>
);

const AssistantPageContent = () => {
  const { products, vendors } = useContext(ProductContext);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(prompts[0]);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [searchParams]);

  const agent = useMemo(() => {
    const productList = products?.data || [];
    const vendorList = vendors || [];
    const cleanQuery = deferredQuery.trim();

    if (!cleanQuery) {
      return {
        profile: null,
        results: [],
        plan: null,
        stats: { productCount: productList.length, vendorCount: vendorList.length },
      };
    }

    const profile = buildAgentProfile({
      query: cleanQuery,
      products: productList,
      vendors: vendorList,
    });

    const scored = productList
      .map((product) => scoreProduct(product, profile))
      .filter((product) => product.aiScore > 0)
      .sort((a, b) => b.aiScore - a.aiScore || Number(a.price || 0) - Number(b.price || 0))
      .slice(0, 8);

    return {
      profile,
      results: scored,
      plan: buildAgentPlan(profile, scored),
      stats: { productCount: productList.length, vendorCount: vendorList.length },
    };
  }, [deferredQuery, products, vendors]);

  const bestProduct = agent.results[0];
  const compareList = agent.results.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f4f1eb]">
      <section className="border-b border-black/10 bg-[#111315] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              <BsStars className="h-4 w-4" />
              SB AI Agent
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight md:text-5xl">
              Assistant avance pour chercher, comparer et guider l&apos;achat
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
              L&apos;agent transforme une demande naturelle en intention, filtres,
              recommandations, comparaison et actions de navigation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Catalogue</p>
              <p className="mt-2 text-3xl font-black">{agent.stats.productCount}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Vendeurs</p>
              <p className="mt-2 text-3xl font-black">{agent.stats.vendorCount}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Mode</p>
              <p className="mt-2 text-3xl font-black">Agent</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[420px,1fr] lg:px-8">
        <aside className="space-y-5">
          <div className="border border-black/10 bg-white p-5">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              <BsSearch className="h-4 w-4" />
              Demande acheteur
            </label>
            <textarea
              rows={6}
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setQuery(nextValue));
              }}
              className="mt-4 w-full resize-none border border-black/10 bg-[#f8f6f2] px-4 py-4 text-sm leading-6 outline-none transition focus:border-black"
              placeholder="Je cherche un cadeau pour ma soeur avec 100 DT..."
            />
            <div className="mt-4 grid gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => startTransition(() => setQuery(prompt))}
                  className="border border-black/10 px-3 py-3 text-left text-xs font-medium text-black/65 transition hover:border-black hover:bg-[#f8f6f2]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-black/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Analyse agent
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {agent.profile?.intent ? <AgentBadge>Intention: {agent.profile.intent.label}</AgentBadge> : null}
              {agent.profile?.budget ? <AgentBadge>Budget: {agent.profile.budget.label}</AgentBadge> : null}
              {agent.profile?.audience ? <AgentBadge>Cible: {agent.profile.audience.label}</AgentBadge> : null}
              {agent.profile?.style ? <AgentBadge>Style: {agent.profile.style.label}</AgentBadge> : null}
              {agent.profile?.category ? <AgentBadge>Categorie: {agent.profile.category}</AgentBadge> : null}
              {agent.profile?.vendor ? <AgentBadge>Vendeur: {agent.profile.vendor.name}</AgentBadge> : null}
              {!agent.profile ? <p className="text-sm text-black/55">Saisis une demande pour lancer l&apos;analyse.</p> : null}
            </div>
          </div>

          <div className="border border-black/10 bg-[#17191c] p-5 text-white">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              <BsLightningCharge className="h-4 w-4" />
              Plan d&apos;action
            </p>
            <p className="mt-4 text-sm leading-6 text-white/75">
              {agent.plan?.diagnosis || "L'agent attend une demande acheteur."}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              {agent.plan?.nextAction || "Les recommandations apparaitront automatiquement."}
            </p>
            {agent.plan?.missing?.length ? (
              <div className="mt-5 border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Questions utiles
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/75">
                  {agent.plan.missing.map((item) => (
                    <p key={item}>- Preciser le {item}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="space-y-6">
          {bestProduct ? (
            <section className="grid gap-5 border border-black/10 bg-white p-5 md:grid-cols-[220px,1fr]">
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <Image
                  fill
                  src={withCloudinaryProxy(bestProduct.mainImage)}
                  alt={bestProduct.name}
                  sizes="220px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    Meilleure recommandation
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-[#17191c]">
                    {bestProduct.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-black/60">
                    {bestProduct.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AgentBadge>Score {bestProduct.aiScore}</AgentBadge>
                    <AgentBadge>Confiance {bestProduct.aiConfidence}</AgentBadge>
                    <AgentBadge>
                      {bestProduct.hidePrice ? "Prix sur demande" : `${Number(bestProduct.price || 0).toFixed(2)} DT`}
                    </AgentBadge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/products/${bestProduct._id}`}
                    className="inline-flex items-center gap-2 bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
                  >
                    Voir produit <BsArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/products?vendor=${bestProduct.vendorSlug || "sb-store"}`}
                    className="inline-flex items-center gap-2 border border-black/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:border-black"
                  >
                    Voir vendeur
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            <section className="border border-dashed border-black/20 bg-white p-10 text-center">
              <p className="text-lg font-bold text-black">Aucune recommandation fiable</p>
              <p className="mt-2 text-sm text-black/55">
                Ajoute un budget, une categorie ou un style pour guider l&apos;agent.
              </p>
            </section>
          )}

          {compareList.length ? (
            <section className="border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    Comparaison intelligente
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#17191c]">
                    Top choix selon la demande
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50 transition hover:text-black"
                >
                  Catalogue complet
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {compareList.map((product, index) => (
                  <article key={product._id} className="border border-black/10 bg-[#f8f6f2] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-8 w-8 items-center justify-center bg-black text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-black/55">
                        {product.hidePrice ? "Sur demande" : `${Number(product.price || 0).toFixed(0)} DT`}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black text-[#17191c]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-black/45">
                      {product.vendorName || product.vendorId?.name || "SB Store"}
                    </p>
                    <div className="mt-4 space-y-2">
                      {product.aiReasons.map((reason) => (
                        <p key={`${product._id}-${reason}`} className="flex gap-2 text-sm text-black/65">
                          <BsCheck2Circle className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                          {reason}
                        </p>
                      ))}
                    </div>
                    <Link
                      href={`/products/${product._id}`}
                      className="mt-5 inline-flex w-full items-center justify-center border border-black/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:border-black"
                    >
                      Ouvrir
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {agent.results.length > 3 ? (
            <section className="border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                Autres pistes
              </p>
              <div className="mt-4 grid gap-3">
                {agent.results.slice(3).map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="grid gap-3 border border-black/10 p-3 transition hover:border-black sm:grid-cols-[1fr,auto] sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-black">{product.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-black/45">
                        {product.aiReasons.join(" • ") || "suggestion catalogue"}
                      </p>
                    </div>
                    <span className="text-xs font-black text-black/55">
                      Score {product.aiScore}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
};

const AssistantPage = () => {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f4f1eb]" />}>
      <AssistantPageContent />
    </Suspense>
  );
};

export default AssistantPage;
