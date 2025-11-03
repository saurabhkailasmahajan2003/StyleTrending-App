import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

const HeroFloatingCard = ({title, subtitle, price, bg='bg-white'}) => (
  <div className={`rounded-2xl p-4 w-56 ${bg} shadow-lg border border-white/30`}> 
    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-3 flex items-center justify-center">
      <div className="w-20 h-28 bg-gradient-to-br from-rose-100 to-amber-100 rounded-md"></div>
    </div>
    <div className="text-sm font-medium text-gray-900">{title}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
    <div className="text-sm font-semibold text-primary-600 mt-2">₹{price}</div>
  </div>
);

const ElegantFashionHero = () => {
  const reduce = useReducedMotion();

  const headline = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const float = (i=0) => ({
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.12, duration: 0.6, type: 'spring', stiffness: 90 } }
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/20 to-white">
      {/* Decorative Blobs */}
      <svg className="pointer-events-none absolute -top-40 -left-20 w-[650px] opacity-30" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g transform="translate(300,300)">
          <path d="M120 -150 C180 -120, 260 -60, 260 20 C260 100, 160 160, 80 200 C0 240, -80 250, -140 210 C-200 170, -230 90, -220 10 C-210 -70, -150 -150, -80 -180 C-10 -210, 60 -180, 120 -150Z" fill="#FFEEF3" />
        </g>
      </svg>

  <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Text */}
          <div className="lg:col-span-6 space-y-6 z-10">
            <motion.div initial="hidden" animate="show" variants={headline}>
              <div className="inline-flex items-center gap-3 py-1 px-3 rounded-full bg-white/60 backdrop-blur-sm border border-white/30 shadow-sm">
                <span className="text-xs tracking-wider text-gray-600">LIMITED EDITION</span>
              </div>
            </motion.div>

            <motion.h1 initial="hidden" animate="show" variants={headline} className="text-3xl md:text-4xl lg:text-5xl font-display leading-tight">
              <span className="block text-rose-600">Sculpted</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl text-gray-900">Luxury for Everyday</span>
            </motion.h1>

            <motion.p initial="hidden" animate="show" variants={headline} className="text-lg text-gray-600 max-w-xl">
              Hand-crafted essentials with a contemporary voice — responsibly sourced fabrics, expert tailoring, and effortless styling.
            </motion.p>

            <motion.div initial="hidden" animate="show" variants={headline} className="flex flex-col sm:flex-row gap-3">
              <Link to="/shop" className="btn primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium">
                Shop The Drop
              </Link>
              <Link to="/shop?look=editorial" className="btn inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-gray-200">
                View Lookbook
              </Link>
            </motion.div>

            <motion.div initial="hidden" animate="show" variants={headline} className="flex items-center gap-8 pt-6">
              <div>
                <div className="text-sm font-semibold text-gray-900">New Arrivals</div>
                <div className="text-xs text-gray-500"> curated weekly</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Sustainability</div>
                <div className="text-xs text-gray-500">slow-fashion initiatives</div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Visual composition (simplified) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="w-full max-w-2xl relative">
              <motion.div initial="hidden" animate="show" variants={float(0)} className="relative rounded-2xl overflow-hidden">
                <div className="aspect-[3/2] rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd" alt="Model wearing fashion" className="w-full h-full object-cover" loading="lazy"/>
                </div>

                {/* Single floating small card */}
                <motion.div initial={reduce ? 'show' : 'hidden'} animate="show" variants={float(1)} className="absolute -top-6 -right-6">
                  <HeroFloatingCard title="Linen Midi" subtitle="Best seller" price={248} bg="bg-white/95" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center text-sm text-gray-500">
            <span>Scroll to explore</span>
            <div className="mt-2 w-px h-8 bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElegantFashionHero;


