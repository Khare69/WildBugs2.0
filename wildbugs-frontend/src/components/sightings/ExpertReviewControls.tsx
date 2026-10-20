import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import sightingsApi from '../../api/sightingsApi';
import speciesApi from '../../api/speciesApi';
import type { Sighting } from '../../types/sighting';
import type { Species } from '../../types/species';

interface ExpertReviewControlsProps {
  sighting: Sighting;
  onSuccess?: () => void;
}

export const ExpertReviewControls: React.FC<ExpertReviewControlsProps> = ({
  sighting,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<'verify' | 'reject' | null>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>(
    sighting.speciesId ?? undefined
  );
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load species for re-assignment / correction during verification
  const { data: speciesData } = useQuery({
    queryKey: ['species-list-expert-review'],
    queryFn: () => speciesApi.getSpecies({ limit: 100 }),
    staleTime: 1000 * 60 * 10,
    enabled: activeModal === 'verify',
  });

  const speciesList: Species[] = speciesData?.data || [];

  const verifyMutation = useMutation({
    mutationFn: () =>
      sightingsApi.verifySighting(sighting.id, {
        speciesId: selectedSpeciesId,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      setActiveModal(null);
      setFeedbackMsg({
        type: 'success',
        text: '🛡️ Observation successfully verified with expert accreditation!',
      });
      queryClient.invalidateQueries({ queryKey: ['sighting-detail', sighting.id] });
      queryClient.invalidateQueries({ queryKey: ['map-sightings'] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to verify sighting. Please try again.',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      sightingsApi.rejectSighting(sighting.id, {
        reason: rejectReason.trim() || undefined,
      }),
    onSuccess: () => {
      setActiveModal(null);
      setFeedbackMsg({
        type: 'success',
        text: '⚠️ Observation marked as rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['sighting-detail', sighting.id] });
      queryClient.invalidateQueries({ queryKey: ['map-sightings'] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to reject sighting.',
      });
    },
  });

  return (
    <div className="expert-review-panel">
      <div className="expert-review-panel__header">
        <div className="expert-review-panel__title-badge">
          <span className="expert-panel-icon">🛡️</span>
          <div>
            <h4 className="expert-panel-title">Expert Verification Desk</h4>
            <p className="expert-panel-subtitle">
              Taxonomic review actions available for credentialed naturalists.
            </p>
          </div>
        </div>

        <div className="expert-review-panel__actions">
          <button
            type="button"
            className="btn btn-verify-action"
            onClick={() => setActiveModal('verify')}
            disabled={verifyMutation.isPending || rejectMutation.isPending}
          >
            ✓ Verify Species
          </button>
          <button
            type="button"
            className="btn btn-reject-action"
            onClick={() => setActiveModal('reject')}
            disabled={verifyMutation.isPending || rejectMutation.isPending}
          >
            ✕ Reject Observation
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`expert-review-feedback expert-review-feedback--${feedbackMsg.type}`}
          role="status"
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            className="btn-close-feedback"
            onClick={() => setFeedbackMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* VERIFY MODAL */}
      {activeModal === 'verify' && (
        <div className="expert-modal-backdrop" role="dialog" aria-modal="true">
          <div className="expert-modal-card">
            <div className="expert-modal-card__header">
              <h3>✓ Expert Taxonomic Verification</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyMutation.mutate();
              }}
              className="expert-modal-form"
            >
              <label className="form-group-label">
                <span>Confirmed Species Taxonomy</span>
                <select
                  className="form-control"
                  value={selectedSpeciesId || ''}
                  onChange={(e) => setSelectedSpeciesId(Number(e.target.value) || undefined)}
                  required
                >
                  <option value="">-- Select Confirmed Species --</option>
                  {speciesList.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.commonName} ({sp.scientificName})
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group-label">
                <span>Field Verification Notes (Optional)</span>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Distinct antenna morphology and wing venation match standard regional specimens."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
              </label>

              <div className="expert-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveModal(null)}
                  disabled={verifyMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedSpeciesId || verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? 'Submitting Verification...' : 'Confirm Verification 🛡️'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {activeModal === 'reject' && (
        <div className="expert-modal-backdrop" role="dialog" aria-modal="true">
          <div className="expert-modal-card">
            <div className="expert-modal-card__header">
              <h3>✕ Reject Sighting Observation</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                rejectMutation.mutate();
              }}
              className="expert-modal-form"
            >
              <p className="reject-warning-text">
                Rejecting an observation will mark it as invalid in the community catalog and
                notify the observer with your reason.
              </p>

              <label className="form-group-label">
                <span>Reason for Rejection</span>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Image does not contain an identifiable specimen or specimen is an arachnid."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  maxLength={500}
                />
              </label>

              <div className="expert-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveModal(null)}
                  disabled={rejectMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertReviewControls;
