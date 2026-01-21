# Engineering Best Practices

This document outlines the software engineering best practices applied in this project.

---

## 1. Architecture & Structure

### Monorepo Organization
```
/
├── client/          # Frontend (React)
├── server/          # Backend (Express)
└── shared/          # Shared types/schemas (future)
```

**Why**: Clear separation of concerns, independent deployability, shared tooling.

### Feature-Based Component Organization
```
client/src/
├── components/
│   ├── ui/          # Reusable base components
│   ├── layout/      # App-wide layout components
│   └── property/    # Domain-specific components
├── pages/           # Route-level components
├── hooks/           # Custom React hooks
├── lib/             # Utilities, API client
└── context/         # React context providers
```

**Why**: Scalable structure, easy to locate code, promotes reusability.

---

## 2. Frontend Best Practices

### Component Design Principles

#### Single Responsibility
Each component does one thing well:
```jsx
// Good: Focused component
function PropertyCard({ property, isFavorite }) { ... }

// Bad: Component doing too much
function PropertyCardWithFiltersAndMap({ ... }) { ... }
```

#### Composition Over Inheritance
```jsx
// Card with composable sub-components
<Card>
  <Card.Image src={photo} />
  <Card.Content>{children}</Card.Content>
</Card>
```

#### Props Interface
```jsx
// Clear, typed props with defaults
function Button({
  variant = 'primary',  // Default value
  size = 'md',
  loading = false,
  children,
  ...props              // Rest props for flexibility
}) { ... }
```

### State Management

#### Server State (React Query)
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['properties', filters],  // Cache key
  queryFn: () => api.getProperties(filters),
})
```

**Why**:
- Automatic caching and deduplication
- Background refetching
- Optimistic updates
- Loading/error states built-in

#### Client State (React Context)
```jsx
// AuthContext for user session
const { user, login, logout } = useAuth()
```

**Why**: Lightweight, no external dependencies for simple global state.

#### Local State (useState)
```jsx
const [imgError, setImgError] = useState(false)
```

**Why**: Component-scoped state that doesn't need sharing.

### Performance Optimizations

#### Lazy Loading Images
```jsx
<img loading="lazy" src={photo} />
```

#### Error Boundaries for Images
```jsx
const [imgError, setImgError] = useState(false)
<img
  src={imgError ? PLACEHOLDER : photo}
  onError={() => setImgError(true)}  // Prevents infinite loop
/>
```

#### Query Caching
```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
    },
  },
})
```

---

## 3. Backend Best Practices

### RESTful API Design

#### Resource-Based URLs
```
GET    /api/properties          # List
GET    /api/properties/:id      # Read
POST   /api/properties          # Create
PUT    /api/properties/:id      # Update
DELETE /api/properties/:id      # Delete
```

#### Consistent Response Format
```json
{
  "properties": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

#### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

### Middleware Pattern
```javascript
// Composable middleware chain
app.use(cors())
app.use(express.json())
app.use('/api/favorites', authenticateToken, favoritesRoutes)
```

### Authentication

#### JWT Best Practices
```javascript
// Token generation with expiration
const token = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: '7d' }
)

// Password hashing with bcrypt
const hash = await bcrypt.hash(password, 10)  // 10 rounds
```

#### Protected Routes
```javascript
// Middleware checks token
export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No autorizado' })
  // ... verify token
}
```

### Database

#### Schema Design
```sql
-- Proper foreign keys with cascading
CREATE TABLE favorites (
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, property_id)  -- Prevent duplicates
);
```

#### Indexes for Performance
```sql
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_price ON properties(price_soles);
```

#### Parameterized Queries (SQL Injection Prevention)
```javascript
// Good: Parameterized
db.prepare('SELECT * FROM users WHERE email = ?').get(email)

// Bad: String concatenation
db.exec(`SELECT * FROM users WHERE email = '${email}'`)  // VULNERABLE!
```

---

## 4. Security Best Practices

### Input Validation (Zod)
```javascript
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
})

// Middleware validates before handler runs
router.post('/register', validate(registerSchema), handler)
```

### Password Security
- Bcrypt hashing with salt rounds
- Never store plain text passwords
- Never log passwords

### JWT Security
- Tokens expire after 7 days
- Stored in localStorage (consider httpOnly cookies for production)
- Validated on every protected request

### CORS Configuration
```javascript
app.use(cors())  // Configure origins for production
```

---

## 5. Error Handling

### Frontend
```jsx
// React Query handles loading/error states
if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />

// API client with fallback
try {
  return await fetch(url)
} catch (err) {
  return handleMockRequest(endpoint)  // Graceful degradation
}
```

### Backend
```javascript
// Centralized error handler
export function errorHandler(err, req, res, next) {
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: err.errors
    })
  }
  res.status(500).json({ message: 'Error interno' })
}
```

---

## 6. Testing Strategy

### Test Pyramid
```
    /\
   /  \     E2E Tests (Playwright)
  /----\    - Critical user flows
 /      \
/--------\  Integration Tests (Supertest)
            - API endpoints
            - Database operations

/----------\  Unit Tests (Vitest)
              - Components
              - Utilities
              - Business logic
```

### Unit Tests (Vitest + React Testing Library)
```jsx
describe('PropertyCard', () => {
  it('renders property title', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Moderno Departamento')).toBeInTheDocument()
  })
})
```

### API Tests (Supertest)
```javascript
describe('Auth API', () => {
  it('should register a new user', async () => {
    // Test database operations directly
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    expect(user).toBeDefined()
  })
})
```

### E2E Tests (Playwright)
```javascript
test('should filter properties by district', async ({ page }) => {
  await page.goto('/')
  await page.selectOption('select', { label: 'Miraflores' })
  await page.click('button:has-text("Buscar")')
  await expect(page).toHaveURL(/district=Miraflores/)
})
```

---

## 7. Code Quality

### Consistent Code Style
- ESLint for linting
- Prettier for formatting
- EditorConfig for editor settings

### Meaningful Naming
```javascript
// Good
const favoritePropertyIds = new Set(favorites.map(f => f.property_id))
const isPropertyFavorited = favoritePropertyIds.has(property.id)

// Bad
const x = new Set(data.map(d => d.id))
const y = x.has(p.id)
```

### Comments for "Why", Not "What"
```javascript
// Good: Explains why
// Keep only last 50 searches to prevent unbounded growth
db.prepare('DELETE FROM search_history WHERE ...').run()

// Bad: Explains what (obvious from code)
// Delete from search history
db.prepare('DELETE FROM search_history').run()
```

---

## 8. DevOps & Deployment

### Environment Configuration
```bash
# .env.production
VITE_USE_MOCK=true      # Enable mock data for demo
VITE_API_URL=/api       # API base URL
```

### Graceful Degradation
```javascript
// Frontend works without backend using mock data
if (USE_MOCK || fetchFailed) {
  return handleMockRequest(endpoint)
}
```

### Build Optimization
```javascript
// Vite config for production
export default defineConfig({
  build: {
    rollupOptions: {
      output: { manualChunks: { vendor: ['react', 'react-dom'] } }
    }
  }
})
```

---

## 9. Git Workflow

### Conventional Commits
```
feat: Add favorites functionality
fix: Resolve image flickering issue
docs: Update README with API endpoints
refactor: Extract PropertyCard component
test: Add unit tests for auth
```

### Branch Strategy
```
main                    # Production-ready code
└── feature/xyz         # Feature branches
```

### Commit Best Practices
- Atomic commits (one logical change)
- Descriptive messages
- Reference issues when applicable

---

## 10. Documentation

### Code Documentation
- JSDoc for complex functions
- TypeScript types (future improvement)
- README for setup/usage

### API Documentation
- Endpoint tables in README
- Request/response examples
- Error codes documented

---

## Summary

| Category | Practices Applied |
|----------|-------------------|
| Architecture | Monorepo, feature-based structure, separation of concerns |
| Frontend | React Query, Context API, component composition |
| Backend | RESTful API, middleware pattern, parameterized queries |
| Security | JWT auth, bcrypt, input validation, CORS |
| Testing | Unit, integration, E2E tests |
| DevOps | Environment configs, graceful degradation |
| Code Quality | Consistent naming, meaningful comments |
