const AboutPage = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">About SVK Sweets</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Handcrafted sweets, timeless tradition.</h1>
        <p className="mt-4 text-lg leading-8 text-stone-600">SVK Sweets brings together traditional recipes, premium ingredients, and modern quality standards to create indulgent sweets for weddings, festivals, gifting, and everyday celebrations.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {['Authentic recipes', 'Freshly prepared daily', 'Premium packaging'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-semibold text-stone-900">{item}</h3><p className="mt-3 text-sm leading-7 text-stone-600">Crafted to preserve flavor, texture, and the joy of sharing sweets with loved ones.</p></div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
