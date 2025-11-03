import DropdownMenu from './DropdownMenu.jsx';

const categories = [
  { label: 'Mens', path: '/category/Mens' },
  { label: 'Womens', path: '/category/Womens' },
  { label: 'Kids', path: '/category/Kids' }
];

const subCategories = [
  { label: 'Bottom Wear', key: 'Bottom Wear' },
  { label: 'Shirts', key: 'Shirts' },
  { label: 'Tshirts', key: 'Tshirts' },
  { label: 'Blazers', key: 'Blazers' },
  { label: 'Footwear', key: 'Footwear' }
];

export default function SubNavbar() {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-2 flex gap-6">
        {categories.map((c) => (
          <DropdownMenu key={c.label} label={c.label} path={c.path} items={subCategories} />
        ))}
      </div>
    </div>
  );
}


