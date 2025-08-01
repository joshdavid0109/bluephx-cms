import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import Quill from 'quill';

const MobileAppPreview = ({ documentTitle, documentContentHtml, onMobileEditorChange }) => {
  const quillRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  // Update selection and toolbar position
  useEffect(() => {
  const quill = quillRef.current?.getEditor?.();
  if (!quill) return;

  const handleSelectionChange = (range) => {
        if (range && range.length > 0) {
        const bounds = quill.getBounds(range.index, range.length);
        const containerRect = quill.container.getBoundingClientRect();

        setToolbarPosition({
            top: bounds.top + containerRect.top - 50,
            left: bounds.left + containerRect.left + bounds.width / 2,
        });

        setShowToolbar(true);
        setSelection(range);
        } else {
        setShowToolbar(false);
        }
    };

    quill.on('selection-change', handleSelectionChange);
    return () => quill.off('selection-change', handleSelectionChange);
    }, []);

  const applyFormat = (format, value = true) => {
  console.log('Applying format:', format);
  const quill = quillRef.current.getEditor();
  quill.focus();
  quill.format(format, value);
};

  return (
    <div style={styles.phoneFrame}>
      {/* Top Bar */}
      <div style={styles.appBar}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>←</span>
        </div>

        <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          lineHeight: '1.2',
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {documentTitle || 'Document Title'}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Remedial Law
          </div>
        </div>

        <div style={{ position: 'absolute', right: '16px', top: '12px' }}>
          <span style={{ fontSize: '18px' }}>☰</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={styles.contentArea}>
        <ReactQuill
          ref={quillRef}
          value={documentContentHtml}
          onChange={onMobileEditorChange}
          theme="bubble"
          placeholder="Start typing..."
          style={{ height: '100%', fontSize: '14px' }}
        />
      </div>

      {/* Floating Toolbar */}
      {showToolbar && (
        <div
            style={{
                ...styles.floatingToolbar,
                top: `${toolbarPosition.top}px`,
                left: `${toolbarPosition.left}px`,
                transform: 'translate(-50%, -100%)', // centers horizontally, places it above
            }}
            className="floating-toolbar"
            >
            <button onClick={() => applyFormat('bold')}><b>B</b></button>
            <button onClick={() => applyFormat('italic')}><i>I</i></button>
            <button onClick={() => applyFormat('underline')}><u>U</u></button>
            <button onClick={() => applyFormat('list', 'bullet')}>•</button>
            <button onClick={() => applyFormat('list', 'ordered')}>1.</button>
            </div>
        )}
    </div>
  );
};

// Styles
const styles = {
  phoneFrame: {
    width: '390px',
    height: '844px',
    borderRadius: '40px',
    border: '14px solid #333',
    backgroundColor: '#000',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: 'Roboto, sans-serif',
  },
  appBar: {
    position: 'relative',
    backgroundColor: '#ffffff',
    padding: '12px 16px 8px 16px',
    borderTopLeftRadius: '32px',
    borderTopRightRadius: '32px',
    borderBottom: '1px solid #ddd',
    fontFamily: 'Roboto, sans-serif',
    color: '#0a2540',
  },
  contentArea: {
    backgroundColor: '#fff',
    padding: '16px',
    overflowY: 'auto',
    height: 'calc(100% - 60px)',
  },
  floatingToolbar: {
    position: 'absolute',
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'flex',
    gap: '4px',
    padding: '6px 8px',
    transition: 'opacity 0.2s ease',
    opacity: 1,
  },
};

export default MobileAppPreview;
