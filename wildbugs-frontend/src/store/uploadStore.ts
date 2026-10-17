import { create } from 'zustand';
import type { Sighting } from '../types/sighting';

export type UploadStep = 'capture' | 'preview' | 'location' | 'submitting' | 'success';

export interface UploadState {
  step: UploadStep;
  rawFile: File | null;
  compressedFile: File | null;
  previewUrl: string | null;
  originalSize: number;
  compressedSize: number;
  imageWidth: number;
  imageHeight: number;

  latitude: number | null;
  longitude: number | null;
  speciesId: number | null;
  observedAt: string;
  notes: string;

  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  createdSighting: Sighting | null;

  // Actions
  setStep: (step: UploadStep) => void;
  setPhotoData: (data: {
    rawFile: File;
    compressedFile: File;
    previewUrl: string;
    originalSize: number;
    compressedSize: number;
    imageWidth: number;
    imageHeight: number;
  }) => void;
  setLocation: (latitude: number, longitude: number) => void;
  setSpeciesId: (speciesId: number | null) => void;
  setObservedAt: (observedAt: string) => void;
  setNotes: (notes: string) => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  setError: (error: string | null) => void;
  setCreatedSighting: (sighting: Sighting) => void;
  reset: () => void;
}

const getInitialObservedAt = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export const useUploadStore = create<UploadState>((set) => ({
  step: 'capture',
  rawFile: null,
  compressedFile: null,
  previewUrl: null,
  originalSize: 0,
  compressedSize: 0,
  imageWidth: 0,
  imageHeight: 0,

  latitude: null,
  longitude: null,
  speciesId: null,
  observedAt: getInitialObservedAt(),
  notes: '',

  uploadProgress: 0,
  isUploading: false,
  error: null,
  createdSighting: null,

  setStep: (step) => set({ step, error: null }),

  setPhotoData: (data) =>
    set({
      rawFile: data.rawFile,
      compressedFile: data.compressedFile,
      previewUrl: data.previewUrl,
      originalSize: data.originalSize,
      compressedSize: data.compressedSize,
      imageWidth: data.imageWidth,
      imageHeight: data.imageHeight,
      step: 'preview',
      error: null,
    }),

  setLocation: (latitude, longitude) => set({ latitude, longitude }),

  setSpeciesId: (speciesId) => set({ speciesId }),

  setObservedAt: (observedAt) => set({ observedAt }),

  setNotes: (notes) => set({ notes }),

  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  setIsUploading: (isUploading) => set({ isUploading }),

  setError: (error) => set({ error, isUploading: false }),

  setCreatedSighting: (createdSighting) =>
    set({
      createdSighting,
      step: 'success',
      isUploading: false,
      uploadProgress: 100,
    }),

  reset: () =>
    set({
      step: 'capture',
      rawFile: null,
      compressedFile: null,
      previewUrl: null,
      originalSize: 0,
      compressedSize: 0,
      imageWidth: 0,
      imageHeight: 0,
      latitude: null,
      longitude: null,
      speciesId: null,
      observedAt: getInitialObservedAt(),
      notes: '',
      uploadProgress: 0,
      isUploading: false,
      error: null,
      createdSighting: null,
    }),
}));

export default useUploadStore;
