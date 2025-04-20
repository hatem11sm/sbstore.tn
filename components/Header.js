"use client";
import Link from "next/link";
import { BsBag } from "react-icons/bs";
import Mobile from "./Mobile";
import { useContext, useEffect, useState } from "react";
import SideCart from "./SideCart";
import { Context } from "@/Context/Context";
import axios from "axios";
import Image from "next/image";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, handleLogout } = useContext(Context);
  const [categories, setCategories] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const name = user?.data?.name.replace(/ .*/, "");

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("/api/category");
      setCategories(res?.data?.data);
    };
    fetchCategories();
  }, []);
  return (
    <div className="w-full relative">
      <header className="bg-white ">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link className="block text-teal-600" href="/">
            <span className="sr-only">Home</span>
            <Image
              src={"/logo/logo-black.svg"}
              alt="Logo"
              width={100}
              height={100}
              className="h-20 w-auto"
            />
          </Link>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <Link
                    className="text-gray-800 transition hover:text-gray-800/75 "
                    href="/about"
                  >
                    About
                  </Link>
                </li>

                <li
                  className="relative"
                  onMouseEnter={() => setIsHovered(true)}
                >
                  <Link
                    href={"/category"}
                    className="text-gray-800 transition hover:text-gray-800/75 cursor-pointer "
                  >
                    Categories
                  </Link>

                  {isHovered && (
                    <ul
                      onMouseLeave={() => setIsHovered(false)}
                      className="absolute top-8 left-0 w-48 bg-white shadow-lg rounded-lg py-3 z-50"
                    >
                      {categories?.map((category) => (
                        <li key={category}>
                          <Link
                            href={`/category/${category}`}
                            className="block px-5 py-2.5 text-sm text-gray-800 transition hover:bg-gray-100"
                          >
                            {category}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                <li>
                  <Link
                    className="text-gray-800 transition hover:text-gray-800/75 "
                    href="/products"
                  >
                    Products
                  </Link>
                </li>

                <li>
                  <Link
                    className="text-gray-800 transition hover:text-gray-800/75 "
                    href="/contact"
                  >
                    Contact
                  </Link>
                </li>
                {user?.data?.isAdmin && (
                  <li>
                    <Link
                      className="text-gray-800 transition hover:text-gray-800/75"
                      href="/dashboard"
                      onClick={(e) => {
                        if (!user?.data?.isAdmin) {
                          e.preventDefault();
                          return;
                        }
                      }}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <span
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="text-gray-800 transition hover:text-gray-800/75 cursor-pointer"
              >
                <BsBag fontSize={19} />
              </span>
              {user?.data ? (
                <div className="sm:flex sm:gap-4">
                  <span className="hidden rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-[#2f4550] transition hover:text-[#2f4550]/75 sm:block">
                    {name}
                  </span>
                  <span
                    onClick={handleLogout}
                    className="hidden cursor-pointer md:block rounded-md bg-[#2f4550] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2930] "
                  >
                    Logout
                  </span>
                </div>
              ) : (
                <div className="sm:flex sm:gap-4">
                  <Link
                    href="/loginpage"
                    className="block rounded-md bg-[#2f4550] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2930] "
                  >
                    Login
                  </Link>

                  <Link
                    className="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-[#2f4550] transition hover:text-[#2f4550]/75 sm:block"
                    href="/signupPage"
                  >
                    Register
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75  md:hidden"
              >
                <span className="sr-only">Toggle menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      {isOpen && (
        <div
          className={`absolute left-0 top-0 w-52 md:hidden bg-white shadow-lg rounded-lg z-50`}
        >
          <Mobile setIsOpen={setIsOpen} categories={categories} />
        </div>
      )}
      {isCartOpen && (
        <SideCart setIsCartOpen={setIsCartOpen} isCartOpen={isCartOpen} />
      )}
    </div>
  );
};

export default Header;
