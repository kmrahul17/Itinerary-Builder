# Itinerary Builder

A lightweight React + Tailwind CSS app to build multi-day tour itineraries and export them as a styled PDF (no backend required).

Demo: [Drive demo link](https://drive.google.com/file/d/1mXwpeuk0HmvXVF3joDfzUmoIykkswIzS/view?usp=sharing)

## Features
- Add / remove / clone / reorder days (morning / afternoon / evening slots)
- Hotel, flight and payment plan sections
- Activity presets and quick-add to target Morning/Afternoon/Evening
- PDF export using html2pdf.js (client-side)
- Autosave to browser localStorage and templates to start quickly
- Responsive preview and mobile-friendly payment layout

## Quick start
1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open the app in your browser (Vite will show the URL)

## How to use
- Use the "Start from Template" button to load sample itineraries.
- Add days with the "Add Day" button and edit morning/afternoon/evening activities.
- Fill hotel, flight and payment details in the left sidebar.
- Click "Get Itinerary" or "Download PDF" in the preview to generate a styled PDF.

## Notes
- The PDF generation runs entirely in the browser (html2pdf.js). For very long itineraries the page-break behavior may need fine-tuning.
- This is a frontend-only demo — no server required. Use the export/import JSON idea (planned) to share itineraries between devices.



If you'd like, I can:
- Add a downloadable zip of starter templates,
- Embed the actual Drive demo link for you,
- Improve the README with screenshots or a short GIF of the export flow.

Tell me which you'd like next and I will implement it.
