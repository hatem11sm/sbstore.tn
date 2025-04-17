import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { bannerImages } from "./content/bannerImages";
const HeroBanner = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const column1 = bannerImages.filter((img) => img.column === 1);
  const column2 = bannerImages.filter((img) => img.column === 2);
  const column3 = bannerImages.filter((img) => img.column === 3);

  return (
    <section className="p-2 bg-white" aria-labelledby="hero-heading">
      <div className="relative overflow-hidden">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1
                id="hero-heading"
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl animate-fade-in"
              >
                Summer styles are finally here
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                This year, our new summer collection will shelter you from the
                harsh elements of a world that doesn&apos;t care if you live or
                die.
              </p>

              {/* Mobile CTA - visible on small screens */}
              <div className="mt-6 block sm:hidden">
                <Link
                  href="/products"
                  className="w-full inline-block rounded-md border border-transparent bg-[#2a2e33] px-8 py-3 text-center font-medium text-white hover:bg-[#12171d] transition-colors duration-300"
                  aria-label="Shop our summer collection"
                >
                  Shop Collection
                </Link>
              </div>
            </div>

            <div>
              <div className="mt-10">
                {/* Decorative image grid */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl transition-opacity duration-700 ${
                    isLoading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="absolute transform sm:left-1/2 sm:top-0 sm:translate-x-8 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      {/* Column 1 */}
                      <div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        {column1.map((image) => (
                          <div
                            key={image.id}
                            className={`h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100 shadow-md transition-transform duration-500 hover:scale-105`}
                          >
                            <Image
                              width={300}
                              height={300}
                              src={image.src}
                              alt={image.alt}
                              className="h-full w-full object-cover object-center"
                              priority={image.id === 1}
                              loading={image.id === 1 ? "eager" : "lazy"}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Column 2 */}
                      <div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        {column2.map((image) => (
                          <div
                            key={image.id}
                            className="h-64 w-44 overflow-hidden rounded-lg shadow-md transition-transform duration-500 hover:scale-105"
                          >
                            <Image
                              width={300}
                              height={300}
                              src={image.src}
                              alt={image.alt}
                              className="h-full w-full object-cover object-center"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Column 3 */}
                      <div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        {column3.map((image) => (
                          <div
                            key={image.id}
                            className="h-64 w-44 overflow-hidden rounded-lg shadow-md transition-transform duration-500 hover:scale-105"
                          >
                            <Image
                              width={300}
                              height={300}
                              src={image.src}
                              alt={image.alt}
                              className="h-full w-full object-cover object-center"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop CTA - hidden on small screens, visible on larger screens */}
                <div className="hidden sm:block">
                  <Link
                    href="/products"
                    className="inline-block rounded-md border border-transparent bg-[#2a2e33] px-8 py-3 text-center font-medium text-white hover:bg-[#12171d] transition-colors duration-300"
                    aria-label="Shop our summer collection"
                  >
                    Shop Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
