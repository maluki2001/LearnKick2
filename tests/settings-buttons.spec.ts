import { test, expect } from '@playwright/test'

test.describe('Settings Buttons', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('http://localhost:3000')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should open settings modal when clicking Arena button', async ({ page }) => {
    // First, complete the quick setup
    await page.goto('http://localhost:3000')

    // Wait for the QuickSetup to appear
    await page.waitForSelector('text=Welcome to LearnKick', { timeout: 10000 })

    // Enter a name - find the input field
    const nameInput = page.locator('input').first()
    await nameInput.fill('Test Player')

    // Select School Mode
    await page.click('text=School Mode')

    // Wait a bit for the START button to become enabled
    await page.waitForTimeout(500)

    // Click the START button
    await page.click('button:has-text("START")')

    // Wait for home screen with BATTLE button
    await page.waitForSelector('text=BATTLE', { timeout: 15000 })

    // Take a screenshot to see the home screen
    await page.screenshot({ path: 'test-results/home-screen.png' })

    // Now look for the Arena button
    const arenaButton = page.locator('button:has-text("Arena")').first()
    await expect(arenaButton).toBeVisible({ timeout: 5000 })

    // Click the Arena button
    await arenaButton.click()

    // Take a screenshot after clicking
    await page.screenshot({ path: 'test-results/after-arena-click.png' })

    // Wait for the settings modal to appear
    await page.waitForSelector('h2:has-text("Settings")', { timeout: 5000 })

    // Verify the settings modal is visible
    const settingsTitle = page.locator('h2:has-text("Settings")')
    await expect(settingsTitle).toBeVisible()

    console.log('✅ Settings modal opened successfully!')
  })

  test('should open accessibility modal when clicking Access button', async ({ page }) => {
    // First, complete the quick setup
    await page.goto('http://localhost:3000')

    // Wait for the QuickSetup to appear
    await page.waitForSelector('text=Welcome to LearnKick', { timeout: 10000 })

    // Enter a name
    const nameInput = page.locator('input').first()
    await nameInput.fill('Test Player')

    // Select Family Mode
    await page.click('text=Family Mode')

    // Wait a bit for the START button to become enabled
    await page.waitForTimeout(500)

    // Click the START button
    await page.click('button:has-text("START")')

    // Wait for home screen with BATTLE button
    await page.waitForSelector('text=BATTLE', { timeout: 15000 })

    // Now look for the Access button
    const accessButton = page.locator('button:has-text("Access")').first()
    await expect(accessButton).toBeVisible({ timeout: 5000 })

    // Click the Access button
    await accessButton.click()

    // Take a screenshot after clicking
    await page.screenshot({ path: 'test-results/after-access-click.png' })

    // Wait for the accessibility modal to appear
    await page.waitForSelector('text=Accessibility Settings', { timeout: 5000 })

    console.log('✅ Accessibility modal opened successfully!')
  })
})
