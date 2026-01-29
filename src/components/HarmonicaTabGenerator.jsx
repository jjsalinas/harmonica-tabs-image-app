import React, { useState, useRef } from "react";

const DEMO_TABS = `
  4 6 -5 5 -4 4 3
  6 7 -6 6 -6' 6 5
  4 4 4 5 5' 5 5 5 -5 5 4
  `;

const HarmonicaTabGenerator = () => {
  const [input, setInput] = useState(DEMO_TABS);
  const [title, setTitle] = useState("My Harmonica Tab");
  const [maxLinesPerColumn, setMaxLinesPerColumn] = useState(10);
  const svgRef = useRef(null);

  // Parse input and add + signs to positive numbers
  const parseInput = (text) => {
    const lines = text.split("\n");
    return lines.map((line) => {
      // Check if line contains tab notation (numbers with optional minus signs, quotes for bends, and spaces)
      const isTabLine =
        /^[\s\d-'"]+$/.test(line.trim()) && line.trim().length > 0;

      let processedContent = line;

      // If it's a tab line, add + signs to positive numbers (but preserve bend notation)
      if (isTabLine) {
        processedContent = line.replace(
          /(\s|^)(\d+)(['"]?)/g,
          (match, space, number, bend) => {
            return space + "+" + number + bend;
          },
        );
      }

      return {
        content: processedContent,
        isTab: isTabLine,
      };
    });
  };

  // Calculate layout (columns based on max lines per column)
  const calculateLayout = (parsedLines) => {
    const tabLines = parsedLines.filter((l) => l.isTab);
    const numColumns = Math.ceil(tabLines.length / maxLinesPerColumn);

    const columns = [];
    let currentIndex = 0;

    for (let col = 0; col < numColumns; col++) {
      const columnLines = [];
      let tabCount = 0;

      while (
        currentIndex < parsedLines.length &&
        tabCount < maxLinesPerColumn
      ) {
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

  const parsedLines = parseInput(input);
  const columns = calculateLayout(parsedLines);

  // SVG dimensions and styling
  const lineHeight = 40;
  const fontSize = 28;
  const annotationFontSize = 12;
  const titleFontSize = 36;
  const titleHeight = 80;
  const columnWidth = 400;
  const padding = 40;
  const columnGap = 60;

  const maxLinesInAnyColumn = Math.max(
    ...columns.map((col) => {
      return col.reduce((sum, line) => {
        return sum + (line.isTab ? 1 : 0.5);
      }, 0);
    }),
    1,
  );

  const svgWidth =
    columns.length * columnWidth +
    (columns.length - 1) * columnGap +
    padding * 2;
  const svgHeight =
    maxLinesInAnyColumn * lineHeight + padding * 2 + titleHeight;

  // Export as PNG
  const exportAsPNG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size (2x for better quality)
    canvas.width = svgWidth * 2;
    canvas.height = svgHeight * 2;

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(2, 2);
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

  // Export as SVG
  const exportAsSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "harmonica-tabs.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="gradient-bg">
      <div className="container">
        <h1 className="title">🎵 Harmonica Tabs Image Generator</h1>
        <p className="subtitle">
          Create beautiful, readable images of your harmonica tabs
        </p>

        {/* Instructions Section - MOVED TO TOP */}
        <div className="card instructions-card">
          <h2 className="section-title">📋 How to Use</h2>
          <ul className="instructions">
            <li className="instruction-item">
              <span className="instruction-number">1</span>
              <div className="instruction-content">
                <strong>Enter your tabs</strong> - Type your harmonica tab
                numbers with spaces
              </div>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">2</span>
              <div className="instruction-content">
                <strong>Auto-formatting</strong> - Positive numbers get a + sign
                automatically. Use ' or " for bends (e.g., -3', 4")
              </div>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">3</span>
              <div className="instruction-content">
                <strong>Add annotations</strong> - Plain text appears smaller
                and italicized
              </div>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">4</span>
              <div className="instruction-content">
                <strong>Customize layout</strong> - Set your title and rows per
                column
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

        {/* Settings Section */}
        <div className="card settings-card">
          <h2 className="section-title">⚙️ Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label className="setting-label">
                Tab Title
                <span className="setting-hint">
                  Appears at the top of your image
                </span>
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
                  max="20"
                  value={maxLinesPerColumn}
                  onChange={(e) =>
                    setMaxLinesPerColumn(parseInt(e.target.value))
                  }
                  className="slider"
                />
                <span className="slider-value">{maxLinesPerColumn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
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
Use ' or &quot; for bends"
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
            💡 <strong>Pro tip:</strong> Mix tab lines with text for
            annotations. Tab lines contain only numbers, spaces, and bend
            markers (' or ").
          </p>
        </div>

        {/* Preview Section */}
        <div className="card preview-card">
          <h2 className="section-title">👁️ Preview</h2>
          <div className="preview-container">
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              xmlns="http://www.w3.org/2000/svg"
              style={{ background: "#fffef5", display: "block" }}
            >
              {/* Background with soft cream color */}
              <rect width={svgWidth} height={svgHeight} fill="#fffef5" />

              {/* Title - centered at top */}
              {title && (
                <text
                  x={svgWidth / 2}
                  y={padding + titleFontSize}
                  fontFamily="'Segoe UI', 'Arial Rounded MT Bold', Arial, sans-serif"
                  fontSize={titleFontSize}
                  fontWeight="700"
                  fill="#5c4a72"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  {title}
                </text>
              )}

              {/* Render columns */}
              {columns.map((column, colIndex) => {
                let yOffset = padding + titleHeight;
                const xOffset = padding + colIndex * (columnWidth + columnGap);

                return (
                  <g key={colIndex}>
                    {column.map((line, lineIndex) => {
                      const currentY = yOffset;

                      if (line.isTab) {
                        // Render tab line with monospace font - softer color
                        yOffset += lineHeight;
                        return (
                          <text
                            key={lineIndex}
                            x={xOffset}
                            y={currentY}
                            fontFamily="'Courier New', monospace"
                            fontSize={fontSize}
                            fontWeight="600"
                            fill="#3d5a6c"
                            letterSpacing="2"
                          >
                            {line.content}
                          </text>
                        );
                      } else if (line.content.trim()) {
                        // Render annotation with smaller font - soft gray
                        yOffset += lineHeight * 0.6;
                        return (
                          <text
                            key={lineIndex}
                            x={xOffset}
                            y={currentY}
                            fontFamily="Arial, sans-serif"
                            fontSize={annotationFontSize}
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
        </div>
      </div>
    </div>
  );
};

export default HarmonicaTabGenerator;
