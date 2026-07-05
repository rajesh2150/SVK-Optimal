import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Leaf, Sparkles, Store, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import type { ContactInfo, Product, TestimonialItem } from '../types';
import { getDefaultProducts, getStoredProducts, saveProducts } from '../lib/sweetStore';
import palakovaImage from '../assets/palakova.webp';
import milkSweetsImage from '../assets/milk_sweet.webp';
import dryFruitSweetsImage from '../assets/dryfruitsweet.webp';

const heroSlides = [
  {
    title: 'Palakova made for every celebration',
    subtitle: 'Creamy, rich and nostalgic.',
    image: palakovaImage,
  },
  {
    title: 'Milk sweets with a timeless finish',
    subtitle: 'Freshly prepared and beautifully packed.',
    image: milkSweetsImage,
  },
  {
    title: 'Premium dry fruit sweets for gifting',
    subtitle: 'Elegant sweets for special occasions.',
    image: dryFruitSweetsImage,
  },
];

const testimonials: TestimonialItem[] = [
  { id: 1, customerName: 'Riya', location: 'Chennai', message: 'The flavours are exactly like home. Every box feels special.', rating: 5 },
  { id: 2, customerName: 'Anand', location: 'Coimbatore', message: 'Fast delivery and the quality is always premium.', rating: 5 },
  { id: 3, customerName: 'Meera', location: 'Madurai', message: 'Beautiful packaging and the taste is simply unforgettable.', rating: 5 },
];

const contact: ContactInfo = {
  address: '12, Anna Salai, Chennai',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
};

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem('svk-products')) {
      saveProducts(getDefaultProducts());
      setProducts(getDefaultProducts());
    }
    setProducts(getStoredProducts());
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const interval = window.setInterval(() => {
      if (!isHovered) {
        setActiveSlide((prev) => (prev + 1) % heroSlides.length);
      }
    }, 4000);
    return () => window.clearInterval(interval);
  }, [isHovered]);

  const featuredProducts = useMemo(() => products.filter((product) => product.featured).slice(0, 3), [products]);
  const bestSellers = useMemo(() => products.filter((product) => product.bestSeller).slice(0, 3), [products]);
  const activeHero = heroSlides[activeSlide];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF7D6] px-3 py-2 text-sm font-semibold text-[#8B4513]">
            <Sparkles size={16} /> Premium handcrafted sweets since 2023
          </div>
          <h1 className={`mt-6 text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl transition duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>Authentic SVK Sweets for every celebration.</h1>
          <p className={`mt-4 max-w-2xl text-lg leading-8 text-stone-600 transition duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>From decadent palakova to festival gift boxes, discover classic Indian confections made with tradition, purity, and premium ingredients.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white transition hover:bg-[#6f3410]">Shop Collection</Link>
            <Link to="/about" className="rounded-full border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition hover:border-[#D4AF37] hover:text-[#8B4513]">About SVK</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-2xl font-semibold text-[#8B4513]">10k+</p>
              <p className="text-sm text-stone-600">Happy customers</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-2xl font-semibold text-[#8B4513]">24/7</p>
              <p className="text-sm text-stone-600">Orders & support</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-2xl font-semibold text-[#8B4513]">4.9★</p>
              <p className="text-sm text-stone-600">Average rating</p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-[#FFF7D6] via-white to-[#F2E2C6] p-4 sm:p-6" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <div className="relative overflow-hidden rounded-[1.5rem]">
            <img src={activeHero.image} alt={activeHero.title} className="h-[320px] w-full object-cover transition duration-500 sm:h-[420px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/30 bg-white/85 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Featured showcase</p>
              <p className="mt-2 text-xl font-semibold text-stone-900">{activeHero.title}</p>
              <p className="mt-1 text-sm text-stone-600">{activeHero.subtitle}</p>
            </div>
            <button onClick={() => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/80 p-2 shadow-sm">
              <ChevronLeft size={20} className="text-stone-800" />
            </button>
            <button onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/80 p-2 shadow-sm">
              <ChevronRight size={20} className="text-stone-800" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            {heroSlides.map((slide, index) => (
              <button key={slide.title} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-[#8B4513]' : 'w-2.5 bg-stone-300'}`} />
            ))}
          </div>
        </div>
      </section>


      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Featured</p>
            <h2 className="text-3xl font-semibold text-stone-900">Featured sweets</h2>
          </div>
          <Link to="/products" className="flex items-center gap-2 text-sm font-semibold text-[#8B4513]">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-stone-200 bg-[#FFF7D6] p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8B4513]">Why choose SVK</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">Freshly made with premium ingredients and thoughtful packaging.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: BadgeCheck, title: 'Premium Quality', copy: 'Made with fresh milk, pure ghee, and finest nuts.' },
            { icon: Truck, title: 'Fast Delivery', copy: 'Same-day and scheduled deliveries across the city.' },
            { icon: ShieldCheck, title: 'Hygienic Prep', copy: 'Crafted and packed in clean, modern conditions.' },
            { icon: Leaf, title: 'Authentic Taste', copy: 'Traditional recipes preserved with modern standards.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm">
              <item.icon className="text-[#8B4513]" />
              <h3 className="mt-3 text-lg font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Best sellers</p>
            <h2 className="text-3xl font-semibold text-stone-900">Customer favourites</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">About SVK Sweets</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">A legacy of indulgence and celebration.</h2>
          <p className="mt-4 text-lg leading-8 text-stone-600">We combine age-old recipes and modern quality practices to bring you premium sweets that delight every generation.</p>
          <Link to="/about" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#8B4513]">Learn more <ArrowRight size={16} /></Link>
        </div>
        <div className="space-y-4 rounded-[2rem] border border-stone-200 bg-stone-900 p-7 text-white shadow-sm">
          <div className="flex items-center gap-3 text-[#D4AF37]"><Store size={18} /> <span className="font-semibold">Contact SVK Sweets</span></div>
          <p className="text-lg leading-8 text-stone-300">{contact.address}</p>
          <p className="text-lg leading-8 text-stone-300">Phone: {contact.phone}</p>
          <p className="text-lg leading-8 text-stone-300">WhatsApp: {contact.whatsapp}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-stone-900">Start a conversation <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Testimonials</p>
          <h2 className="text-3xl font-semibold text-stone-900">What customers say</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.id} className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-1 text-[#D4AF37]">{'★'.repeat(item.rating)}</div>
              <p className="mt-4 text-base leading-8 text-stone-600">“{item.message}”</p>
              <div className="mt-5">
                <p className="font-semibold text-stone-900">{item.customerName}</p>
                <p className="text-sm text-stone-500">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
