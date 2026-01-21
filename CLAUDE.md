# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Donde Vivir - A property listings web application with mortgage calculator functionality. Built with Node.js, Express.js, EJS templating, and file-based JSON storage.

## Development Commands

```bash
npm run dev    # Start dev server with nodemon (port 3000)
```

No test or lint commands are currently configured.

## Architecture

```
src/
├── index.js        # Express app, all routes defined here
├── data.js         # Data layer (JSON file I/O with callbacks)
├── utils.js        # ES module __dirname/__filename helpers
└── views/          # EJS templates
public/             # Static assets (CSS)
data/properties.json  # JSON database
upload/             # User-uploaded photos
```

**Pattern:** MVC-like separation with routes in `index.js`, data operations in `data.js`, and EJS views.

## Key Routes

- `GET /` - Property listings with optional price filter (?min=X&max=Y)
- `GET /new` & `POST /new` - Add new property
- `GET /:id/mortgage-calculator` & `POST /mortgage-calculator` - Mortgage calculation
- `GET /upload` & `POST /upload` - Photo upload (busboy for multipart)

## Technical Details

- **ES modules** throughout (import/export)
- **Callback-based async** for file operations (not promises)
- **File-based persistence** - properties stored in `/data/properties.json`
- **Busboy** handles multipart uploads, files named with UUID

## Property Schema

```javascript
{
  "id": "uuid",
  "title": "string",
  "address": "string",
  "status": "string",
  "price_soles": number,
  "bedrooms": "string",
  "area_range_m2": "string",
  "amenities": ["array"],
  "photo": "/upload/filename"  // optional
}
```

## Known Issues

- Test script is a placeholder
- CORS package imported but unused
- No input validation on property creation
- Error handling in `data.js` upload function has issues (line 81: `callback(null, err)` should be `callback(err)`)
- Typo in properties.ejs line 19: `type="subtmi"` should be `submit`
