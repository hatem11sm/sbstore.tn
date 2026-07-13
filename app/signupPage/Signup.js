"use client";
import { Context } from "@/Context/Context";
import Loader from "@/components/Loader";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

const Signup = () => {
  const { signup, setSignUp, handleSignUpSubmit, loading, error, message } =
    useContext(Context);

  const handleChange = (e) => {
    setSignUp({ ...signup, [e.target.name]: e.target.value });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <main className="mx-auto w-full max-w-lg border border-black/10 bg-white p-6 sm:p-8">
          <Link className="inline-flex text-3xl font-semibold text-black" href="/">
            SB Store
          </Link>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.28em] text-black/45">
            Nouveau compte
          </p>
          <h1 className="mt-3 text-4xl font-semibold uppercase leading-none text-black sm:text-5xl">
            Rejoindre SB Store
          </h1>
          <p className="mt-3 leading-6 text-gray-600">
            Créez un compte pour sauvegarder votre panier, commander plus
            vite et retrouver vos informations.
          </p>

          {error && (
            <div
              className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              <span className="font-semibold">Erreur d’inscription :</span>{" "}
              {message}
            </div>
          )}

          <form onSubmit={handleSignUpSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="FirstName" className="text-xs font-medium uppercase tracking-[0.16em] text-black">
                Nom complet
              </label>
              <input
                type="text"
                id="FirstName"
                name="name"
                required
                value={signup.name}
                onChange={handleChange}
                placeholder="Votre nom"
                className="mt-2 w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="Email" className="text-xs font-medium uppercase tracking-[0.16em] text-black">
                Email
              </label>
              <input
                type="email"
                id="Email"
                name="email"
                required
                value={signup.email}
                onChange={handleChange}
                placeholder="test@gmail.com"
                className="mt-2 w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="Password" className="text-xs font-medium uppercase tracking-[0.16em] text-black">
                Mot de passe
              </label>
              <input
                type="password"
                id="Password"
                name="password"
                required
                value={signup.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
                className="mt-2 w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <label htmlFor="MarketingAccept" className="flex gap-3 border border-black/10 bg-white p-4">
              <input
                type="checkbox"
                id="MarketingAccept"
                name="marketing_accept"
                className="mt-0.5 h-5 w-5 border-black/10 bg-white"
              />
              <span className="text-sm leading-6 text-gray-700">
                Je souhaite recevoir les nouveautés, offres et actualités de
                SB Store. Vous pouvez commander sans cocher cette option.
              </span>
            </label>

            <button
              className="inline-flex w-full items-center justify-center bg-black px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700"
              type="submit"
            >
              {loading ? <Loader /> : "Créer mon compte"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Vous avez déjà un compte ?
              <Link href="/loginpage" className="mx-1 font-medium text-black underline">
                Se connecter
              </Link>
            </p>
          </form>
        </main>

        <aside className="relative hidden min-h-[620px] overflow-hidden bg-black lg:block">
          <Image
            alt="Fashion store editorial"
            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?auto=format&fit=crop&w=1200&q=80"
            className="object-cover opacity-90"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Nouvelle saison
            </p>
            <h2 className="mt-3 text-4xl font-black">
              Construisez votre garde-robe avec des essentiels sélectionnés.
            </h2>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Signup;
