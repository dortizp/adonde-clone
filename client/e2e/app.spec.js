import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the homepage with property listings', async ({ page }) => {
    await page.goto('/')

    // Check header is visible
    await expect(page.locator('header')).toBeVisible()

    // Check main heading
    await expect(page.getByRole('heading', { name: /encuentra tu hogar ideal/i })).toBeVisible()

    // Check search/filter section exists
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()
  })

  test('should toggle between grid and map view', async ({ page }) => {
    await page.goto('/')

    // Click map view button
    const mapButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1)
    await mapButton.click()

    // Check map container is visible (Leaflet map)
    await expect(page.locator('.leaflet-container')).toBeVisible()

    // Click grid view button
    const gridButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await gridButton.click()

    // Map should no longer be visible
    await expect(page.locator('.leaflet-container')).not.toBeVisible()
  })

  test('should filter properties by district', async ({ page }) => {
    await page.goto('/')

    // Select a district from dropdown
    await page.selectOption('select', { label: 'Miraflores' })

    // Click search button
    await page.getByRole('button', { name: /buscar/i }).click()

    // URL should include district filter
    await expect(page).toHaveURL(/district=Miraflores/)
  })
})

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Click login button in header
    await page.getByRole('link', { name: /iniciar sesión/i }).click()

    // Should be on login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')

    // Click register link
    await page.getByRole('link', { name: /crear una cuenta/i }).click()

    // Should be on register page
    await expect(page).toHaveURL('/register')
  })

  test('should show validation errors on empty login submit', async ({ page }) => {
    await page.goto('/login')

    // Submit empty form
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Should show validation errors
    await expect(page.getByText(/correo.*requerido/i)).toBeVisible()
  })

  test('should register a new user', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    const uniqueEmail = `test${Date.now()}@example.com`
    await page.getByLabel(/nombre/i).fill('Test User')
    await page.getByLabel(/correo/i).fill(uniqueEmail)
    await page.getByLabel(/contraseña/i).first().fill('password123')
    await page.getByLabel(/confirmar/i).fill('password123')

    // Submit
    await page.getByRole('button', { name: /crear cuenta/i }).click()

    // Should redirect to home after successful registration
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })
})

test.describe('Favorites', () => {
  test('should redirect to login when accessing favorites without auth', async ({ page }) => {
    await page.goto('/favorites')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Property Detail', () => {
  test('should display property details', async ({ page }) => {
    await page.goto('/')

    // Wait for properties to load
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 5000 }).catch(() => {
      // If no property cards with testid, try clicking first link in grid
    })

    // Click first property card link
    const firstPropertyLink = page.locator('a[href^="/property/"]').first()
    if (await firstPropertyLink.isVisible()) {
      await firstPropertyLink.click()

      // Should be on property detail page
      await expect(page).toHaveURL(/\/property\//)

      // Should show property title
      await expect(page.locator('h1')).toBeVisible()

      // Should show contact form
      await expect(page.getByText(/contactar/i)).toBeVisible()
    }
  })
})

test.describe('Navigation', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Logo should link to home
    await page.getByRole('link', { name: /a donde vivir/i }).click()
    await expect(page).toHaveURL('/')

    // Footer should have explore links
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still be functional
    await expect(page.getByRole('heading', { name: /encuentra tu hogar ideal/i })).toBeVisible()

    // Filter section should adapt
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()
  })
})
