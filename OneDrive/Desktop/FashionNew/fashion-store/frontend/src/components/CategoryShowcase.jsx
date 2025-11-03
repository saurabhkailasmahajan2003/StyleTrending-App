import React from 'react';
import { Link } from 'react-router-dom';

const CategoryShowcase = () => {
  const categories = [
    {
      name: 'New Arrivals',
      href: '/shop?new=true',
      image: 'https://apkamart.com/cdn/shop/files/Earrings_apkamart_10_6e252fdb-a428-4036-9c9b-7e6cd1967e26.jpg?v=1709376375&width=1500',
      alt: 'Woman wearing a beige knit sweater and long skirt.'
    },
    {
      name: 'Apparel',
      href: '/category/Womens',
      image: 'https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-AI211971190001_alternate10?$plpDeskRF$',
      alt: 'Woman wearing a long beige trench coat.'
    },
    {
      name: 'Bags',
      href: '/shop?q=bag',
      image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTGBSvBPdB2_dgya9Eff5xrf-W1J9Zqp45bExYLKOB-C-naS-puYCo26_fCArS1yMlFnkHKBCSrSZ3LJ_r5_EHdB_AjE5E8-QJZJI9ynNigkkG_MhqnF_9dfA',
      alt: 'Woman wearing a sparkling bronze party dress.'
    },
    {
      name: 'Accessories',
      href: '/shop?q=accessories',
      image: 'https://product-assets.rinascente.it/80/52792/8052792075386_01_PNrcKv.jpg?impolicy=resize&imwidth=818',
      alt: 'Woman wearing a leopard print tracksuit set.'
    },
    {
      name: 'Sale',
      href: '/shop?sale=true',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwBKi-1Wfur0k6e9YBEzPRGW-zte9jJBzHOw&s',
      alt: 'Close-up of a person putting on stylish running shoes.'
    },
    {
      name: 'Shop All',
      href: '/shop',
      image: 'https://plumgoodness.com/cdn/shop/files/001_2de71673-9eb7-4023-a364-39ef6a68fc9c.jpg?v=1758791596&width=460',
      alt: 'A collection of beauty products and gift boxes.'
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight mb-8 md:mb-12">Shop by Style</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-6 overflow-x-auto overflow-y-hidden md:overflow-hidden pb-4 md:pb-0 flex-nowrap md:flex-wrap">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="relative flex-shrink-0 w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[1/1] rounded-lg overflow-hidden shadow-md group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ minWidth: '150px' }}
              aria-label={`Shop ${category.name}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${category.image}')` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-sm sm:text-base font-semibold tracking-wide">{category.name}</p>
                <span className="block h-0.5 bg-white w-0 group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;


