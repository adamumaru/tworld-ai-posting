import { create } from 'zustand';

export const useComposerStore = create((set, get) => ({
  topic: '',
  context: '',
  mode: 'short', // 'short' | 'long' | 'bulleted' | 'rephrase'
  generatedContent: '',
  suggestedHashtags: [],
  isGenerating: false,
  fallbackNotice: null,
  error: null,

  // Attached Media Assets
  attachedAssets: [],

  // Asset Picker Modal State
  isPickerOpen: false,
  pickerCategory: 'all',
  pickerLibraryAssets: [],
  pickerRecommendations: [],
  isFetchingAssets: false,

  // Actions
  setTopic: (topic) => set({ topic }),
  setContext: (context) => set({ context }),
  setMode: (mode) => set({ mode }),
  setGeneratedContent: (content) => set({ generatedContent: content }),
  openPicker: () => {
    set({ isPickerOpen: true });
    get().fetchAssetPickerPayload();
  },
  closePicker: () => set({ isPickerOpen: false }),
  setPickerCategory: (category) => {
    set({ pickerCategory: category });
    get().fetchAssetPickerPayload(category);
  },

  // Toggle asset attachment
  toggleAttachAsset: (asset) => {
    const { attachedAssets } = get();
    const exists = attachedAssets.some(a => a.fileId === asset.fileId || a._id === asset._id);
    if (exists) {
      set({ attachedAssets: attachedAssets.filter(a => (a.fileId || a._id) !== (asset.fileId || asset._id)) });
    } else {
      set({ attachedAssets: [...attachedAssets, asset] });
    }
  },

  removeAttachedAsset: (id) => {
    set({ attachedAssets: get().attachedAssets.filter(a => (a.fileId || a._id) !== id) });
  },

  // AI Generation API call
  generatePost: async () => {
    const { topic, context, mode } = get();
    if (!topic.trim() && !context.trim()) {
      set({ error: 'Please enter a topic or context notes.' });
      return;
    }

    set({ isGenerating: true, error: null, fallbackNotice: null });

    try {
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context, mode })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to generate post');
      }

      set({
        generatedContent: data.data.content,
        suggestedHashtags: data.data.suggestedHashtags || [],
        fallbackNotice: data.data.fallbackTriggered ? data.data.notice : null,
        isGenerating: false
      });

      // Automatically trigger smart recommendation query based on newly generated text
      get().fetchAssetPickerPayload();
    } catch (err) {
      set({ isGenerating: false, error: err.message });
    }
  },

  // Asset Picker Fetch API call
  fetchAssetPickerPayload: async (categoryOverride) => {
    const { generatedContent, topic, pickerCategory } = get();
    const activeCategory = categoryOverride || pickerCategory;
    const queryText = generatedContent || topic || '';

    set({ isFetchingAssets: true });
    try {
      const url = `/api/files/asset-picker?postContent=${encodeURIComponent(queryText)}&category=${activeCategory}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        set({
          pickerRecommendations: data.data.recommendations || [],
          pickerLibraryAssets: data.data.libraryAssets || [],
          isFetchingAssets: false
        });
      }
    } catch (err) {
      console.error('Failed to load asset picker payload:', err);
      set({ isFetchingAssets: false });
    }
  }
}));
