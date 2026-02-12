import React, { useState, useRef } from "react";
import "../styles.css";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEMO_TABS = `
  4 6 -5 5 -4 4 3
  6 7 -6 6 -6' 6 5
  4 4 4 5 5' 5 5 5 -5 5 4
`;

const SVG_CONFIG = {
  lineHeight: 40,
  fontSize: 28,
  annotationFontSize: 12,
  titleFontSize: 36,
  titleHeight: 80,
  padding: 40,
  columnGap: 80,
  charWidth: 17.3, // For tab lines (monospace)
  textCharWidth: 7, // For annotation lines
  minColumnWidth: 200,
  canvasScale: 2, // For PNG export quality
  backgroundColor: "#fffef5",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse input text and identify tab lines vs annotation lines
 * Adds + signs to positive numbers in tab lines
 * Preserves empty lines for spacing
 */
const parseInput = (text) => {
  const lines = text.split("\n");

  return lines.map((line) => {
    // Check if line is empty
    const isEmpty = line.trim().length === 0;

    // Tab lines contain only numbers, spaces, minus signs, and bend markers
    const isTabLine =
      /^[\s\d\-'"`'']+$/.test(line.trim()) && line.trim().length > 0;

    let processedContent = line;

    // Add + signs to positive numbers in tab lines
    if (isTabLine) {
      processedContent = line.replace(
        /(\s|^)(\d+)(['"`'']?)/g,
        (match, space, number, bend) => space + "+" + number + bend,
      );
    }

    return {
      content: processedContent,
      isTab: isTabLine,
      isEmpty: isEmpty,
    };
  });
};

/**
 * Calculate column layout based on max lines per column
 * Preserves empty lines for spacing
 */
const calculateLayout = (parsedLines, maxLinesPerColumn) => {
  const tabLines = parsedLines.filter((l) => l.isTab);
  const numColumns = Math.ceil(tabLines.length / maxLinesPerColumn);

  const columns = [];
  let currentIndex = 0;

  for (let col = 0; col < numColumns; col++) {
    const columnLines = [];
    let tabCount = 0;

    while (currentIndex < parsedLines.length && tabCount < maxLinesPerColumn) {
      const line = parsedLines[currentIndex];
      columnLines.push(line);

      if (line.isTab) {
        tabCount++;
      }
      currentIndex++;
    }

    columns.push(columnLines);
  }

  return columns;
};

/**
 * Calculate the width needed for a column based on its content
 */
const calculateColumnWidth = (column) => {
  let maxLength = 0;

  column.forEach((line) => {
    if (line.content.trim()) {
      const charWidth = line.isTab
        ? SVG_CONFIG.charWidth
        : SVG_CONFIG.textCharWidth;
      const length = line.content.length * charWidth;
      maxLength = Math.max(maxLength, length);
    }
  });

  return Math.max(maxLength, SVG_CONFIG.minColumnWidth);
};

/**
 * Calculate SVG dimensions based on content
 */
const calculateSVGDimensions = (columns, columnWidths) => {
  const totalContentWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  const maxLinesInAnyColumn = Math.max(
    ...columns.map((col) => {
      return col.reduce((sum, line) => {
        if (line.isEmpty) return sum + 0.5; // Empty lines take less space
        return sum + (line.isTab ? 1 : 0.5);
      }, 0);
    }),
    1,
  );

  const svgWidth =
    totalContentWidth +
    (columns.length - 1) * SVG_CONFIG.columnGap +
    SVG_CONFIG.padding * 2;

  const svgHeight =
    maxLinesInAnyColumn * SVG_CONFIG.lineHeight +
    SVG_CONFIG.padding * 2 +
    SVG_CONFIG.titleHeight;

  return { svgWidth, svgHeight };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HarmonicaTabGenerator = () => {
  // State
  const [input, setInput] = useState(DEMO_TABS);
  const [title, setTitle] = useState("My Harmonica Tab");
  const [maxLinesPerColumn, setMaxLinesPerColumn] = useState(10);

  // Ref for SVG element
  const svgRef = useRef(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const parsedLines = parseInput(input);
  const columns = calculateLayout(parsedLines, maxLinesPerColumn);
  const columnWidths = columns.map(calculateColumnWidth);
  const { svgWidth, svgHeight } = calculateSVGDimensions(columns, columnWidths);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Export the SVG as a PNG image
   */
  const exportAsPNG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size with 2x scaling for better quality
    canvas.width = svgWidth * SVG_CONFIG.canvasScale;
    canvas.height = svgHeight * SVG_CONFIG.canvasScale;

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(SVG_CONFIG.canvasScale, SVG_CONFIG.canvasScale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.download = "harmonica-tabs.png";
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };

    img.src = url;
  };

  /**
   * Export the SVG as an SVG file
   */
  const exportAsSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "harmonica-tabs.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="gradient-bg">
      <div className="container">
        {/* Header */}
        <h1 className="title">🎵 Harmonica Tabs Image Generator</h1>
        <p className="subtitle">
          Create beautiful, readable images of your harmonica tabs
        </p>

        {/* Instructions */}
        <InstructionsSection />

        {/* Settings */}
        <SettingsSection
          title={title}
          setTitle={setTitle}
          maxLinesPerColumn={maxLinesPerColumn}
          setMaxLinesPerColumn={setMaxLinesPerColumn}
        />

        {/* Input */}
        <InputSection
          input={input}
          setInput={setInput}
          exportAsPNG={exportAsPNG}
          exportAsSVG={exportAsSVG}
        />

        {/* Preview */}
        <PreviewSection
          svgRef={svgRef}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          title={title}
          columns={columns}
          columnWidths={columnWidths}
          exportAsPNG={exportAsPNG}
          exportAsSVG={exportAsSVG}
        />
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const InstructionsSection = () => (
  <div className="card instructions-card">
    <h2 className="section-title">📋 How to Use</h2>
    <ul className="instructions">
      <li className="instruction-item">
        <span className="instruction-number">1</span>
        <div className="instruction-content">
          <strong>Enter your tabs</strong> - Type your harmonica tab numbers
          with spaces
        </div>
      </li>
      <li className="instruction-item">
        <span className="instruction-number">2</span>
        <div className="instruction-content">
          <strong>Auto-formatting</strong> - Positive numbers get a + sign
          automatically. Bends: ' " ` ' (e.g., -3', 4")
        </div>
      </li>
      <li className="instruction-item">
        <span className="instruction-number">3</span>
        <div className="instruction-content">
          <strong>Add annotations</strong> - Plain text appears smaller and
          italicized
        </div>
      </li>
      <li className="instruction-item">
        <span className="instruction-number">4</span>
        <div className="instruction-content">
          <strong>Customize layout</strong> - Set your title and rows per column
        </div>
      </li>
      <li className="instruction-item">
        <span className="instruction-number">5</span>
        <div className="instruction-content">
          <strong>Download</strong> - Save as PNG or SVG when ready
        </div>
      </li>
    </ul>
  </div>
);

const SettingsSection = ({
  title,
  setTitle,
  maxLinesPerColumn,
  setMaxLinesPerColumn,
}) => (
  <div className="card settings-card">
    <h2 className="section-title">⚙️ Settings</h2>
    <div className="settings-grid">
      <div className="setting-item">
        <label className="setting-label">
          Tab Title
          <span className="setting-hint">Appears at the top of your image</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="Enter a title for your tabs..."
        />
      </div>
      <div className="setting-item">
        <label className="setting-label">
          Rows Per Column
          <span className="setting-hint">
            How many lines before splitting into columns
          </span>
        </label>
        <div className="slider-container">
          <input
            type="range"
            min="5"
            max="35"
            value={maxLinesPerColumn}
            onChange={(e) => setMaxLinesPerColumn(parseInt(e.target.value))}
            className="slider"
          />
          <span className="slider-value">{maxLinesPerColumn}</span>
        </div>
      </div>
    </div>
  </div>
);

const InputSection = ({ input, setInput, exportAsPNG, exportAsSVG }) => (
  <div className="card">
    <h2 className="section-title">✏️ Input Your Tabs</h2>
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="textarea"
      placeholder="Enter your harmonica tabs here...

Example:
4 6 -5 5 -4 4 3
-3' 6 7 -6' 6 5

Add quotes after numbers for bends"
      rows={12}
    />
    <div className="button-group">
      <button onClick={exportAsPNG} className="button button-primary">
        📥 Download PNG
      </button>
      <button onClick={exportAsSVG} className="button button-secondary">
        📥 Download SVG
      </button>
    </div>
    <p className="tip">
      💡 <strong>Pro tip:</strong> Mix tab lines with text for annotations. Tab
      lines contain only numbers, spaces, and bend markers (' " ` ').
    </p>
  </div>
);

const PreviewSection = ({
  svgRef,
  svgWidth,
  svgHeight,
  title,
  columns,
  columnWidths,
  exportAsPNG,
  exportAsSVG,
}) => (
  <div className="card preview-card">
    <h2 className="section-title">👁️ Preview</h2>
    <div className="preview-container">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: SVG_CONFIG.backgroundColor, display: "block" }}
      >
        {/* Background */}
        <rect
          width={svgWidth}
          height={svgHeight}
          fill={SVG_CONFIG.backgroundColor}
        />

        {/* Title */}
        {title && (
          <text
            x={svgWidth / 2}
            y={SVG_CONFIG.padding + SVG_CONFIG.titleFontSize}
            fontFamily="'Segoe UI', 'Arial Rounded MT Bold', Arial, sans-serif"
            fontSize={SVG_CONFIG.titleFontSize}
            fontWeight="700"
            fill="#5c4a72"
            textAnchor="middle"
            letterSpacing="1"
          >
            {title}
          </text>
        )}

        {/* Columns */}
        {columns.map((column, colIndex) => {
          let yOffset = SVG_CONFIG.padding + SVG_CONFIG.titleHeight;

          // Calculate x position based on previous columns
          let xOffset = SVG_CONFIG.padding;
          for (let i = 0; i < colIndex; i++) {
            xOffset += columnWidths[i] + SVG_CONFIG.columnGap;
          }

          return (
            <g key={colIndex}>
              {column.map((line, lineIndex) => {
                const currentY = yOffset;

                if (line.isEmpty) {
                  // Empty line - just add spacing
                  yOffset += SVG_CONFIG.lineHeight * 0.5;
                  return null;
                } else if (line.isTab) {
                  // Tab line - monospace, larger font
                  yOffset += SVG_CONFIG.lineHeight;
                  return (
                    <text
                      key={lineIndex}
                      x={xOffset}
                      y={currentY}
                      fontFamily="'Courier New', monospace"
                      fontSize={SVG_CONFIG.fontSize}
                      fontWeight="600"
                      fill="#3d5a6c"
                      letterSpacing="0.5"
                    >
                      {line.content}
                    </text>
                  );
                } else if (line.content.trim()) {
                  // Annotation line - smaller, italic
                  yOffset += SVG_CONFIG.lineHeight * 0.6;
                  return (
                    <text
                      key={lineIndex}
                      x={xOffset}
                      y={currentY}
                      fontFamily="Arial, sans-serif"
                      fontSize={SVG_CONFIG.annotationFontSize}
                      fontStyle="italic"
                      fill="#8b7e99"
                    >
                      {line.content}
                    </text>
                  );
                }
                return null;
              })}
            </g>
          );
        })}
      </svg>
    </div>
    <div className="button-group">
      <button onClick={exportAsPNG} className="button button-primary">
        📥 Download PNG
      </button>
      <button onClick={exportAsSVG} className="button button-secondary">
        📥 Download SVG
      </button>
    </div>
  </div>
);

export default HarmonicaTabGenerator;
