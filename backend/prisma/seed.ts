import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FarmSe database seeding...');

  // 1. Clear existing records in correct relation order
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.farmerProfile.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing data.');

  // Password hashes
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordFarmer = await bcrypt.hash('farmer123', 10);
  const passwordCustomer = await bcrypt.hash('customer123', 10);

  // 2. Create Categories
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

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log('✅ Created 7 core agricultural categories.');

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@farmse.com',
      password: passwordAdmin,
      name: 'Platform Administrator',
      role: 'ADMIN',
      phone: '+91 9800000001',
      city: 'New Delhi',
      state: 'Delhi',
      isApproved: true,
      isActive: true,
    },
  });

  // 4. Create Farmers
  const farmer1 = await prisma.user.create({
    data: {
      email: 'ramesh.patel@farmse.com',
      password: passwordFarmer,
      name: 'Ramesh Patel',
      role: 'FARMER',
      phone: '+91 9823011223',
      address: 'Plot 42, Dindori Agro Belt',
      city: 'Nashik',
      state: 'Maharashtra',
      pincode: '422001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Patel Organic Orchards & Greens',
          bio: 'Third-generation organic farmer practicing natural zero-budget regenerative agriculture across 15 acres.',
          location: 'Nashik, Maharashtra',
          state: 'Maharashtra',
          farmSizeAcres: 15,
          experienceYears: 18,
          rating: 4.9,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      email: 'gurpreet.singh@farmse.com',
      password: passwordFarmer,
      name: 'Gurpreet Singh',
      role: 'FARMER',
      phone: '+91 9876543210',
      address: 'Khanna Grain Highway',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141401',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Golden Wheat & Heritage Grain Hub',
          bio: 'Specializing in GI-tagged Sharbati wheat, Basmati rice varieties, and heirloom pulses with zero chemical pesticides.',
          location: 'Ludhiana, Punjab',
          state: 'Punjab',
          farmSizeAcres: 30,
          experienceYears: 24,
          rating: 4.85,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const farmer3 = await prisma.user.create({
    data: {
      email: 'lakshmi.narayanan@farmse.com',
      password: passwordFarmer,
      name: 'Lakshmi Narayanan',
      role: 'FARMER',
      phone: '+91 9447012345',
      address: 'Meppadi Valley Estate',
      city: 'Wayanad',
      state: 'Kerala',
      pincode: '673577',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Malabar Spice & Highland Dairy',
          bio: 'Cultivating wild green cardamom, tellicherry black pepper, high-curcumin turmeric alongside Gir Cow A2 dairy.',
          location: 'Wayanad, Kerala',
          state: 'Kerala',
          farmSizeAcres: 12,
          experienceYears: 14,
          rating: 5.0,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const farmer4 = await prisma.user.create({
    data: {
      email: 'anita.sharma@farmse.com',
      password: passwordFarmer,
      name: 'Anita Sharma',
      role: 'FARMER',
      phone: '+91 9816099887',
      address: 'Kotgarh Apple Orchards',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      pincode: '172001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      isApproved: true,
      farmerProfile: {
        create: {
          farmName: 'Himalayan Fresh Apple & Honey Orchards',
          bio: 'High-altitude organic apple orchards and natural wildflower apiary in Himachal foothills.',
          location: 'Shimla, Himachal Pradesh',
          state: 'Himachal Pradesh',
          farmSizeAcres: 8,
          experienceYears: 10,
          rating: 4.92,
          isVerified: true,
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  // 5. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'rahul.verma@farmse.com',
      password: passwordCustomer,
      name: 'Rahul Verma',
      role: 'CUSTOMER',
      phone: '+91 9820098200',
      address: 'B-402, Green Meadows Apt, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      customerProfile: {
        create: {
          defaultAddress: 'B-402, Green Meadows Apt, Powai, Mumbai - 400076',
          preferredLanguage: 'English',
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya.sharma@farmse.com',
      password: passwordCustomer,
      name: 'Priya Sharma',
      role: 'CUSTOMER',
      phone: '+91 9740012345',
      address: 'Flat 12A, Palm Heights, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      customerProfile: {
        create: {
          defaultAddress: 'Flat 12A, Palm Heights, Indiranagar, Bangalore - 560038',
          preferredLanguage: 'English',
        },
      },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  console.log('✅ Created Admin, 4 Farmers, and 2 Customers.');

  // 6. Create Realistic Agricultural Products
  const productsData = [
    {
      farmerId: farmer1.id,
      categoryId: categories['fruits'].id,
      name: 'Organic Devgad Alphonso Mangoes (GI Tagged)',
      description: 'Naturally tree-ripened, carbide-free authentic Alphonso mangoes from Devgad coastal red-laterite soil. Rich aroma, velvety pulp, and sweetness.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 650,
      originalPrice: 850,
      quantity: 120,
      unit: 'dozen',
      location: 'Devgad / Nashik, Maharashtra',
      harvestDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.9,
      reviewCount: 28,
    },
    {
      farmerId: farmer1.id,
      categoryId: categories['vegetables'].id,
      name: 'Farm Fresh Vine-Ripened Red Tomatoes',
      description: 'Plump, juicy, naturally grown field tomatoes harvested at dawn. Free of synthetic growth hormones.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 38,
      originalPrice: 45,
      quantity: 450,
      unit: 'kg',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 19,
    },
    {
      farmerId: farmer1.id,
      categoryId: categories['vegetables'].id,
      name: 'Crisp Organic Baby Spinach (Palak)',
      description: 'Tender baby spinach leaves washed with ozone water. Packed with natural iron, magnesium, and dietary fiber.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 28,
      originalPrice: 35,
      quantity: 80,
      unit: 'pack',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(),
      isOrganic: true,
      isAvailable: true,
      rating: 4.7,
      reviewCount: 12,
    },
    {
      farmerId: farmer2.id,
      categoryId: categories['grains'].id,
      name: 'Heritage Sharbati Whole Wheat Grain',
      description: 'Gold-tinged, heavy-kernel Sharbati wheat grown in deep black soil. Produces exceptionally soft, sweet rotis with high bran fiber.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 480,
      originalPrice: 550,
      quantity: 85,
      unit: 'quintal',
      location: 'Ludhiana, Punjab',
      harvestDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.9,
      reviewCount: 42,
    },
    {
      farmerId: farmer2.id,
      categoryId: categories['grains'].id,
      name: 'Traditional Royal Basmati Rice (Aged 2 Years)',
      description: 'Extra-long grain authentic 1121 Basmati rice naturally aged in temperature-controlled grain silos for fluffy non-sticky elongation.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 135,
      originalPrice: 160,
      quantity: 500,
      unit: 'kg',
      location: 'Ludhiana, Punjab',
      harvestDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 35,
    },
    {
      farmerId: farmer2.id,
      categoryId: categories['pulses'].id,
      name: 'Unpolished Chitra Rajma (Himalayan Kidney Beans)',
      description: 'Creamy-textured Chitra Rajma harvested from mineral-rich Himalayan soil. Rich in plant protein with no chemical polishing.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585996746979-335b1dcfb2f3?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 165,
      originalPrice: 190,
      quantity: 320,
      unit: 'kg',
      location: 'Ludhiana, Punjab',
      harvestDate: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 15,
    },
    {
      farmerId: farmer3.id,
      categoryId: categories['dairy'].id,
      name: 'Pure Desi Gir Cow A2 Bilona Ghee',
      description: 'Handcrafted using ancient Bilona method from grass-fed Gir cows. Golden granule texture, heavenly aroma, and easy digestibility.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 1450,
      originalPrice: 1750,
      quantity: 65,
      unit: 'litre',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 54,
    },
    {
      farmerId: farmer3.id,
      categoryId: categories['spices'].id,
      name: 'Wayanad Bold Green Cardamom (8mm+ Extra Bold)',
      description: 'Handpicked shade-grown green cardamom from high elevation rainforest estates. Intensely fragrant with high essential oil content.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 320,
      originalPrice: 380,
      quantity: 90,
      unit: 'pack',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.9,
      reviewCount: 22,
    },
    {
      farmerId: farmer3.id,
      categoryId: categories['spices'].id,
      name: 'Lakadong Organic Turmeric Powder (8% Curcumin)',
      description: 'Celebrated high-curcumin pure turmeric root powder from organic hills. Natural golden color, earthy aroma, and potent antioxidant benefits.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 240,
      originalPrice: 290,
      quantity: 140,
      unit: 'pack',
      location: 'Wayanad, Kerala',
      harvestDate: new Date(Date.now() - 25 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.95,
      reviewCount: 31,
    },
    {
      farmerId: farmer4.id,
      categoryId: categories['fruits'].id,
      name: 'Crisp Shimla Royal Delicious Apples',
      description: 'Crisp, sweet, ruby-red mountain apples grown at 7,500 ft elevation. Wax-free, freshly plucked, bursting with orchard crunch.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 180,
      originalPrice: 220,
      quantity: 350,
      unit: 'kg',
      location: 'Shimla, Himachal Pradesh',
      harvestDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 4.88,
      reviewCount: 45,
    },
    {
      farmerId: farmer4.id,
      categoryId: categories['other'].id,
      name: 'Raw Himalayan Wildflower Honey (Unfiltered)',
      description: 'Raw, unpasteurized honey harvested from high-altitude flora by native bees. Contains live enzymes, pollen, and propolis.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 490,
      originalPrice: 600,
      quantity: 80,
      unit: 'litre',
      location: 'Shimla, Himachal Pradesh',
      harvestDate: new Date(Date.now() - 12 * 24 * 3600 * 1000),
      isOrganic: true,
      isAvailable: true,
      rating: 5.0,
      reviewCount: 60,
    },
    {
      farmerId: farmer1.id,
      categoryId: categories['dairy'].id,
      name: 'Fresh Farm Raw A2 Cow Milk (Chilled Daily)',
      description: 'Pure, wholesome whole milk delivered in sterilized glass bottles within hours of milking. Hormone-free and antibiotic-free.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      ]),
      price: 75,
      originalPrice: 85,
      quantity: 90,
      unit: 'litre',
      location: 'Nashik, Maharashtra',
      harvestDate: new Date(),
      isOrganic: true,
      isAvailable: true,
      rating: 4.9,
      reviewCount: 38,
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({ data: prod });
    createdProducts.push(p);
  }
  console.log(`✅ Created ${createdProducts.length} agricultural products.`);

  // 7. Seed Sample Reviews
  await prisma.review.create({
    data: {
      productId: createdProducts[0].id,
      customerId: customer1.id,
      rating: 5,
      comment: 'Best Alphonso mangoes I have had in years! Beautiful golden color, sweet aroma, and zero chemicals.',
    },
  });

  await prisma.review.create({
    data: {
      productId: createdProducts[6].id,
      customerId: customer2.id,
      rating: 5,
      comment: 'Authentic Bilona Ghee with grain-like Danedar texture. Reminds me of traditional village ghee.',
    },
  });

  await prisma.review.create({
    data: {
      productId: createdProducts[9].id,
      customerId: customer1.id,
      rating: 5,
      comment: 'Super crisp and naturally sweet without any wax coating. Prompt delivery and eco packaging.',
    },
  });

  // 8. Seed Demo Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'FRM-892101-4432',
      customerId: customer1.id,
      totalAmount: 1338,
      shippingAddress: 'B-402, Green Meadows Apt, Powai, Mumbai - 400076',
      contactPhone: '+91 9820098200',
      paymentMethod: 'UPI',
      paymentStatus: 'COMPLETED',
      orderStatus: 'PREPARING',
      notes: 'Please ring bell upon delivery.',
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            farmerId: farmer1.id,
            quantity: 2,
            unitPrice: 650,
            subtotal: 1300,
          },
          {
            productId: createdProducts[1].id,
            farmerId: farmer1.id,
            quantity: 1,
            unitPrice: 38,
            subtotal: 38,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'FRM-761294-8190',
      customerId: customer2.id,
      totalAmount: 1940,
      shippingAddress: 'Flat 12A, Palm Heights, Indiranagar, Bangalore - 560038',
      contactPhone: '+91 9740012345',
      paymentMethod: 'CARD',
      paymentStatus: 'COMPLETED',
      orderStatus: 'DELIVERED',
      items: {
        create: [
          {
            productId: createdProducts[6].id,
            farmerId: farmer3.id,
            quantity: 1,
            unitPrice: 1450,
            subtotal: 1450,
          },
          {
            productId: createdProducts[10].id,
            farmerId: farmer4.id,
            quantity: 1,
            unitPrice: 490,
            subtotal: 490,
          },
        ],
      },
    },
  });

  // 9. Notifications
  await prisma.notification.create({
    data: {
      userId: customer1.id,
      title: 'Order Preparing! 📦',
      message: `Your order #FRM-892101-4432 is being packed with care by Ramesh Patel.`,
      type: 'ORDER',
      link: '/customer/orders',
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmer1.id,
      title: 'New Order Received! 🌾',
      message: `You have received a new order for Alphonso Mangoes & Tomatoes.`,
      type: 'ORDER',
      link: '/farmer/orders',
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
