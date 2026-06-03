'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-quill with SSR disabled
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // Import css inside the dynamic loader to ensure browser-only compilation
    // @ts-ignore
    await import('react-quill/dist/quill.snow.css');
    return RQ;
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[240px] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-xs font-mono text-slate-400">
        Loading editor...
      </div>
    ),
  }
);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Flesh out your thoughts...',
  className = '',
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'link',
    'image',
  ];

  return (
    <div className={`quill-editor-container w-full bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col focus-within:border-[#8979FF] focus-within:shadow-[var(--glow-purple)] transition-all duration-200 ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="flex-1 flex flex-col"
      />

      <style jsx global>{`
        /* Custom styles to match the premium light layout */
        .quill-editor-container .ql-toolbar.ql-snow {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 100 !important;
          width: 90% !important;
          max-width: 600px !important;
          background: var(--bg-surface) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid var(--border-subtle) !important;
          border-radius: 24px !important;
          box-shadow: 0 10px 25px -5px rgba(137, 121, 255, 0.25) !important;
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 10px 20px !important;
        }
        
        .quill-editor-container .ql-toolbar.ql-snow button {
          color: var(--text-secondary) !important;
        }
        .quill-editor-container .ql-toolbar.ql-snow button:hover,
        .quill-editor-container .ql-toolbar.ql-snow button.ql-active {
          color: var(--text-primary) !important;
        }
        .quill-editor-container .ql-toolbar.ql-snow .ql-stroke {
          stroke: var(--text-secondary) !important;
        }
        .quill-editor-container .ql-toolbar.ql-snow .ql-fill {
          fill: var(--text-secondary) !important;
        }
        .quill-editor-container .ql-toolbar.ql-snow button:hover .ql-stroke,
        .quill-editor-container .ql-toolbar.ql-snow button.ql-active .ql-stroke {
          stroke: var(--text-primary) !important;
        }
        .quill-editor-container .ql-toolbar.ql-snow button:hover .ql-fill,
        .quill-editor-container .ql-toolbar.ql-snow button.ql-active .ql-fill {
          fill: var(--text-primary) !important;
        }
        .quill-editor-container .ql-toolbar.ql-snow .ql-picker {
          color: var(--text-secondary) !important;
        }

        .quill-editor-container .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 200px;
        }
        .quill-editor-container .ql-editor {
          flex: 1;
          min-height: 200px;
          padding: 16px !important;
          padding-bottom: 96px !important;
          color: var(--text-primary) !important;
        }
        .quill-editor-container .ql-editor.ql-blank::before {
          color: var(--text-tertiary) !important;
          font-style: normal !important;
          left: 16px !important;
          right: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
