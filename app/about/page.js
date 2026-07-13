import Link from "next/link";

const pillars = [
  {
    title: "Pour les clients",
    text: "Un seul catalogue pour découvrir plusieurs boutiques tunisiennes, comparer les styles et commander plus facilement.",
  },
  {
    title: "Pour les boutiques",
    text: "Chaque vendeur garde son identité avec une vitrine, un slogan, une couleur, des produits et des informations pratiques.",
  },
  {
    title: "Pour la plateforme",
    text: "SB Store relie produits, boutiques, recherche, comparaison et assistant AI dans une experience e-commerce unifiee.",
  },
];

const page = () => {
  return (
    <main className="bg-white text-[#16181b]">
      <section className="border-b border-black/10 bg-[#f7f4ef] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            A propos de SB Store
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Une plateforme multi-boutiques pour vendre et acheter en Tunisie
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600">
            SB Store n&apos;est pas une seule boutique. C&apos;est une
            marketplace tunisienne qui rassemble plusieurs vendeurs dans un
            meme espace, avec des vitrines separees et un catalogue commun.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/boutiques"
              className="inline-flex items-center justify-center bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
            >
              Voir les boutiques
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center border border-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-white"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="border border-black/10 p-6">
              <h2 className="text-xl font-bold">{pillar.title}</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                {pillar.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#16181b] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
              Le concept
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Plusieurs boutiques, une seule experience simple
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Boutiques partenaires avec leurs propres vitrines",
              "Produits classes par categorie, style et vendeur",
              "Comparaison et signaux de confiance pour aider le client",
              "Assistant AI pour chercher par budget, besoin ou boutique",
            ].map((item) => (
              <p
                key={item}
                className="border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/72"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
