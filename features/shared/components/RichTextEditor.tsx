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

// ==========================================
// 3. Main RichTextEditor Component
// ==========================================
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'اكتب هنا...',
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const lastSavedHtml = useRef<string>(value || '');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // ─── HTML to Blocks Conversion ───────────────────────
  // Used to convert external HTML code into a format understood by EditorJS
  const htmlToBlocks = (html: string) => {
    if (typeof window === 'undefined' || !html || typeof html !== 'string') return { blocks: [] };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const blocks: any[] = [];
      const processNode = (node: any) => {
        if (node.nodeType === 1) {
          const tag = node.tagName.toLowerCase();
          if (tag.startsWith('h') && tag.length === 2) {
            blocks.push({ type: 'header', data: { text: node.innerHTML, level: parseInt(tag[1]) || 2 } });
          } else if (tag === 'hr') {
            blocks.push({ type: 'delimiter', data: { color: node.style.borderTopColor || node.style.borderColor || '' } });
          } else if (tag === 'ul' || tag === 'ol') {
            blocks.push({ type: 'list', data: { style: tag === 'ul' ? 'unordered' : 'ordered', items: Array.from(node.querySelectorAll(':scope > li')).map((li: any) => li.innerHTML) } });
          } else if (tag === 'img') {
            blocks.push({ type: 'image', data: { file: { url: node.getAttribute('src') }, caption: node.getAttribute('alt') || '' } });
          } else if (tag === 'iframe' && node.getAttribute('src')?.includes('youtube')) {
            blocks.push({ type: 'video', data: { url: node.getAttribute('src'), type: 'youtube' } });
          } else if (tag === 'video') {
            blocks.push({ type: 'video', data: { url: node.getAttribute('src') || node.querySelector('source')?.getAttribute('src'), type: 'direct' } });
          } else if (tag === 'table') {
            const rows: string[][] = [];
            let withHeadings = false;
            const trs = Array.from(node.querySelectorAll('tr'));
            trs.forEach((tr: any, index: number) => {
              const cells = Array.from(tr.querySelectorAll('th, td')).map((cell: any) => cell.innerHTML);
              if (index === 0 && tr.querySelector('th')) withHeadings = true;
              if (cells.length > 0) rows.push(cells);
            });
            if (rows.length > 0) {
              blocks.push({ type: 'table', data: { withHeadings, content: rows } });
            }
          } else if (tag === 'p' || tag === 'div' || tag === 'section') {
            // Check if it contains block-level elements we want to parse separately
            const hasBlockElements = !!node.querySelector('img, table, ul, ol, h1, h2, h3, h4, h5, h6, hr');
            if (hasBlockElements) {
              Array.from(node.childNodes).forEach(processNode);
            } else if (node.innerHTML.trim()) {
              blocks.push({ type: 'paragraph', data: { text: node.innerHTML } });
            }
          } else if (node.childNodes.length > 0 && !['b', 'i', 'u', 'strong', 'em', 'a', 'span', 'font'].includes(tag)) {
            Array.from(node.childNodes).forEach(processNode);
          } else if (node.innerHTML.trim()) {
            blocks.push({ type: 'paragraph', data: { text: node.outerHTML } });
          }
        } else if (node.nodeType === 3 && node.textContent?.trim()) {
          blocks.push({ type: 'paragraph', data: { text: node.textContent.trim() } });
        }
      };
      Array.from(doc.body.childNodes).forEach(processNode);
      return { blocks: blocks.length > 0 ? blocks : [{ type: 'paragraph', data: { text: '' } }] };
    } catch { return { blocks: [] }; }
  };

  // ─── Editor Initialization Effect ───────────────────────
  // This effect is called once when the component mounts to initialize the editor and its tools
  useEffect(() => {
    if (!isClient || initializationRef.current || !containerRef.current) return;
    initializationRef.current = true;

    const initEditor = async () => {
      try {
        const [EditorJS, Header, List, ImageTool, Embed, Table, Paragraph, edjsHTML, Underline, DragDrop, Alignment, InlineCode, Undo] = await Promise.all([
          import('@editorjs/editorjs').then(m => m.default),
          import('@editorjs/header').then(m => m.default),
          import('@editorjs/list').then(m => m.default),
          import('@editorjs/image').then(m => m.default),
          import('@editorjs/embed').then(m => m.default),
          import('@editorjs/table').then(m => m.default),
          import('@editorjs/paragraph').then(m => m.default),
          import('editorjs-html').then(m => m.default),
          import('@editorjs/underline').then(m => m.default),
          import('editorjs-drag-drop').then(m => m.default || m),
          import('editorjs-text-alignment-blocktune').then(m => m.default),
          import('@editorjs/inline-code').then(m => m.default),
          import('editorjs-undo').then(m => m.default),
        ]);

        // Custom tools — no external color plugin needed
        const TextColorTool = createColorTool('text');
        const MarkerTool = createColorTool('marker');
        const VideoTool = createVideoTool();
        const H1Tool = createHeaderLevelTool(1);
        const H2Tool = createHeaderLevelTool(2);
        const H3Tool = createHeaderLevelTool(3);
        const StrikeTool = createStrikeTool();
        
        // ─── Custom Delimiter Tool ───────────────────────
        const CustomDelimiterTool = (() => {
          return class DelimiterTool {
            static get isReadOnlySupported() { return true; }
            static get contentless() { return true; }
            api: any; data: any; nodes: any;
            constructor({ data, api }: { data: any; api: any }) {
              this.api = api;
              this.data = { color: data.color || 'var(--border-color, #444)' };
              this.nodes = { wrapper: null, line: null };
            }
            render() {
              this.nodes.wrapper = document.createElement('div');
              this.nodes.wrapper.classList.add('ce-delimiter');
              this.nodes.line = document.createElement('div');
              Object.assign(this.nodes.line.style, { width: '100%', height: '1px', backgroundColor: this.data.color, opacity: '0.8' });
              this.nodes.wrapper.appendChild(this.nodes.line);
              return this.nodes.wrapper;
            }
            save() { return { color: this.data.color }; }
            renderSettings() {
              const storageKey = 'editor_custom_text_colors';
              const getCustomColors = () => {
                if (typeof window === 'undefined') return [];
                try {
                  const stored = localStorage.getItem(storageKey);
                  return stored ? JSON.parse(stored) : [];
                } catch(e) { return []; }
              };

              const wrapper = document.createElement('div');
              Object.assign(wrapper.style, { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' });

              const colorsGrid = document.createElement('div');
              Object.assign(colorsGrid.style, { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' });

              const defaultColors = ['#444444', '#FF1300', '#EC78FF', '#0070FF', '#03FF46', '#FFEE00', '#E91E63', '#9C27B0', '#010101', '#FFFFFF'];
              const customColors = getCustomColors();
              const allColors = [...defaultColors, ...customColors.filter((c: string) => !defaultColors.includes(c))].slice(-20);

              allColors.forEach(color => {
                const swatch = document.createElement('div');
                Object.assign(swatch.style, { width: '24px', height: '24px', borderRadius: '6px', backgroundColor: color, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.1s' });
                swatch.onclick = () => {
                  this.data.color = color;
                  if (this.nodes.line) this.nodes.line.style.backgroundColor = color;
                };
                colorsGrid.appendChild(swatch);
              });

              const inputWrapper = document.createElement('div');
              Object.assign(inputWrapper.style, { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' });
              
              const label = document.createElement('div');
              label.textContent = 'لون مخصص';
              Object.assign(label.style, { fontSize: '10px', color: '#999', textAlign: 'right', fontWeight: 'bold' });

              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = this.data.color.startsWith('#') ? this.data.color : '#444444';
              Object.assign(colorInput.style, { width: '100%', height: '30px', border: '1px solid #333', borderRadius: '6px', background: '#000', cursor: 'pointer' });
              colorInput.onchange = (e: any) => {
                const color = e.target.value.toUpperCase();
                this.data.color = color;
                if (this.nodes.line) this.nodes.line.style.backgroundColor = color;
                
                const currentCustom = getCustomColors();
                if (!currentCustom.includes(color)) {
                  currentCustom.push(color);
                  localStorage.setItem(storageKey, JSON.stringify(currentCustom));
                }
              };

              inputWrapper.appendChild(label);
              inputWrapper.appendChild(colorInput);
              wrapper.appendChild(colorsGrid);
              wrapper.appendChild(inputWrapper);
              return wrapper;
            }
          };
        })();
        const editor = new EditorJS({
          holder: containerRef.current!,
          placeholder,
          readOnly,
          tools: {
            paragraph: { 
              class: Paragraph, 
              inlineToolbar: ['h1', 'h2', 'h3', 'bold', 'italic', 'underline', 'strike', 'inlineCode', 'link', 'color', 'marker'],
              tunes: ['alignment']
            },
            header: { 
              class: Header, 
              inlineToolbar: ['h1', 'h2', 'h3', 'bold', 'italic', 'underline', 'strike', 'inlineCode', 'link', 'color', 'marker'],
              config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 },
              tunes: ['alignment']
            },
            list: { class: List, inlineToolbar: true },
            table: { class: Table, inlineToolbar: true },
            video: VideoTool,
            embed: Embed,
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile(file: File) {
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        resolve({
                          success: 1,
                          file: {
                            url: e.target?.result as string,
                          },
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  },
                  uploadByUrl(url: string) {
                    return Promise.resolve({
                      success: 1,
                      file: {
                        url: url,
                      },
                    });
                  },
                },
              },
            },
            underline: Underline,
            inlineCode: InlineCode,
            strike: StrikeTool,
            h1: H1Tool,
            h2: H2Tool,
            h3: H3Tool,
            alignment: {
              class: Alignment,
              config: { default: 'right', blocks: { header: 'right', list: 'right' } }
            },
            // ✅ Custom color tools — no Illegal constructor errors
            color: { class: TextColorTool },
            marker: { class: MarkerTool },
            delimiter: CustomDelimiterTool,
          },
          tunes: ['alignment'],
          data: htmlToBlocks(value),
          onReady: () => { 
            editorRef.current = editor; 
            if (DragDrop) new DragDrop(editor);
            if (Undo) new Undo({ editor });

            // Shortcut: --- + Enter = Horizontal Line
            const holder = containerRef.current;
            holder?.addEventListener('keydown', (event: KeyboardEvent) => {
              if (event.key === 'Enter') {
                const index = editor.blocks.getCurrentBlockIndex();
                const block = editor.blocks.getBlockByIndex(index);
                if (block && block.name === 'paragraph') {
                  const text = block.holder.querySelector('.ce-paragraph')?.textContent || '';
                  if (/^---+$|^ـــ+$|^—+$/.test(text.trim())) {
                    event.preventDefault();
                    event.stopPropagation();
                    editor.blocks.delete(index);
                    editor.blocks.insert('delimiter', {}, {}, index, true);
                  }
                }
              }
            }, true);
          },
          onChange: () => {
            if (!editor) return;
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(async () => {
              try {
                if (!editor || !editor.save) return;
                const data = await editor.save();
                const parser = edjsHTML({
                  paragraph: (block: any) => {
                    const alignment = block.tunes?.alignment?.alignment || block.data?.alignment || 'right';
                    return `<p style="text-align: ${alignment};">${block.data.text}</p>`;
                  },
                  header: (block: any) => {
                    const alignment = block.tunes?.alignment?.alignment || block.data?.alignment || 'right';
                    const level = block.data.level || 2;
                    return `<h${level} style="text-align: ${alignment};">${block.data.text}</h${level}>`;
                  },
                  image: (block: any) =>
                    `<div style="text-align: center;"><img src="${block.data.file?.url || block.data.url || ''}" alt="${block.data.caption || ''}" style="max-width:100%;height:auto;border-radius:8px;" /></div>`,
                  video: (block: any) => {
                    if (block.data.type === 'youtube') {
                      return `<div style="margin: 1em 0; border-radius: 16px; overflow: hidden; aspect-ratio: 16/9;"><iframe src="${block.data.url}" style="width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>`;
                    }
                    return `<div style="margin: 1em 0; border-radius: 16px; overflow: hidden;"><video src="${block.data.url}" controls style="width: 100%; border-radius: 16px;"></video></div>`;
                  },
                  table: (block: any) => {
                    let rowsHTML = '';
                    const content = block.data.content || [];
                    const withHeadings = block.data.withHeadings || false;
                    content.forEach((row: string[], index: number) => {
                      const isHeader = withHeadings && index === 0;
                      const cellTag = isHeader ? 'th' : 'td';
                      const cells = row.map(cell => `<${cellTag} style="border: 1px solid var(--border-color, #ccc); padding: 8px;">${cell}</${cellTag}>`).join('');
                      rowsHTML += `<tr>${cells}</tr>`;
                    });
                    return `<table style="width: 100%; border-collapse: collapse; margin-bottom: 1em;"><tbody>${rowsHTML}</tbody></table>`;
                  },
                  delimiter: (block: any) => `<hr style="border: 0; border-top: 1px solid ${block.data.color || 'var(--border-color, #ccc)'}; margin: 2em 0;" />`,
                });
                const htmlParts = parser.parse(data);
                const html = Array.isArray(htmlParts) ? htmlParts.join('') : (typeof htmlParts === 'string' ? htmlParts : '');
                isInternalChange.current = true;
                lastSavedHtml.current = html;
                onChange(html);
                setTimeout(() => { isInternalChange.current = false; }, 300);
              } catch (error) {
                console.error('Error saving editor content:', error);
              }
            }, 200);
          },
        });
      } catch (e) {
        console.error('Failed to initialize EditorJS:', e);
      }
    };

    initEditor();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
        editorRef.current = null;
        initializationRef.current = false;
      }
    };
  }, [isClient]);

  // ─── Read-Only Mode Toggle ───────────────────────
  useEffect(() => {
    if (editorRef.current?.readOnly) editorRef.current.readOnly.toggle(readOnly);
  }, [readOnly]);

  // ─── External Value Sync ───────────────────────
  useEffect(() => {
    if (
      editorRef.current &&
      !isInternalChange.current &&
      value !== undefined &&
      value !== lastSavedHtml.current
    ) {
      lastSavedHtml.current = value;
      if (typeof editorRef.current.render === 'function') {
        editorRef.current.render(htmlToBlocks(value));
      }
    }
  }, [value]);

  // ==========================================
  // 4. Component Render
  // ==========================================
  if (!isClient) return <div className="min-h-[300px] bg-[var(--bg-secondary)] rounded-2xl animate-pulse" />;

  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]">
      <div
        ref={containerRef}
        className="prose prose-sm max-w-none p-6 min-h-[300px] editorjs-rtl w-4/5 mx-auto"
      />
      <style jsx global>{`
        .editorjs-rtl .ce-block__content,
        .editorjs-rtl .ce-toolbar__content { max-width: unset; direction: rtl; }
        .editorjs-rtl .ce-toolbar__actions { left: -40px; right: unset; }
        .editorjs-rtl .ce-popover { left: 0; right: unset; }
        .editorjs-rtl .ce-settings { left: 0; right: unset; }
        .editorjs-rtl .ce-paragraph { font-size: 1rem; line-height: 1.6; color: var(--text-primary); text-align: inherit; }
        .editorjs-rtl .ce-header { padding: 1em 0; color: var(--text-primary); text-align: inherit; }
        .editorjs-rtl .ce-toolbar__plus,
        .editorjs-rtl .ce-toolbar__settings-btn { background-color: var(--bg-secondary); color: var(--text-primary); }
        .ce-toolbar__plus, .ce-toolbar__settings-btn,
        .ce-popover__item-icon, .ce-settings__button { color: var(--text-primary) !important; }
        .ce-popover__item-label { text-align: right; padding-right: 10px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;