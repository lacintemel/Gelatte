// ── External Shop/Order URL ──
// All "Order", "Shop", and cart-related buttons redirect to this URL
export const SHOP_URL = "https://example.com";

// ── Brand ──
export const BRAND = {
  name: "GELATTE",
  tagline: "Gelato | Coffee | Bakery",
  description: "A premium destination for artisan gelato, specialty coffee, and luxury desserts.",
};

// ── Navigation Links ──
export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#categories" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

// ── Categories ──
export const CATEGORIES = [
  {
    title: "Gelato",
    description: "Artisan Italian gelato crafted with the finest natural ingredients",
    image: "/images/gelato.png",
  },
  {
    title: "Coffee",
    description: "Specialty single-origin coffees, expertly roasted and brewed",
    image: "/images/coffee.png",
  },
  {
    title: "Bakery",
    description: "Fresh-baked pastries and breads from our artisan kitchen",
    image: "/images/bakery.png",
  },
  {
    title: "Waffle",
    description: "Belgian waffles with premium toppings and signature sauces",
    image: "/images/waffle.png",
  },
  {
    title: "Baklava",
    description: "Traditional pistachio baklava with a modern luxurious twist",
    image: "/images/baklava.png",
  },
  {
    title: "Desserts",
    description: "Exquisite handcrafted desserts for the discerning palate",
    image: "/images/dessert.png",
  },
];

// ── Signature Products ──
export const PRODUCTS = [
  {
    name: "Pistachio Royale Gelato",
    description: "Sicilian pistachios churned into velvety perfection with a hint of Madagascar vanilla",
    price: "€8.50",
    badge: "Signature",
    image: "/images/gelato.png",
  },
  {
    name: "Pistachio Baklava",
    description: "Layers of golden phyllo dough filled with premium Antep pistachios and rose-infused honey",
    price: "€12.00",
    badge: "Best Seller",
    image: "/images/baklava.png",
  },
  {
    name: "Belgian Waffle Deluxe",
    description: "Crispy Belgian waffle topped with fresh berries, artisan gelato, and Belgian chocolate",
    price: "€14.50",
    badge: "Signature",
    image: "/images/waffle.png",
  },
  {
    name: "Pistachio Layer Cake",
    description: "Five layers of pistachio sponge with mascarpone cream and raspberry coulis",
    price: "€9.50",
    badge: "Fresh Daily",
    image: "/images/cake.png",
  },
  {
    name: "Artisan Croissants",
    description: "48-hour fermented butter croissants baked to golden perfection each morning",
    price: "€5.50",
    badge: "Fresh Daily",
    image: "/images/bakery.png",
  },
  {
    name: "Signature Latte",
    description: "Single-origin Ethiopian beans with silky microfoam and our house-made vanilla syrup",
    price: "€6.50",
    badge: "Best Seller",
    image: "/images/coffee.png",
  },
];

// ── Testimonials ──
export const TESTIMONIALS = [
  {
    name: "Isabelle Laurent",
    role: "Food Critic",
    text: "GELATTE redefines what a dessert experience should be. The pistachio gelato alone is worth the visit — it's the best I've tasted outside of Sicily. The atmosphere is pure luxury.",
    rating: 5,
  },
  {
    name: "Marco Pellegrini",
    role: "Culinary Journalist",
    text: "Walking into GELATTE feels like entering a Milanese boutique. Every detail, from the pastry displays to the coffee art, speaks of uncompromising quality. A true gem.",
    rating: 5,
  },
  {
    name: "Sophia Chen",
    role: "Lifestyle Blogger",
    text: "The baklava here is a revelation — crispy, nutty, perfectly sweet. Combined with their specialty coffee, it's my new favorite indulgence. Elegant, warm, and unforgettable.",
    rating: 5,
  },
];

// ── Gallery Images ──
export const GALLERY = [
  { src: "/images/hero-bg.png", alt: "GELATTE boutique interior" },
  { src: "/images/store-interior.png", alt: "Premium pastry display" },
  { src: "/images/gallery-display.png", alt: "Artisan gelato counter" },
  { src: "/images/gelato.png", alt: "Signature pistachio gelato" },
  { src: "/images/baklava.png", alt: "Pistachio baklava platter" },
  { src: "/images/cake.png", alt: "Artisan layer cake" },
];

// ── Contact Info ──
export const CONTACT = {
  address: "42 Via della Dolcezza, Milan 20121, Italy",
  phone: "+39 02 1234 5678",
  email: "hello@gelatte.com",
  hours: [
    { days: "Monday — Friday", time: "7:00 AM — 10:00 PM" },
    { days: "Saturday", time: "8:00 AM — 11:00 PM" },
    { days: "Sunday", time: "8:00 AM — 9:00 PM" },
  ],
  social: {
    instagram: "https://instagram.com/gelatte",
    facebook: "https://facebook.com/gelatte",
    twitter: "https://twitter.com/gelatte",
    tiktok: "https://tiktok.com/@gelatte",
  },
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.154!2d9.189!3d45.464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDI3JzUwLjQiTiA5wrAxMSczMi40IkU!5e0!3m2!1sen!2sit!4v1",
};
