const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Fallback to local .env

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_db';
const JWT_SECRET = process.env.JWT_SECRET || 'aura_ecommerce_ultra_secure_jwt_token_key_2026_x89f2';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend assets
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '..')));

// =========================================================================
// MONGOOSE SCHEMAS & MODELS
// =========================================================================

// 1. User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, default: '' },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: 'India' }
    },
    avatar: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// 2. Product Schema
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true }, // In INR (₹)
    originalPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, default: 25 },
    badge: { type: String, default: 'Best Seller' },
    image: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
    features: [{ type: String }],
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    reviews: [
        {
            userName: String,
            rating: Number,
            comment: String,
            date: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// 3. Cart Schema (User Isolated)
const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    items: [
        {
            productId: { type: Number, required: true },
            title: String,
            price: Number, // In INR (₹)
            image: String,
            category: String,
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

// 4. Wishlist Schema (User Isolated)
const wishlistSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    productIds: [{ type: Number }]
}, { timestamps: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// 5. Order Schema
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: { type: String, default: 'India' }
    },
    items: [
        {
            productId: Number,
            title: String,
            price: Number, // In INR (₹)
            quantity: Number,
            image: String,
            category: String
        }
    ],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, default: 'UPI / QR Code' },
    paymentStatus: { type: String, default: 'Paid' },
    status: {
        type: String,
        enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    carrier: { type: String, default: 'BlueDart Express' },
    trackingNumber: { type: String, default: '' },
    estimatedDelivery: { type: String, default: '' },
    timeline: [
        {
            status: String,
            title: String,
            description: String,
            time: { type: Date, default: Date.now },
            completed: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// 6. Contact & Inquiry Schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// =========================================================================
// AUTHENTICATION HELPER MIDDLEWARE
// =========================================================================

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // Ignore invalid token for optional auth
        }
    }
    next();
};

// =========================================================================
// INITIAL PRODUCT SEED DATA (Indian Rupees - INR / ₹)
// =========================================================================

const initialProducts = [
    {
        id: 1,
        title: "Aura Apex Book Ultra 16 Titanium",
        brand: "Aura Tech",
        category: "Electronics",
        price: 124999.00,
        originalPrice: 149999.00,
        discount: 17,
        rating: 4.9,
        reviewCount: 142,
        stock: 18,
        badge: "Best Seller",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Engineered for creators. Crafted from aerospace-grade titanium, featuring a 16.2-inch Liquid Retina XDR display with 120Hz ProMotion, 32GB Unified Memory, and 1TB ultra-fast NVMe storage.",
        features: [
            "M3 Ultra 16-Core CPU & 40-Core GPU architecture",
            "16.2-inch Liquid Retina XDR Display (3456 x 2234)",
            "All-day 22-hour battery life with 140W fast charge",
            "Studio-quality 6-speaker sound system with Spatial Audio"
        ],
        specifications: {
            "Processor": "M3 Ultra 16-Core",
            "RAM": "32GB Unified Memory",
            "Storage": "1TB PCIe Gen4 NVMe SSD",
            "Weight": "1.62 kg",
            "Warranty": "2 Years Official Manufacturer Warranty"
        },
        reviews: [
            { userName: "Marcus Vance", rating: 5, comment: "Fastest machine for 4K video rendering and code compilation in India.", date: new Date() },
            { userName: "Pooja Sharma", rating: 5, comment: "Titanium finish is gorgeous and lightweight. Battery lasts two full work days.", date: new Date() }
        ]
    },
    {
        id: 2,
        title: "Sonic Studio ANC Over-Ear Headphones",
        brand: "Sonic Audio",
        category: "Audio",
        price: 24999.00,
        originalPrice: 31999.00,
        discount: 21,
        rating: 4.8,
        reviewCount: 98,
        stock: 35,
        badge: "Top Rated",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Immerse yourself in acoustic perfection. Active Noise Cancellation with dual-core processors eliminates 99.4% of ambient sound while custom beryllium drivers provide breath-taking frequency fidelity.",
        features: [
            "Lossless Spatial Audio with dynamic head tracking",
            "Industry-leading Hybrid Active Noise Cancellation",
            "45-Hour playback on a single charge; 10min charge = 5 hours",
            "Ultra-soft memory foam earcups wrapped in breathable protein leather"
        ],
        specifications: {
            "Driver Size": "40mm Custom Beryllium",
            "Connectivity": "Bluetooth 5.3 & 3.5mm Lossless Jack",
            "Battery Life": "45 Hours (ANC On)",
            "Weight": "250 grams",
            "Noise Cancellation": "Hybrid Multi-Mic Dual Core"
        },
        reviews: [
            { userName: "Rohan Kapoor", rating: 5, comment: "Cuts out metro and flight noise completely. Incredibly crisp sound.", date: new Date() }
        ]
    },
    {
        id: 3,
        title: "Nova X Pro 5G Flagship Smartphone",
        brand: "Nova Mobile",
        category: "Electronics",
        price: 74999.00,
        originalPrice: 89999.00,
        discount: 17,
        rating: 4.9,
        reviewCount: 210,
        stock: 22,
        badge: "New Arrival",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Equipped with a 200MP sensor with optical image stabilization, 120Hz curved LTPO OLED, and satellite emergency communication.",
        features: [
            "6.8-inch Dynamic AMOLED 2X, 1-120Hz variable refresh",
            "200MP Master Camera with 100x Space Zoom",
            "5200mAh Battery with 65W Wireless HyperCharge",
            "IP68 dust and water resistance up to 6 meters"
        ],
        specifications: {
            "Screen": "6.8 inch 120Hz AMOLED 2600 nits",
            "Camera": "200MP Main + 50MP Periscope + 12MP Ultra-wide",
            "Battery": "5200 mAh, 65W Wireless Charging",
            "OS": "Android 15 with Aura Luxe UI",
            "Network": "5G VoNR & Dual SIM"
        },
        reviews: [
            { userName: "Ananya Iyer", rating: 5, comment: "Night photography with this phone is unbelievable. Truly flagship in every metric.", date: new Date() }
        ]
    },
    {
        id: 4,
        title: "Aura Watch Ultra Titanium Edition",
        brand: "Aura Tech",
        category: "Electronics",
        price: 28999.00,
        originalPrice: 35999.00,
        discount: 19,
        rating: 4.8,
        reviewCount: 86,
        stock: 15,
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
        ],
        description: "The rugged smartwatch designed for endurance athletes. Features a 49mm titanium case, dual-frequency GPS, and up to 72 hours of battery life.",
        features: [
            "49mm aerospace-grade titanium case with flat sapphire crystal",
            "Precision dual-frequency GPS (L1 and L5)",
            "ECG, blood oxygen, temperature sensing, and sleep staging",
            "100m water resistance with recreational dive computer certification"
        ],
        specifications: {
            "Case Material": "Aerospace Titanium",
            "Display": "Always-On Retina 3000 nits",
            "Battery": "72h Low Power / 36h Standard",
            "Water Rating": "100m Water Resistant"
        },
        reviews: [
            { userName: "Vikram Malhotra", rating: 5, comment: "Amazing battery life and precision GPS tracking.", date: new Date() }
        ]
    },
    {
        id: 5,
        title: "Italian Handcrafted Calfskin Leather Jacket",
        brand: "Atelier Modena",
        category: "Fashion",
        price: 34999.00,
        originalPrice: 47999.00,
        discount: 27,
        rating: 4.9,
        reviewCount: 64,
        stock: 12,
        badge: "Hot Deal",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Handcrafted in Florence from buttery full-grain Italian calfskin. Features bespoke gunmetal hardware, Japanese cupro silk lining, and tailored silhouette.",
        features: [
            "100% Genuine Full-Grain Italian Calfskin leather",
            "Silky breathable Cupro interior lining",
            "Heavy-duty antiqued YKK Excella zippers",
            "Two interior hidden passport pockets"
        ],
        specifications: {
            "Material": "100% Full Grain Italian Calfskin",
            "Lining": "100% Japanese Bemberg Cupro",
            "Hardware": "Excella Gunmetal",
            "Care": "Specialist Leather Clean Only"
        },
        reviews: [
            { userName: "Sameer Joshi", rating: 5, comment: "Feels like pure luxury. The cut is impeccable.", date: new Date() }
        ]
    },
    {
        id: 6,
        title: "Barista Master Dual-Boiler Espresso Machine",
        brand: "Caffè Maestro",
        category: "Home & Living",
        price: 53999.00,
        originalPrice: 66999.00,
        discount: 19,
        rating: 4.9,
        reviewCount: 115,
        stock: 10,
        badge: "Best Seller",
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Bring third-wave specialty coffee right into your home. Dual stainless steel boilers allow simultaneous espresso extraction and microfoam steaming.",
        features: [
            "Dual Stainless Steel Boilers with PID electronic temp stability",
            "15-Bar Italian high-pressure vibration pump",
            "Commercial 58mm stainless steel portafilter included",
            "LCD interface with integrated shot timer and volumetric control"
        ],
        specifications: {
            "Boiler Capacity": "2.5 Liter Water Tank",
            "Pump Pressure": "15 Bar Italian",
            "Portafilter": "58mm Commercial Brass & Steel",
            "Dimensions": "37cm x 34cm x 40cm"
        },
        reviews: [
            { userName: "Deepa Nair", rating: 5, comment: "Specialty café quality espresso at home every morning.", date: new Date() }
        ]
    },
    {
        id: 7,
        title: "Chrono Royal Automatic Open-Heart Watch",
        brand: "Geneva Horology",
        category: "Fashion",
        price: 47999.00,
        originalPrice: 62000.00,
        discount: 23,
        rating: 4.9,
        reviewCount: 47,
        stock: 8,
        badge: "Luxury Edition",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Swiss automatic movement with an open-heart dial revealing the balance wheel. Encased in 316L surgical steel with anti-reflective sapphire crystal.",
        features: [
            "Caliber 2824-2 Swiss Automatic Movement with 42h power reserve",
            "Domed sapphire crystal with anti-reflective inner coating",
            "Genuine alligator leather strap with butterfly deployant clasp",
            "5 ATM water resistance"
        ],
        specifications: {
            "Case Diameter": "41mm",
            "Movement": "Automatic Mechanical (28,800 vph)",
            "Crystal": "Scratch-proof Sapphire",
            "Strap": "Alligator Embossed Genuine Leather"
        },
        reviews: [
            { userName: "Aditya Roy", rating: 5, comment: "Mesmerizing balance wheel. Truly royal timepiece.", date: new Date() }
        ]
    },
    {
        id: 8,
        title: "Aura Pods Pro Gen 3 Wireless Earbuds",
        brand: "Aura Tech",
        category: "Audio",
        price: 15999.00,
        originalPrice: 20999.00,
        discount: 24,
        rating: 4.8,
        reviewCount: 175,
        stock: 45,
        badge: "Best Seller",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Active noise cancellation with Adaptive Audio and Conversation Awareness. Features wireless charging case and personalized spatial audio.",
        features: [
            "Active Noise Cancellation with Transparency Mode",
            "Personalized Spatial Audio with dynamic head tracking",
            "IP54 sweat and water resistant earbuds and case",
            "30 hours total listening time with USB-C case"
        ],
        specifications: {
            "Battery": "6h per charge, 30h with charging case",
            "Charging": "Qi Wireless, USB-C",
            "Bluetooth": "5.3 Low Latency"
        },
        reviews: [
            { userName: "Kavita Sen", rating: 5, comment: "Transparency mode sounds completely natural. Great bass and call quality.", date: new Date() }
        ]
    },
    {
        id: 9,
        title: "Zenith Minimalist Floating Desk Lamp",
        brand: "Lumiere Design",
        category: "Home & Living",
        price: 9999.00,
        originalPrice: 12999.00,
        discount: 23,
        rating: 4.7,
        reviewCount: 52,
        stock: 30,
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Cantilevered architectural desk lamp. Flicker-free, color-accurate 98 CRI lighting with integrated 15W wireless charging base.",
        features: [
            "98 CRI Full-Spectrum daylight simulation",
            "Stepless touch dimming and color temp adjust (2700K - 6500K)",
            "Integrated 15W Qi Fast Wireless Charging Base",
            "Precision counterweight magnetic suspension hinge"
        ],
        specifications: {
            "Material": "Anodized Aerospace Aluminum",
            "Max Brightness": "1200 Lumens",
            "Power Output": "15W Wireless Qi + 10W USB-C"
        },
        reviews: [
            { userName: "Tarun Bajaj", rating: 5, comment: "Elevates my work desk setup. Wireless charger on base is super convenient.", date: new Date() }
        ]
    },
    {
        id: 10,
        title: "Ergonomic Performance Executive Chair",
        brand: "ErgoForm",
        category: "Home & Living",
        price: 31999.00,
        originalPrice: 41999.00,
        discount: 24,
        rating: 4.8,
        reviewCount: 88,
        stock: 14,
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1580481077195-73ab013f3367?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1580481077195-73ab013f3367?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Promotes healthy sitting posture during extended 10+ hour creative and coding sessions. Breathable elastomeric mesh with 4D omnidirectional armrests.",
        features: [
            "Dynamic Auto-Tuning Lumbar Support system",
            "Breathable high-elasticity mesh fabric",
            "4D Adjustable armrests (height, angle, depth, width)",
            "Smooth synchronous tilt mechanism with 4 lock positions"
        ],
        specifications: {
            "Weight Capacity": "150 kg (330 lbs)",
            "Base": "Heavy-duty polished aluminum 5-star base",
            "Gas Lift": "Class 4 BIFMA Certified"
        },
        reviews: [
            { userName: "Rajesh Menon", rating: 5, comment: "Fixed my lower back posture completely. Best investment for work from home.", date: new Date() }
        ]
    },
    {
        id: 11,
        title: "Aura Cashmere Minimalist Oversized Hoodie",
        brand: "Aura Atelier",
        category: "Fashion",
        price: 13999.00,
        originalPrice: 17999.00,
        discount: 22,
        rating: 4.9,
        reviewCount: 71,
        stock: 25,
        badge: "Hot Deal",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Spun from 100% Grade-A Mongolian cashmere with a relaxed drop-shoulder silhouette. Ribbed cuffs, kangaroo pocket, and double-layered warm hood.",
        features: [
            "100% Sustainable Grade-A Mongolian Cashmere",
            "Heavyweight 450 GSM ultra-dense knit",
            "Pre-shrunk for effortless care",
            "Double-stitched reinforced seam construction"
        ],
        specifications: {
            "Knit": "7-Gauge 2-Ply 100% Pure Cashmere",
            "Fit": "Modern Relaxed / Slightly Oversized",
            "Color": "Obsidian Night Black"
        },
        reviews: [
            { userName: "Meera Singhania", rating: 5, comment: "So soft and cozy without feeling heavy. Premium cut.", date: new Date() }
        ]
    },
    {
        id: 12,
        title: "Aura Soundbar Cinema 7.1 Atmos System",
        brand: "Sonic Audio",
        category: "Audio",
        price: 36999.00,
        originalPrice: 49999.00,
        discount: 26,
        rating: 4.9,
        reviewCount: 63,
        stock: 16,
        badge: "New Arrival",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Transform your living room into a theater. Features upward-firing Dolby Atmos drivers, wireless down-firing 8-inch subwoofer, and crystal dialogue enhancement.",
        features: [
            "True 7.1.2 Dolby Atmos & DTS:X multidimensional audio",
            "Wireless 8-inch 300W down-firing subwoofer",
            "HDMI eARC with 4K HDR10+ and Dolby Vision passthrough",
            "AirPlay 2, Chromecast built-in, and Spotify Connect"
        ],
        specifications: {
            "Total Power": "580 Watts Peak",
            "Channels": "7.1.2 System (11 Total Drivers)",
            "Inputs": "HDMI eARC, Optical, AUX, Bluetooth 5.2"
        },
        reviews: [
            { userName: "Karan Sethi", rating: 5, comment: "Cinematic room-shaking bass. Huge upgrade over TV speakers.", date: new Date() }
        ]
    },
    {
        id: 13,
        title: "Nomad Canvas & Full-Grain Leather Weekender Bag",
        brand: "Nomad Goods",
        category: "Accessories",
        price: 16499.00,
        originalPrice: 21999.00,
        discount: 25,
        rating: 4.8,
        reviewCount: 79,
        stock: 20,
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Built from wax-treated 18oz waterproof duck canvas and vegetable-tanned leather trim with separate ventilated shoe compartment.",
        features: [
            "Weatherproof 18oz Scottish waxed duck canvas",
            "Dedicated ventilated bottom compartment for shoes",
            "Padded 16-inch laptop compartment with quick-access zip",
            "Detachable padded leather shoulder strap"
        ],
        specifications: {
            "Capacity": "45 Liters (Flight Cabin Compliant)",
            "Dimensions": "54cm x 30cm x 28cm",
            "Zippers": "YKK Weather-Proof AquaGuard"
        },
        reviews: [
            { userName: "Nikhil Verma", rating: 5, comment: "Holds clothes for a 4-day trip comfortably. Leather patinas beautifully.", date: new Date() }
        ]
    },
    {
        id: 14,
        title: "Aroma Ceramic Ultrasonic Stone Diffuser",
        brand: "Lumiere Design",
        category: "Home & Living",
        price: 6499.00,
        originalPrice: 8499.00,
        discount: 24,
        rating: 4.7,
        reviewCount: 41,
        stock: 40,
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Hand-poured matte porcelain cover with whisper-quiet ultrasonic technology. Emits a fine cold aromatherapy mist with warm ambient candlelight glow.",
        features: [
            "Matte textured hand-crafted ceramic stone cover",
            "Ultrasonic vibrations without heat degradation",
            "Up to 10 hours continuous diffusion",
            "Auto shut-off sensor when reservoir is dry"
        ],
        specifications: {
            "Capacity": "180ml Water Reservoir",
            "Coverage": "Up to 500 sq ft",
            "Noise Level": "< 20 dB (Whisper Silent)"
        },
        reviews: [
            { userName: "Sunita Agarwal", rating: 5, comment: "Looks like modern Scandinavian art and creates great calming vibes.", date: new Date() }
        ]
    },
    {
        id: 15,
        title: "Titanium Polarized Navigator Sunglasses",
        brand: "Atelier Modena",
        category: "Accessories",
        price: 14999.00,
        originalPrice: 18999.00,
        discount: 21,
        rating: 4.8,
        reviewCount: 53,
        stock: 28,
        badge: "Hot Deal",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Featherlight beta-titanium frame weighing just 18 grams. Equipped with 9-layer polarized lenses offering 100% UV400 protection.",
        features: [
            "Ultra-flexible Japanese Beta-Titanium memory frame",
            "9-Layer polarized lenses with anti-reflective coating",
            "Hypoallergenic medical-grade titanium nose pads",
            "Scratch-resistant sapphire hardness outer treatment"
        ],
        specifications: {
            "Weight": "18 grams",
            "Lens Width": "58mm",
            "Protection": "100% UVA/UVB UV400"
        },
        reviews: [
            { userName: "Amitabh Sen", rating: 5, comment: "Light as a feather. Zero eye strain in bright sun.", date: new Date() }
        ]
    },
    {
        id: 16,
        title: "Precision Mechanical Wireless Keyboard",
        brand: "Aura Tech",
        category: "Electronics",
        price: 12999.00,
        originalPrice: 16999.00,
        discount: 24,
        rating: 4.9,
        reviewCount: 92,
        stock: 32,
        badge: "Top Rated",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
        ],
        description: "CNC-machined aluminum chassis with gasket mount structure for ultra-creamy acoustic typing. Hot-swappable pre-lubed linear switches and south-facing RGB.",
        features: [
            "Full CNC-machined 6063 aluminum body with brass weight bar",
            "Triple connectivity: 2.4GHz low-latency, Bluetooth 5.1, USB-C",
            "Factory pre-lubed Aura Butter Linear mechanical switches",
            "Double-shot PBT keycaps with crisp Cherry profile"
        ],
        specifications: {
            "Layout": "75% Compact (82 Keys)",
            "Battery": "4000 mAh (Up to 200 hours without RGB)",
            "Compatibility": "macOS, Windows, iOS, Android"
        },
        reviews: [
            { userName: "Pranav Deshmukh", rating: 5, comment: "Thocky, deep sound out of the box. Absolutely top notch build.", date: new Date() }
        ]
    }
];

// Seed & Upsert Function
const seedDatabase = async () => {
    try {
        console.log('Synchronizing products with Indian Rupee (₹ INR) pricing in MongoDB...');
        for (const prod of initialProducts) {
            await Product.findOneAndUpdate({ id: prod.id }, { $set: prod }, { upsert: true, new: true });
        }
        console.log('All 16 products updated to INR in MongoDB.');

        // Seed Default Demo Users
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding default demo accounts (Customer & Admin)...');
            const salt = await bcrypt.genSalt(10);
            
            // Demo Customer
            const hashedPasswordUser = await bcrypt.hash('password123', salt);
            const demoUser = await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPasswordUser,
                role: 'user',
                phone: '+91 98765 43210',
                address: {
                    street: 'Flat 402, Sea Green Towers, Bandra West',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400050',
                    country: 'India'
                },
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
            });

            // Demo Admin
            const hashedPasswordAdmin = await bcrypt.hash('admin123', salt);
            await User.create({
                name: 'Store Administrator',
                email: 'admin@example.com',
                password: hashedPasswordAdmin,
                role: 'admin',
                phone: '+91 98111 22334',
                address: {
                    street: 'Level 12, Express Towers, Nariman Point',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400021',
                    country: 'India'
                },
                avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
            });

            // Seed initial sample order for John Doe in INR
            const sampleOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
            const sampleTracking = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
            await Order.create({
                orderId: sampleOrderId,
                userId: demoUser.email,
                customerName: demoUser.name,
                customerEmail: demoUser.email,
                customerPhone: demoUser.phone,
                shippingAddress: demoUser.address,
                items: [
                    {
                        productId: 2,
                        title: "Sonic Studio ANC Over-Ear Headphones",
                        price: 24999.00,
                        quantity: 1,
                        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                        category: "Audio"
                    },
                    {
                        productId: 9,
                        title: "Zenith Minimalist Floating Desk Lamp",
                        price: 9999.00,
                        quantity: 1,
                        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
                        category: "Home & Living"
                    }
                ],
                subtotal: 34998.00,
                shippingFee: 0,
                tax: 6299.64,
                discount: 3499.80,
                promoCode: 'SAVE10',
                totalAmount: 37797.84,
                currency: 'INR',
                paymentMethod: 'UPI / QR Code',
                paymentStatus: 'Paid',
                status: 'Shipped',
                carrier: 'BlueDart Express',
                trackingNumber: sampleTracking,
                estimatedDelivery: 'Oct 30, 2026',
                timeline: [
                    {
                        status: 'Processing',
                        title: 'Order Placed & Payment Confirmed',
                        description: 'Your payment via UPI was authorized.',
                        time: new Date(Date.now() - 48 * 3600 * 1000),
                        completed: true
                    },
                    {
                        status: 'Confirmed',
                        title: 'Quality Checked & Packed',
                        description: 'Items securely packed at Mumbai Fulfillment Center.',
                        time: new Date(Date.now() - 36 * 3600 * 1000),
                        completed: true
                    },
                    {
                        status: 'Shipped',
                        title: 'In Transit with BlueDart Express',
                        description: 'Package departed carrier sorting hub.',
                        time: new Date(Date.now() - 12 * 3600 * 1000),
                        completed: true
                    },
                    {
                        status: 'Out for Delivery',
                        title: 'Out for Delivery',
                        description: 'Local courier will deliver to your doorstep.',
                        time: new Date(Date.now() + 24 * 3600 * 1000),
                        completed: false
                    },
                    {
                        status: 'Delivered',
                        title: 'Package Delivered',
                        description: 'Signed and delivered at destination.',
                        time: new Date(Date.now() + 36 * 3600 * 1000),
                        completed: false
                    }
                ]
            });

            console.log('Demo accounts & sample order initialized in INR.');
        }
    } catch (err) {
        console.error('Database seeding error:', err.message);
    }
};

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log(`Connected successfully to MongoDB at ${MONGO_URI}`);
        await seedDatabase();
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        console.log('Running in resilient mode: APIs will report database connectivity state.');
    });

// =========================================================================
// API ROUTES
// =========================================================================

// --- Health & Diagnostic ---
app.get('/api/health', async (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    let counts = { products: 0, users: 0, orders: 0 };
    if (isDbConnected) {
        try {
            counts.products = await Product.countDocuments();
            counts.users = await User.countDocuments();
            counts.orders = await Order.countDocuments();
        } catch (e) {}
    }
    res.json({
        success: true,
        status: 'online',
        database: isDbConnected ? 'connected' : 'disconnected',
        currency: 'INR',
        mongoUri: MONGO_URI,
        timestamp: new Date(),
        counts
    });
});

// Force Re-seed endpoint
app.post('/api/seed', async (req, res) => {
    try {
        await seedDatabase();
        res.json({ success: true, message: 'Database updated to Indian Rupees successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- AUTHENTICATION ROUTES ---

// 1. User Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone || '',
            address: address || { country: 'India' },
            role: 'user'
        });

        // Initialize user isolated cart & wishlist
        await Cart.create({ userId: newUser.email, items: [] });
        await Wishlist.create({ userId: newUser.email, productIds: [] });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'Account registered successfully.',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                address: newUser.address
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Signed in successfully.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Get Current User Profile (Protected)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Update Profile & Shipping Address (Protected)
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone, address, avatar } = req.body;
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address) user.address = { ...user.address, ...address };
        if (avatar) user.avatar = avatar;

        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- PRODUCT CATALOG ROUTES ---

// 1. Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sortBy, inStock } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { brand: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        let sortOption = {};
        if (sortBy === 'price-low') sortOption = { price: 1 };
        else if (sortBy === 'price-high') sortOption = { price: -1 };
        else if (sortBy === 'rating') sortOption = { rating: -1 };
        else if (sortBy === 'newest') sortOption = { createdAt: -1 };
        else sortOption = { id: 1 };

        let products = await Product.find(query).sort(sortOption);

        if (products.length === 0 && !category && !search) {
            products = initialProducts;
        }

        res.json({ success: true, count: products.length, currency: 'INR', products });
    } catch (err) {
        console.error('Fetch products error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Get Single Product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = Number(req.params.id);
        let product = await Product.findOne({ id: productId });
        if (!product) {
            product = initialProducts.find(p => p.id === productId);
        }
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.json({ success: true, currency: 'INR', product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Add Customer Review
app.post('/api/products/:id/review', optionalAuthMiddleware, async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const { rating, comment, userName } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
        }

        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const reviewer = userName || (req.user ? req.user.name : 'Verified Customer');
        const newReview = {
            userName: reviewer,
            rating: Number(rating),
            comment,
            date: new Date()
        };

        product.reviews.unshift(newReview);
        product.reviewCount = product.reviews.length;
        const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
        product.rating = Number((totalRating / product.reviews.length).toFixed(1));

        await product.save();
        res.json({ success: true, message: 'Review added successfully.', product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- CART ROUTES ---

app.get('/api/cart', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        res.json({ success: true, currency: 'INR', items: cart.items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findOne({ id: Number(productId) });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId === Number(productId));
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += Number(quantity);
        } else {
            cart.items.push({
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: Number(quantity)
            });
        }

        await cart.save();
        res.json({ success: true, message: 'Item added to cart.', currency: 'INR', items: cart.items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/cart/item', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        const { productId, quantity } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

        const itemIndex = cart.items.findIndex(i => i.productId === Number(productId));
        if (itemIndex > -1) {
            if (Number(quantity) <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = Number(quantity);
            }
            await cart.save();
        }

        res.json({ success: true, currency: 'INR', items: cart.items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/cart/:productId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        const productId = Number(req.params.productId);

        let cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = cart.items.filter(i => i.productId !== productId);
            await cart.save();
        }
        res.json({ success: true, message: 'Item removed from cart.', currency: 'INR', items: cart ? cart.items : [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/cart', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        let cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ success: true, message: 'Cart cleared successfully.', items: [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- WISHLIST ROUTES ---

app.get('/api/wishlist', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, productIds: [] });
        }

        const products = await Product.find({ id: { $in: wishlist.productIds } });
        res.json({
            success: true,
            currency: 'INR',
            productIds: wishlist.productIds,
            products
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/wishlist/toggle', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        const productId = Number(req.body.productId);

        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = new Wishlist({ userId, productIds: [] });
        }

        const index = wishlist.productIds.indexOf(productId);
        let action = 'added';
        if (index > -1) {
            wishlist.productIds.splice(index, 1);
            action = 'removed';
        } else {
            wishlist.productIds.push(productId);
            action = 'added';
        }

        await wishlist.save();
        const products = await Product.find({ id: { $in: wishlist.productIds } });

        res.json({
            success: true,
            action,
            message: action === 'added' ? 'Added to your wishlist.' : 'Removed from your wishlist.',
            currency: 'INR',
            productIds: wishlist.productIds,
            products
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- ORDERS & TRACKING ROUTES ---

app.post('/api/orders', optionalAuthMiddleware, async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            items,
            subtotal,
            shippingFee,
            tax,
            discount,
            promoCode,
            totalAmount,
            paymentMethod
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cannot place an empty order.' });
        }
        if (!customerName || !customerEmail || !shippingAddress || !shippingAddress.street) {
            return res.status(400).json({ success: false, message: 'Please provide full contact and shipping details.' });
        }

        const orderId = `ORD-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
        const trackingNumber = `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const userId = req.user ? req.user.email : (customerEmail.toLowerCase().trim() || 'guest');

        const deliveryDate = new Date(Date.now() + 3 * 24 * 3600 * 1000);
        const estimatedDeliveryStr = deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const initialTimeline = [
            {
                status: 'Processing',
                title: 'Order Placed & Payment Verified',
                description: `Payment confirmed via ${paymentMethod || 'UPI'}. Queued in warehouse fulfillment.`,
                time: new Date(),
                completed: true
            },
            {
                status: 'Confirmed',
                title: 'Quality Checked & Packed',
                description: 'Items securely inspected and packaged in distribution center.',
                time: new Date(Date.now() + 6 * 3600 * 1000),
                completed: false
            },
            {
                status: 'Shipped',
                title: 'In Transit with BlueDart Express',
                description: `Dispatched with air waybill #${trackingNumber}.`,
                time: new Date(Date.now() + 18 * 3600 * 1000),
                completed: false
            },
            {
                status: 'Out for Delivery',
                title: 'Out for Delivery',
                description: 'Arrived at your local delivery hub. Dispatched for door delivery.',
                time: new Date(Date.now() + 48 * 3600 * 1000),
                completed: false
            },
            {
                status: 'Delivered',
                title: 'Package Delivered',
                description: 'Delivered safely to recipient address.',
                time: deliveryDate,
                completed: false
            }
        ];

        const newOrder = await Order.create({
            orderId,
            userId,
            customerName,
            customerEmail: customerEmail.toLowerCase().trim(),
            customerPhone: customerPhone || '',
            shippingAddress,
            items,
            subtotal: Number(subtotal),
            shippingFee: Number(shippingFee || 0),
            tax: Number(tax || 0),
            discount: Number(discount || 0),
            promoCode: promoCode || '',
            totalAmount: Number(totalAmount),
            currency: 'INR',
            paymentMethod: paymentMethod || 'UPI / QR Code',
            paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
            status: 'Processing',
            carrier: 'BlueDart Express',
            trackingNumber,
            estimatedDelivery: estimatedDeliveryStr,
            timeline: initialTimeline
        });

        if (req.user) {
            await Cart.findOneAndUpdate({ userId: req.user.email }, { items: [] });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            currency: 'INR',
            order: newOrder
        });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.email;
        const orders = await Order.find({
            $or: [
                { userId: userId },
                { customerEmail: userId }
            ]
        }).sort({ createdAt: -1 });

        res.json({ success: true, count: orders.length, currency: 'INR', orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/orders/track/:orderId', async (req, res) => {
    try {
        const queryParam = req.params.orderId.trim();
        const order = await Order.findOne({
            $or: [
                { orderId: queryParam },
                { trackingNumber: queryParam }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: `No order found with ID or tracking number '${queryParam}'.` });
        }

        res.json({
            success: true,
            orderId: order.orderId,
            status: order.status,
            carrier: order.carrier,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            customerName: order.customerName,
            shippingAddress: order.shippingAddress,
            timeline: order.timeline,
            items: order.items,
            totalAmount: order.totalAmount,
            currency: 'INR'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId.trim() });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true, currency: 'INR', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, currency: 'INR', orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/orders/:orderId/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findOne({ orderId: req.params.orderId.trim() });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        order.status = status;

        const statusHierarchy = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const targetIndex = statusHierarchy.indexOf(status);

        if (targetIndex !== -1) {
            order.timeline.forEach((step, idx) => {
                if (idx <= targetIndex) {
                    step.completed = true;
                    if (idx === targetIndex) {
                        step.time = new Date();
                    }
                } else {
                    step.completed = false;
                }
            });
        }

        await order.save();
        res.json({ success: true, message: `Order status updated to ${status}.`, currency: 'INR', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- PROMO / COUPON CODE VALIDATION (INR) ---
app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required.' });

    const normalizedCode = code.toUpperCase().trim();
    const orderSubtotal = Number(subtotal || 0);

    const coupons = {
        'SAVE10': { type: 'percent', value: 10, minOrder: 1999, desc: '10% off orders over ₹1,999' },
        'WELCOME20': { type: 'percent', value: 20, minOrder: 4999, desc: '20% off orders over ₹4,999' },
        'LUXE50': { type: 'fixed', value: 2500, minOrder: 20000, desc: '₹2,500 off luxury orders over ₹20,000' }
    };

    const coupon = coupons[normalizedCode];
    if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid promo code. Try SAVE10 or WELCOME20.' });
    }

    if (orderSubtotal < coupon.minOrder) {
        return res.status(400).json({
            success: false,
            message: `Minimum order amount of ₹${coupon.minOrder.toLocaleString('en-IN')} required for ${normalizedCode}.`
        });
    }

    let discountAmount = 0;
    if (coupon.type === 'percent') {
        discountAmount = (orderSubtotal * coupon.value) / 100;
    } else {
        discountAmount = coupon.value;
    }

    res.json({
        success: true,
        code: normalizedCode,
        discount: Number(discountAmount.toFixed(2)),
        currency: 'INR',
        description: coupon.desc
    });
});

// Wildcard route to serve the React SPA for any unhandled routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'), (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, '../index.html'));
        }
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` AURA LUXE E-COMMERCE SERVER RUNNING ON PORT ${PORT}`);
    console.log(` Currency: Indian Rupees (₹ INR)`);
    console.log(` Target MongoDB URI: ${MONGO_URI}`);
    console.log(` API Health: http://localhost:${PORT}/api/health`);
    console.log(` Frontend:   http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
