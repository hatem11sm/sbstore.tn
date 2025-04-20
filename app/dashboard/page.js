"use client";

import { AdminContext } from "@/Context/AdminProvider";
import { useContext, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js";
import { FaUser } from "react-icons/fa6";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import {
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { totalUser, totalProduct, totalOrders } = useContext(AdminContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (totalUser !== undefined && totalProduct !== undefined && totalOrders !== undefined) {
      setIsLoading(false);
    }
  }, [totalUser, totalProduct, totalOrders]);

  const data = {
    labels: ["Users", "Products", "Orders"],
    datasets: [
      {
        label: "# of Items",
        data: [totalUser?.length || 0, totalProduct?.length || 0, totalOrders?.length || 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        type: "linear",
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{totalUser?.length || 0}</p>
            </div>
            <FaUser className="text-4xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
              <p className="text-3xl font-bold text-green-600">{totalProduct?.length || 0}</p>
            </div>
            <BsFillBoxSeamFill className="text-4xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
              <p className="text-3xl font-bold text-purple-600">{totalOrders?.length || 0}</p>
            </div>
            <FaShoppingCart className="text-4xl text-purple-500" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Statistics</h3>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
