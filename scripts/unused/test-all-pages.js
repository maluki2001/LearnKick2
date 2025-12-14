const { chromium } = require('playwright');

async function testAllPages() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('🎮 Testing LearnKick - Full UI Audit');
    
    // 1. Test Main Page
    console.log('\n📱 Testing Main Page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/01-main-page.png' });
    
    // 2. Test Player Setup Flow
    console.log('📝 Testing Player Setup...');
    await page.fill('input[placeholder*="name"], input[type="text"]', 'Test Player');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/02-player-setup-filled.png' });
    
    // 3. Test Admin Panel Access
    console.log('🛠️ Testing Admin Panel Access...');
    await page.click('button[role="button"]:has-text("🛠️"), .admin-access, [aria-label*="Admin"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/03-admin-access.png' });
    
    // 4. Test Admin Panel
    console.log('🔐 Testing Admin Panel...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/04-admin-panel.png' });
    
    // 5. Test Accessibility Settings
    console.log('♿ Testing Accessibility Settings...');
    await page.goto('http://localhost:3000');
    await page.click('button[role="button"]:has-text("♿"), .accessibility-settings, [aria-label*="Accessibility"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/05-accessibility-settings.png' });
    
    // 6. Test UI Components Showcase
    console.log('🎨 Testing UI Components...');
    await page.click('button[role="button"]:has-text("🎨"), .ui-showcase, [aria-label*="UI Components"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/06-ui-components.png' });
    
    // 7. Test Game Mode Selection
    console.log('🎯 Testing Game Mode Selection...');
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder*="name"], input[type="text"]', 'Test Player');
    await page.selectOption('select', { index: 2 }); // Select grade
    await page.click('button:has-text("Start"), button:has-text("Play")');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/07-game-mode-selection.png' });
    
    console.log('\n✅ UI Audit Complete! Check screenshots folder for results.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'screenshots/error-state.png' });
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testAllPages();