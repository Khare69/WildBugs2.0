import React from 'react';
import type { FamilyOption } from '../../types/species';

interface SpeciesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFamily: string;
  onFamilyChange: (family: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  families: FamilyOption[];
  onReset: () => void;
  totalResults?: number;
}

export const SpeciesFilterBar: React.FC<SpeciesFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedFamily,
  onFamilyChange,
  selectedStatus,
  onStatusChange,
  families,
  onReset,
  totalResults,
}) => {
  const hasActiveFilters = searchTerm !== '' || selectedFamily !== '' || selectedStatus !== '';

  return (
    <div className="filter-bar-container">
      <div className="filter-bar-inputs">
        <div className="search-field-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search by common name, scientific name, or habitat..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-select-group">
          <select
            className="filter-select"
            value={selectedFamily}
            onChange={(e) => onFamilyChange(e.target.value)}
            aria-label="Filter by taxonomic family"
          >
            <option value="">All Families</option>
            {families.map((f) => (
              <option key={f.family} value={f.family}>
                {f.family} ({f.count})
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by conservation status"
          >
            <option value="">All Conservation Statuses</option>
            <option value="Least Concern">Least Concern</option>
            <option value="Near Threatened">Near Threatened</option>
            <option value="Vulnerable">Vulnerable</option>
            <option value="Endangered">Endangered</option>
          </select>

          {hasActiveFilters && (
            <button type="button" className="btn-reset-filters" onClick={onReset}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {totalResults !== undefined && (
        <div className="filter-results-counter">
          <span>Found <strong>{totalResults}</strong> species cataloged</span>
        </div>
      )}
    </div>
  );
};

export default SpeciesFilterBar;
