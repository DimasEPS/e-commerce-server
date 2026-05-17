const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
dotenv.config();

const Product = require("../models/Product");

const products = [
  {
    title: "Royal Canin Persian Adult",
    description:
      "Makanan kering premium untuk kucing ras Persia dewasa. Diformulasikan khusus untuk kesehatan bulu panjang dan sistem pencernaan optimal.",
    category: "Makanan",
    brand: "Royal Canin",
    price: 285000,
    salePrice: 320000,
    stock: 45,
    hewan: "kucing",
    kat: "Makanan",
    subkat: "Dry Food",
    rating: 4.9,
    reviews: 128,
    sold: 890,
    emoji: "🐱",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80",
    badge: "bestseller",
    isNewProduct: false,
  },
  {
    title: "Whiskas Pouch Tuna",
    description:
      "Makanan basah kucing dengan kandungan tuna pilihan. Cocok sebagai camilan atau makanan utama.",
    category: "Makanan",
    brand: "Whiskas",
    price: 12000,
    salePrice: 15000,
    stock: 120,
    hewan: "kucing",
    kat: "Makanan",
    subkat: "Wet Food",
    rating: 4.7,
    reviews: 256,
    sold: 2100,
    emoji: "🐟",
    image: "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=500&q=80",
    badge: "",
    isNewProduct: false,
  },
  {
    title: "Catit Fountain Air Kucing",
    description:
      "Dispenser air otomatis untuk kucing dengan filter karbon aktif. Mendorong kucing minum lebih banyak.",
    category: "Aksesoris",
    brand: "Catit",
    price: 189000,
    salePrice: 0,
    stock: 30,
    hewan: "kucing",
    kat: "Aksesoris",
    subkat: "Tempat Makan",
    rating: 4.8,
    reviews: 89,
    sold: 340,
    emoji: "💧",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80",
    badge: "new",
    isNewProduct: true,
  },
  {
    title: "Pedigree Adult Beef",
    description:
      "Makanan kering anjing dewasa rasa daging sapi. Lengkap vitamin dan mineral untuk kesehatan optimal.",
    category: "Makanan",
    brand: "Pedigree",
    price: 195000,
    salePrice: 220000,
    stock: 60,
    hewan: "anjing",
    kat: "Makanan",
    subkat: "Dry Food",
    rating: 4.6,
    reviews: 178,
    sold: 760,
    emoji: "🐶",
    image: "https://images.unsplash.com/photo-1589924691995-400dc9cecb58?w=500&q=80",
    badge: "",
    isNewProduct: false,
  },
  {
    title: "Frontline Anti Kutu Kucing",
    description:
      "Obat anti kutu dan caplak untuk kucing. Efektif melindungi hingga 4 minggu. Mudah diaplikasikan.",
    category: "Kesehatan",
    brand: "Frontline",
    price: 125000,
    salePrice: 145000,
    stock: 85,
    hewan: "kucing",
    kat: "Kesehatan",
    subkat: "Anti Kutu",
    rating: 4.9,
    reviews: 312,
    sold: 1450,
    emoji: "💊",
    image: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=500&q=80",
    badge: "bestseller",
    isNewProduct: false,
  },
  {
    title: "Kong Bola Gigit Anjing",
    description:
      "Mainan karet durable untuk anjing. Aman untuk gigi dan gusi. Bisa diisi camilan untuk stimulasi mental.",
    category: "Aksesoris",
    brand: "Kong",
    price: 95000,
    salePrice: 0,
    stock: 55,
    hewan: "anjing",
    kat: "Aksesoris",
    subkat: "Mainan",
    rating: 4.7,
    reviews: 145,
    sold: 420,
    emoji: "🎾",
    image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500&q=80",
    badge: "new",
    isNewProduct: true,
  },
  {
    title: "Bioline Shampoo Kucing",
    description:
      "Shampoo kucing formula mild untuk bulu lebat. Mengandung aloe vera dan vitamin E untuk bulu berkilap.",
    category: "Perawatan",
    brand: "Bioline",
    price: 65000,
    salePrice: 75000,
    stock: 90,
    hewan: "kucing",
    kat: "Perawatan",
    subkat: "Shampoo & Sabun",
    rating: 4.5,
    reviews: 203,
    sold: 890,
    emoji: "🧴",
    image: "https://images.unsplash.com/photo-1516280030429-27679b3dc9ef?w=500&q=80",
    badge: "",
    isNewProduct: false,
  },
  {
    title: "Oxbow Timothy Hay Kelinci",
    description:
      "Hay timothy grade A untuk kelinci. Serat tinggi untuk kesehatan pencernaan dan gigi kelinci.",
    category: "Makanan",
    brand: "Oxbow",
    price: 145000,
    salePrice: 165000,
    stock: 40,
    hewan: "kelinci",
    kat: "Makanan",
    subkat: "Dry Food",
    rating: 4.9,
    reviews: 97,
    sold: 680,
    emoji: "🌿",
    image: "https://images.unsplash.com/photo-1585110396000-c9fd4e4e320c?w=500&q=80",
    badge: "bestseller",
    isNewProduct: false,
  },
  {
    title: "Petkit Kandang Lipat Kucing",
    description:
      "Kandang kucing lipat premium dari bahan stainless steel. Mudah dibersihkan dan dilipat untuk perjalanan.",
    category: "Aksesoris",
    brand: "Petkit",
    price: 450000,
    salePrice: 520000,
    stock: 15,
    hewan: "kucing",
    kat: "Aksesoris",
    subkat: "Kandang & Rumah",
    rating: 4.8,
    reviews: 67,
    sold: 210,
    emoji: "🏠",
    image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=500&q=80",
    badge: "",
    isNewProduct: true,
  },
  {
    title: "Drools Adult Dog Wet Food",
    description:
      "Makanan basah anjing dewasa rasa ayam. Cocok dicampur dengan makanan kering.",
    category: "Makanan",
    brand: "Drools",
    price: 28000,
    salePrice: 0,
    stock: 200,
    hewan: "anjing",
    kat: "Makanan",
    subkat: "Wet Food",
    rating: 4.4,
    reviews: 134,
    sold: 580,
    emoji: "🥩",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80",
    badge: "",
    isNewProduct: false,
  },
  {
    title: "Kalung GPS Kucing",
    description:
      "Kalung GPS real-time untuk kucing. Pantau lokasi anabul lewat aplikasi smartphone.",
    category: "Aksesoris",
    brand: "PetTracker",
    price: 320000,
    salePrice: 380000,
    stock: 22,
    hewan: "kucing",
    kat: "Aksesoris",
    subkat: "Kalung & Tali",
    rating: 4.6,
    reviews: 54,
    sold: 180,
    emoji: "📍",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80",
    badge: "new",
    isNewProduct: true,
  },
  {
    title: "Vitaboost Vitamin Kelinci",
    description:
      "Suplemen vitamin lengkap untuk kelinci. Mendukung pertumbuhan bulu, kekuatan tulang, dan imun.",
    category: "Kesehatan",
    brand: "Vitaboost",
    price: 85000,
    salePrice: 95000,
    stock: 50,
    hewan: "kelinci",
    kat: "Kesehatan",
    subkat: "Vitamin & Suplemen",
    rating: 4.7,
    reviews: 76,
    sold: 320,
    emoji: "🌟",
    image: "https://images.unsplash.com/photo-1585110396000-c9fd4e4e320c?w=500&q=80",
    badge: "",
    isNewProduct: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert seed data
    const result = await Product.insertMany(products);
    console.log(`Seeded ${result.length} products successfully`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
