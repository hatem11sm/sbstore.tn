"use client";
import { Context } from "@/Context/Context";
import Loader from "@/components/Loader";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

const Login = () => {
  const { loading, error, message, login, setLogin, handleLoginSubmit } =
    useContext(Context);

  const handleChange = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-black lg:block">
          <Image
            fill
            alt="Fashion editorial"
            src="https://images.unsplash.com/photo-1630450202872-e0829c9d6172?auto=format&fit=crop&w=1200&q=80"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              SB Store
            </p>
            <h1 className="mt-3 text-4xl font-black">
              Retrouvez votre panier, vos commandes et les nouveautés.
            </h1>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md border border-black/10 bg-white p-6 sm:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
              Bon retour
            </p>
            <h2 className="mt-3 text-4xl font-semibold uppercase leading-none text-black">
              Connexion SB Store
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Connectez-vous pour continuer vos achats, gérer votre panier et
              suivre vos commandes.
            </p>
          </div>

          {error && (
            <div
              className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              <span className="font-semibold">Erreur de connexion :</span>{" "}
              {message}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-[0.16em] text-black"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="mt-2 w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="test@gmail.com"
                required
                name="email"
                value={login.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-[0.16em] text-black"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="mt-2 w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="Entrez votre mot de passe"
                required
                name="password"
                value={login.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center bg-black px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700"
            >
              {loading ? <Loader /> : "Se connecter"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Pas encore de compte ?
              <Link
                className="mx-1 font-medium text-black underline"
                href="/signupPage"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
