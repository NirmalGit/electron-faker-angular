
import { test, expect } from '@playwright/test';

test.describe('Enterprise Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the root page before each test
    await page.goto('/');
  });

  test('should display correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/ElectronFakerAngular/i);
  });

  test('should show sidebar with navigation links', async ({ page }) => {
    // Sidebar should be visible
    await expect(page.locator('mat-sidenav')).toBeVisible();
    // Sidebar should have Dashboard and All Products links
    await expect(page.locator('mat-nav-list a', { hasText: 'Dashboard' })).toBeVisible();
    await expect(page.locator('mat-nav-list a', { hasText: 'All Products' })).toBeVisible();
  });

  test('should show dashboard header and product count', async ({ page }) => {
    // Dashboard header
    await expect(page.locator('h1')).toHaveText(/Product Dashboard/i);
    // Subtitle with product count (may be 0 if API is mocked)
    await expect(page.locator('.subtitle')).toContainText('Browse our collection');
  });

  test('should navigate to All Products and show product list', async ({ page }) => {
    // Click All Products link
    await page.locator('mat-nav-list a', { hasText: 'All Products' }).click();
    // Wait for navigation
    await expect(page).toHaveURL(/\/products/);
    // Product list header
    await expect(page.locator('h1')).toHaveText(/All Products/i);
    // Search field should be present
    await expect(page.locator('input[placeholder="Search by name, description..."]')).toBeVisible();
  });

  test('should show error or loading state gracefully', async ({ page }) => {
    // These selectors should exist even if no products are loaded
    await expect(page.locator('app-loading-spinner, app-error-message')).toBeVisible({ timeout: 5000 });
  });
});
