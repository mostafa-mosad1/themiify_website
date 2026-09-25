"use client";

import { useEffect, useRef, useCallback, useState } from 'react';

interface AutoSaveOptions {
  data: any;
  onSave?: (data: any) => void;
  interval?: number;
  storageKey?: string;
  enabled?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSaveSimple({
  data,
  onSave,
  interval = 10000, // 10 seconds
  storageKey = 'autosave-data',
  enabled = true,
  onSaveSuccess,
  onSaveError
}: AutoSaveOptions) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Simple save function
  const saveData = useCallback(async (currentData: any) => {
    if (!enabled || isSaving) return;

    console.log('🔄 Starting auto-save...');
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Save to localStorage
      const saveData = {
        data: currentData,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      console.log('✅ Data saved to localStorage');
      
      // Call custom save function if provided
      if (onSave) {
        await onSave(currentData);
        console.log('✅ Custom save function called');
      }
      
      lastSavedDataRef.current = currentData;
      setSaveStatus('saved');
      onSaveSuccess?.();
      console.log('✅ Auto-save completed successfully');
      
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      setSaveStatus('error');
      onSaveError?.(error instanceof Error ? error : new Error('Auto-save failed'));
    } finally {
      setIsSaving(false);
      
      // Auto-hide saved status after 3 seconds
      if (saveStatus === 'saved') {
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  }, [enabled, onSave, storageKey, onSaveSuccess, onSaveError, isSaving, saveStatus]);

  // Check if data has changed (simple comparison)
  const hasDataChanged = useCallback((currentData: any) => {
    if (!lastSavedDataRef.current) {
      console.log('📝 No previous data, will save');
      return true;
    }
    
    const currentStr = JSON.stringify(currentData);
    const lastStr = JSON.stringify(lastSavedDataRef.current);
    const changed = currentStr !== lastStr;
    
    if (changed) {
      console.log('📝 Data changed, will save');
    } else {
      console.log('📝 No changes detected');
    }
    
    return changed;
  }, []);

  // Manual save function
  const manualSave = useCallback(() => {
    console.log('💾 Manual save triggered');
    saveData(data);
  }, [data, saveData]);

  // Restore data from localStorage
  const restoreData = useCallback((): any | null => {
    if (!enabled) return null;

    try {
      const savedItem = localStorage.getItem(storageKey);
      if (!savedItem) {
        console.log('📂 No saved data found');
        return null;
      }

      const savedData = JSON.parse(savedItem);
      console.log('📂 Found saved data from:', new Date(savedData.timestamp));
      
      // Check if saved data is recent (within 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - savedData.timestamp > maxAge) {
        console.log('📂 Saved data is too old, removing');
        localStorage.removeItem(storageKey);
        return null;
      }

      return savedData.data;
    } catch (error) {
      console.error('❌ Failed to restore saved data:', error);
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [enabled, storageKey]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(storageKey);
    lastSavedDataRef.current = null;
    console.log('🗑️ Saved data cleared');
  }, [storageKey]);

  // Check if there's unsaved data
  const hasUnsavedData = useCallback(() => {
    return hasDataChanged(data);
  }, [data, hasDataChanged]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) {
      console.log('⏸️ Auto-save is disabled');
      return;
    }

    console.log('⏰ Setting up auto-save with interval:', interval);
    
    const scheduleSave = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-save timer triggered');
        
        if (hasDataChanged(data)) {
          saveData(data);
        } else {
          console.log('⏰ No changes to save');
        }
        
        scheduleSave(); // Schedule next save
      }, interval);
    };

    scheduleSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        console.log('⏰ Auto-save cleaned up');
      }
    };
  }, [data, hasDataChanged, saveData, interval, enabled]);

  // Immediate save on data changes (debounced)
  useEffect(() => {
    if (!enabled) return;

    const debounceTimer = setTimeout(() => {
      if (hasDataChanged(data)) {
        console.log('⚡ Immediate save on data change');
        saveData(data);
      }
    }, 2000); // Wait 2 seconds after change before saving

    return () => clearTimeout(debounceTimer);
  }, [data, hasDataChanged, saveData, enabled]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasDataChanged(data)) {
        console.log('🚀 Saving before page unload');
        // Save to localStorage synchronously before unload
        try {
          const saveData = {
            data: data,
            timestamp: Date.now(),
            version: '1.0'
          };
          localStorage.setItem(storageKey, JSON.stringify(saveData));
        } catch (error) {
          console.error('❌ Failed to save on unload:', error);
        }
      }
    };

    if (enabled) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, hasDataChanged, storageKey, enabled]);

  return {
    manualSave,
    restoreData,
    clearSavedData,
    hasUnsavedData,
    isSaving,
    saveStatus
  };
}
