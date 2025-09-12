import { test, expect } from '@playwright/test';

const base = process.env.ADMIN_BASE_URL || 'http://localhost:5173';

test.describe('Retirement Planner E2E', () => {
  test('should render form, submit, and show results', async ({ page }) => {
    await page.goto(base + '/retirement-planner');
    await expect(page.locator('h1')).toHaveText(/Retirement Planner/i);

    // Fill out the form fields (adjust selectors as needed)
    await page.fill('input[name="age"]', '40');
    await page.fill('input[name="income"]', '100000');
    await page.fill('input[name="savings"]', '50000');
    await page.fill('input[name="retirementAge"]', '65');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for results (adjust selector/text as needed)
    await expect(page.locator('.result, .results, [data-testid="results"]')).toContainText(/Estimated Retirement/i, { timeout: 5000 });
  });
});
