import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import speciesApi from '../api/speciesApi';
import SpeciesCard from '../components/species/SpeciesCard';
import SpeciesFilterBar from '../components/species/SpeciesFilterBar';

export const SpeciesListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch taxonomic families for filter dropdown
  const { data: familiesData } = useQuery({
    queryKey: ['speciesFamilies'],
    queryFn: () => speciesApi.getFamilies(),
  });

  // Fetch paginated catalog
  const {
    data: catalogData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['speciesCatalog', { searchTerm, selectedFamily, selectedStatus, page, limit }],
    queryFn: () =>
      speciesApi.getSpecies({
        search: searchTerm || undefined,
        family: selectedFamily || undefined,
        conservationStatus: selectedStatus || undefined,
        page,
        limit,
      }),
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFamily('');
    setSelectedStatus('');
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleFamilyChange = (val: string) => {
    setSelectedFamily(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setPage(1);
  };

  return (
    <div className="species-list-page">
      <header className="page-header">
        <div className="badge-tag">Biodiversity Field Guide</div>
        <h1 className="page-title">Species Catalog</h1>
        <p className="page-subtitle">
          Explore and identify regional insects, pollinators, and macro-invertebrates. Discover their
          ecological niches, life cycles, and conservation statuses.
        </p>
      </header>

      <SpeciesFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedFamily={selectedFamily}
        onFamilyChange={handleFamilyChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        families={familiesData || []}
        onReset={handleResetFilters}
        totalResults={catalogData?.meta?.total}
      />

      {isLoading && (
        <div className="catalog-loading-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="species-card skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-body">
                <div className="skeleton-line short" />
                <div className="skeleton-line title" />
                <div className="skeleton-line subtitle" />
                <div className="skeleton-line paragraph" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="state-panel error-panel">
          <div className="state-icon">⚠️</div>
          <h3>Failed to load species catalog</h3>
          <p>{error instanceof Error ? error.message : 'An unexpected error occurred.'}</p>
          <button type="button" className="btn-retry" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && catalogData?.data && catalogData.data.length === 0 && (
        <div className="state-panel empty-panel">
          <div className="state-icon">🔍</div>
          <h3>No species match your criteria</h3>
          <p>Try adjusting your search terms or clearing active filters to see all species.</p>
          <button type="button" className="btn-reset-filters" onClick={handleResetFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {!isLoading && !isError && catalogData?.data && catalogData.data.length > 0 && (
        <>
          <div className="species-grid">
            {catalogData.data.map((species) => (
              <SpeciesCard key={species.id} species={species} />
            ))}
          </div>

          {/* Pagination Controls */}
          {catalogData.meta.totalPages > 1 && (
            <div className="pagination-bar">
              <button
                type="button"
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page {catalogData.meta.page} of {catalogData.meta.totalPages}
              </span>

              <button
                type="button"
                className="pagination-btn"
                disabled={page >= catalogData.meta.totalPages}
                onClick={() => setPage((p) => Math.min(catalogData.meta.totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpeciesListPage;
