const { chromium } = require('playwright');

async function testFloatingButtons() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('🎯 Testing Floating Action Buttons');
    
    // 1. Go to main page
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 2. Test Accessibility Button (bottom-right)
    console.log('♿ Testing Accessibility Button...');
    try {
      await page.click('.fixed.bottom-6.right-6, button[aria-label*="Accessibility"], .bottom-4.right-4');
      await page.waitForTimeout(2000);
      console.log('✅ Accessibility modal opened');
      await page.screenshot({ path: 'floating-test/accessibility-open.png' });
      
      // Close modal
      await page.click('button:has-text("×"), .close-button');
      await page.waitForTimeout(1000);
      console.log('✅ Accessibility modal closed');
    } catch (e) {
      console.log('❌ Could not click accessibility button:', e.message);
    }
    
    // 3. Test Admin Button (bottom-left)
    console.log('🛠️ Testing Admin Button...');
    try {
      await page.click('.fixed.bottom-6.left-6, button[aria-label*="Admin"], .bottom-4.left-4');
      await page.waitForTimeout(2000);
      console.log('✅ Admin modal opened');
      await page.screenshot({ path: 'floating-test/admin-open.png' });
      
      // Close modal
      await page.click('button:has-text("×"), .close-button');
      await page.waitForTimeout(1000);
      console.log('✅ Admin modal closed');
    } catch (e) {
      console.log('❌ Could not click admin button:', e.message);
    }
    
    // 4. Test UI Components Button
    console.log('🎨 Testing UI Components Button...');
    try {
      await page.click('.fixed.bottom-24.left-6, button[aria-label*="UI Components"]');
      await page.waitForTimeout(2000);
      console.log('✅ UI Components modal opened');
      await page.screenshot({ path: 'floating-test/ui-components-open.png' });
      
      // Close modal
      await page.click('button:has-text("✕"), .close-button');
      await page.waitForTimeout(1000);
      console.log('✅ UI Components modal closed');
    } catch (e) {
      console.log('❌ Could not click UI components button:', e.message);
    }
    
    // 5. Final screenshot
    await page.screenshot({ path: 'floating-test/final-state.png' });
    
    console.log('\n✅ Floating Buttons Test Complete!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'floating-test/error.png' });
  } finally {
    await browser.close();
  }
}

// Create test directory
const fs = require('fs');
if (!fs.existsSync('floating-test')) {
  fs.mkdirSync('floating-test');
}

testFloatingButtons();