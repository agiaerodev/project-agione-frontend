export const deleteWorkOrder = async (page, expect) => {
    await page.locator('a').filter({ hasText: 'Delete' }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByText('Are you sure, you want to')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('Record NOT deleted')).not.toBeVisible();

    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');
}