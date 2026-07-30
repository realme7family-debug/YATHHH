import React, { useState, useRef } from 'react';
import { useConfig, BirthdayConfigType } from '../context/ConfigContext';
import { soundEngine } from '../utils/audioSynth';
import { 
  Save, RotateCcw, Download, Upload, Eye, Plus, Trash2, Image as ImageIcon, 
  Music, Heart, Sparkles, Star, Camera, Gift, FileText, CheckCircle2, ChevronLeft
} from 'lucide-react';

interface AdminPanelProps {
  onBackToPresentation: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToPresentation }) => {
  const { config, updateConfig, resetConfig, exportConfig, importConfig, isSaving, isLoading } = useConfig();
  const [formData, setFormData] = useState<BirthdayConfigType>(() => JSON.parse(JSON.stringify(config)));
  const [activeTab, setActiveTab] = useState<number>(0);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  // Populate form ONCE when initial database config finishes loading
  React.useEffect(() => {
    if (!isLoading && !isInitializedRef.current) {
      setFormData(JSON.parse(JSON.stringify(config)));
      isInitializedRef.current = true;
    }
  }, [isLoading, config]);

  // Password Security Lock State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('yaathh_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '200RS-DEDE') {
      setIsAuthenticated(true);
      sessionStorage.setItem('yaathh_admin_auth', 'true');
      soundEngine.playChime();
      setAuthError(null);
    } else {
      soundEngine.playPop();
      setAuthError('Incorrect passcode! Please try again.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('yaathh_admin_auth');
    soundEngine.playPop();
  };

  const tabs = [
    { id: 0, title: "1. Cover Slide", icon: <Sparkles className="w-4 h-4" /> },
    { id: 1, title: "2. About Her", icon: <Star className="w-4 h-4" /> },
    { id: 2, title: "3. Friendship Stats", icon: <Heart className="w-4 h-4" /> },
    { id: 3, title: "4. Insta Scrapbook", icon: <Camera className="w-4 h-4" /> },
    { id: 4, title: "5. Birthday Cake", icon: <Gift className="w-4 h-4" /> },
    { id: 5, title: "6. Photo Gallery", icon: <ImageIcon className="w-4 h-4" /> },
    { id: 6, title: "7. Postcard Letter", icon: <FileText className="w-4 h-4" /> },
    { id: 7, title: "8. Song & Ending", icon: <Music className="w-4 h-4" /> },
  ];

  const handleSave = async () => {
    const success = await updateConfig(formData);
    if (success) {
      soundEngine.playChime();
      setSavedNotification("Saved successfully to Production Database! 🚀");
      setTimeout(() => setSavedNotification(null), 3500);
    } else {
      soundEngine.playPop();
      alert("Failed to save changes to Production Database. Please check your network connection.");
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all content in the Production Database to original defaults?")) {
      const success = await resetConfig();
      if (success) {
        setFormData(JSON.parse(JSON.stringify(config)));
        soundEngine.playPop();
        setSavedNotification("Reset database to original default config.");
        setTimeout(() => setSavedNotification(null), 3500);
      }
    }
  };

  // Handle Photo File Upload via Backend API / Database
  const handlePhotoUpload = (index: number, file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64, fileName: file.name, resourceType: 'image' }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            const updatedPhotos = [...formData.photos];
            updatedPhotos[index] = { ...updatedPhotos[index], url: data.url };
            setFormData({ ...formData, photos: updatedPhotos });
            soundEngine.playChime();
          } else {
            alert("Image upload failed: " + (data.error || 'Unknown error'));
          }
        } catch (err) {
          console.error("Photo upload error:", err);
          alert("Photo upload failed. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Song Audio Upload via Backend API / Database
  const handleAudioFileUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64, fileName: file.name, resourceType: 'audio' }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            soundEngine.setCustomAudioUrl(data.url);
            setFormData({
              ...formData,
              customTrackName: file.name.replace(/\.[^/.]+$/, ""),
              customAudioUrl: data.url,
            });
            soundEngine.playChime();
          } else {
            alert("Audio upload failed: " + (data.error || 'Unknown error'));
          }
        } catch (err) {
          console.error("Audio upload error:", err);
          alert("Audio upload failed. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle JSON Import
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            const success = await importConfig(content);
            if (success) {
              setFormData(parsed);
              setSavedNotification("Imported & saved JSON to Production Database! 📥");
              setTimeout(() => setSavedNotification(null), 3500);
            }
          } catch(err) {
            alert("Invalid configuration file format.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Password Protection Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5ede8] flex items-center justify-center p-4 font-sans">
        <div className="bg-white/95 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl border border-[#ebdcd0] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-coquette-pinkLight text-coquette-pinkDeep mx-auto flex items-center justify-center shadow-inner">
            <span className="text-3xl">🔐</span>
          </div>

          <div>
            <h2 className="font-script text-4xl text-coquette-roseDark font-bold mb-1">Admin Panel Access</h2>
            <p className="font-cormorant text-sm italic text-coquette-roseDark/70">
              Enter secret passcode to manage & edit website content 🎀
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Passcode (e.g. 200RS-DEDE)"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl border border-coquette-pink/60 bg-[#fffdf9] text-center font-mono text-lg text-coquette-roseDark tracking-widest focus:outline-none focus:ring-2 focus:ring-coquette-pinkDeep"
              />
              {authError && (
                <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">
                  {authError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-coquette-pinkDeep text-white font-bold text-xs uppercase tracking-wider hover:bg-coquette-roseDark transition-all shadow-lg hover:scale-[1.02]"
              >
                Unlock Admin Panel ✨
              </button>

              <button
                type="button"
                onClick={onBackToPresentation}
                className="w-full py-2.5 rounded-2xl bg-coquette-pinkLight/60 text-coquette-roseDark font-bold text-xs hover:bg-coquette-pinkLight transition-colors"
              >
                ← Back to Main Website
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5ede8] text-[#4a3f32] p-4 md:p-8 max-w-6xl mx-auto font-sans">
      
      {/* Top Notification Toast */}
      {savedNotification && (
        <div className="fixed top-6 right-6 z-50 bg-coquette-roseDark text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Admin Panel Header Bar */}
      <header className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-lg border border-coquette-pink/40 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToPresentation}
            className="p-2 rounded-full bg-coquette-pinkLight text-coquette-roseDark hover:bg-coquette-pink transition-colors"
            title="Back to Deck"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-script text-3xl md:text-4xl text-coquette-roseDark font-bold leading-tight">
              Birthday Deck Admin CMS ⚙️
            </h1>
            <p className="font-cormorant text-sm italic text-coquette-roseDark/70">
              Customize text, photos, letter paragraphs, stats & song for every slide.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-full bg-coquette-pinkDeep text-white font-bold text-xs hover:bg-coquette-roseDark transition-all flex items-center gap-1.5 shadow-md hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>

          <button
            onClick={exportConfig}
            className="px-3.5 py-2 rounded-full bg-white border border-coquette-pink text-coquette-roseDark font-bold text-xs hover:bg-coquette-pinkLight transition-colors flex items-center gap-1 shadow-sm"
            title="Export JSON Config"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label className="px-3.5 py-2 rounded-full bg-white border border-coquette-pink text-coquette-roseDark font-bold text-xs hover:bg-coquette-pinkLight transition-colors flex items-center gap-1 shadow-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" ref={fileInputRef} />
          </label>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-full bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-1"
            title="Reset to Original Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-full bg-stone-800 text-white font-bold text-xs hover:bg-black transition-colors flex items-center gap-1 shadow-sm"
            title="Lock Admin Panel"
          >
            <span>Lock 🔒</span>
          </button>
        </div>
      </header>

      {/* Slide Selection Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); soundEngine.playPop(); }}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
              activeTab === tab.id
                ? 'bg-coquette-roseDark text-white scale-105 shadow-md'
                : 'bg-white text-coquette-roseDark/80 hover:bg-coquette-pinkLight'
            }`}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </nav>

      {/* Main Tab Content Editor Card */}
      <main className="bg-white/95 rounded-2xl p-6 md:p-10 shadow-xl border border-[#ebdcd0]">

        {/* ─── TAB 0: Cover Slide ─── */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 1: Cover Page Setup 🎀</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page1Tag ?? '/01'}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page1Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page1Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-mono text-sm"
                  placeholder="/01"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Greeting Phrase
                </label>
                <input
                  type="text"
                  value={formData.coverGreeting ?? ''}
                  onChange={(e) => setFormData({ ...formData, coverGreeting: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-alex text-xl"
                  placeholder="Happy Birthday"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Bestie's Name (Main Title)
                </label>
                <input
                  type="text"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] focus:outline-none focus:ring-2 focus:ring-coquette-pinkDeep font-script text-xl"
                  placeholder="e.g. Bestie / Riya"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Deck Subtitle Tag
                </label>
                <input
                  type="text"
                  value={formData.subtitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] focus:outline-none focus:ring-2 focus:ring-coquette-pinkDeep font-sans text-sm"
                  placeholder="e.g. Aesthetic Birthday Deck"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Dramatic Opening Line / Subheading
                </label>
                <textarea
                  rows={2}
                  value={formData.openingLine ?? ''}
                  onChange={(e) => setFormData({ ...formData, openingLine: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] focus:outline-none focus:ring-2 focus:ring-coquette-pinkDeep font-cormorant text-lg italic"
                  placeholder="Opening dramatic line..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Next Slide Button Text
                </label>
                <input
                  type="text"
                  value={formData.slide1BtnText ?? ''}
                  onChange={(e) => setFormData({ ...formData, slide1BtnText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                  placeholder="Begin Her Story 🎀"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 1: About Her ─── */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 2: About Her Details ✨</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page2Tag ?? '/02'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page2Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page2Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-mono text-sm"
                  placeholder="/02"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.aboutTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, aboutTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-alex text-xl"
                  placeholder="Hi there"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Section Main Title
                </label>
                <input
                  type="text"
                  value={formData.aboutTitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-script text-xl"
                  placeholder="About You ✨"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Main Highlight Quote
                </label>
                <textarea
                  rows={3}
                  value={formData.aboutQuote ?? ''}
                  onChange={(e) => setFormData({ ...formData, aboutQuote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-cormorant text-base italic"
                  placeholder="Main highlight quote..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Heart Tag Circle Quote
                </label>
                <textarea
                  rows={3}
                  value={formData.heartTagQuote ?? ''}
                  onChange={(e) => setFormData({ ...formData, heartTagQuote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-cormorant text-sm italic"
                  placeholder="Heart circle quote..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  🌸 Vibe Tag Label & Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.vibeLabel ?? ''}
                    onChange={(e) => setFormData({ ...formData, vibeLabel: e.target.value })}
                    className="w-1/3 px-2 py-2 rounded-lg border text-xs font-bold"
                    placeholder="Vibe"
                  />
                  <input
                    type="text"
                    value={formData.vibe ?? ''}
                    onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                    className="w-2/3 px-3 py-2 rounded-lg border border-coquette-pink/50 text-xs"
                    placeholder="Vibe text..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  👑 Superpower Label & Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.superpowerLabel ?? ''}
                    onChange={(e) => setFormData({ ...formData, superpowerLabel: e.target.value })}
                    className="w-1/3 px-2 py-2 rounded-lg border text-xs font-bold"
                    placeholder="Superpower"
                  />
                  <input
                    type="text"
                    value={formData.superpower ?? ''}
                    onChange={(e) => setFormData({ ...formData, superpower: e.target.value })}
                    className="w-2/3 px-3 py-2 rounded-lg border border-coquette-pink/50 text-xs"
                    placeholder="Superpower text..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  💖 Status Label & Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.statusLabel ?? ''}
                    onChange={(e) => setFormData({ ...formData, statusLabel: e.target.value })}
                    className="w-1/3 px-2 py-2 rounded-lg border text-xs font-bold"
                    placeholder="Status"
                  />
                  <input
                    type="text"
                    value={formData.status ?? ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-2/3 px-3 py-2 rounded-lg border border-coquette-pink/50 text-xs"
                    placeholder="Status text..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Next Slide Button Text
              </label>
              <input
                type="text"
                value={formData.slide2BtnText ?? ''}
                onChange={(e) => setFormData({ ...formData, slide2BtnText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                placeholder="View Friendship Stats ✨"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 2: Friendship Stats ─── */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 3: Friendship Stats 📊</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page3Tag ?? '/03'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page3Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page3Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-mono text-sm"
                  placeholder="/03"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.statsTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, statsTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl"
                  placeholder="Friendship stats"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Section Main Title
                </label>
                <input
                  type="text"
                  value={formData.statsTitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, statsTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-script text-xl"
                  placeholder="Friendship stats"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Subtitle Quote
              </label>
              <input
                type="text"
                value={formData.statsSubtitle ?? ''}
                onChange={(e) => setFormData({ ...formData, statsSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-cormorant text-sm italic"
                placeholder="Subtitle quote..."
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80">
                  Friendship Stat Cards ({formData.stats.length})
                </span>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      stats: [...formData.stats, { number: "100%", label: "New Special Stat" }]
                    });
                    soundEngine.playPop();
                  }}
                  className="px-3 py-1 rounded-full bg-coquette-pink text-coquette-roseDark text-xs font-bold flex items-center gap-1 hover:bg-coquette-pinkDeep hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stat Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.stats.map((stat, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-coquette-pink/40 bg-[#fffdf9] space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-coquette-pinkDeep">Stat Card #{idx + 1}</span>
                      {formData.stats.length > 1 && (
                        <button
                          onClick={() => {
                            const newStats = formData.stats.filter((_, i) => i !== idx);
                            setFormData({ ...formData, stats: newStats });
                          }}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          title="Remove Stat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={stat.number ?? ''}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[idx].number = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="w-24 px-3 py-2 rounded-lg border font-script text-2xl text-coquette-pinkDeep font-bold"
                        placeholder="365+"
                      />
                      <input
                        type="text"
                        value={stat.label ?? ''}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[idx].label = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border font-cormorant text-xs italic"
                        placeholder="Description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Next Slide Button Text
              </label>
              <input
                type="text"
                value={formData.slide3BtnText ?? ''}
                onChange={(e) => setFormData({ ...formData, slide3BtnText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                placeholder="View Instagram Collage 📸"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 3: Insta Scrapbook ─── */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 4: Instagram Scrapbook Layout 📸</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page4Tag ?? '/04'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page4Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page4Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-mono text-sm"
                  placeholder="/04"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.instaTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, instaTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl"
                  placeholder="Insta collage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Journal Title
                </label>
                <input
                  type="text"
                  value={formData.instaTitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, instaTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-script text-xl"
                  placeholder="Happy Bestie Day!"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Journal Message
                </label>
                <textarea
                  rows={2}
                  value={formData.instaNote ?? ''}
                  onChange={(e) => setFormData({ ...formData, instaNote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-cormorant text-sm italic"
                  placeholder="Journal note..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Card Footer Sign-off
                </label>
                <input
                  type="text"
                  value={formData.instaSignoff ?? ''}
                  onChange={(e) => setFormData({ ...formData, instaSignoff: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl text-coquette-pinkDeep"
                  placeholder="Forever BFF!"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  IG Handle 1
                </label>
                <input
                  type="text"
                  value={formData.igHandle1 ?? ''}
                  onChange={(e) => setFormData({ ...formData, igHandle1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold"
                  placeholder="bestie.birthday"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  IG Handle 2
                </label>
                <input
                  type="text"
                  value={formData.igHandle2 ?? ''}
                  onChange={(e) => setFormData({ ...formData, igHandle2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold"
                  placeholder="birthday.queen"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Pill Badge 1 Text
                </label>
                <input
                  type="text"
                  value={formData.badge1 ?? ''}
                  onChange={(e) => setFormData({ ...formData, badge1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-sans font-bold"
                  placeholder="Pill Badge 1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Pill Badge 2 Text
                </label>
                <input
                  type="text"
                  value={formData.badge2 ?? ''}
                  onChange={(e) => setFormData({ ...formData, badge2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-sans font-bold"
                  placeholder="Pill Badge 2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Next Slide Button Text
              </label>
              <input
                type="text"
                value={formData.slide4BtnText ?? ''}
                onChange={(e) => setFormData({ ...formData, slide4BtnText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                placeholder="Make A Birthday Wish 🎂"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 4: Birthday Cake ─── */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 5: Birthday Cake Candle Wish 🎂</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page5Tag ?? '/05'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page5Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page5Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-mono text-sm"
                  placeholder="/05"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.cakeTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, cakeTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl"
                  placeholder="Make a wish"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Cake Section Title
                </label>
                <input
                  type="text"
                  value={formData.cakeTitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, cakeTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-script text-xl"
                  placeholder="Birthday Cake 🎂"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Candle Blowing Prompt
                </label>
                <input
                  type="text"
                  value={formData.cakeWishPrompt ?? ''}
                  onChange={(e) => setFormData({ ...formData, cakeWishPrompt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-cormorant text-base italic"
                  placeholder="Candle prompt..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Blow Candle Button Text
                </label>
                <input
                  type="text"
                  value={formData.cakeBlowBtnText ?? ''}
                  onChange={(e) => setFormData({ ...formData, cakeBlowBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-sans text-xs font-bold"
                  placeholder="Blow Out Candles 🕯️"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Blowing State Button Text
                </label>
                <input
                  type="text"
                  value={formData.cakeBlowingBtnText ?? ''}
                  onChange={(e) => setFormData({ ...formData, cakeBlowingBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-sans text-xs font-bold"
                  placeholder="Blowing Candles..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Wish Unlocked Message (After blowing candles)
              </label>
              <input
                type="text"
                value={formData.wishesUnlockedMessage ?? ''}
                onChange={(e) => setFormData({ ...formData, wishesUnlockedMessage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-2xl text-coquette-pinkDeep"
                placeholder="Wish unlocked message..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Next Slide Button Text
              </label>
              <input
                type="text"
                value={formData.slide5BtnText ?? ''}
                onChange={(e) => setFormData({ ...formData, slide5BtnText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                placeholder="Explore Photo Memories 🖼️"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 5: Photo Gallery (Photos 1 to 6+) ─── */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 6 & All Photo Slots Manager 🖼️</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page6Tag ?? '/06'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page6Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page6Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-mono text-sm"
                  placeholder="/06"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.photosTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, photosTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl"
                  placeholder="Favorite moments"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80">
                Photo Gallery Slots ({formData.photos.length})
              </span>
              <button
                onClick={() => {
                  const newId = String(formData.photos.length + 1);
                  setFormData({
                    ...formData,
                    photos: [
                      ...formData.photos,
                      {
                        id: newId,
                        url: "/photos/photo1.png",
                        caption: "New beautiful memory",
                        memoryTitle: "Special Moment ✨",
                        secretNote: "A memory to hold onto forever."
                      }
                    ]
                  });
                  soundEngine.playPop();
                }}
                className="px-3.5 py-1.5 rounded-full bg-coquette-pink text-coquette-roseDark text-xs font-bold flex items-center gap-1 hover:bg-coquette-pinkDeep hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo Slot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.photos.map((photo, pIdx) => (
                <div key={photo.id || pIdx} className="p-4 rounded-xl border border-coquette-pink/40 bg-[#fffdf9] space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-coquette-roseDark">Photo #{pIdx + 1} ({photo.memoryTitle || `Slot ${pIdx + 1}`})</span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1 rounded-full bg-coquette-pinkDeep text-white text-[10px] font-bold flex items-center gap-1 hover:bg-coquette-roseDark transition-colors">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(pIdx, file);
                          }}
                          className="hidden"
                        />
                      </label>
                      {formData.photos.length > 1 && (
                        <button
                          onClick={() => {
                            const updatedPhotos = formData.photos.filter((_, i) => i !== pIdx);
                            setFormData({ ...formData, photos: updatedPhotos });
                          }}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Preview & URL */}
                  <div className="flex items-center gap-4">
                    <img
                      src={photo.url}
                      alt={`Photo ${pIdx + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border border-coquette-pink/50 shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-coquette-roseDark/70 mb-1">Photo URL / Path</label>
                        <input
                          type="text"
                          value={photo.url ?? ''}
                          onChange={(e) => {
                            const updated = [...formData.photos];
                            updated[pIdx].url = e.target.value;
                            setFormData({ ...formData, photos: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-white"
                          placeholder="Image URL or uploaded file"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Click Modal Text Controls */}
                  <div className="space-y-3 pt-1 border-t border-coquette-pink/30">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-coquette-pinkDeep mb-1">
                        ✨ 1. Popup Headline Title (Script Text)
                      </label>
                      <input
                        type="text"
                        value={photo.memoryTitle ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.photos];
                          updated[pIdx].memoryTitle = e.target.value;
                          setFormData({ ...formData, photos: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-coquette-pink/60 text-xs font-script font-bold text-coquette-pinkDeep text-base bg-white"
                        placeholder="e.g. The Grace & Elegance ✨"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-coquette-roseDark/80 mb-1">
                        📖 2. Subheading Caption (Italic Subtext)
                      </label>
                      <input
                        type="text"
                        value={photo.caption ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.photos];
                          updated[pIdx].caption = e.target.value;
                          setFormData({ ...formData, photos: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-coquette-pink/60 text-xs font-cormorant italic bg-white"
                        placeholder="e.g. Some moments stay etched in the heart forever."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-coquette-roseDark mb-1">
                        💌 3. Pink Box Secret Note (Full Paragraph Text)
                      </label>
                      <textarea
                        rows={2}
                        value={photo.secretNote ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.photos];
                          updated[pIdx].secretNote = e.target.value;
                          setFormData({ ...formData, photos: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-coquette-pinkDeep/40 bg-coquette-pinkLight/50 text-xs font-sans text-coquette-roseDark"
                        placeholder="e.g. That traditional saree look took everyone's breath away. Pure perfection in every single detail."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Next Slide Button Text
              </label>
              <input
                type="text"
                value={formData.slide6BtnText ?? ''}
                onChange={(e) => setFormData({ ...formData, slide6BtnText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                placeholder="Read Heartfelt Postcard 💌"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 6: Postcard Letter ─── */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 7: Heartfelt Postcard Letter 💌</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page7Tag ?? '/07'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page7Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page7Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-mono text-sm"
                  placeholder="/07"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.letterTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, letterTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl"
                  placeholder="Postcard letter"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Salutation
                </label>
                <input
                  type="text"
                  value={formData.letter.salutation ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    letter: { ...formData.letter, salutation: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-cormorant text-lg font-bold"
                  placeholder="TO. BESTIE"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Envelope Stamp Badge
                </label>
                <input
                  type="text"
                  value={formData.letterBadge ?? ''}
                  onChange={(e) => setFormData({ ...formData, letterBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-cormorant text-xs uppercase"
                  placeholder="A Letter For Bestie 💌"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Open Letter Button Text
                </label>
                <input
                  type="text"
                  value={formData.letterOpenBtnText ?? ''}
                  onChange={(e) => setFormData({ ...formData, letterOpenBtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-sans text-xs font-bold"
                  placeholder="Open Postcard Letter 💌"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Next Slide Button Text
                </label>
                <input
                  type="text"
                  value={formData.slide7BtnText ?? ''}
                  onChange={(e) => setFormData({ ...formData, slide7BtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 bg-[#fffdf9] font-sans text-xs font-bold text-coquette-pinkDeep"
                  placeholder="Final Celebration 🎉"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                Closing & Sender
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.letter.closing ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    letter: { ...formData.letter, closing: e.target.value }
                  })}
                  className="w-1/2 px-3 py-2 rounded-xl border font-alex text-xl"
                  placeholder="Always yours,"
                />
                <input
                  type="text"
                  value={formData.letter.sender ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    letter: { ...formData.letter, sender: e.target.value }
                  })}
                  className="w-1/2 px-3 py-2 rounded-xl border font-serifTitle font-bold text-sm"
                  placeholder="Nikhil"
                />
              </div>
            </div>

            {/* Paragraphs Editor */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80">
                  Letter Paragraphs (Animated word-by-word reveal)
                </label>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      letter: {
                        ...formData.letter,
                        paragraphs: [...formData.letter.paragraphs, "New paragraph..."]
                      }
                    });
                    soundEngine.playPop();
                  }}
                  className="px-3 py-1 rounded-full bg-coquette-pink text-coquette-roseDark text-xs font-bold flex items-center gap-1 hover:bg-coquette-pinkDeep hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Paragraph</span>
                </button>
              </div>

              {formData.letter.paragraphs.map((para, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="font-bold text-xs text-coquette-pinkDeep pt-3">#{idx + 1}</span>
                  <textarea
                    rows={3}
                    value={para ?? ''}
                    onChange={(e) => {
                      const updatedParas = [...formData.letter.paragraphs];
                      updatedParas[idx] = e.target.value;
                      setFormData({
                        ...formData,
                        letter: { ...formData.letter, paragraphs: updatedParas }
                      });
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-cormorant text-base leading-relaxed italic bg-[#fffdf9]"
                    placeholder="Enter paragraph text..."
                  />
                  <button
                    onClick={() => {
                      const updatedParas = formData.letter.paragraphs.filter((_, i) => i !== idx);
                      setFormData({
                        ...formData,
                        letter: { ...formData.letter, paragraphs: updatedParas }
                      });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors pt-3"
                    title="Delete Paragraph"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 7: Song & Ending ─── */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h2 className="font-cormorant text-2xl font-bold text-coquette-pinkDeep border-b pb-2 flex items-center justify-between">
              <span>Slide 8: Song Track & Final Celebration 🎵</span>
              <span className="text-xs font-sans font-normal text-coquette-roseDark/60">Page Tag: {formData.page8Tag ?? '/08'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Page Tag Number
                </label>
                <input
                  type="text"
                  value={formData.page8Tag ?? ''}
                  onChange={(e) => setFormData({ ...formData, page8Tag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-mono text-sm"
                  placeholder="/08"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Header Right Tag
                </label>
                <input
                  type="text"
                  value={formData.thankYouTag ?? ''}
                  onChange={(e) => setFormData({ ...formData, thankYouTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-pink/50 font-alex text-xl"
                  placeholder="Thank you"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-coquette-pink/50 bg-[#fffdf9] space-y-4">
              <h3 className="font-sans font-bold text-sm text-coquette-roseDark flex items-center gap-2">
                <Music className="w-4 h-4 text-coquette-pinkDeep" />
                <span>Background Song Track</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                    Song Track Title Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.customTrackName ?? ''}
                    onChange={(e) => setFormData({ ...formData, customTrackName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border font-sans text-sm"
                    placeholder="e.g. Majboor — Autotune Version"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                    Song Card Subtext
                  </label>
                  <input
                    type="text"
                    value={formData.songSubtext ?? ''}
                    onChange={(e) => setFormData({ ...formData, songSubtext: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border font-sans text-xs"
                    placeholder="Cinematic Birthday Vibe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                    Upload Custom MP3 Song File
                  </label>
                  <label className="w-full px-4 py-2.5 rounded-xl border border-coquette-pinkDeep bg-coquette-pinkLight text-coquette-roseDark font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-coquette-pink transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Choose MP3 File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAudioFileUpload(file);
                      }}
                      className="hidden"
                      ref={audioInputRef}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Final Slide Title
                </label>
                <input
                  type="text"
                  value={formData.thankYouTitle ?? ''}
                  onChange={(e) => setFormData({ ...formData, thankYouTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border font-script text-2xl"
                  placeholder="Happy Birthday!"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Final Thank You Message
                </label>
                <textarea
                  rows={2}
                  value={formData.thankYouMessage ?? ''}
                  onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border font-cormorant text-base italic"
                  placeholder="Final message..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-coquette-roseDark/80 mb-2">
                  Restart Deck Button Text
                </label>
                <input
                  type="text"
                  value={formData.slide8BtnText ?? ''}
                  onChange={(e) => setFormData({ ...formData, slide8BtnText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border font-sans text-xs font-bold text-coquette-pinkDeep"
                  placeholder="Back to Start 🌸"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Footer inside Editor */}
        <div className="mt-10 pt-6 border-t border-[#ebdcd0] flex justify-between items-center">
          <button
            onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
            disabled={activeTab === 0}
            className="px-5 py-2.5 rounded-full bg-coquette-pinkLight text-coquette-roseDark font-bold text-xs disabled:opacity-30"
          >
            ← Previous Section
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-full bg-coquette-pinkDeep text-white font-bold text-xs hover:bg-coquette-roseDark transition-all shadow-lg hover:scale-105 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>

          <button
            onClick={() => setActiveTab((prev) => Math.min(tabs.length - 1, prev + 1))}
            disabled={activeTab === tabs.length - 1}
            className="px-5 py-2.5 rounded-full bg-coquette-roseDark text-white font-bold text-xs disabled:opacity-30"
          >
            Next Section →
          </button>
        </div>

      </main>
    </div>
  );
};
