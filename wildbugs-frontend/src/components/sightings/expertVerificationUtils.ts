import type { SightingStatus } from '../../types/sighting';

export interface VerificationBadgeConfig {
  icon: string;
  label: string;
  description: string;
  themeClass: string;
}

/**
 * Pure helper function that resolves UI styling and descriptive copy for observation status.
 */
export function getVerificationStatusConfig(status: SightingStatus): VerificationBadgeConfig {
  switch (status) {
    case 'VERIFIED':
      return {
        icon: '🛡️',
        label: 'Expert Verified',
        description: 'Confirmed by a credentialed entomologist with 100% taxonomic confidence.',
        themeClass: 'verify-badge--verified',
      };
    case 'REJECTED':
      return {
        icon: '⚠️',
        label: 'Observation Rejected',
        description: 'Reviewed by an expert and deemed unidentifiable or non-insect specimen.',
        themeClass: 'verify-badge--rejected',
      };
    case 'IDENTIFIED':
      return {
        icon: '🔍',
        label: 'Community / AI Identified',
        description: 'Classification proposed by Vision AI or community naturalist. Awaiting expert review.',
        themeClass: 'verify-badge--identified',
      };
    case 'PENDING':
    default:
      return {
        icon: '⏳',
        label: 'Pending Analysis',
        description: 'Queued for Vision AI classification and expert verification.',
        themeClass: 'verify-badge--pending',
      };
  }
}

/**
 * Checks whether a user role has authority to perform expert verification actions.
 */
export function canPerformExpertVerification(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return normalized === 'EXPERT' || normalized === 'ADMIN';
}
