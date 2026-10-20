import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import speciesApi from '../../api/speciesApi';
import type { Species } from '../../types/species';

interface ForumEditorProps {
  mode?: 'post' | 'reply';
  initialSpeciesId?: number;
  parentAuthorName?: string;
  onSubmitPost?: (data: { title: string; body: string; speciesId?: number }) => Promise<void> | void;
  onSubmitReply?: (data: { body: string }) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const ForumEditor: React.FC<ForumEditorProps> = ({
  mode = 'post',
  initialSpeciesId,
  parentAuthorName,
  onSubmitPost,
  onSubmitReply,
  onCancel,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [speciesId, setSpeciesId] = useState<number | undefined>(initialSpeciesId);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load species options for species tagging in new posts
  const { data: speciesData } = useQuery({
    queryKey: ['species-list-forum'],
    queryFn: () => speciesApi.getSpecies({ limit: 50 }),
    staleTime: 1000 * 60 * 10,
    enabled: mode === 'post',
  });

  const speciesList: Species[] = speciesData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'post') {
      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();

      if (!trimmedTitle || trimmedTitle.length < 3) {
        setErrorMessage('Post title must be at least 3 characters long.');
        return;
      }
      if (trimmedTitle.length > 200) {
        setErrorMessage('Post title cannot exceed 200 characters.');
        return;
      }
      if (!trimmedBody || trimmedBody.length < 5) {
        setErrorMessage('Post body must be at least 5 characters long.');
        return;
      }

      if (onSubmitPost) {
        try {
          await onSubmitPost({
            title: trimmedTitle,
            body: trimmedBody,
            speciesId: speciesId ? Number(speciesId) : undefined,
          });
          setTitle('');
          setBody('');
        } catch (err: any) {
          setErrorMessage(err?.response?.data?.message || 'Failed to submit post. Please try again.');
        }
      }
    } else {
      const trimmedBody = body.trim();
      if (!trimmedBody) {
        setErrorMessage('Reply message cannot be empty.');
        return;
      }

      if (onSubmitReply) {
        try {
          await onSubmitReply({ body: trimmedBody });
          setBody('');
        } catch (err: any) {
          setErrorMessage(err?.response?.data?.message || 'Failed to submit reply. Please try again.');
        }
      }
    }
  };

  const renderSimplePreview = (text: string) => {
    if (!text.trim()) {
      return <p className="forum-editor__preview-empty">Nothing to preview yet. Write some markdown above!</p>;
    }

    const lines = text.split('\n');
    return (
      <div className="forum-editor__preview-content">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="preview-h3">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="preview-h2">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('# ')) {
            return <h2 key={idx} className="preview-h1">{line.replace('# ', '')}</h2>;
          }
          if (line.startsWith('> ')) {
            return <blockquote key={idx} className="preview-quote">{line.replace('> ', '')}</blockquote>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="preview-list-item">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="preview-spacer" />;
          }
          return <p key={idx} className="preview-paragraph">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <form className={`forum-editor ${mode === 'reply' ? 'forum-editor--reply' : ''}`} onSubmit={handleSubmit}>
      {mode === 'reply' && parentAuthorName && (
        <div className="forum-editor__replying-to">
          Replying to <span className="forum-editor__parent-author">@{parentAuthorName}</span>
        </div>
      )}

      {errorMessage && (
        <div className="forum-editor__error" role="alert">
          <span className="forum-editor__error-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {mode === 'post' && (
        <div className="forum-editor__form-group">
          <label htmlFor="forum-post-title" className="forum-editor__label">
            Discussion Title <span className="required">*</span>
          </label>
          <input
            id="forum-post-title"
            type="text"
            className="forum-editor__input"
            placeholder="e.g. Unusual flight patterns observed in Painted Lady butterflies..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            disabled={isSubmitting}
            required
          />
        </div>
      )}

      {mode === 'post' && speciesList.length > 0 && (
        <div className="forum-editor__form-group">
          <label htmlFor="forum-species-select" className="forum-editor__label">
            Tag Species (Optional)
          </label>
          <select
            id="forum-species-select"
            className="forum-editor__select"
            value={speciesId ?? ''}
            onChange={(e) => setSpeciesId(e.target.value ? Number(e.target.value) : undefined)}
            disabled={isSubmitting}
          >
            <option value="">-- No specific species --</option>
            {speciesList.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.commonName} ({sp.scientificName})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="forum-editor__tabs">
        <button
          type="button"
          className={`forum-editor__tab-btn ${activeTab === 'write' ? 'forum-editor__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('write')}
        >
          ✏️ Write
        </button>
        <button
          type="button"
          className={`forum-editor__tab-btn ${activeTab === 'preview' ? 'forum-editor__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Preview
        </button>
      </div>

      {activeTab === 'write' ? (
        <div className="forum-editor__form-group">
          <label htmlFor="forum-post-body" className="sr-only">
            {mode === 'post' ? 'Discussion Content' : 'Your Reply'}
          </label>
          <textarea
            id="forum-post-body"
            className="forum-editor__textarea"
            rows={mode === 'reply' ? 4 : 7}
            placeholder={
              mode === 'post'
                ? 'Share your observations, field questions, identification inquiries, or taxonomic insights...'
                : 'Write your helpful reply or identification opinion...'
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <div className="forum-editor__meta">
            <span className="forum-editor__char-count">{body.length} characters</span>
            <span className="forum-editor__tip">Markdown supported: **bold**, *italic*, # heading, &gt; quote</span>
          </div>
        </div>
      ) : (
        <div className="forum-editor__preview-box">{renderSimplePreview(body)}</div>
      )}

      <div className="forum-editor__footer">
        {onCancel && (
          <button
            type="button"
            className="forum-editor__btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="forum-editor__btn-primary"
          disabled={isSubmitting || (mode === 'post' ? !title.trim() || !body.trim() : !body.trim())}
        >
          {isSubmitting ? (
            <span className="forum-editor__spinner">Submitting...</span>
          ) : mode === 'post' ? (
            'Publish Discussion'
          ) : (
            'Post Reply'
          )}
        </button>
      </div>
    </form>
  );
};

export default ForumEditor;
