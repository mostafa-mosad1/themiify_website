"use client";

// ==========================================
// 1. Library Imports and Dependencies
// ==========================================
import React, { useEffect, useRef, useState } from 'react';

// ==========================================
// 2. Custom Editor Tools
// This section contains definitions for additional editor tools (Color, Headers, Strikethrough, Video)
// ==========================================

// ─── Color Tool ───────────────────────
const createColorTool = (type: 'text' | 'marker') => {
  const defaultColors =
    type === 'text'
      ? ['#FF1300', '#EC78FF', '#0070FF', '#03FF46', '#FFEE00', '#8B73FF', '#010101', '#FFFFFF', '#E91E63', '#9C27B0']
      : ['#FFBF00', '#ADFF2F', '#00FFFF', '#FF69B4', '#FFA500', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB6C1'];

  const storageKey = `editor_custom_${type}_colors`;
  let customColors: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) customColors = JSON.parse(stored);
    } catch (e) {}
  }
  
  const COLORS = [...defaultColors, ...customColors];

  return class ColorInlineTool {
    static get isInline() { return true; }
    static get sanitize() { return { span: { style: true, class: true } }; }
    static get title() { return type === 'text' ? 'Text Color' : 'Highlight'; }

    api: any;
    button: any;
    picker: any;
    state: boolean;
    tag: string;

    constructor({ api }: { api: any }) {
      this.api = api;
      this.button = null;
      this.picker = null;
      this.state = false;
      this.tag = type === 'text' ? 'COLORTEXT' : 'COLORMARK';
      
      // Bind methods to ensure correct 'this' context
      this.togglePicker = this.togglePicker.bind(this);
      this.applyColor = this.applyColor.bind(this);
      this.removePicker = this.removePicker.bind(this);
    }

    render() {
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.classList.add(this.api.styles.inlineToolButton);
      this.button.innerHTML =
        type === 'text'
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v3H2zm4.32-4h11.36L12 3.37z"/></svg>`
          : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 0 0 9.5 3C6.08 3 3 6.08 3 9.5S6.08 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

      this.button.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePicker();
      });
      return this.button;
    }

    removePicker() {
      if (this.picker) {
        this.picker.remove();
        this.picker = null;
        window.removeEventListener('scroll', this.removePicker, true);
      }
    }

    togglePicker() {
      if (this.picker) {
        this.removePicker();
        return;
      }
      this.picker = document.createElement('div');
      const rect = this.button.getBoundingClientRect();
      Object.assign(this.picker.style, {
        position: 'fixed',
        top: (rect.bottom + 10) + 'px',
        left: (rect.left + rect.width / 2) + 'px',
        transform: 'translateX(-50%)',
        background: 'var(--bg-secondary, #1e1e2e)',
        border: '1px solid var(--border-color, #333)',
        borderRadius: '12px',
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 26px)',
        gap: '6px',
        zIndex: '99999',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      });

      COLORS.forEach((color) => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        Object.assign(swatch.style, { 
          width: '26px', 
          height: '26px', 
          borderRadius: '6px', 
          background: color, 
          border: '2px solid rgba(255,255,255,0.1)', 
          cursor: 'pointer', 
          transition: 'all 0.2s' 
        });
        swatch.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          this.applyColor(color); 
          this.removePicker(); 
        });
        this.picker.appendChild(swatch);
      });

      const customWrapper = document.createElement('div');
      Object.assign(customWrapper.style, { 
        gridColumn: 'span 5', 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      });
      
      const customTitle = document.createElement('div');
      customTitle.textContent = 'لون مخصص';
      Object.assign(customTitle.style, { 
        fontSize: '10px', 
        color: 'var(--text-secondary, #999)', 
        textAlign: 'right', 
        fontWeight: 'bold' 
      });
      
      const customInput = document.createElement('input');
      customInput.type = 'color';
      Object.assign(customInput.style, { 
        width: '100%', 
        height: '30px', 
        border: '1px solid var(--border-color, #444)', 
        borderRadius: '6px', 
        background: 'var(--bg-primary, #000)', 
        cursor: 'pointer' 
      });
      customInput.addEventListener('change', (e: any) => { 
        const newColor = e.target.value.toUpperCase();
        if (!COLORS.some(c => c.toUpperCase() === newColor)) {
          COLORS.push(newColor);
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem(storageKey);
              const savedCustom = stored ? JSON.parse(stored) : [];
              savedCustom.push(newColor);
              localStorage.setItem(storageKey, JSON.stringify(savedCustom));
            } catch (err) {}
          }
        }
        this.applyColor(e.target.value); 
        this.removePicker(); 
      });
      
      customWrapper.appendChild(customTitle);
      customWrapper.appendChild(customInput);
      this.picker.appendChild(customWrapper);

      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.textContent = 'إعادة ضبط اللون';
      Object.assign(resetBtn.style, { 
        gridColumn: 'span 5', 
        marginTop: '4px', 
        padding: '6px', 
        fontSize: '11px', 
        cursor: 'pointer', 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid var(--border-color, #444)', 
        borderRadius: '6px', 
        color: 'var(--text-primary, #fff)' 
      });
      resetBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        this.applyColor(null); 
        this.removePicker(); 
      });
      this.picker.appendChild(resetBtn);

      document.body.appendChild(this.picker);
      
      const onMouseDown = (e: MouseEvent) => {
        if (this.picker && !this.picker.contains(e.target as Node) && e.target !== this.button) {
          this.removePicker();
          document.removeEventListener('mousedown', onMouseDown);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('mousedown', onMouseDown);
        window.addEventListener('scroll', this.removePicker, { capture: true, once: true });
      }, 0);
    }

    applyColor(color: string | null) {
      if (!color) { document.execCommand('removeFormat'); return; }
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      if (this.tag === 'COLORTEXT') span.style.color = color; else span.style.backgroundColor = color;
      try { 
        range.surroundContents(span); 
        selection.removeAllRanges(); 
        const newRange = document.createRange(); 
        newRange.selectNode(span); 
        selection.addRange(newRange); 
      } catch { 
        const fragment = range.extractContents(); 
        span.appendChild(fragment); 
        range.insertNode(span); 
      }
    }

    surround(_range: Range) {}
    checkState() {
      const selection = window.getSelection();
      if (!selection) return false;
      const anchorNode = selection.anchorNode;
      const parent = anchorNode?.nodeType === 3 ? anchorNode.parentElement : anchorNode as Element;
      this.state = !!parent?.closest('span[style]');
      if (this.button) this.button.classList.toggle(this.api.styles.inlineToolButtonActive, this.state);
      return this.state;
    }
  };
};

// ─── Header Level Tool ───────────────────────
const createHeaderLevelTool = (level: number) => {
  return class HeaderLevelTool {
    static get isInline() { return true; }
    static get title() { return `Heading ${level}`; }
    api: any;
    button: any;
    constructor({ api }: { api: any }) { this.api = api; }
    render() {
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.innerHTML = `<b>H${level}</b>`;
      this.button.classList.add(this.api.styles.inlineToolButton);
      this.button.addEventListener('click', async (e: any) => {
        e.preventDefault();
        const index = this.api.blocks.getCurrentBlockIndex();
        if (index < 0) return;
        
        try {
          const block = this.api.blocks.getBlockByIndex(index);
          const savedBlock = await block.save();
          const text = savedBlock.data.text || '';
          
          // Replace block to ensure type change and data update
          this.api.blocks.insert('header', { level, text }, {}, index, true, true);
        } catch (err) {
          console.error('Error converting to header:', err);
        }
      });
      return this.button;
    }
    surround() {}
    checkState() {
      try {
        const index = this.api.blocks.getCurrentBlockIndex();
        const block = this.api.blocks.getBlockByIndex(index);
        if (!block || block.name !== 'header') {
          if (this.button) this.button.classList.remove(this.api.styles.inlineToolButtonActive);
          return false;
        }
        
        // Synchronously check the header level via the DOM element
        const holder = block.holder;
        const hasTargetHeader = !!holder.querySelector(`h${level}`);
        
        if (this.button) {
          this.button.classList.toggle(this.api.styles.inlineToolButtonActive, hasTargetHeader);
        }
        return hasTargetHeader;
      } catch (e) {
        return false;
      }
    }
  };
};

// ─── Strikethrough Tool ───────────────────────
const createStrikeTool = () => {
  return class StrikeTool {
    static get isInline() { return true; }
    static get title() { return 'Strikethrough'; }
    static get sanitize() { return { s: {} }; }
    api: any;
    button: any;
    constructor({ api }: { api: any }) { this.api = api; }
    render() {
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.innerHTML = '<s>S</s>';
      this.button.classList.add(this.api.styles.inlineToolButton);
      return this.button;
    }
    surround() { document.execCommand('strikeThrough'); }
    checkState() {
      const state = document.queryCommandState('strikeThrough');
      if (this.button) this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
      return state;
    }
  };
};

// ─── Custom Video Tool ───────────────────────
const createVideoTool = () => {
  return class VideoTool {
    static get isReadOnlySupported() { return true; }
    static get toolbox() {
      return {
        title: 'فيديو',
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><polygon points="10 8 16 12 10 16 10 8"></polygon><line x1="2" y1="21" x2="22" y2="21"></line></svg>'
      };
    }

    api: any;
    data: any;
    readOnly: boolean;
    nodes: { wrapper: HTMLElement | null };

    constructor({ data, api, readOnly }: { data: any; api: any; readOnly: boolean }) {
      this.api = api;
      this.data = data || {};
      this.readOnly = readOnly;
      this.nodes = { wrapper: null };
    }

    render() {
      const wrapper = document.createElement('div');
      wrapper.classList.add('video-tool-wrapper');
      this.nodes.wrapper = wrapper;

      if (this.data && this.data.url) {
        this._showVideo(this.data.url);
      } else if (!this.readOnly) {
        this._showInput();
      } else {
        wrapper.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">لا يوجد فيديو</div>';
      }

      return wrapper;
    }

    _showInput() {
      const container = document.createElement('div');
      Object.assign(container.style, {
        padding: '24px',
        border: '2px dashed var(--border-color, #444)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-secondary, #1e1e2e)',
        margin: '10px 0'
      });

      const title = document.createElement('div');
      title.textContent = 'إضافة فيديو (YouTube أو رابط مباشر)';
      Object.assign(title.style, { fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', textAlign: 'right' });

      const input = document.createElement('input');
      input.placeholder = 'أدخل رابط الفيديو هنا...';
      Object.assign(input.style, {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid var(--border-color, #444)',
        background: 'var(--bg-primary, #000)',
        color: 'var(--text-primary, #fff)',
        outline: 'none',
        direction: 'ltr'
      });

      const button = document.createElement('button');
      button.textContent = 'إضافة';
      Object.assign(button.style, {
        padding: '10px 20px',
        borderRadius: '8px',
        background: '#0070FF',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'opacity 0.2s'
      });

      const handleAdd = () => {
        const url = input.value.trim();
        if (url) {
          this.data.url = url;
          this._showVideo(url);
        }
      };

      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } });
      button.addEventListener('click', (e) => { e.preventDefault(); handleAdd(); });

      const orText = document.createElement('div');
      orText.textContent = 'أو';
      Object.assign(orText.style, { fontSize: '12px', color: 'var(--text-secondary, #999)', textAlign: 'center', margin: '4px 0' });

      const uploadBtn = document.createElement('button');
      uploadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        رفع فيديو (بحد أقصى 5 ميجا)
      `;
      Object.assign(uploadBtn.style, {
        padding: '12px 20px',
        borderRadius: '10px',
        background: 'rgba(0, 112, 255, 0.1)',
        color: '#0070FF',
        border: '1px dashed #0070FF',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/*';
      fileInput.style.display = 'none';

      uploadBtn.onclick = () => fileInput.click();

      fileInput.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          alert('حجم الفيديو يجب أن يكون أقل من 5 ميجا بايت');
          return;
        }

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = 'جاري الرفع...';
        
        const formData = new FormData();
        formData.append('video', file);

        try {
          const response = await fetch('/api/upload-video', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!response.ok || !result.url) {
            throw new Error(result.error || 'Failed to upload video');
          }

          this.data.url = result.url;
          this.data.type = 'direct';
          this._showVideo(result.url);
        } catch (err: any) {
          console.error('Upload error:', err);
          alert('حدث خطأ أثناء الرفع: ' + (err.message || 'خطأ غير معروف'));
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = 'رفع فيديو (بحد أقصى 5 ميجا)';
        }
      };

      container.appendChild(title);
      container.appendChild(input);
      container.appendChild(button);
      container.appendChild(orText);
      container.appendChild(uploadBtn);
      
      if (this.nodes.wrapper) {
        this.nodes.wrapper.innerHTML = '';
        this.nodes.wrapper.appendChild(container);
      }
    }

    _showVideo(url: string) {
      const isYouTube = /youtube\.com|youtu\.be/.test(url);
      const container = document.createElement('div');
      Object.assign(container.style, {
        position: 'relative',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#000',
        aspectRatio: '16/9',
        margin: '10px 0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      });

      if (isYouTube) {
        const videoId = this._getYouTubeId(url);
        if (videoId) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          Object.assign(iframe.style, { width: '100%', height: '100%', border: '0' });
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          container.appendChild(iframe);
          this.data.type = 'youtube';
        } else {
          container.innerHTML = '<div style="padding: 20px; color: red; text-align: center;">رابط YouTube غير صالح</div>';
        }
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        Object.assign(video.style, { width: '100%', height: '100%', borderRadius: '16px' });
        container.appendChild(video);
        this.data.type = 'direct';
      }

      if (!this.readOnly) {
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✎';
        Object.assign(editBtn.style, {
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          cursor: 'pointer',
          zIndex: '10'
        });
        editBtn.onclick = (e) => {
          e.preventDefault();
          this._showInput();
        };
        container.appendChild(editBtn);
      }

      if (this.nodes.wrapper) {
        this.nodes.wrapper.innerHTML = '';
        this.nodes.wrapper.appendChild(container);
      }
    }

    _getYouTubeId(url: string) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }

    save() {
      return this.data;
    }
  };
};
