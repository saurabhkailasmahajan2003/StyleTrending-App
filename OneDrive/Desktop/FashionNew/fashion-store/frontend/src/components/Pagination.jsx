
export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const maxShown = 5;
    if (pages <= maxShown) return Array.from({ length: pages }, (_, i) => i + 1);
    const numbers = [];
    if (page > 3) numbers.push(1);
    if (page > 4) numbers.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      numbers.push(i);
    }
    if (page < pages - 3) numbers.push('...');
    if (page < pages - 2) numbers.push(pages);
    return numbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center my-6" aria-label="Pagination">
      <ul className="inline-flex items-center gap-1">
        <li>
          <button
            className="px-2 py-1 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            « First
          </button>
        </li>
        <li>
          <button
            className="px-2 py-1 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
        </li>
        {pageNumbers.map((p, idx) => (
          <li key={idx}>
            {p === '...'
              ? <span className="px-2 py-1 text-gray-400">...</span>
              : <button
                  className={`px-3 py-1.5 text-sm rounded-md border ${p === page ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
            }
          </li>
        ))}
        <li>
          <button
            className="px-2 py-1 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
            aria-label="Next page"
          >
            Next ›
          </button>
        </li>
        <li>
          <button
            className="px-2 py-1 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onPageChange(pages)}
            disabled={page === pages}
            aria-label="Last page"
          >
            Last »
          </button>
        </li>
      </ul>
    </nav>
  );
}


