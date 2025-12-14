const { chromium } = require('playwright');

async function testAdmin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('🔐 Testing Admin Panel...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'admin-panel-current.png' });
    
    console.log('✅ Admin panel screenshot taken');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testAdmin();