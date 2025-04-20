import Image from "next/image";
import Link from "next/link";

const Collection = () => {
  return (
    <section>
      <div className="mx-auto  lg:w-10/12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-3xl">
            New Collection
          </h2>

          <p className="mx-auto mt-4 max-w-md text-gray-500">
            For unique and stylish clothing, shoes and accessories in the
            collection you can select the best one for you.
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <li>
            <Link href={"/category/Men"} className="group relative block">
              <Image
                height={300}
                width={300}
                src="/images/models/man-fashion.jpg"
                alt=""
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
              />

              <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                <h3 className="text-xl font-medium text-white">
                  {"Man's Collection"}
                </h3>

                <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white rounded">
                  Shop Now
                </span>
              </div>
            </Link>
          </li>

          <li>
            <Link href={"/category/Kids"} className="group relative block">
              <Image
                height={300}
                width={300}
                src="/images/models/kids-fashion.jpg"
                alt=""
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
              />

              <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                <h3 className="text-xl font-medium text-white">
                  {"Kids Collection"}
                </h3>

                <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white rounded">
                  Shop Now
                </span>
              </div>
            </Link>
          </li>

          <li className="lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Link href={"/category/Women"} className="group relative block">
              <Image
                height={300}
                width={500}
                src="/images/models/woman-fashion.jpg"
                alt=""
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
              />

              <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                <h3 className="text-xl font-medium text-black">
                  {"Women's Collection"}
                </h3>

                <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white rounded">
                  Shop Now
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Collection;
