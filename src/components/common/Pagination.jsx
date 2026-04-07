import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="pagination-btn"
      >
        Anterior
      </button>

      <span className="pagination-info">
        Página {currentPage + 1} de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="pagination-btn"
      >
        Próxima
      </button>
    </div>
  );
}