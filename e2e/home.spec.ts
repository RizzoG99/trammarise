import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Trammarise/);
});

test('renders upload area', async ({ page }) => {
  await page.goto('/');

  // Expect the upload area to be visible
  await expect(page.locator('text=Upload Audio')).toBeVisible();
});
