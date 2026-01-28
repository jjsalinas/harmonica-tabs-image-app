# Harmonica Tabs Image Generator

A beautiful React application for generating clean, readable images of harmonica tabs.

## Features

- ✨ Auto-formatting: Positive numbers automatically get a + sign
- 📊 Smart layout: Automatically splits long tabs into columns (max 10 lines per column)
- 📝 Text annotations: Add notes that appear smaller alongside your tabs
- 🎨 High contrast: Professional typography for excellent readability
- 📥 Multiple formats: Export as PNG (high-res) or SVG (vector)
- 📱 Responsive: Works on all screen sizes with vertical layout

## Installation

1. Navigate to the project directory:
```bash
cd harmonica-tabs-image-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open in your browser at `http://localhost:5173`

## Usage

1. Enter your harmonica tabs in the input field
   - Use numbers for holes (e.g., 4, 6, 5)
   - Positive numbers automatically get a + sign
   - Use minus sign for draw notes (e.g., -5, -6)
   
2. Add text annotations if needed (they'll appear smaller and italicized)

3. Preview updates automatically

4. Download your tabs as PNG or SVG

## Example Input

```
 4 6 -5 5 -4 4 3
 6 7 -6 6 -6 6 5
 4 4 4 5 5 5 5 5 -5 5 4
```

## License

MIT
