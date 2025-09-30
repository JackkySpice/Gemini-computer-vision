import { test, expect } from '@playwright/test';

test.describe('Gemini Robotics Live E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant camera and microphone permissions
    await context.grantPermissions(['camera', 'microphone']);
  });

  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Gemini Robotics Live/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Gemini Robotics Live/i })).toBeVisible();
  });

  test('should display ER controls', async ({ page }) => {
    await page.goto('/');
    
    // Check detection mode buttons
    await expect(page.getByRole('button', { name: 'Points' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Boxes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Trajectory' })).toBeVisible();
    
    // Check thinking budget slider
    await expect(page.locator('input[type="range"]')).toBeVisible();
    
    // Check queries input
    await expect(page.getByPlaceholder(/banana, bowl, cup/i)).toBeVisible();
  });

  test('should switch detection modes', async ({ page }) => {
    await page.goto('/');
    
    // Points mode should be selected by default
    const pointsButton = page.getByRole('button', { name: 'Points' });
    await expect(pointsButton).toHaveClass(/bg-blue-600/);
    
    // Click Boxes mode
    const boxesButton = page.getByRole('button', { name: 'Boxes' });
    await boxesButton.click();
    await expect(boxesButton).toHaveClass(/bg-blue-600/);
    
    // Click Trajectory mode
    const trajectoryButton = page.getByRole('button', { name: 'Trajectory' });
    await trajectoryButton.click();
    await expect(trajectoryButton).toHaveClass(/bg-blue-600/);
  });

  test('should adjust thinking budget', async ({ page }) => {
    await page.goto('/');
    
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();
    
    // Check initial value
    await expect(page.getByText(/Thinking Budget: 0/i)).toBeVisible();
    
    // Adjust slider
    await slider.fill('4');
    await expect(page.getByText(/Thinking Budget: 4/i)).toBeVisible();
  });

  test('should accept query input', async ({ page }) => {
    await page.goto('/');
    
    const queryInput = page.getByPlaceholder(/banana, bowl, cup/i);
    await queryInput.fill('banana, cup');
    
    await expect(queryInput).toHaveValue('banana, cup');
  });

  test('should display stats panel', async ({ page }) => {
    await page.goto('/');
    
    // Check for stats
    await expect(page.getByText(/Latency/i)).toBeVisible();
    await expect(page.getByText(/FPS/i)).toBeVisible();
    await expect(page.getByText(/Est. Cost/i)).toBeVisible();
  });

  test('should have Live API controls', async ({ page }) => {
    await page.goto('/');
    
    // Check for Live API button
    const liveButton = page.getByRole('button', { name: /Start Live Session/i });
    await expect(liveButton).toBeVisible();
  });

  test('should display privacy notice', async ({ page }) => {
    await page.goto('/');
    
    // Check privacy banner
    await expect(page.getByText(/Privacy & Consent/i)).toBeVisible();
    await expect(page.getByText(/Camera is active/i)).toBeVisible();
  });

  test('should use quick presets', async ({ page }) => {
    await page.goto('/');
    
    const queryInput = page.getByPlaceholder(/banana, bowl, cup/i);
    
    // Click Kitchen Items preset
    await page.getByRole('button', { name: 'Kitchen Items' }).click();
    await expect(queryInput).toHaveValue('banana, bowl, cup');
    
    // Click Clear preset
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(queryInput).toHaveValue('');
  });

  test.describe('Camera Emulation', () => {
    test('should emulate camera and show video feed', async ({ page }) => {
      // Create a fake video stream using canvas
      await page.goto('/');
      
      // Check if camera on indicator appears (may take a moment)
      await page.waitForTimeout(2000);
      
      // Look for video element
      const video = page.locator('video');
      await expect(video).toBeVisible();
    });

    test('should handle camera permission gracefully', async ({ page, context }) => {
      // Revoke permissions to test error handling
      await context.clearPermissions();
      
      await page.goto('/');
      
      // Page should still load without crashing
      await expect(page.getByRole('heading', { name: /Gemini Robotics Live/i })).toBeVisible();
    });
  });

  test.describe('Backend Integration', () => {
    test('should connect to backend health endpoint', async ({ page }) => {
      const response = await page.request.get('http://localhost:5050/health');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
    });

    test('should fetch live token', async ({ page }) => {
      const response = await page.request.post('http://localhost:5050/api/live/token', {
        data: {},
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('expireTime');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      await expect(page.getByRole('heading', { name: /Gemini Robotics Live/i })).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      await expect(page.getByRole('heading', { name: /Gemini Robotics Live/i })).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible form controls', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper labels
      await expect(page.getByText(/Detection Mode/i)).toBeVisible();
      await expect(page.getByText(/Thinking Budget/i)).toBeVisible();
      await expect(page.getByText(/Object Queries/i)).toBeVisible();
    });
  });
});