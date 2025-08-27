/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange, ordersPerPage, onOrdersPerPageChange, totalOrders, filteredOrders }) => {
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-sm">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 border rounded text-sm ${
            currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-sm">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-1">{renderPaginationButtons()}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;