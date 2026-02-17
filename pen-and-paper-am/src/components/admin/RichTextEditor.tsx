import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder = 'Start typing...',
  disabled = false,
  height = '300px'
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div 
        className="rich-text-editor-wrapper" 
        style={{ 
          '--editor-min-height': height 
        } as React.CSSProperties}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
        />
      </div>
      <style>{`
        .rich-text-editor-wrapper {
          position: relative;
          isolation: isolate;
        }
        .rich-text-editor-wrapper .quill {
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
          overflow: hidden;
        }
        .rich-text-editor-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: hsl(var(--muted));
          position: relative;
          z-index: 1;
        }
        .rich-text-editor-wrapper .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          font-size: 14px;
          min-height: var(--editor-min-height);
          background: hsl(var(--background));
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: var(--editor-min-height);
          padding-bottom: 1rem;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
};

