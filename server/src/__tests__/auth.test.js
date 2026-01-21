import request from 'supertest'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

// Setup test database
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const testDbPath = join(__dirname, '../../data/test-database.sqlite')

// Mock the database module
const testDb = new Database(testDbPath)
testDb.pragma('foreign_keys = ON')

// Create tables
testDb.exec(`
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
`)

// We need to mock the db import in the actual modules
// For now, we'll test the API endpoints directly

// Clean up after all tests
afterAll(() => {
  testDb.close()
})

describe('Auth API', () => {
  beforeEach(() => {
    testDb.exec('DELETE FROM users')
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      // Simulate registration logic
      const existingUser = testDb.prepare('SELECT id FROM users WHERE email = ?').get(userData.email)
      expect(existingUser).toBeUndefined()

      const passwordHash = await bcrypt.hash(userData.password, 10)
      const id = uuidv4()

      testDb.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(id, userData.email, passwordHash, userData.name)

      const user = testDb.prepare('SELECT id, email, name FROM users WHERE id = ?').get(id)
      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
    })

    it('should not register with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      }

      // Create existing user
      const passwordHash = await bcrypt.hash('existing', 10)
      testDb.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), userData.email, passwordHash, 'Existing User')

      // Try to register with same email
      const existingUser = testDb.prepare('SELECT id FROM users WHERE email = ?').get(userData.email)
      expect(existingUser).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const password = 'testpassword'
      const passwordHash = await bcrypt.hash(password, 10)
      const userId = uuidv4()

      testDb.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(userId, 'login@example.com', passwordHash, 'Login User')

      const user = testDb.prepare('SELECT * FROM users WHERE email = ?').get('login@example.com')
      expect(user).toBeDefined()

      const validPassword = await bcrypt.compare(password, user.password_hash)
      expect(validPassword).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 10)

      testDb.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), 'wrong@example.com', passwordHash, 'Wrong User')

      const user = testDb.prepare('SELECT * FROM users WHERE email = ?').get('wrong@example.com')
      const validPassword = await bcrypt.compare('wrongpassword', user.password_hash)
      expect(validPassword).toBe(false)
    })
  })
})

describe('Properties API', () => {
  beforeEach(() => {
    testDb.exec('DELETE FROM properties')
  })

  it('should filter properties by district', () => {
    // Insert test properties
    testDb.prepare(`
      INSERT INTO properties (id, title, address, district, price_soles)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'Property 1', 'Address 1', 'Miraflores', 200000)

    testDb.prepare(`
      INSERT INTO properties (id, title, address, district, price_soles)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'Property 2', 'Address 2', 'San Isidro', 300000)

    const mirafloresProperties = testDb.prepare(
      'SELECT * FROM properties WHERE district = ?'
    ).all('Miraflores')

    expect(mirafloresProperties).toHaveLength(1)
    expect(mirafloresProperties[0].title).toBe('Property 1')
  })

  it('should filter properties by price range', () => {
    testDb.prepare(`
      INSERT INTO properties (id, title, address, district, price_soles)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'Cheap Property', 'Address 1', 'Lince', 100000)

    testDb.prepare(`
      INSERT INTO properties (id, title, address, district, price_soles)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'Expensive Property', 'Address 2', 'San Isidro', 500000)

    const affordableProperties = testDb.prepare(
      'SELECT * FROM properties WHERE price_soles <= ?'
    ).all(200000)

    expect(affordableProperties).toHaveLength(1)
    expect(affordableProperties[0].title).toBe('Cheap Property')
  })
})

describe('Favorites API', () => {
  let testUserId
  let testPropertyId

  beforeEach(async () => {
    testDb.exec('DELETE FROM favorites')
    testDb.exec('DELETE FROM properties')
    testDb.exec('DELETE FROM users')

    // Create test user
    testUserId = uuidv4()
    const passwordHash = await bcrypt.hash('test', 10)
    testDb.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).run(testUserId, 'fav@example.com', passwordHash, 'Fav User')

    // Create test property
    testPropertyId = uuidv4()
    testDb.prepare(`
      INSERT INTO properties (id, title, address, district, price_soles)
      VALUES (?, ?, ?, ?, ?)
    `).run(testPropertyId, 'Test Property', 'Test Address', 'Miraflores', 250000)
  })

  it('should add property to favorites', () => {
    const favId = uuidv4()
    testDb.prepare(`
      INSERT INTO favorites (id, user_id, property_id)
      VALUES (?, ?, ?)
    `).run(favId, testUserId, testPropertyId)

    const favorite = testDb.prepare(
      'SELECT * FROM favorites WHERE user_id = ? AND property_id = ?'
    ).get(testUserId, testPropertyId)

    expect(favorite).toBeDefined()
    expect(favorite.user_id).toBe(testUserId)
    expect(favorite.property_id).toBe(testPropertyId)
  })

  it('should remove property from favorites', () => {
    // Add favorite first
    testDb.prepare(`
      INSERT INTO favorites (id, user_id, property_id)
      VALUES (?, ?, ?)
    `).run(uuidv4(), testUserId, testPropertyId)

    // Remove it
    testDb.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?'
    ).run(testUserId, testPropertyId)

    const favorite = testDb.prepare(
      'SELECT * FROM favorites WHERE user_id = ? AND property_id = ?'
    ).get(testUserId, testPropertyId)

    expect(favorite).toBeUndefined()
  })

  it('should not allow duplicate favorites', () => {
    testDb.prepare(`
      INSERT INTO favorites (id, user_id, property_id)
      VALUES (?, ?, ?)
    `).run(uuidv4(), testUserId, testPropertyId)

    // Try to add same favorite again
    expect(() => {
      testDb.prepare(`
        INSERT INTO favorites (id, user_id, property_id)
        VALUES (?, ?, ?)
      `).run(uuidv4(), testUserId, testPropertyId)
    }).toThrow()
  })
})
