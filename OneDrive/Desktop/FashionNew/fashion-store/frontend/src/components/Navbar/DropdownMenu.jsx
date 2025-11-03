import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DropdownMenu({ label, path, items }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50" onClick={() => navigate(path)}>
        {label}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            {items.map((i) => (
              <Link key={i.key} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" to={`${path}?sub=${encodeURIComponent(i.key)}`}>
                {i.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


