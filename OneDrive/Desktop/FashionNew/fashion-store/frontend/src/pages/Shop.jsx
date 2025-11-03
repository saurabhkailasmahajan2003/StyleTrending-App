import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/productAPI.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || 1);
  const keyword = searchParams.get('q') || '';
  const onSale = searchParams.get('sale') || '';
  const isNewArrival = searchParams.get('new') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchProducts({ page, keyword, onSale, isNewArrival });
      setData(res);
      setLoading(false);
    })();
  }, [page, keyword, onSale, isNewArrival]);

  const onPageChange = (next) => setSearchParams({ page: String(next), q: keyword, sale: onSale, new: isNewArrival });

  const applyFilters = (nextKeyword, nextSale, nextNew) => {
    const params = new URLSearchParams();
    if (nextKeyword) params.set('q', nextKeyword);
    if (nextSale) params.set('sale', nextSale);
    if (nextNew) params.set('new', nextNew);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Shop</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            className="w-full sm:w-64 rounded-md border border-gray-200 px-3 py-2 text-sm"
            placeholder="Search products..."
            defaultValue={keyword}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters(e.currentTarget.value.trim(), onSale, isNewArrival);
              }
            }}
          />
          <div className="flex items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={onSale === 'true'}
                onChange={(e) => applyFilters(keyword, e.target.checked ? 'true' : '', isNewArrival)}
              />
              <span>Sale</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={isNewArrival === 'true'}
                onChange={(e) => applyFilters(keyword, onSale, e.target.checked ? 'true' : '')}
              />
              <span>New</span>
            </label>
            <button
              className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
              onClick={() => applyFilters('', '', '')}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}


