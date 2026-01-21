import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '../../data/database.sqlite')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    district TEXT,
    status TEXT,
    price_soles INTEGER NOT NULL,
    price_usd INTEGER,
    units TEXT,
    bedrooms TEXT,
    bathrooms INTEGER,
    parking_spaces INTEGER,
    area_m2 INTEGER,
    area_range_m2 TEXT,
    amenities TEXT,
    photo TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    property_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(user_id, property_id)
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    filters TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
  CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_soles);
  CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
  CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
`)

// Clear existing data
db.exec('DELETE FROM search_history')
db.exec('DELETE FROM inquiries')
db.exec('DELETE FROM favorites')
db.exec('DELETE FROM properties')

// Read existing properties from JSON file
const existingPropertiesPath = join(__dirname, '../../../data/properties.json')
let existingListings = []

if (existsSync(existingPropertiesPath)) {
  try {
    const data = JSON.parse(readFileSync(existingPropertiesPath, 'utf-8'))
    existingListings = data.listings || []
    console.log(`Found ${existingListings.length} existing properties to migrate`)
  } catch (err) {
    console.log('Could not read existing properties:', err.message)
  }
}

// District data for Lima with approximate coordinates
const districts = [
  { name: 'Miraflores', lat: -12.1191, lng: -77.0289 },
  { name: 'San Isidro', lat: -12.0977, lng: -77.0365 },
  { name: 'Santiago de Surco', lat: -12.1333, lng: -76.9833 },
  { name: 'Barranco', lat: -12.1447, lng: -77.0214 },
  { name: 'San Borja', lat: -12.1067, lng: -77.0000 },
  { name: 'La Molina', lat: -12.0833, lng: -76.9333 },
  { name: 'Lince', lat: -12.0833, lng: -77.0333 },
  { name: 'Chorrillos', lat: -12.1667, lng: -77.0167 },
  { name: 'Breña', lat: -12.0583, lng: -77.0500 },
  { name: 'Jesús María', lat: -12.0708, lng: -77.0458 },
  { name: 'Magdalena del Mar', lat: -12.0900, lng: -77.0700 },
  { name: 'Pueblo Libre', lat: -12.0769, lng: -77.0639 },
]

const amenitiesList = [
  'Gimnasio', 'Piscina', 'Área de juegos', 'Parrilla', 'Áreas verdes',
  'Lobby', 'Coworking', 'Rooftop', 'Pet Shower', 'Salón de niños',
  'Estacionamiento bicicletas', 'Seguridad 24h', 'Ascensor', 'Balcón',
  'Terraza', 'Vista al mar', 'Jardín privado', 'Sauna', 'Spa',
]

const statusOptions = [
  'Entrega inmediata',
  'En construcción',
  'En planos · Entrega 2025',
  'En planos · Entrega 2026',
  'En planos · Entrega 2027',
  '',
]

const propertyTitles = [
  'Moderno Departamento',
  'Exclusivo Flat',
  'Acogedor Departamento',
  'Lujoso Penthouse',
  'Amplio Departamento Familiar',
  'Departamento con Vista',
  'Nuevo Proyecto Residencial',
  'Departamento de Estreno',
  'Elegante Suite',
  'Confortable Departamento',
]

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomItems(arr, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function extractDistrict(address) {
  for (const d of districts) {
    if (address.toLowerCase().includes(d.name.toLowerCase())) {
      return d.name
    }
  }
  // Check common variations
  if (address.toLowerCase().includes('surco')) return 'Santiago de Surco'
  return null
}

// Insert existing properties
const insertProperty = db.prepare(`
  INSERT INTO properties (id, title, address, district, status, price_soles, price_usd, units, bedrooms, bathrooms, parking_spaces, area_m2, area_range_m2, amenities, photo, latitude, longitude)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Migrate existing properties
existingListings.forEach((listing, index) => {
  const district = extractDistrict(listing.address)
  const districtData = districts.find(d => d.name === district) || getRandomItem(districts)

  // Add slight randomization to coordinates
  const lat = districtData.lat + (Math.random() - 0.5) * 0.02
  const lng = districtData.lng + (Math.random() - 0.5) * 0.02

  const priceSoles = typeof listing.price_soles === 'string'
    ? parseInt(listing.price_soles)
    : listing.price_soles

  insertProperty.run(
    listing.id,
    listing.title,
    listing.address,
    district || districtData.name,
    listing.status || '',
    priceSoles,
    listing.price_usd || null,
    listing.units || null,
    typeof listing.bedrooms === 'number' ? String(listing.bedrooms) : listing.bedrooms,
    listing.bathrooms || null,
    listing.parking_spaces || null,
    listing.area_m2 || null,
    listing.area_range_m2 || null,
    JSON.stringify(listing.amenities || []),
    listing.photo || null,
    lat,
    lng
  )
  console.log(`Migrated: ${listing.title}`)
})

// Generate additional properties to reach ~100 total
const targetTotal = 100
const additionalNeeded = targetTotal - existingListings.length

console.log(`\nGenerating ${additionalNeeded} additional properties...`)

for (let i = 0; i < additionalNeeded; i++) {
  const district = getRandomItem(districts)
  const bedrooms = getRandomItem([1, 2, 3, 4])
  const area = 30 + bedrooms * 25 + Math.floor(Math.random() * 40)
  const pricePerM2 = district.name === 'San Isidro' ? 8500
    : district.name === 'Miraflores' ? 7500
    : district.name === 'Barranco' ? 7000
    : district.name === 'Santiago de Surco' ? 6000
    : 5000
  const basePrice = area * pricePerM2
  const price = Math.round(basePrice / 1000) * 1000 + Math.floor(Math.random() * 50000)

  const title = `${getRandomItem(propertyTitles)} en ${district.name}`
  const streets = ['Av. Principal', 'Calle Las Flores', 'Jr. Los Pinos', 'Av. El Sol', 'Calle Los Olivos', 'Av. La Marina', 'Jr. San Martín', 'Calle Berlín', 'Av. Arequipa', 'Calle Roma']
  const address = `${getRandomItem(streets)} ${100 + Math.floor(Math.random() * 900)}, ${district.name}, Lima`

  const lat = district.lat + (Math.random() - 0.5) * 0.02
  const lng = district.lng + (Math.random() - 0.5) * 0.02

  insertProperty.run(
    uuidv4(),
    title,
    address,
    district.name,
    getRandomItem(statusOptions),
    price,
    Math.round(price / 3.75), // Approximate USD
    null,
    `${bedrooms} dorm.`,
    Math.min(bedrooms, 3),
    Math.random() > 0.3 ? Math.ceil(bedrooms / 2) : null,
    area,
    `${area} m²`,
    JSON.stringify(getRandomItems(amenitiesList, 2, 6)),
    null,
    lat,
    lng
  )
}

const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get()
console.log(`\nDatabase seeded successfully!`)
console.log(`Total properties: ${totalProperties.count}`)

db.close()
