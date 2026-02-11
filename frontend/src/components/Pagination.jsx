import React from 'react';

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNext, hasPrev, total, limit } = pagination;
  
  // Calculate visible page range
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
      {/* Results info */}
      <div className="text-muted small">
        Affichage de {startItem} à {endItem} sur {total} résultats
      </div>

      {/* Pagination buttons */}
      <nav aria-label="Page navigation">
        <ul className="pagination pagination-sm mb-0">
          {/* First page */}
          <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(1)}
              disabled={!hasPrev}
              title="Première page"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
          </li>

          {/* Previous page */}
          <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrev}
              title="Page précédente"
            >
              <i className="fas fa-angle-left"></i>
            </button>
          </li>

          {/* Page numbers */}
          {getPageNumbers()[0] > 1 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}
          
          {getPageNumbers().map(pageNum => (
            <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            </li>
          ))}

          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {/* Next page */}
          <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext}
              title="Page suivante"
            >
              <i className="fas fa-angle-right"></i>
            </button>
          </li>

          {/* Last page */}
          <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNext}
              title="Dernière page"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>

      {/* Page selector */}
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">Page</span>
        <select 
          className="form-select form-select-sm" 
          style={{ width: 'auto' }}
          value={page}
          onChange={(e) => onPageChange(Number(e.target.value))}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <option key={pageNum} value={pageNum}>
              {pageNum}
            </option>
          ))}
        </select>
        <span className="text-muted small">sur {totalPages}</span>
      </div>
    </div>
  );
}

export default Pagination;
