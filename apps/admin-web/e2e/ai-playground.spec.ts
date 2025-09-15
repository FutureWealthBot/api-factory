import { test, expect } from '@playwright/test';

const base = process.env.ADMIN_BASE_URL || 'http://localhost:5173';

test('AI playground sync mode returns generated text', async ({ page }) => {
  await page.goto(base + '/fortress');
  await page.fill('textarea[name="ai-input"]', 'Test famous quote');
  await page.click('button:has-text("Run (sync)")');
  await expect(page.locator('[data-testid="ai-output"]')).toContainText('Mock answer', { timeout: 5000 });
});
