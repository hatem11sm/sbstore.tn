"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import TableSkeleton from "../TableSkeleton";
import { AdminContext } from "@/Context/AdminProvider";
import { useContext } from "react";

const Products = () => {
  const { totalProduct } = useContext(AdminContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (totalProduct !== undefined) {
      setIsLoading(false);
    }
  }, [totalProduct]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = totalProduct?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil((totalProduct?.length || 0) / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="w-full p-2 m-2 bg-white rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 p-1 m-2">
          Products
          <span className="text-sm text-gray-500 font-normal">
            ({totalProduct?.length || 0})
          </span>
        </h1>
      </div>
      <div className="w-full p-2 m-2 bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg text-white">
          <div className="font-bold">Image</div>
          <div className="font-bold">Product Name</div>
          <div className="font-bold">Price</div>
          <div className="font-bold">Category</div>
        </div>

        {currentItems.length > 0 ? (
          currentItems.map((item, index) => (
            <Link
              key={item._id}
              href={`/dashboard/products/${item._id}`}
              className={`w-full border grid md:grid-cols-4 text-sm gap-4 py-4 px-1 md:p-4 hover:bg-gray-200 transition-all duration-200 ${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="relative w-16 h-16 mx-2">
                <Image
                  src={item.mainImage}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="text-gray-600 mx-2">{item.name}</div>
              <div className="text-gray-600 mx-2">{item.price} dt</div>
              <div className="text-sm text-gray-500 mx-2">{item.category}</div>
            </Link>
          ))
        ) : (
          <TableSkeleton />
        )}

        <div className="flex justify-center mt-4">
          {pageNumbers.length > 1 &&
            pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-10 w-10 mr-1 flex justify-center items-center border rounded-full ${
                  currentPage === number ? "text-white bg-blue-500" : ""
                }`}
              >
                {number}
              </button>
            ))}
        </div>
      </div>
    </>
  );
};

export default Products;
