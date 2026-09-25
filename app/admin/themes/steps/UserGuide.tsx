"use client";

import React, { useState, useEffect, useImperativeHandle, useRef } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaVideo, FaAngleUp, FaAngleDown, FaSave, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { useAutoSaveSimple } from "@/hooks/useAutoSaveSimple";

const RichTextEditor = dynamic(() => import("@/components/shared/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm animate-pulse">
      جاري تحميل المحرر...
    </div>
  ),
});

interface Page { id: string; name: string; sections: Section[]; order?: number; }
interface Section { id: number; title: string; content: string; videoLink?: string; }
interface UserGuideProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pageData: { [pageId: string]: Page };
  updatePageData: (pages: { [pageId: string]: Page }) => void;
  onBeforeSave?: () => void;
  onAddPendingSection?: (pageId: string, section: Omit<Section, "id">) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
}

const UserGuide = React.forwardRef<{ addPendingSections: () => void; clearPendingStates: () => void; checkPendingSections: () => boolean }, UserGuideProps>(({ activeTab, setActiveTab, pageData, updatePageData, onBeforeSave, onAddPendingSection, onEditingStateChange }, ref) => {
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [newPageName, setNewPageName] = useState("");
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; onConfirm: () => void }>({ show: false, onConfirm: () => {} });
  const sectionFormRef = React.useRef<HTMLDivElement>(null);

  const emptySection = (): Omit<Section, "id"> => ({ title: "", content: "", videoLink: "" });
  const [draftSections, setDraftSections] = useState<{ [pageId: string]: Omit<Section, "id"> }>({});
  
  // Auto-save functionality
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoredData, setRestoredData] = useState<any>(null);
  
  const themeId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : 'unknown';
  
  const { manualSave, restoreData, clearSavedData, hasUnsavedData, isSaving, saveStatus: autoSaveStatus } = useAutoSaveSimple({
    data: pageData,
    interval: 10000, // 10 seconds
    storageKey: `theme-editor-autosave-${themeId}`,
    onSaveSuccess: () => setSaveStatus('saved'),
    onSaveError: () => setSaveStatus('error'),
    enabled: true
  });

  useEffect(() => {
    if (pageData && Object.keys(pageData).length > 0 && (!activeTab || !pageData[activeTab])) {
      setActiveTab(Object.keys(pageData)[0]);
    }
  }, [pageData]);

  useEffect(() => {
    if (showAddSection && sectionFormRef.current) {
      sectionFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showAddSection]);

  useEffect(() => {
    if (onEditingStateChange) {
      onEditingStateChange(editingSectionId !== null || showAddSection);
    }
  }, [editingSectionId, showAddSection, onEditingStateChange]);

  // ─── Persistence ─────────────────────────────
  // Persistence logic removed.

  // ─── Auto-save Restore Functionality ─────────────────────────────
  useEffect(() => {
    // Check for saved data on component mount
    const savedData = restoreData();
    if (savedData && Object.keys(savedData).length > 0) {
      setRestoredData(savedData);
      setShowRestoreDialog(true);
    }
  }, []);

  // Update save status when isSaving changes
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    }
  }, [isSaving]);

  // Auto-hide save status after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'error') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Handle restore dialog
  const handleRestoreData = () => {
    if (restoredData) {
      updatePageData(restoredData);
      setShowRestoreDialog(false);
      setRestoredData(null);
      clearSavedData();
    }
  };

  const handleDiscardRestore = () => {
    setShowRestoreDialog(false);
    setRestoredData(null);
    clearSavedData();
  };

  const getActivePage = (): Page => {
    if (!pageData || !Object.keys(pageData).length) return { id: "", name: "", sections: [] };
    if (activeTab && pageData[activeTab]) return pageData[activeTab];
    const key = Object.keys(pageData)[0];
    return key ? pageData[key] : { id: "", name: "", sections: [] };
  };

  const activePage = getActivePage();
  const hasActivePage = activePage.id !== "";

  const getDraft = (pageId: string) => draftSections[pageId] || emptySection();
  const setDraft = (pageId: string, data: Partial<Omit<Section, "id">>) => {
    setDraftSections(prev => ({ ...prev, [pageId]: { ...(prev[pageId] || emptySection()), ...data } }));
  };

  const isSectionValid = (pageId: string) => {
    const d = getDraft(pageId);
    const hasContent = d.content.replace(/<[^>]*>/g, "").trim() !== "";
    const hasVideo = (d.videoLink || "").trim() !== "";
    const hasTitle = d.title.trim() !== "";
    
    // السكشن صالح إذا كان عندو عنوان على الأقل، أو محتوى، أو فيديو
    return hasTitle && (hasContent || hasVideo);
  };

  const handleAddPage = () => {
    if (!newPageName.trim()) return;
    const pageId = `page-${Date.now()}`;
    updatePageData({ ...pageData, [pageId]: { id: pageId, name: newPageName, sections: [] } });
    setActiveTab(pageId);
    setNewPageName("");
    setShowNewPageForm(false);
  };

  const handleDeletePage = (pageId: string) => {
    setConfirmDialog({
      show: true,
      onConfirm: () => {
        const updated = { ...pageData };
        delete updated[pageId];
        updatePageData(updated);
        const remaining = Object.keys(updated);
        setActiveTab(remaining.length > 0 ? remaining[0] : "");
        setConfirmDialog({ show: false, onConfirm: () => {} });
      },
    });
  };

  const handleEditPageName = (pageId: string, newName: string) => {
    if (!newName.trim()) return;
    updatePageData({ ...pageData, [pageId]: { ...pageData[pageId], name: newName } });
    setEditingPageId(null);
  };

  const handleAddSection = (pageId: string) => {
    const draft = getDraft(pageId);
    const hasContent = draft.content.replace(/<[^>]*>/g, "").trim() !== "";
    const hasVideo = (draft.videoLink || "").trim() !== "";
    const hasTitle = draft.title.trim() !== "";
    
    // اضف السكشن لو فيه عنوان على الأقل، أو محتوى، أو فيديو
    if (!hasTitle && !hasContent && !hasVideo) return;
    
    // لو مفيش عنوان، استخدم عنوان افتراضي
    const finalDraft = {
      ...draft,
      title: hasTitle ? draft.title : `سكشن ${pageData[pageId].sections.length + 1}`
    };
    
    const page = pageData[pageId];
    const newId = page.sections.length > 0 ? Math.max(...page.sections.map(s => s.id)) + 1 : 1;
    updatePageData({ ...pageData, [pageId]: { ...page, sections: [...page.sections, { ...finalDraft, id: newId }] } });
    setDraftSections(prev => ({ ...prev, [pageId]: emptySection() }));
  };

  const addPendingSections = () => {
    // Save any pending additions
    if (showAddSection) {
      handleAddSection(activeTab);
      setShowAddSection(false);
    }
    
    // Save any pending edits
    if (editingSectionId !== null) {
      const editDraftKey = `edit-${editingSectionId}`;
      const editDraft = draftSections[editDraftKey];
      if (editDraft && hasEditChanges(editingSectionId, editDraft)) {
        handleSaveEdit(activeTab, editingSectionId, editDraft);
      }
    }
  };

  const clearPendingStates = () => {
    setShowAddSection(false);
    setEditingSectionId(null);
    setDraftSections({});
  };

  useImperativeHandle(ref, () => ({
    addPendingSections,
    clearPendingStates,
    checkPendingSections: () => {
      // Return true if the add section form is open OR if there are any pending edits
      const hasPendingAddSection = showAddSection;
      const hasPendingEdit = editingSectionId !== null;
      
      // Also check if there are any unsaved changes in drafts
      const hasUnsavedChanges = Object.keys(draftSections).some(key => {
        if (key.startsWith('edit-')) {
          const sectionId = parseInt(key.replace('edit-', ''));
          const draft = draftSections[key];
          return draft && hasEditChanges(sectionId, draft);
        }
        return false;
      });
      
      return hasPendingAddSection || hasPendingEdit || hasUnsavedChanges;
    }
  }));

  const handleDeleteSection = (pageId: string, sectionId: number) => {
    setConfirmDialog({
      show: true,
      onConfirm: () => {
        const page = pageData[pageId];
        updatePageData({ ...pageData, [pageId]: { ...page, sections: page.sections.filter(s => s.id !== sectionId) } });
        setConfirmDialog({ show: false, onConfirm: () => {} });
      },
    });
  };

  const hasEditChanges = (sectionId: number, draft: Omit<Section, "id">) => {
    const section = activePage.sections.find(s => s.id === sectionId);
    if (!section) return false;
    
    return (
      draft.title !== section.title ||
      draft.content !== section.content ||
      (draft.videoLink || "") !== (section.videoLink || "")
    );
  };

  const handleSaveEdit = (pageId: string, sectionId: number, draft: Omit<Section, "id">) => {
    const page = pageData[pageId];
    updatePageData({ ...pageData, [pageId]: { ...page, sections: page.sections.map(s => s.id === sectionId ? { ...s, ...draft } : s) } });
    setEditingSectionId(null);
  };

  const handleMoveSection = (pageId: string, index: number, direction: "up" | "down") => {
    const page = pageData[pageId];
    const sections = [...page.sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    updatePageData({ ...pageData, [pageId]: { ...page, sections } });
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
      if (url.includes("watch?v=")) return `https://www.youtube.com/embed/${url.split("watch?v=")[1].split("&")[0]}`;
      if (url.includes("youtube.com/embed/")) return url;
    } catch { return ""; }
    return "";
  };

  const inputCls = "w-full !rounded-full !bg-transparent border-b border-[var(--border-color)] px-4 py-2.5 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all text-right text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]";
  
  const shadow = " !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]";

  return (
    <div className="space-y-4" dir="rtl">

      {/* ===== Confirm Dialog ===== */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDialog({ show: false, onConfirm: () => {} })} />
          
          <div className="relative bg-[var(--bg-primary)] rounded-3xl shadow-2xl p-8 w-80 flex flex-col items-center gap-4 z-10" dir="rtl">
            <button onClick={() => setConfirmDialog({ show: false, onConfirm: () => {} })} className="absolute top-4 left-4 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition">
              <FaTimes size={14} />
            </button>
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
              <FaTrash size={32} className="text-red-500" />
            </div>
            <p className="text-[var(--text-primary)] font-bold text-lg text-center">هل انت متأكد من حذف هذا العنصر؟</p>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={() => setConfirmDialog({ show: false, onConfirm: () => {} })} className="flex-1 py-2.5 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--bg-tertiary)] transition">إلغاء</button>
              <button onClick={confirmDialog.onConfirm} className="flex-1 py-2.5 rounded-full bg-red-500 text-[var(--bg-primary)] font-semibold hover:bg-red-600 transition">حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Restore Dialog ===== */}
      {showRestoreDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDiscardRestore} />
          
          <div className="relative bg-[var(--bg-primary)] rounded-3xl shadow-2xl p-8 w-96 flex flex-col items-center gap-4 z-10" dir="rtl">
            <button onClick={handleDiscardRestore} className="absolute top-4 left-4 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition">
              <FaTimes size={14} />
            </button>
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
              <FaSave size={32} className="text-primary" />
            </div>
            <p className="text-[var(--text-primary)] font-bold text-lg text-center">تم العثور على بيانات غير محفوظة!</p>
            <p className="text-[var(--text-secondary)] text-sm text-center">هل تريد استعادة البيانات التي لم يتم حفظها؟</p>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={handleDiscardRestore} className="flex-1 py-2.5 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--bg-tertiary)] transition">تجاهل</button>
              <button onClick={handleRestoreData} className="flex-1 py-2.5 rounded-full bg-primary text-[var(--bg-primary)] font-semibold hover:bg-primary-dark transition">استعادة</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Auto-save Status Indicator ===== */}
      <div className="flex items-center justify-between gap-2">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FaSave className="animate-spin" />
            <span>جاري الحفظ التلقائي...</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <FaCheck />
            <span>تم الحفظ التلقائي</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <FaExclamationTriangle />
            <span>فشل الحفظ التلقائي</span>
          </div>
        )}
      </div>

      {/* ===== Tabs ===== */}
      <div className="flex items-center gap-2 flex-wrap">
        {Object.values(pageData).map((page, index) => (
          <div 
            key={page.id} 
            className="relative group"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', index.toString());
              e.currentTarget.style.opacity = '0.5';
            }}
            onDragEnd={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.transform = 'scale(1)';
              
              const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
              const dropIndex = index;
              
              if (draggedIndex !== dropIndex) {
                const pages = Object.values(pageData);
                const draggedPage = pages[draggedIndex];
                
                // Create new array with reordered pages
                const newPages = pages.filter((_, i) => i !== draggedIndex);
                newPages.splice(dropIndex, 0, draggedPage);
                
                // Update pageData with new order
                const newPageData: { [key: string]: Page } = {};
                newPages.forEach((page, i) => {
                  newPageData[page.id] = { ...page, order: i };
                });
                
                updatePageData(newPageData);
              }
            }}
          >
            {editingPageId === page.id ? (
              <input
                type="text"
                defaultValue={page.name}
                className="px-3 py-1.5 text-sm border-2 border-[var(--primary-color)] rounded-full outline-none w-32 bg-[var(--bg-primary)] text-[var(--text-primary)]"
                onBlur={(e) => handleEditPageName(page.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleEditPageName(page.id, (e.target as HTMLInputElement).value); }}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1">
                {/* Drag indicator */}
                <div className="text-[var(--text-tertiary)] opacity-50 cursor-move">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m6 4V9"/>
                  </svg>
                </div>
                <button
                  onClick={() => setActiveTab(page.id)}
                  className={shadow + ` rounded-full text-base font-semibold transition-all flex items-center justify-center gap-1.5 min-w-36 duration-300 ${
                    activeTab === page.id
                      ? "bg-[var(--text-primary)] border border-[var(--glass-border)] border-b-transparent text-[var(--bg-primary)] hover:shadow-[0px_2px_3px_0px_var(--text-primary)] w-full"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:shadow-[0px_2px_3px_var(--primary-color)]"
                  }`}
                >
                  <span className={`w-full duration-300 transition ${
                    activeTab === page.id
                      ? "px-4 py-1.5 rounded-full bg-gradient-to-r from-white/30 via-[var(--text-primary)] to-white/30"
                      : "px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] shadow-[inset_0px_1px_4px_0px_var(--text-primary)] border-b border-[var(--border-color)]"
                  }`}>
                    {page.name}
                  </span>
                </button>
              </div>
            )}
            <div className="absolute -top-2 -left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => setEditingPageId(page.id)} className="bg-green-500 hover:bg-green-600 text-[var(--bg-primary)] p-1 rounded-full flex items-center justify-center duration-300 transition">
                <FaEdit size={10} />
              </button>
              {Object.keys(pageData).length > 1 && (
                <button onClick={() => handleDeletePage(page.id)} className="bg-red-500 hover:bg-red-600 text-[var(--bg-primary)] p-1 rounded-full flex items-center justify-center duration-300 transition">
                  <FaTrash size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => setShowNewPageForm(true)}
          className="flex items-center gap-1.5 text-[var(--primary-color)] text-base font-semibold px-3 py-1.5 rounded-full hover:bg-[var(--primary-color)]/20 transition duration-300"
        >
          أضف صفحة
          <span className="w-5 h-5 bg-[var(--primary-color)] text-[var(--bg-primary)] rounded-full flex items-center justify-center">
            <FaPlus size={10} />
          </span>
        </button>
      </div>

      {/* فورم إضافة صفحة */}
      {showNewPageForm && (
        <div className="flex gap-2 bg-transparent py-3">
          <input
            type="text" value={newPageName} onChange={(e) => setNewPageName(e.target.value)}
            placeholder="اسم الصفحة" className={inputCls + shadow + " flex-1"}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddPage(); }} autoFocus
          />
          <button onClick={handleAddPage} disabled={!newPageName.trim()} className={shadow + " bg-[var(--primary-color)] border-b border-[var(--border-color)] text-[var(--bg-primary)] px-4 py-2 rounded-full text-sm font-medium disabled:opacity-70 hover:opacity-80 duration-300 transition"}>إضافة</button>
          <button onClick={() => setShowNewPageForm(false)} className={shadow + " border-b border-[var(--border-color)] text-[var(--text-secondary)] px-3 py-2 rounded-full text-sm duration-300 transition"}>إلغاء</button>
        </div>
      )}

      {/* ===== زرار أضف سكشن جديد ===== */}
      <div className="flex items-center justify-start">
        <button
          onClick={() => setShowAddSection((v) => !v)}
          className="flex items-center gap-1.5 text-[var(--text-primary)] text-sm font-bold"
        >
          أضف سكشن جديد
          <span className="w-6 h-6 bg-[var(--primary-color)] text-[var(--bg-primary)] rounded-full flex items-center justify-center">
            <FaPlus size={10} />
          </span>
        </button>
      </div>

      {hasActivePage && (
        <div className="space-y-4 p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl">

          {activePage.sections.length === 0 && !showAddSection && (
            <div className="flex flex-col items-center justify-center py-5 gap-2">
              <p className="text-[var(--text-primary)] text-base font-semibold">لم يتم إضافة سكاشن بعد</p>
            </div>
          )}

          {/* السكشنز الموجودة */}
          {activePage.sections.map((section, index) => {
            const isEditing = editingSectionId === section.id;
            const editDraftKey = `edit-${section.id}`;
            const editDraft = draftSections[editDraftKey] || { title: section.title, content: section.content, videoLink: section.videoLink || "" };

            return (
              <div key={section.id} className="overflow-hidden">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">تعديل السكشن</span>
                      <button onClick={() => setEditingSectionId(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><FaTimes size={14} /></button>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 block text-right">اسم السكشن <span className="text-red-500">*</span></label>
                      <input
                        type="text" value={editDraft.title}
                        onChange={(e) => setDraftSections(prev => ({ ...prev, [editDraftKey]: { ...editDraft, title: e.target.value } }))}
                        className={inputCls  + shadow } placeholder="ادخل الاسم هنا"
                      />
                    </div>
                    <RichTextEditor
                      value={editDraft.content}
                      onChange={(v) => {
                        setDraftSections(prev => ({ ...prev, [editDraftKey]: { ...editDraft, content: v } }));
                      }}
                      placeholder="اكتب شرح مفصل للقسم هنا..."
                    />
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 flex items-center gap-1">
                        <FaVideo className="text-red-400" size={10} /> رابط يوتيوب (اختياري)
                      </label>
                      <input
                        type="url" value={editDraft.videoLink || ""}
                        onChange={(e) => setDraftSections(prev => ({ ...prev, [editDraftKey]: { ...editDraft, videoLink: e.target.value } }))}
                        className={inputCls + shadow + " text-left"} placeholder="https://youtube.com/watch?v=..." dir="ltr"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={() => setEditingSectionId(null)} className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-full h-10 text-sm hover:bg-[var(--bg-tertiary)] transition">إلغاء</button>
                      <button
                        onClick={() => handleSaveEdit(activeTab, section.id, editDraft)}
                        disabled={!hasEditChanges(section.id, editDraft)}
                        className={`rounded-full text-base h-10 w-28 font-semibold transition-all flex items-center justify-center bg-[var(--text-primary)] text-[var(--bg-primary)] ${
                          hasEditChanges(section.id, editDraft) ? "overflow-hidden opacity-100" : "opacity-70 cursor-not-allowed"
                        }`}
                      >
                        <span className="flex items-center justify-center duration-300 transition w-full h-full rounded-full bg-gradient-to-r from-white/30 via-[var(--text-primary)] to-white/30">
                         حفظ
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={shadow + " flex items-center gap-2 px-4 py-2.5 rounded-full border-b border-[var(--border-color)]"}>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveSection(activeTab, index, "up")}
                          disabled={index === 0}
                          className="p-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="تحريك لأعلى"
                        >
                          <FaAngleUp />
                        </button>
                        <button
                          onClick={() => handleMoveSection(activeTab, index, "down")}
                          disabled={index === activePage.sections.length - 1}
                          className="p-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="تحريك لأسفل"
                        >
                          <FaAngleDown />
                        </button>
                      </div>
                      <span className="text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full">#{index + 1}</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">{section.title}</span>
                      {section.videoLink && <FaVideo size={18} className="text-[var(--primary-color)]" />}
                      <button onClick={() => { setEditingSectionId(section.id); setDraftSections(prev => ({ ...prev, [`edit-${section.id}`]: { title: section.title, content: section.content, videoLink: section.videoLink || "" } })); }}
                        className="p-1.5  text-green-500 rounded-lg transition"><FaEdit size={18} /></button>
                      <button onClick={() => handleDeleteSection(activeTab, section.id)}
                        className="p-1.5 text-red-500 rounded-lg  transition"><FaTrash size={16} /></button>
                    </div>

                    {section.content && section.content.replace(/<[^>]*>/g, "").trim() && (
                      <div className="px-4 py-3 prose prose-sm max-w-none text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: section.content }} />
                    )}

                    {section.videoLink && getEmbedUrl(section.videoLink) && (
                      <div className="aspect-video rounded-3xl overflow-hidden">
                        <iframe src={getEmbedUrl(section.videoLink)} className="w-full h-full" allowFullScreen />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* فورم إضافة سكشن جديد */}
          {showAddSection && (
            <div ref={sectionFormRef} className="overflow-hidden">
              <div className="space-y-5">
                <div>
                  <label className="text-base font-semibold text-[var(--text-primary)] mb-2 block text-right">اسم السكشن <span>*</span></label>
                  <input
                    type="text"
                    value={getDraft(activeTab).title}
                    onChange={(e) => setDraft(activeTab, { title: e.target.value })}
                    className={inputCls + shadow +  " !w-[50%]"}
                    placeholder="ادخل الاسم هنا"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] font-medium mb-1 flex items-center gap-1">
                    <FaVideo className="text-red-400" size={10} /> رابط يوتيوب (اختياري)
                  </label>
                  <input
                    type="url"
                    value={getDraft(activeTab).videoLink || ""}
                    onChange={(e) => setDraft(activeTab, { videoLink: e.target.value })}
                    className={inputCls + shadow + " text-left"}
                    placeholder="https://youtube.com/watch?v=..."
                    dir="ltr"
                  />
                </div>
                <RichTextEditor
                  value={getDraft(activeTab).content}
                  onChange={(v) => setDraft(activeTab, { content: v })}
                  placeholder="اكتب شرح مفصل للقسم هنا..."
                />
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { handleAddSection(activeTab); setShowAddSection(false); }}
                    disabled={!isSectionValid(activeTab)}
                    className={`rounded-full text-base h-10 w-28 font-semibold transition-all flex items-center justify-center bg-[var(--text-primary)] text-[var(--bg-primary)] ${isSectionValid(activeTab) ? "overflow-hidden opacity-100" : "opacity-70 cursor-not-allowed"}`}
                  >
                    <span className="flex items-center justify-center duration-300 transition w-full h-full rounded-full bg-gradient-to-r from-white/30 via-[var(--text-primary)] to-white/30">
                      إضافة
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {!hasActivePage && (
        <div className={shadow + " text-center py-10 border-2 border-dashed border-[var(--border-color)] rounded-xl"}>
          <p className="text-[var(--text-tertiary)] text-sm mb-2">ابدأ بإضافة صفحة جديدة</p>
          <button onClick={() => setShowNewPageForm(true)} className="text-[var(--primary-color)] text-sm font-medium hover:underline">أضف صفحة الآن</button>
        </div>
      )}
    </div>
  );
});

export default UserGuide;