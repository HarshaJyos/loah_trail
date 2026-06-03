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
    <div className={`quill-editor-container w-full bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col focus-within:border-[#8979FF] focus-within:shadow-[var(--glow-purple)] transition-all duration-200 ${className}`}>
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
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          padding: 8px 12px !important;
        }
        .quill-editor-container .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          flex: 1;
          display: flex;
          flex-col: column;
          min-h: 200px;
        }
        .quill-editor-container .ql-editor {
          flex: 1;
          min-h: 200px;
          padding: 16px !important;
          color: #1e1e1e !important;
        }
        .quill-editor-container .ql-editor.ql-blank::before {
          color: #9ca3af !important;
          font-style: normal !important;
          left: 16px !important;
          right: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
