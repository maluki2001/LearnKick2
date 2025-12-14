import { test, expect } from '@playwright/test';

test.describe('Admin Interface Tests', () => {
  
  test('Admin Login and Dashboard Access', async ({ page }) => {
    console.log('🔐 Testing admin login and dashboard access...');
    
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of admin login page
    await page.screenshot({ path: 'screenshots/admin-01-login.png', fullPage: true });
    
    // Check if we're on login screen or already authenticated
    const loginForm = page.locator('form');
    const dashboard = page.locator('text=LearnKick Admin, text=Dashboard Overview');
    
    if (await loginForm.isVisible()) {
      console.log('📝 Login form visible - testing authentication flow');
      
      // Fill in admin credentials (using test credentials)
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@test.com');
        await passwordInput.fill('admin123');
        
        // Click login button (use the first one)
        await page.locator('button:has-text("Sign In")').first().click();
        console.log('🔑 Submitted login credentials');
        
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/admin-02-after-login.png', fullPage: true });
      }
    } else if (await dashboard.isVisible()) {
      console.log('✅ Already authenticated - dashboard visible');
    }
    
    // Wait for potential navigation
    await page.waitForTimeout(1000);
  });

  test('Admin Dashboard Navigation and Sidebar', async ({ page }) => {
    console.log('🧭 Testing admin dashboard navigation...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for dashboard elements
    const sidebar = page.locator('[class*="sidebar"], [class*="nav"]').first();
    const mainContent = page.locator('main, [class*="main"]').first();
    
    // Take screenshot of full dashboard
    await page.screenshot({ path: 'screenshots/admin-03-dashboard.png', fullPage: true });
    
    // Test navigation items
    const navItems = [
      'Overview',
      'Question Bank', 
      'Subjects',
      'User Management',
      'Analytics',
      'School Settings'
    ];
    
    for (const item of navItems) {
      const navButton = page.locator(`button:has-text("${item}"), a:has-text("${item}")`).first();
      if (await navButton.isVisible()) {
        console.log(`🎯 Testing ${item} navigation`);
        await navButton.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot of each section
        await page.screenshot({ 
          path: `screenshots/admin-04-${item.toLowerCase().replace(' ', '-')}.png`, 
          fullPage: true 
        });
      }
    }
    
    console.log('✅ Dashboard navigation test complete');
  });

  test('Admin Dropdown Menus and Actions', async ({ page }) => {
    console.log('📋 Testing admin dropdown menus...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Test header admin actions dropdown
    const headerDropdown = page.locator('[class*="dropdown"], button:has(svg)').first();
    if (await headerDropdown.isVisible()) {
      console.log('🔽 Testing header admin dropdown');
      await headerDropdown.click();
      await page.waitForTimeout(500);
      
      // Take screenshot of dropdown menu
      await page.screenshot({ path: 'screenshots/admin-05-header-dropdown.png', fullPage: true });
      
      // Check for dropdown items
      const dropdownItems = page.locator('[role="menuitem"], [class*="dropdown-item"]');
      const itemCount = await dropdownItems.count();
      console.log(`📝 Found ${itemCount} dropdown items`);
    }
    
    // Test user profile dropdown
    const userProfileArea = page.locator('[class*="user"], [class*="profile"]').last();
    if (await userProfileArea.isVisible()) {
      console.log('👤 Testing user profile dropdown');
      await userProfileArea.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'screenshots/admin-06-profile-dropdown.png', fullPage: true });
    }
    
    // Navigate to User Management to test table dropdowns
    const userMgmtButton = page.locator('button:has-text("User Management"), button:has-text("Users")').first();
    if (await userMgmtButton.isVisible()) {
      await userMgmtButton.click();
      await page.waitForTimeout(1000);
      
      // Look for table action dropdowns
      const actionButtons = page.locator('button:has(svg[class*="vertical"]), button:has-text("⋮")');
      if (await actionButtons.count() > 0) {
        console.log('⚙️ Testing table action dropdown');
        await actionButtons.first().click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: 'screenshots/admin-07-table-dropdown.png', fullPage: true });
      }
    }
    
    console.log('✅ Dropdown menus test complete');
  });

  test('Quick Actions and Interactive Elements', async ({ page }) => {
    console.log('⚡ Testing quick actions and interactive elements...');
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to Overview if not already there
    const overviewButton = page.locator('button:has-text("Overview")').first();
    if (await overviewButton.isVisible()) {
      await overviewButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for quick action cards
    const quickActionCards = page.locator('[class*="quick"], [class*="action"], [class*="card"]');
    const cardCount = await quickActionCards.count();
    console.log(`🎴 Found ${cardCount} interactive elements`);
    
    // Test hover effects on quick action cards
    if (cardCount > 0) {
      for (let i = 0; i < Math.min(4, cardCount); i++) {
        const card = quickActionCards.nth(i);
        if (await card.isVisible()) {
          await card.hover();
          await page.waitForTimeout(300);
        }
      }
      
      await page.screenshot({ path: 'screenshots/admin-08-quick-actions.png', fullPage: true });
    }
    
    // Test invite user functionality
    const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add User")').first();
    if (await inviteButton.isVisible()) {
      console.log('📧 Testing invite user modal');
      await inviteButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'screenshots/admin-09-invite-modal.png', fullPage: true });
      
      // Close modal
      const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    console.log('✅ Quick actions test complete');
  });

  test('Responsive Design and Mobile View', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/admin-10-tablet-view.png', fullPage: true });
    
    // Test mobile hamburger menu
    const hamburgerMenu = page.locator('button:has-text("☰"), button:has(svg[class*="menu"])').first();
    if (await hamburgerMenu.isVisible()) {
      console.log('📱 Testing mobile navigation menu');
      await hamburgerMenu.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'screenshots/admin-11-mobile-menu.png', fullPage: true });
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/admin-12-mobile-view.png', fullPage: true });
    
    console.log('✅ Responsive design test complete');
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