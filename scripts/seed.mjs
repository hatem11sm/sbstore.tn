import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

import ClothingProduct from "../models/Product.js";
import Category from "../models/Category.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const ADMIN_EMAIL = "hatem@gmail.com";
const ADMIN_PASSWORD = "Admin123!";

const PRODUCT_COUNT = 24;
const USER_COUNT = 10;
const ORDER_COUNT = 8;

const CATEGORY_DATA = [
  {
    name: "Men",
    description:
      "Versatile menswear staples, footwear, and accessories for every day.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
    ],
    subcategories: ["T-Shirts", "Shirts", "Pants", "Jackets", "Shoes"],
  },
  {
    name: "Women",
    description:
      "Fresh silhouettes, elevated basics, and standout pieces for women.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    ],
    subcategories: ["Dresses", "Tops", "Skirts", "Jeans", "Heels"],
  },
  {
    name: "Kids",
    description:
      "Playful outfits and comfy essentials for boys, girls, and infants.",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542293787938-4d2226c1e661?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581579186989-4c08b39e91a6?auto=format&fit=crop&w=800&q=80",
    ],
    subcategories: ["Boys", "Girls", "Infants"],
  },
];

const AVAILABLE_SIZES = ["Small", "Medium", "Large", "Extra Large"];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const uniqueEmail = (() => {
  const seen = new Set();
  return () => {
    let email = faker.internet.email().toLowerCase();
    while (seen.has(email)) {
      email = faker.internet.email().toLowerCase();
    }
    seen.add(email);
    return email;
  };
})();

const buildProductPayload = (categoryDoc, sourceInfo) => {
  const imagePool = sourceInfo?.gallery?.filter(Boolean) || [];
  const subcategory =
    sourceInfo?.subcategories?.length
      ? faker.helpers.arrayElement(sourceInfo.subcategories)
      : "";
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 25, max: 220 }),
    category: categoryDoc.name,
    categorySlug: categoryDoc.slug,
    subcategory,
    mainImage:
      imagePool.length > 0
        ? faker.helpers.arrayElement(imagePool)
        : faker.image.urlLoremFlickr({ category: "fashion" }),
  };
};

const buildCustomerDetails = () => ({
  fullName: faker.person.fullName(),
  phoneNumber: faker.phone.number(),
  address: faker.location.streetAddress({ useFullAddress: true }),
  description: faker.lorem.sentence(),
});

const buildItemFromProduct = (product) => {
  const quantity = faker.number.int({ min: 1, max: 4 });
  return {
    productId: product._id,
    quantity,
    size: faker.helpers.arrayElement(AVAILABLE_SIZES),
    image: product.mainImage,
    price: product.price,
    name: product.name,
  };
};

const seedDatabase = async () => {
  try {
    const uri = process.env.CONNECT_DB;
    if (!uri) {
      throw new Error("CONNECT_DB environment variable is not set");
    }
    await mongoose.connect(uri);

    await Promise.all([
      Cart.deleteMany({}),
      Order.deleteMany({}),
      ClothingProduct.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
    ]);

    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminUser = await User.create({
      name: "Hatem Admin",
      email: ADMIN_EMAIL,
      password: adminPasswordHash,
      isAdmin: true,
    });

    const users = [];
    while (users.length < USER_COUNT) {
      users.push({
        name: faker.person.fullName(),
        email: uniqueEmail(),
        password: await bcrypt.hash("Password123!", 10),
        isAdmin: false,
      });
    }
    const userDocs = await User.insertMany(users);

    const categoryDocs = await Category.insertMany(
      CATEGORY_DATA.map(({ name, description, image, subcategories }) => ({
        name,
        description,
        image,
        subcategories: [...new Set(subcategories)],
      }))
    );

    const categorySourceByName = CATEGORY_DATA.reduce((accumulator, item) => {
      accumulator[item.name] = item;
      return accumulator;
    }, {});

    const products = Array.from({ length: PRODUCT_COUNT }, () => {
      const categoryDoc = faker.helpers.arrayElement(categoryDocs);
      const sourceInfo = categorySourceByName[categoryDoc.name] || {};
      return buildProductPayload(categoryDoc, sourceInfo);
    });
    const productDocs = await ClothingProduct.insertMany(products);

    const orders = Array.from({ length: ORDER_COUNT }, () => {
      const customer = faker.helpers.arrayElement([...userDocs, adminUser]);
      const orderProducts = faker.helpers.arrayElements(productDocs, faker.number.int({ min: 1, max: 4 }));
      const items = orderProducts.map(buildItemFromProduct);
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        userId: customer._id,
        items,
        total,
        customer: buildCustomerDetails(),
        shippingAddress: faker.location.streetAddress({ useFullAddress: true }),
        status: faker.helpers.arrayElement(ORDER_STATUSES),
      };
    });
    await Order.insertMany(orders);

    const carts = userDocs.slice(0, Math.ceil(userDocs.length / 2)).map((user) => {
      const cartProducts = faker.helpers.arrayElements(productDocs, faker.number.int({ min: 1, max: 3 }));
      return {
        userId: user._id,
        items: cartProducts.map(buildItemFromProduct),
      };
    });
    await Cart.insertMany(carts);

    console.log("Database seeded successfully.");
    console.log(`Admin account: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

await seedDatabase();
