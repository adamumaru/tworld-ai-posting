import React from 'react';
import { useComposerStore } from './store.js';
import {
  EditIcon,
  PaperclipIcon,
  RefreshIcon,
  CheckIcon,
  FileTextIcon,
  CloseIcon,
  AlertCircleIcon,
  InfoIcon
} from './icons.jsx';

export default function App() {
  const {
    topic,
    context,
    mode,
    generatedContent,
    suggestedHashtags,
    isGenerating,
    fallbackNotice,
    error,
    attachedAssets,
    isPickerOpen,
    pickerCategory,
    pickerRecommendations,
    pickerLibraryAssets,
    isFetchingAssets,
    setTopic,
    setContext,
    setMode,
    setGeneratedContent,
    openPicker,
    closePicker,
    setPickerCategory,
    toggleAttachAsset,
    removeAttachedAsset,
    generatePost
  } = useComposerStore();

  const modes = ['short', 'long', 'bulleted', 'rephrase'];
  const categories = ['all', 'documents', 'images', 'videos', 'audio'];

  return (
    <div className="app-container">
      {/* Navigation & Header */}
      <header className="header">
        <div>
          <span className="brand-badge">Tongston T-World</span>
          <h1 className="title">Smart Posting & Asset Retrieval System</h1>
          <p className="subtitle">Compose structured posts backed by contextual media recommendations.</p>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="main-grid">
        {/* Left Column: Composer Controls */}
        <div className="card">
          <h2 className="card-title">
            <EditIcon size={16} />
            <span>Post Parameters</span>
          </h2>

          <div className="form-group">
            <label className="form-label">Topic or Headline</label>
            <input
              type="text"
              placeholder="e.g. Tongston Entrepreneurial Hub launch in Abuja"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Output Structure / Mode</label>
            <div className="mode-selector">
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`mode-btn ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Context Notes / Raw Draft</label>
            <textarea
              rows="4"
              placeholder="Add key facts, stats, or thoughts. For 'rephrase' mode, paste your rough draft here."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: '#F87171', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircleIcon size={14} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={generatePost}
              disabled={isGenerating}
            >
              <span>{isGenerating ? 'Generating...' : 'Generate Post'}</span>
            </button>
            <button className="btn-secondary" onClick={openPicker}>
              <PaperclipIcon size={15} />
              <span>Attach Media ({attachedAssets.length})</span>
            </button>
          </div>

          {/* Attached Assets Shelf */}
          {attachedAssets.length > 0 && (
            <div className="attached-section">
              <label className="form-label">Attached Media ({attachedAssets.length})</label>
              {attachedAssets.map((asset) => (
                <div key={asset.fileId || asset._id} className="asset-badge">
                  <div className="asset-badge-left">
                    <FileTextIcon size={14} />
                    <span>{asset.originalName}</span>
                  </div>
                  <button
                    className="asset-badge-remove"
                    title="Remove attachment"
                    onClick={() => removeAttachedAsset(asset.fileId || asset._id)}
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Output & Refinement */}
        <div className="card">
          <h2 className="card-title">
            <FileTextIcon size={16} />
            <span>Output & Preview</span>
          </h2>

          {fallbackNotice && (
            <div className="fallback-alert">
              <InfoIcon size={14} />
              <span>{fallbackNotice}</span>
            </div>
          )}

          <textarea
            className="output-preview"
            placeholder="Generated post content will appear here. You can freely edit and polish this draft."
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
          />

          {suggestedHashtags.length > 0 && (
            <div className="form-group">
              <label className="form-label">Suggested Hashtags</label>
              <div className="hashtag-row">
                {suggestedHashtags.map((tag, idx) => (
                  <span key={idx} className="hashtag-chip">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Word count: {generatedContent.split(/\s+/).filter(Boolean).length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary"
                onClick={generatePost}
                disabled={isGenerating || (!topic && !context)}
              >
                <RefreshIcon size={14} />
                <span>Regenerate</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => alert('Post accepted and saved to drafts.')}
                disabled={!generatedContent.trim()}
              >
                <CheckIcon size={14} />
                <span>Accept Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      {isPickerOpen && (
        <div className="modal-overlay" onClick={closePicker}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Files & Docs Asset Picker</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Only moderated and approved assets are available for publication.
                </p>
              </div>
              <button className="btn-secondary" style={{ padding: '6px' }} onClick={closePicker}>
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Category Filter Tabs */}
              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`tab-btn ${pickerCategory === cat ? 'active' : ''}`}
                    onClick={() => setPickerCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {isFetchingAssets ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Scanning approved assets and evaluating contextual relevance...
                </div>
              ) : (
                <>
                  {/* Contextual Recommendations Section */}
                  {pickerRecommendations.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <FileTextIcon size={14} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          Recommended Media for this Post
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pickerRecommendations.map((rec) => {
                          const isAttached = attachedAssets.some(a => (a.fileId || a._id) === rec.fileId);
                          return (
                            <div key={rec.fileId} className="rec-item recommended">
                              <div>
                                <div className="rec-item-title">
                                  <FileTextIcon size={14} />
                                  <strong style={{ fontSize: '13px' }}>{rec.originalName}</strong>
                                  <span className="rec-badge">{Math.round(rec.score * 100)}% match</span>
                                </div>
                                <div className="match-reason">
                                  <span>{rec.matchReason}</span>
                                </div>
                              </div>
                              <button
                                className={isAttached ? 'btn-secondary' : 'btn-primary'}
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => toggleAttachAsset(rec)}
                              >
                                {isAttached ? 'Detach' : 'Attach'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* General Library Files Section */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
                      All Approved Assets ({pickerLibraryAssets.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pickerLibraryAssets.map((asset) => {
                        const isAttached = attachedAssets.some(a => (a.fileId || a._id) === asset._id);
                        return (
                          <div key={asset._id} className="rec-item">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                <FileTextIcon size={14} />
                                <span>{asset.originalName}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '22px' }}>
                                {asset.category} • {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <button
                              className={isAttached ? 'btn-secondary' : 'btn-primary'}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => toggleAttachAsset(asset)}
                            >
                              {isAttached ? 'Detach' : 'Attach'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
