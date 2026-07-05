import { MessageCircleMore, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-xl font-semibold text-white">SVK Sweets</h3>
          <p className="mt-3 max-w-sm text-sm leading-7 text-stone-400">Authentic Indian sweets handcrafted for festivals, celebrations, and premium gifting.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/products" className="hover:text-[#D4AF37]">Shop Now</a></li>
            <li><a href="/about" className="hover:text-[#D4AF37]">About Us</a></li>
            <li><a href="/contact" className="hover:text-[#D4AF37]">Contact</a></li>
            <li><a href="/privacy" className="hover:text-[#D4AF37]">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-[#D4AF37]">Terms & Conditions</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Visit Us</h4>
          <ul className="mt-3 space-y-3 text-sm text-stone-400">
            <li className="flex items-center gap-2"><MapPin size={16} /> 12, Anna Salai, Chennai</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MessageCircleMore size={16} /> @svk.sweets</li>
            <li className="flex items-center gap-2"><MessageCircleMore size={16} /> SVK Sweets</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
