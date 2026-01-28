import React, { useState, useRef } from "react";

const DEMO_TABS = ` 
  4 6 -5 5 -4 4 3
  6 7 -6 6 -6 6 5
  4 4 4 5 5 5 5 5 -5 5 4
  `;
const MAX_LINES_PER_COLUMN = 10;

const HarmonicaTabGenerator = () => {
  const [input, setInput] = useState(DEMO_TABS);
  const svgRef = useRef(null);

  // Parse input and add + signs to positive numbers
  const parseInput = (text) => {
    const lines = text.split("\n");
    return lines.map((line) => {
      // Check if line contains tab notation (numbers with optional minus signs and spaces)
      const isTabLine =
        /^[\s\d-]+$/.test(line.trim()) && line.trim().length > 0;

      let processedContent = line;

      // If it's a tab line, add + signs to positive numbers
      if (isTabLine) {
        processedContent = line.replace(
          /(\s|^)(\d+)/g,
          (match, space, number) => {
            return space + "+" + number;
          },
        );
      }

      return {
        content: processedContent,
        isTab: isTabLine,
      };
    });
  };

  // Calculate layout (columns based on max 10 lines per column)
  const calculateLayout = (parsedLines) => {
    const tabLines = parsedLines.filter((l) => l.isTab);
    const numColumns = Math.ceil(tabLines.length / MAX_LINES_PER_COLUMN);

    const columns = [];
    let currentIndex = 0;

    for (let col = 0; col < numColumns; col++) {
      const columnLines = [];
      let tabCount = 0;

      while (
        currentIndex < parsedLines.length &&
        tabCount < MAX_LINES_PER_COLUMN
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
  const svgHeight = maxLinesInAnyColumn * lineHeight + padding * 2;

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
        <h1 className="title">Harmonica Tabs Image Generator</h1>
        <p className="subtitle">
          Create beautiful, readable images of your harmonica tabs
        </p>

        {/* Input Section */}
        <div className="card">
          <h2 className="section-title">Input Your Tabs</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea"
            placeholder="Enter your harmonica tabs here...

                  Example:
                  4 6 -5 5 -4 4 3
                  6 7 -6 6 -6 6 5"
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
            💡 Tip: Positive numbers will automatically get a + sign. Add text
            for annotations - they'll appear smaller.
          </p>
        </div>

        {/* Preview Section */}
        <div className="card">
          <h2 className="section-title">Preview</h2>
          <div className="preview-container">
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              xmlns="http://www.w3.org/2000/svg"
              style={{ background: "#ffffff", display: "block" }}
            >
              {/* Background */}
              <rect width={svgWidth} height={svgHeight} fill="#ffffff" />

              {/* Render columns */}
              {columns.map((column, colIndex) => {
                let yOffset = padding;
                const xOffset = padding + colIndex * (columnWidth + columnGap);

                return (
                  <g key={colIndex}>
                    {column.map((line, lineIndex) => {
                      const currentY = yOffset;

                      if (line.isTab) {
                        // Render tab line with monospace font
                        yOffset += lineHeight;
                        return (
                          <text
                            key={lineIndex}
                            x={xOffset}
                            y={currentY}
                            fontFamily="'Courier New', monospace"
                            fontSize={fontSize}
                            fontWeight="600"
                            fill="#1f2937"
                            letterSpacing="2"
                          >
                            {line.content}
                          </text>
                        );
                      } else if (line.content.trim()) {
                        // Render annotation with smaller font
                        yOffset += lineHeight * 0.6;
                        return (
                          <text
                            key={lineIndex}
                            x={xOffset}
                            y={currentY}
                            fontFamily="Arial, sans-serif"
                            fontSize={annotationFontSize}
                            fontStyle="italic"
                            fill="#6b7280"
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

        {/* Instructions */}
        <div className="card">
          <h2 className="section-title">How to Use</h2>
          <ul className="instructions">
            <li className="instruction-item">
              <span className="instruction-number">1.</span>
              <span>
                Enter your harmonica tabs in the input field (numbers with
                spaces)
              </span>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">2.</span>
              <span>
                Positive numbers automatically get a + sign, negative numbers
                keep the - sign
              </span>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">3.</span>
              <span>
                Add text annotations if needed - they'll appear smaller and
                italicized
              </span>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">4.</span>
              <span>
                Preview updates automatically - tabs are split into columns (max
                10 lines per column)
              </span>
            </li>
            <li className="instruction-item">
              <span className="instruction-number">5.</span>
              <span>Download as PNG for sharing or SVG for editing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HarmonicaTabGenerator;
