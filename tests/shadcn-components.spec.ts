import { test, expect } from '@playwright/test';

test.describe('shadcn/ui Components Tests', () => {
  
  test('Dialog and Modal Components', async ({ page }) => {
    console.log('🪟 Testing Dialog and Modal components...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to User Management to test dialogs
    const userMgmtButton = page.locator('button:has-text("User Management"), button:has-text("Users")').first();
    if (await userMgmtButton.isVisible()) {
      await userMgmtButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test Dialog component (Invite User)
    const inviteButton = page.locator('button:has-text("Invite")').first();
    if (await inviteButton.isVisible()) {
      console.log('📧 Testing Dialog component');
      await inviteButton.click();
      await page.waitForTimeout(500);
      
      // Check dialog elements
      const dialog = page.locator('[role="dialog"], [class*="dialog"]');
      if (await dialog.isVisible()) {
        console.log('✅ Dialog opened successfully');
        await page.screenshot({ path: 'screenshots/shadcn-01-dialog.png', fullPage: true });
        
        // Test dialog controls
        const dialogTitle = page.locator('[class*="dialog-title"], h1, h2, h3').first();
        const dialogContent = page.locator('[class*="dialog-content"]');
        
        if (await dialogTitle.isVisible()) {
          const titleText = await dialogTitle.textContent();
          console.log(`📝 Dialog title: ${titleText}`);
        }
        
        // Close dialog
        const closeButton = page.locator('button:has-text("Cancel"), [aria-label="Close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          console.log('❌ Dialog closed');
        }
      }
    }
    
    // Test Alert Dialog (Delete confirmation)
    const actionDropdown = page.locator('button:has(svg)').last();
    if (await actionDropdown.isVisible()) {
      await actionDropdown.click();
      await page.waitForTimeout(300);
      
      const deleteButton = page.locator('button:has-text("Delete"), [class*="destructive"]').first();
      if (await deleteButton.isVisible()) {
        console.log('🗑️ Testing AlertDialog component');
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        const alertDialog = page.locator('[role="alertdialog"], [class*="alert-dialog"]');
        if (await alertDialog.isVisible()) {
          console.log('⚠️ AlertDialog opened successfully');
          await page.screenshot({ path: 'screenshots/shadcn-02-alert-dialog.png', fullPage: true });
          
          // Cancel the delete
          const cancelButton = page.locator('button:has-text("Cancel")').first();
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
            console.log('❌ AlertDialog cancelled');
          }
        }
      }
    }
  });

  test('Dropdown Menu Components', async ({ page }) => {
    console.log('📋 Testing DropdownMenu components...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Test header dropdown menu
    const dropdownTrigger = page.locator('button:has(svg[class*="vertical"]), button:has(svg[class*="more"])').first();
    if (await dropdownTrigger.isVisible()) {
      console.log('🔽 Testing DropdownMenu component');
      await dropdownTrigger.click();
      await page.waitForTimeout(300);
      
      const dropdownContent = page.locator('[role="menu"], [class*="dropdown-content"]');
      if (await dropdownContent.isVisible()) {
        console.log('✅ DropdownMenu opened successfully');
        await page.screenshot({ path: 'screenshots/shadcn-03-dropdown-menu.png', fullPage: true });
        
        // Check menu items
        const menuItems = page.locator('[role="menuitem"], [class*="dropdown-item"]');
        const itemCount = await menuItems.count();
        console.log(`📝 Found ${itemCount} menu items`);
        
        // Click outside to close
        await page.click('body', { position: { x: 100, y: 100 } });
        console.log('❌ DropdownMenu closed');
      }
    }
  });

  test('Table Component', async ({ page }) => {
    console.log('📊 Testing Table component...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to User Management
    const userMgmtButton = page.locator('button:has-text("User Management")').first();
    if (await userMgmtButton.isVisible()) {
      await userMgmtButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test Table component
    const table = page.locator('table, [class*="table"]');
    if (await table.isVisible()) {
      console.log('📋 Testing Table component');
      await page.screenshot({ path: 'screenshots/shadcn-04-table.png', fullPage: true });
      
      // Check table structure
      const tableHeaders = page.locator('thead th, [class*="table-head"]');
      const tableRows = page.locator('tbody tr, [class*="table-row"]');
      
      const headerCount = await tableHeaders.count();
      const rowCount = await tableRows.count();
      
      console.log(`📊 Table has ${headerCount} headers and ${rowCount} rows`);
      
      // Test table interactions
      if (rowCount > 0) {
        const firstRow = tableRows.first();
        await firstRow.hover();
        await page.waitForTimeout(300);
        console.log('🖱️ Table row hover effect tested');
      }
    }
  });

  test('Button and Badge Components', async ({ page }) => {
    console.log('🔘 Testing Button and Badge components...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Test different button variants
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`🔘 Found ${buttonCount} buttons`);
    
    // Test button interactions
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          await button.hover();
          await page.waitForTimeout(100);
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/shadcn-05-buttons.png', fullPage: true });
    
    // Test Badge components (usually found in user management)
    const userMgmtButton = page.locator('button:has-text("User Management")').first();
    if (await userMgmtButton.isVisible()) {
      await userMgmtButton.click();
      await page.waitForTimeout(1000);
      
      const badges = page.locator('[class*="badge"], .inline-flex.px-2.py-1');
      const badgeCount = await badges.count();
      console.log(`🏷️ Found ${badgeCount} badges`);
      
      if (badgeCount > 0) {
        await page.screenshot({ path: 'screenshots/shadcn-06-badges.png', fullPage: true });
      }
    }
  });

  test('Form Components (Input, Label, etc.)', async ({ page }) => {
    console.log('📝 Testing Form components...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to settings to find form elements
    const settingsButton = page.locator('button:has-text("Settings")').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test Input components
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`📝 Found ${inputCount} input fields`);
    
    if (inputCount > 0) {
      // Test input focus and typing
      const firstInput = inputs.first();
      if (await firstInput.isVisible()) {
        await firstInput.focus();
        await page.waitForTimeout(200);
        await firstInput.fill('Test input');
        console.log('✏️ Input field tested');
      }
    }
    
    // Test Label components
    const labels = page.locator('label');
    const labelCount = await labels.count();
    console.log(`🏷️ Found ${labelCount} labels`);
    
    // Test Select components
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log(`📋 Found ${selectCount} select dropdowns`);
    
    await page.screenshot({ path: 'screenshots/shadcn-07-form-components.png', fullPage: true });
  });

  test('Card and Layout Components', async ({ page }) => {
    console.log('🎴 Testing Card and layout components...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Test Card components (should be everywhere in admin)
    const cards = page.locator('[class*="card"], .border.rounded');
    const cardCount = await cards.count();
    console.log(`🎴 Found ${cardCount} card components`);
    
    if (cardCount > 0) {
      // Test card hover effects
      for (let i = 0; i < Math.min(3, cardCount); i++) {
        const card = cards.nth(i);
        if (await card.isVisible()) {
          await card.hover();
          await page.waitForTimeout(200);
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/shadcn-08-cards.png', fullPage: true });
    
    // Test Progress components (might be in analytics)
    const analyticsButton = page.locator('button:has-text("Analytics")').first();
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      await page.waitForTimeout(1000);
      
      const progressBars = page.locator('[class*="progress"], .bg-primary');
      const progressCount = await progressBars.count();
      console.log(`📊 Found ${progressCount} progress indicators`);
      
      if (progressCount > 0) {
        await page.screenshot({ path: 'screenshots/shadcn-09-progress.png', fullPage: true });
      }
    }
  });

  test('Theme Toggle and Dark Mode', async ({ page }) => {
    console.log('🌙 Testing theme toggle and dark mode...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for theme toggle button
    const themeToggle = page.locator('button:has(svg[class*="sun"]), button:has(svg[class*="moon"]), button[aria-label*="theme"]').first();
    
    if (await themeToggle.isVisible()) {
      console.log('🌙 Theme toggle found');
      
      // Take screenshot in light mode
      await page.screenshot({ path: 'screenshots/shadcn-10-light-theme.png', fullPage: true });
      
      // Toggle to dark mode
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Take screenshot in dark mode
      await page.screenshot({ path: 'screenshots/shadcn-11-dark-theme.png', fullPage: true });
      
      // Toggle back to light mode
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      console.log('✅ Theme toggle functionality tested');
    } else {
      console.log('⚠️ Theme toggle not found');
    }
  });
});

// Setup function
test.beforeAll(async () => {
  const fs = await import('fs');
  const path = await import('path');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📁 Created screenshots directory');
  }
});