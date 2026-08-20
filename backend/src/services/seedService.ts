import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedMarketplaceData(prisma: PrismaClient) {
  console.log('🌱 Checking and auto-seeding FarmSe marketplace data...');

  const categoryCount = await prisma.category.count();
  if (categoryCount > 0) {
    console.log(`📦 Database already has ${categoryCount} categories. Skipping category creation.`);
    // Check if products exist
    const productCount = await prisma.product.count();
    if (productCount > 0) {
      console.log(`📦 Database already has ${productCount} products. Skipping product creation.`);
      return;
    }
  }

  // 1. Create Core Agricultural Categories
  const categoriesData = [
    {
      name: 'Vegetables',
      slug: 'vegetables',
      description: 'Crisp, organically grown farm-fresh seasonal vegetables harvested daily.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      icon: 'Carrot',
    },
    {
      name: 'Fruits',
      slug: 'fruits',
      description: 'Naturally ripened, pesticide-free orchard fruits packed with nutrients.',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      icon: 'Apple',
    },
    {
      name: 'Grains',
      slug: 'grains',
      description: 'Pure, unadulterated whole grains, heritage wheat, and premium aromatic rice.',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      icon: 'Wheat',
    },
    {
      name: 'Pulses',
      slug: 'pulses',
      description: 'High-protein, unpolished heirloom pulses and lentils direct from farm gates.',
      image: 'https://images.unsplash.com/photo-1585996746979-335b1dcfb2f3?auto=format&fit=crop&w=800&q=80',
      icon: 'Bean',
    },
    {
      name: 'Dairy',
      slug: 'dairy',
      description: 'Farm-fresh A2 desi cow milk, bilona ghee, paneer, and artisanal butter.',
      image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80',
      icon: 'Milk',
    },
    {
      name: 'Spices',
      slug: 'spices',
      description: 'Aromatic single-origin whole spices, sun-dried herbs, and high-curcumin turmeric.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      icon: 'Flame',
    },
    {
      name: 'Other Farm Products',
      slug: 'other',
      description: 'Raw unprocessed forest honey, cold-pressed oils, jaggery, and farm essentials.',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      icon: 'Leaf',
    },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = created;
  }
  console.log('✅ Categories seeded successfully.');

  // Password hashes
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordFarmer = await bcrypt.hash('farmer123', 10);
  const passwordCustomer = await bcrypt.hash('customer123', 10);

  // 2. Admin User
  await prisma.user.upsert({
    where: { email: 'admin@farmse.com' },
    update: {},
    create: {
      email: 'admin@farmse.com',
      password: passwordAdmin,
      name: 'Platform Administrator',
      role: 'ADMIN',
      phone: '+91 9800000001',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      isApproved: true,
    },
  });

  // 3. Demo Farmers
  const farmer1 = await prisma.user.upsert({
    where: { email: 'ramesh.patel@farmse.com' },
    update: {},
    create: {
      email: 'ramesh.patel@farmse.com',
      password: passwordFarmer,
      name: 'Ramesh Patel',
      role: 'FARMER',
      phone: '+91 9823456781',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
      address: 'Plot 42, Pimpalgaon Baswant',
      city: 'Nashik',
      state: 'Maharashtra',
      pincode: '422209',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Patel Organic Orchards & Vineyards',
          bio: 'Third-generation grower cultivating certified chemical-free export quality table grapes, pomegranates, and vine vegetables on 25 fertile acres in Nashik.',
          location: 'Nashik, Maharashtra',
          state: 'Maharashtra',
          farmSizeAcres: 25.0,
          experienceYears: 18,
          rating: 4.9,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const farmer2 = await prisma.user.upsert({
    where: { email: 'gurpreet.singh@farmse.com' },
    update: {},
    create: {
      email: 'gurpreet.singh@farmse.com',
      password: passwordFarmer,
      name: 'Gurpreet Singh',
      role: 'FARMER',
      phone: '+91 9876543212',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      address: 'VPO Sahnewal, GT Road',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141120',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Golden Wheat & Grain Hub',
          bio: 'Specializing in traditional stone-ground heritage wheat grains, non-GMO mustard, basmati paddy, and unpolished yellow lentils with bio-compost farming.',
          location: 'Ludhiana, Punjab',
          state: 'Punjab',
          farmSizeAcres: 40.0,
          experienceYears: 22,
          rating: 4.8,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const farmer3 = await prisma.user.upsert({
    where: { email: 'lakshmi.narayanan@farmse.com' },
    update: {},
    create: {
      email: 'lakshmi.narayanan@farmse.com',
      password: passwordFarmer,
      name: 'Lakshmi Narayanan',
      role: 'FARMER',
      phone: '+91 9447123456',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      address: 'Kalpetta Plantation Estate',
      city: 'Wayanad',
      state: 'Kerala',
      pincode: '673121',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Malabar Spice & Highland Dairy',
          bio: 'High-altitude agroforestry plantation in the Western Ghats producing whole Tellicherry black pepper, green cardamom, Ceylon cinnamon, and grass-fed A2 Gir cow milk.',
          location: 'Wayanad, Kerala',
          state: 'Kerala',
          farmSizeAcres: 15.5,
          experienceYears: 14,
          rating: 5.0,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  // 4. Demo Customers
  await prisma.user.upsert({
    where: { email: 'rahul.verma@farmse.com' },
    update: {},
    create: {
      email: 'rahul.verma@farmse.com',
      password: passwordCustomer,
      name: 'Rahul Verma',
      role: 'CUSTOMER',
      phone: '+91 9811223344',
      address: 'Flat 402, Palm Heights, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      customerProfile: {
        create: {
          preferredLanguage: 'English',
          defaultAddress: 'Flat 402, Palm Heights, Powai, Mumbai - 400076',
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: 'priya.sharma@farmse.com' },
    update: {},
    create: {
      email: 'priya.sharma@farmse.com',
      password: passwordCustomer,
      name: 'Priya Sharma',
      role: 'CUSTOMER',
      phone: '+91 9822334455',
      address: 'Villa 12, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      customerProfile: {
        create: {
          preferredLanguage: 'English',
          defaultAddress: 'Villa 12, Green Glen Layout, Bellandur, Bengaluru - 560103',
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  // 5. Create Core Marketplace Harvest Products
  const productsData = [
    {
      farmerId: farmer1.id,
      categoryId: categoryMap['fruits']?.id,
      name: 'Organic Shimla Royal Delicious Apples',
      description: 'Handpicked, pesticide-free crisp sweet apples from high-altitude orchards. Naturally tree-ripened without wax coatings.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 180,
      originalPrice: 220,
      quantity: 450,
      unit: 'kg',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.9,
      reviewCount: 14,
    },
    {
      farmerId: farmer1.id,
      categoryId: categoryMap['vegetables']?.id,
      name: 'Sun-Ripened Vine Fresh Tomatoes',
      description: 'Juicy, rich red desi tomatoes harvested fresh at dawn. Packed with natural lycopene, perfect for everyday salads, soups, and curries.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 38,
      originalPrice: 50,
      quantity: 800,
      unit: 'kg',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 9,
    },
    {
      farmerId: farmer3.id,
      categoryId: categoryMap['dairy']?.id,
      name: 'Pure Gir Cow A2 Raw Milk (Chilled Daily Batch)',
      description: 'Pure, fresh unprocessed A2 whole milk from free-grazing indigenous Gir cows. Rich in A2 beta-casein proteins and natural micronutrients.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 95,
      originalPrice: 110,
      quantity: 120,
      unit: 'litre',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 32,
    },
    {
      farmerId: farmer3.id,
      categoryId: categoryMap['dairy']?.id,
      name: 'Traditional Vedic Bilona Cow Cultured Ghee',
      description: 'Slow-cooked golden aromatic ghee made using the authentic Ayurvedic bilona curd-churning method. Pure granular texture with medicinal properties.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 1450,
      originalPrice: 1650,
      quantity: 45,
      unit: 'litre',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 28,
    },
    {
      farmerId: farmer2.id,
      categoryId: categoryMap['grains']?.id,
      name: 'Premium Sharbati Golden Wheat Grain',
      description: 'Single-estate harvested golden grain wheat known for soft, fluffy rotis and superior dietary fiber. Sun-dried and double-cleaned naturally.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 52,
      originalPrice: 65,
      quantity: 2500,
      unit: 'kg',
      location: 'Ludhiana, Punjab',
      harvestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 16,
    },
    {
      farmerId: farmer3.id,
      categoryId: categoryMap['spices']?.id,
      name: 'High-Curcumin Lakadong Turmeric Powder',
      description: 'Freshly grounded pure turmeric with guaranteed 7.5%+ active curcumin content. Zero additives, pure golden immunity booster.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 320,
      originalPrice: 380,
      quantity: 150,
      unit: 'kg',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.9,
      reviewCount: 19,
    },
    {
      farmerId: farmer3.id,
      categoryId: categoryMap['spices']?.id,
      name: 'Wayanad Whole Bold Green Cardamom (8mm+)',
      description: 'GI-tagged extra-large cardamom pods handpicked from mountain slopes. Intensely aromatic, sweet floral aroma with plump flavorful seeds.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 2400,
      originalPrice: 2800,
      quantity: 60,
      unit: 'kg',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 12,
    },
    {
      farmerId: farmer2.id,
      categoryId: categoryMap['pulses']?.id,
      name: 'Organic Unpolished Desi Toor Dal (Pigeon Pea)',
      description: 'Pure, pesticide-free yellow split pigeon peas. No artificial colors or water polishing applied to retain original proteins and minerals.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585996746979-335b1dcfb2f3?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 165,
      originalPrice: 195,
      quantity: 600,
      unit: 'kg',
      location: 'Ludhiana, Punjab',
      harvestDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.7,
      reviewCount: 8,
    },
    {
      farmerId: farmer1.id,
      categoryId: categoryMap['vegetables']?.id,
      name: 'Farm-Fresh Crisp Button Mushrooms',
      description: 'Cultivated in sterile temperature-regulated organic substrate. Plump, fresh, and harvested within hours of dispatch.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 90,
      originalPrice: 120,
      quantity: 180,
      unit: 'pack',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(),
      isOrganic: true,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 11,
    },
    {
      farmerId: farmer1.id,
      categoryId: categoryMap['other']?.id,
      name: 'Raw Unfiltered Multifloral Forest Honey',
      description: 'Pure wildflower honey extracted from sustainable apiaries without heat processing or ultrafiltration. Retains active enzymes and bee pollen.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 450,
      originalPrice: 550,
      quantity: 110,
      unit: 'kg',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 24,
    },
  ];

  for (const prod of productsData) {
    if (!prod.categoryId) continue;
    // Check if product with same name exists
    const existing = await prisma.product.findFirst({
      where: { name: prod.name },
    });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }

  console.log(`✅ Seeded ${productsData.length} core fresh harvest marketplace products.`);
}
