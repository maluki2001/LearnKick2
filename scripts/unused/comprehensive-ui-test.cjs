const { chromium } = require('playwright');

async function testAllUI() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('🎮 Starting Comprehensive UI Test');
    
    // 1. Main Page
    console.log('\n📱 Testing Main Page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ui-test/01-main-page.png' });
    
    // 2. Test Accessibility Settings Modal
    console.log('♿ Testing Accessibility Settings...');
    try {
      // Look for accessibility button and click it
      const accessibilityButton = page.locator('button').filter({ hasText: '♿' }).first();
      await accessibilityButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'ui-test/02-accessibility-modal.png' });
      
      // Close modal
      await page.locator('button').filter({ hasText: '×' }).first().click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('  ⚠️ Accessibility button not clickable, trying alternative...');
    }
    
    // 3. Test Admin Access Modal
    console.log('🛠️ Testing Admin Access Modal...');
    try {
      const adminButton = page.locator('button').filter({ hasText: '🛠️' }).first();
      await adminButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'ui-test/03-admin-access-modal.png' });
      
      // Close modal
      await page.locator('button').filter({ hasText: '×' }).first().click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('  ⚠️ Admin button not clickable, continuing...');
    }
    
    // 4. Test UI Components Showcase
    console.log('🎨 Testing UI Components Showcase...');
    try {
      const uiButton = page.locator('button').filter({ hasText: '🎨' }).first();
      await uiButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'ui-test/04-ui-showcase-modal.png' });
      
      // Close modal
      await page.locator('button').filter({ hasText: '✕' }).first().click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('  ⚠️ UI showcase button not clickable, continuing...');
    }
    
    // 5. Fill in Player Setup and test flow
    console.log('📝 Testing Player Setup Flow...');
    await page.fill('input[placeholder*="name"], input[type="text"]', 'UI Test Player');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'ui-test/05-player-setup-filled.png' });
    
    // Try to select grade
    try {
      await page.selectOption('select', { index: 2 });
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('  ⚠️ Grade selection not available');
    }
    
    // Click language buttons
    try {
      await page.click('button:has-text("DE")');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'ui-test/06-language-selection.png' });
      
      // Switch back to EN
      await page.click('button:has-text("EN")');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('  ⚠️ Language buttons not clickable');
    }
    
    // 6. Test Start Playing Button
    console.log('🎯 Testing Start Playing Button...');
    try {
      await page.click('button:has-text("Start Playing"), button:has-text("Play")');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'ui-test/07-game-mode-or-setup.png' });
    } catch (e) {
      console.log('  ⚠️ Start playing button not clickable');
    }
    
    // 7. Test Admin Panel
    console.log('🔐 Testing Admin Panel...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ui-test/08-admin-panel.png' });
    
    // Test admin tab switching
    try {
      await page.click('button:has-text("School Admin")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'ui-test/09-admin-signup.png' });
      
      await page.click('button:has-text("Parent")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'ui-test/10-parent-signup.png' });
      
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('  ⚠️ Admin tabs not clickable');
    }
    
    console.log('\n✅ Comprehensive UI Test Complete!');
    console.log('📁 Screenshots saved in ui-test/ folder');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'ui-test/error-state.png' });
  } finally {
    await browser.close();
  }
}

// Create ui-test directory
const fs = require('fs');
if (!fs.existsSync('ui-test')) {
  fs.mkdirSync('ui-test');
}

testAllUI();