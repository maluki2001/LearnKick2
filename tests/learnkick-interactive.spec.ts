import { test, expect } from '@playwright/test';

test.describe('LearnKick Interactive Testing', () => {
  
  test('Complete LearnKick Game Flow - Interactive Session', async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🎮') || text.includes('🏁') || text.includes('✅') || text.includes('❌') || text.includes('🚀')) {
        console.log('🖥️ Browser Console:', text);
      }
    });

    // Navigate to the LearnKick homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('🎮 Opening LearnKick in browser for interactive testing...');
    
    // Take a screenshot of the welcome screen
    await page.screenshot({ path: 'screenshots/01-welcome-screen.png', fullPage: true });
    
    // Check if we're on the player setup screen
    const welcomeTitle = page.locator('h1:has-text("LearnKick")');
    await expect(welcomeTitle).toBeVisible();
    console.log('✅ Welcome screen loaded');
    
    // Fill in player name
    const nameInput = page.locator('input[placeholder*="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Player');
      console.log('📝 Entered player name: Test Player');
      
      // Select grade (Grade 3 for example)
      await page.locator('button:has-text("Grade 3")').click();
      console.log('🎓 Selected Grade 3');
      
      // Click Start Playing
      await page.locator('button:has-text("Start Playing")').click();
      console.log('🚀 Clicked Start Playing');
      
      await page.screenshot({ path: 'screenshots/02-after-player-setup.png', fullPage: true });
    }
    
    // Now we should be on mode selection screen
    await page.waitForTimeout(1000);
    
    // Check for mode selection screen
    const familyModeButton = page.locator('text=Family Mode, text=👨‍👩‍👧‍👦');
    const schoolModeButton = page.locator('text=School Mode, text=🏫');
    
    if (await familyModeButton.isVisible() || await schoolModeButton.isVisible()) {
      console.log('🎮 On mode selection screen');
      
      // Select Family Mode for testing
      await familyModeButton.click();
      console.log('👨‍👩‍👧‍👦 Selected Family Mode');
      
      // Click Continue
      const continueButton = page.locator('button:has-text("Continue with Family Mode")');
      await continueButton.click();
      console.log('✅ Continued with Family Mode');
      
      await page.screenshot({ path: 'screenshots/03-mode-selected.png', fullPage: true });
      
      await page.waitForTimeout(1000);
    }
    
    // Look for game setup options
    const arenaButtons = page.locator('button:has-text("Soccer"), button:has-text("Hockey")');
    if (await arenaButtons.first().isVisible()) {
      console.log('⚽ On game setup screen');
      
      // Select Soccer arena
      await page.locator('button:has-text("⚽ Soccer")').click();
      console.log('⚽ Selected Soccer arena');
      
      // Select Math subject
      const subjectSelect = page.locator('select');
      if (await subjectSelect.isVisible()) {
        await subjectSelect.selectOption('math');
        console.log('🔢 Selected Math subject');
      }
      
      // Select English language
      await page.locator('button:has-text("🇬🇧 EN")').click();
      console.log('🇬🇧 Selected English language');
      
      await page.screenshot({ path: 'screenshots/04-game-setup.png', fullPage: true });
      
      // Click Start Playing to begin the game
      const startButton = page.locator('button:has-text("Start Playing")');
      await startButton.click();
      console.log('🎮 Starting game...');
      
      // Wait for game to initialize and show actual questions
      await page.waitForTimeout(5000);
      
      await page.screenshot({ path: 'screenshots/05-game-loading.png', fullPage: true });
      
      // Wait a bit more to see active game with questions
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/06-active-game-questions.png', fullPage: true });
    }
    
    // Now we should be in the active game
    await page.waitForTimeout(2000);
    
    // Look for game elements
    const gameArena = page.locator('.bg-green-400, .bg-gradient-to-b');
    if (await gameArena.isVisible()) {
      console.log('🏟️ Game arena is visible');
      
      // Look for question card
      const questionCard = page.locator('.bg-white').first();
      if (await questionCard.isVisible()) {
        console.log('❓ Question card is visible');
        
        // Try to find answer buttons
        const answerButtons = page.locator('button:has-text("A."), button:has-text("B."), button:has-text("C."), button:has-text("D.")');
        const buttonCount = await answerButtons.count();
        
        if (buttonCount > 0) {
          console.log(`✅ Found ${buttonCount} answer buttons`);
          
          // Take screenshot of active game
          await page.screenshot({ path: 'screenshots/07-active-game.png', fullPage: true });
          
          // Click the first answer for demonstration
          await answerButtons.first().click();
          console.log('👆 Clicked first answer option');
          
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'screenshots/08-after-answer.png', fullPage: true });
        }
      }
    }
    
    console.log('🎯 Interactive session complete! Browser will stay open for manual testing.');
    console.log('📁 Screenshots saved in screenshots/ directory');
    
    // Keep the browser open for manual interaction
    // In headed mode, this allows manual testing
    await page.waitForTimeout(5000); // Wait 5 seconds to see logs
  });
  
  test('Check OpenAI Status and Question Generation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Checking OpenAI integration status...');
    
    // Look for OpenAI status indicator
    const openAiStatus = page.locator('text=AI Question Generation, text=Using Static Questions');
    if (await openAiStatus.isVisible()) {
      const statusText = await openAiStatus.textContent();
      console.log('🤖 OpenAI Status:', statusText);
    }
    
    // Check console for debug messages
    page.on('console', msg => {
      if (msg.text().includes('OpenAI') || msg.text().includes('questions') || msg.text().includes('🤖') || msg.text().includes('📚')) {
        console.log('🎮 Game Log:', msg.text());
      }
    });
    
    await page.screenshot({ path: 'screenshots/openai-status.png', fullPage: true });
    console.log('📸 OpenAI status screenshot taken');
    
    await page.waitForTimeout(5000);
  });
  
  test('Test Tablet Landscape Layout', async ({ page }) => {
    // Set tablet landscape viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 Testing tablet landscape layout (1024x768)...');
    
    // Take full page screenshot
    await page.screenshot({ path: 'screenshots/tablet-landscape.png', fullPage: true });
    
    // Check if content fits without scrolling
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    console.log(`📐 Body height: ${bodyHeight}px, Viewport height: ${viewportHeight}px`);
    
    if (bodyHeight <= viewportHeight) {
      console.log('✅ Content fits without scrolling');
    } else {
      console.log('⚠️  Content requires scrolling');
    }
    
    await page.waitForTimeout(3000);
  });
});

// Helper function to create screenshots directory
test.beforeAll(async () => {
  const fs = await import('fs');
  const path = await import('path');
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📁 Created screenshots directory');
  }
});