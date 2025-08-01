import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import Quill from 'quill';

// Import Poppins font from Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Add custom CSS to override ReactQuill defaults
const customCSS = `
  .ql-editor {
    font-family: 'Poppins', sans-serif !important;
    font-size: 16px !important;
    font-weight: 300 !important;
    line-height: 1.5 !important;
    color: #2c3e50 !important;
    padding: 16px !important;
  }
  
  .ql-editor p {
    font-family: 'Poppins', sans-serif !important;
    font-size: 16px !important;
    font-weight: 300 !important;
    line-height: 1.5 !important;
    margin-bottom: 8px !important;
  }
  
  .ql-editor .ql-blank::before {
    font-family: 'Poppins', sans-serif !important;
    font-size: 16px !important;
    font-weight: 300 !important;
    color: #999 !important;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = customCSS;
document.head.appendChild(styleSheet);

const MobileAppPreview = ({ documentTitle, documentContentHtml, onMobileEditorChange }) => {
  const quillRef = useRef(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [currentFont, setCurrentFont] = useState('Poppins');
  const [currentSize, setCurrentSize] = useState('16');

  const fonts = ['Poppins', 'Arial', 'Times New Roman', 'Roboto', 'Open Sans', 'Helvetica', 'Georgia', 'Verdana'];
  const sizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36'];
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'
  ];

  const applyFormat = (format, value = true) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.focus();
      if (format === 'font') {
        quill.format('font', value);
        setCurrentFont(value);
      } else if (format === 'size') {
        quill.format('size', value + 'px');
        setCurrentSize(value);
      } else {
        quill.format(format, value);
      }
    }
  };

  const applyAlignment = (alignment) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.focus();
      quill.format('align', alignment);
    }
  };

  const applyHeader = (level) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.focus();
      quill.format('header', level);
    }
  };

  // Apply default formatting when component mounts
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      // Set default font and size for new content
      quill.format('font', 'Poppins');
      quill.format('size', '16px');
      
      // Apply to existing content if any
      const length = quill.getLength();
      if (length > 0) {
        quill.formatText(0, length, 'font', 'Poppins');
        quill.formatText(0, length, 'size', '16px');
      }
    }
  }, [documentContentHtml]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFontDropdown(false);
      setShowSizeDropdown(false);
      setShowColorDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div style={styles.container}>
      {/* Google Docs Style Toolbar */}
      <div style={styles.toolbar}>
        {/* First Row */}
        <div style={styles.toolbarRow}>
          {/* Undo/Redo */}
          <div style={styles.toolbarGroup}>
            <button style={styles.iconButton} title="Undo">
              ↶
            </button>
            <button style={styles.iconButton} title="Redo">
              ↷
            </button>
          </div>

          <div style={styles.separator}></div>

          {/* Print */}
          <button style={styles.iconButton} title="Print">
            🖨
          </button>

          <div style={styles.separator}></div>

          {/* Zoom */}
          <div style={styles.zoomControl}>
            <button style={styles.zoomButton}>100%</button>
          </div>

          <div style={styles.separator}></div>

          {/* Format Painter */}
          <button style={styles.iconButton} title="Paint format">
            🖌
          </button>
        </div>

        {/* Second Row */}
        <div style={styles.toolbarRow}>
          {/* Font Family Dropdown */}
          <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.dropdownButton} 
              onClick={() => setShowFontDropdown(!showFontDropdown)}
            >
              {currentFont} ▼
            </button>
            {showFontDropdown && (
              <div style={styles.dropdownMenu}>
                {fonts.map(font => (
                  <div 
                    key={font}
                    style={{...styles.dropdownItem, fontFamily: font}}
                    onClick={() => {
                      applyFormat('font', font);
                      setShowFontDropdown(false);
                    }}
                  >
                    {font}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Dropdown */}
          <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.sizeButton} 
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            >
              {currentSize} ▼
            </button>
            {showSizeDropdown && (
              <div style={styles.dropdownMenu}>
                {sizes.map(size => (
                  <div 
                    key={size}
                    style={styles.dropdownItem}
                    onClick={() => {
                      applyFormat('size', size);
                      setShowSizeDropdown(false);
                    }}
                  >
                    {size}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.separator}></div>

          {/* Bold, Italic, Underline */}
          <div style={styles.toolbarGroup}>
            <button style={styles.formatButton} onClick={() => applyFormat('bold')} title="Bold (Ctrl+B)">
              <strong>B</strong>
            </button>
            <button style={styles.formatButton} onClick={() => applyFormat('italic')} title="Italic (Ctrl+I)">
              <em>I</em>
            </button>
            <button style={styles.formatButton} onClick={() => applyFormat('underline')} title="Underline (Ctrl+U)">
              <u>U</u>
            </button>
          </div>

          <div style={styles.separator}></div>

          {/* Text Color */}
          <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.colorButton} 
              onClick={() => setShowColorDropdown(!showColorDropdown)}
              title="Text color"
            >
              A <span style={styles.colorUnderline}></span> ▼
            </button>
            {showColorDropdown && (
              <div style={styles.colorDropdown}>
                <div style={styles.colorGrid}>
                  {colors.map(color => (
                    <div 
                      key={color}
                      style={{...styles.colorSwatch, backgroundColor: color}}
                      onClick={() => {
                        applyFormat('color', color);
                        setShowColorDropdown(false);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={styles.separator}></div>

          {/* Alignment */}
          <div style={styles.toolbarGroup}>
            <button style={styles.iconButton} onClick={() => applyAlignment('')} title="Align left">
              ≡
            </button>
            <button style={styles.iconButton} onClick={() => applyAlignment('center')} title="Align center">
              ≣
            </button>
            <button style={styles.iconButton} onClick={() => applyAlignment('right')} title="Align right">
              ≢
            </button>
            <button style={styles.iconButton} onClick={() => applyAlignment('justify')} title="Justify">
              ≡
            </button>
          </div>

          <div style={styles.separator}></div>

          {/* Lists */}
          <div style={styles.toolbarGroup}>
            <button style={styles.iconButton} onClick={() => applyFormat('list', 'bullet')} title="Bulleted list">
              ⦁
            </button>
            <button style={styles.iconButton} onClick={() => applyFormat('list', 'ordered')} title="Numbered list">
              ①
            </button>
          </div>

          <div style={styles.separator}></div>

          {/* Indent */}
          <div style={styles.toolbarGroup}>
            <button style={styles.iconButton} title="Decrease indent">
              ⬅
            </button>
            <button style={styles.iconButton} title="Increase indent">
              ➡
            </button>
          </div>

          <div style={styles.separator}></div>

          {/* More Options */}
          <button style={styles.iconButton} title="More">
            ⋮
          </button>
        </div>
      </div>

      {/* Mobile Preview */}
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
            style={styles.quillEditor}
          />
        </div>
      </div>
    </div>
  );
};

// Styles matching Google Docs
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  toolbar: {
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '8px 12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '900px',
    minWidth: '800px',
  },
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4px',
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  separator: {
    width: '1px',
    height: '20px',
    backgroundColor: '#dadce0',
    margin: '0 4px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#444746',
    minWidth: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.1s',
  },
  formatButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#444746',
    minWidth: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.1s',
    fontFamily: 'Arial, sans-serif',
  },
  dropdown: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#444746',
    minWidth: '120px',
    height: '28px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background-color 0.1s',
  },
  sizeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#444746',
    minWidth: '50px',
    height: '28px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background-color 0.1s',
  },
  colorButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#444746',
    minWidth: '35px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background-color 0.1s',
    position: 'relative',
  },
  colorUnderline: {
    position: 'absolute',
    bottom: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '12px',
    height: '3px',
    backgroundColor: '#000',
  },
  zoomControl: {
    display: 'flex',
    alignItems: 'center',
  },
  zoomButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#444746',
    height: '28px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#fff',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minWidth: '120px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  dropdownItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#444746',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  colorDropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#fff',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    padding: '8px',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '2px',
    width: '200px',
  },
  quillEditor: {
    height: '100%',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
    fontWeight: '300', // Light font weight
    lineHeight: '1.5', // Equivalent to 4dp line spacing extra
    color: '#2c3e50', // Approximating bp_bg color
  },
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
  colorSwatch: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    border: '1px solid #dadce0',
    borderRadius: '2px',
  },
  contentArea: {
    backgroundColor: '#fff',
    padding: '16px',
    overflowY: 'auto',
    height: 'calc(100% - 60px)',
    fontFamily: 'Poppins, sans-serif',
  },
};

export default MobileAppPreview;