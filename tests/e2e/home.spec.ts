import { test, expect } from '../shared-context'
import { config } from '../config'

test.use({ baseURL: config.url });

test('Testing the visibility of dashboard filters', async ({ page }) => {
    await page.locator('.actions-content').locator('#filter-button-crud').click();

    await expect(page.getByRole('textbox', { name: 'Scheduled date' }).nth(1)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Comparison date' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Customer' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Contract' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Station' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Ad Hoc' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Operation Type' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Work Order Types' })).toBeVisible();
});
