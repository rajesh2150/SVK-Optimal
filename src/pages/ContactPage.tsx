const ContactPage = () => {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Contact us</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">We’d love to hear from you.</h1>
        <p className="mt-4 text-lg leading-8 text-stone-600">Call us, message on WhatsApp, or visit our store for custom orders, festival boxes, and bulk catering.</p>
        <div className="mt-6 space-y-3 text-stone-600">
          <p>Phone: +91 98765 43210</p>
          <p>Email: hello@svksweets.com</p>
          <p>Address: 12, Anna Salai, Chennai</p>
          <p>Hours: Everyday 8 AM - 10 PM</p>
        </div>
      </div>
      <div className="rounded-[2rem] border border-stone-200 bg-[#FFF7D6] p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-900">WhatsApp support</h2>
        <p className="mt-4 text-lg leading-8 text-stone-600">Need help choosing the perfect sweet box? Reach us directly on WhatsApp for instant assistance and custom recommendations.</p>
        <a href="https://wa.me/919876543210" className="mt-6 inline-flex rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white">Chat on WhatsApp</a>
      </div>
    </div>
  );
};

export default ContactPage;
