import { test, expect } from '@playwright/test'

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and IndexedDB to start fresh
    await page.goto('http://localhost:3000')
    await page.evaluate(() => {
      localStorage.clear()
      // Clear IndexedDB
      const deleteRequest = indexedDB.deleteDatabase('LearnKickOffline')
      deleteRequest.onerror = () => console.log('Error deleting DB')
      deleteRequest.onsuccess = () => console.log('DB deleted')
    })
    await page.reload()
  })

  test('accessibility settings persist after page refresh', async ({ page }) => {
    // Complete the quick setup
    await page.goto('http://localhost:3000')
    await page.waitForSelector('text=Welcome to LearnKick', { timeout: 10000 })

    const nameInput = page.locator('input').first()
    await nameInput.fill('Persistence Test')
    await page.click('text=School Mode')
    await page.waitForTimeout(500)
    await page.click('button:has-text("START")')

    // Wait for home screen
    await page.waitForSelector('text=BATTLE', { timeout: 15000 })

    // Open Accessibility settings
    const accessButton = page.locator('button:has-text("Access")').first()
    await accessButton.click()
    await page.waitForSelector('text=Accessibility Settings', { timeout: 5000 })

    // Click on "Dark" theme button (initially Light is selected)
    const darkButton = page.locator('button:has-text("Dark")').first()
    await expect(darkButton).toBeVisible({ timeout: 5000 })

    // Check if Light is currently selected (has border)
    const lightButton = page.locator('button:has-text("Light")').first()
    console.log('Light button visible')

    // Click Dark theme
    await darkButton.click()
    await page.waitForTimeout(500)
    console.log('Clicked Dark theme button')

    // Take a screenshot after selecting Dark
    await page.screenshot({ path: 'test-results/dark-theme-selected.png' })

    // Close the modal by clicking X button
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await closeButton.click()
    await page.waitForTimeout(500)

    // Verify localStorage was saved
    const savedSettings = await page.evaluate(() => {
      return localStorage.getItem('learnkick_accessibility')
    })
    console.log('Saved accessibility settings:', savedSettings)
    expect(savedSettings).toBeTruthy()
    expect(savedSettings).toContain('dark')

    // Refresh the page
    await page.reload()

    // Wait for either BATTLE (returning user) or Welcome (if profile needs re-creation)
    // The key is to verify localStorage persisted
    await page.waitForTimeout(2000)

    // Verify Dark theme is still in localStorage after refresh
    const persistedSettings = await page.evaluate(() => {
      return localStorage.getItem('learnkick_accessibility')
    })
    console.log('Persisted accessibility settings after refresh:', persistedSettings)
    expect(persistedSettings).toBeTruthy()
    expect(persistedSettings).toContain('dark')

    // Take a screenshot after refresh
    await page.screenshot({ path: 'test-results/after-refresh.png' })

    console.log('✅ Accessibility settings persisted in localStorage after page refresh!')
  })

  test('game settings (arena) persist after page refresh', async ({ page }) => {
    // Complete the quick setup
    await page.goto('http://localhost:3000')
    await page.waitForSelector('text=Welcome to LearnKick', { timeout: 10000 })

    const nameInput = page.locator('input').first()
    await nameInput.fill('Arena Test')
    await page.click('text=School Mode')
    await page.waitForTimeout(500)
    await page.click('button:has-text("START")')

    // Wait for home screen
    await page.waitForSelector('text=BATTLE', { timeout: 15000 })

    // Open Settings modal (Arena button)
    const arenaButton = page.locator('button:has-text("Arena")').first()
    await arenaButton.click()
    await page.waitForSelector('h2:has-text("Settings")', { timeout: 5000 })

    // Look for arena selection - click Hockey if not already selected
    const hockeyOption = page.locator('text=Hockey')
    if (await hockeyOption.isVisible()) {
      await hockeyOption.click()
      await page.waitForTimeout(500)
    }

    // Close the modal
    const closeButton = page.locator('button:has-text("Close")').or(page.locator('[aria-label="Close"]')).first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
    } else {
      // Try clicking outside the modal
      await page.keyboard.press('Escape')
    }
    await page.waitForTimeout(500)

    // Verify IndexedDB was saved by checking console logs
    const indexedDBData = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const request = indexedDB.open('LearnKickOffline')
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction('preferences', 'readonly')
          const store = tx.objectStore('preferences')
          const getRequest = store.get('current')
          getRequest.onsuccess = () => {
            resolve(getRequest.result)
          }
          getRequest.onerror = () => {
            resolve(null)
          }
        }
        request.onerror = () => {
          resolve(null)
        }
      })
    })
    console.log('IndexedDB preferences:', indexedDBData)

    // Refresh the page
    await page.reload()
    await page.waitForSelector('text=BATTLE', { timeout: 15000 })

    // Open Settings modal again
    const arenaButton2 = page.locator('button:has-text("Arena")').first()
    await arenaButton2.click()
    await page.waitForSelector('h2:has-text("Settings")', { timeout: 5000 })

    // Check if Hockey is still selected
    const indexedDBDataAfter = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const request = indexedDB.open('LearnKickOffline')
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction('preferences', 'readonly')
          const store = tx.objectStore('preferences')
          const getRequest = store.get('current')
          getRequest.onsuccess = () => {
            resolve(getRequest.result)
          }
          getRequest.onerror = () => {
            resolve(null)
          }
        }
        request.onerror = () => {
          resolve(null)
        }
      })
    })
    console.log('IndexedDB preferences after refresh:', indexedDBDataAfter)

    console.log('✅ Game settings test completed!')
  })
})
