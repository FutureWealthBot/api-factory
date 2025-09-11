import { test, expect } from '@playwright/test';

test('mobile toggle opens and auto-closes after navigation', async ({ page }) => {
  // use ADMIN_BASE_URL when set (used in CI)
  const base = process.env.ADMIN_BASE_URL || 'http://localhost:5173';
  await page.goto(base + '/');

  // set viewport narrow to simulate mobile
  await page.setViewportSize({ width: 375, height: 812 });

  // expect topbar toggle is visible
  const toggle = page.locator('button[aria-label="Toggle menu"]');
  await expect(toggle).toBeVisible();

  // open sidebar
  await toggle.click();

  // ensure sidebar becomes visible (avoid animation/race)
  const sidebar = page.locator('.left-col');
  await expect(sidebar).toBeVisible();

  // click Cyber Fortress link
  await page.locator('a.sidebar-link', { hasText: 'Cyber Fortress' }).click();

  // after navigation, sidebar should not be visible
  await expect(sidebar).toBeHidden();

  // and the fortress page should be visible
  await expect(page).toHaveURL(/\/fortress/);
  await expect(page.locator('h1')).toContainText('Fortress');

  // navigate to fortress and check Security Scan widget
  await page.goto(base + '/fortress');
  await expect(page.locator('text=Security Scan')).toBeVisible();
});
