# A Donde Vivir

A modern real estate platform for finding properties in Lima, Peru. Built with React, Express, and SQLite.

## Features

### 1. Property Browsing
- **Grid View**: Browse properties in a responsive card grid layout
- **Map View**: Interactive Leaflet map showing property locations with price markers
- **Property Details**: Full property page with images, amenities, and specifications

### 2. Advanced Search & Filters
- Search by title or address
- Filter by district (Miraflores, San Isidro, Surco, etc.)
- Filter by number of bedrooms
- Filter by price range
- Filter by area (m²)
- Clear all filters with one click

### 3. User Authentication
- **Register**: Create a new account with name, email, and password
- **Login**: Secure JWT-based authentication
- **Protected Routes**: Favorites and profile pages require login
- **Persistent Sessions**: Stay logged in across browser sessions

### 4. Favorites System
- Save properties to your favorites list
- Quick toggle favorite from property cards
- Dedicated favorites page to view all saved properties
- Favorites sync across devices when logged in

### 5. Direct Contact
- Inquiry form on each property page
- Pre-filled user information when logged in
- Send messages directly to property owners
- Confirmation feedback after sending

### 6. Personalized Recommendations
- Based on your search history
- Shown on your profile page
- Adapts to your browsing preferences

### 7. User Profile
- View your account information
- See recent favorites
- Get personalized recommendations
- Logout functionality

---

## Tech Stack

### Frontend (`/client`)
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling (Airbnb-inspired design)
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Leaflet** - Interactive maps
- **Lucide React** - Icons

### Backend (`/server`)
- **Express.js** - API server
- **SQLite** (better-sqlite3) - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Zod** - Schema validation

### Testing
- **Vitest** - Unit tests (frontend)
- **React Testing Library** - Component tests
- **Supertest** - API integration tests
- **Playwright** - E2E tests

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd prestamo-hipotecario

# Install server dependencies
cd server
npm install

# Seed the database (100 properties)
npm run seed

# Install client dependencies
cd ../client
npm install
```

### Running the Application

**Terminal 1 - Start the API server:**
```bash
cd server
npm run dev
# Server runs at http://localhost:3001
```

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
# Client runs at http://localhost:5173
```

### Running Tests

```bash
# Server tests
cd server
npm test

# Client unit tests
cd client
npm test

# E2E tests (requires both servers running)
cd client
npm run test:e2e
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List properties (with filters) |
| GET | `/api/properties/:id` | Get single property |

**Query Parameters for `/api/properties`:**
- `search` - Search in title/address
- `district` - Filter by district
- `bedrooms` - Filter by bedrooms (1, 2, 3, 4+)
- `priceRange` - Price range (e.g., "200000-400000")
- `minArea` / `maxArea` - Area filter
- `page` / `limit` - Pagination

### Favorites (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | Get user's favorites |
| POST | `/api/favorites` | Add to favorites |
| DELETE | `/api/favorites/:propertyId` | Remove from favorites |

### Inquiries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inquiries` | Send property inquiry |

### Recommendations (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized recommendations |

---

## Project Structure

```
/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Button, Input, Card, Modal, Badge
│   │   │   ├── layout/        # Header, Footer
│   │   │   └── property/      # PropertyCard, PropertyFilters, PropertyMap
│   │   ├── pages/             # Route pages
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # API client
│   │   ├── context/           # Auth context
│   │   └── __tests__/         # Component tests
│   └── e2e/                   # Playwright E2E tests
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── db/                # Database setup & seed
│   │   └── __tests__/         # API tests
│   └── data/                  # SQLite database file
│
└── data/                      # Original JSON data (legacy)
```

---

## Design System

The UI follows an Airbnb-inspired minimalist design:

### Colors
- **Primary**: `#FF385C` (Airbnb red for CTAs)
- **Secondary**: `#222222` (Dark text)
- **Muted**: `#717171` (Secondary text)
- **Border**: `#DDDDDD` (Borders)
- **Surface**: `#F7F7F7` (Card backgrounds)

### Components
- Rounded corners (8-12px radius)
- Subtle shadows on hover
- Clean white cards with thin borders
- Full-width images with aspect ratio preservation
- Pill-shaped tags/badges

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT,
  status TEXT,
  price_soles INTEGER NOT NULL,
  price_usd INTEGER,
  bedrooms TEXT,
  area_range_m2 TEXT,
  amenities TEXT,  -- JSON array
  photo TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id)
);

-- Inquiries table
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search history (for recommendations)
CREATE TABLE search_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filters TEXT NOT NULL,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## License

MIT
