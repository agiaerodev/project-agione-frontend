export const checkFilterFieldsInTheSchedule = async (page, expect) => {
    await page.locator('#filter-button-crud').click();
    await expect(page.getByText('Filters', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Day', exact: true })).toBeVisible();
    await expect(page.locator('.q-date__view').first()).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by time' })).toBeVisible();
    await expect(page.getByLabel('Customer')).toBeVisible();
    await expect(page.getByLabel('Carrier')).toBeVisible();
    await expect(page.getByLabel('Station')).toBeVisible();
    await expect(page.getByLabel('Status', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Work Order Types')).toBeVisible();
    await expect(page.getByLabel('Operation type')).toBeVisible();
    await expect(page.getByLabel('Flight Status')).toBeVisible();
    await expect(page.getByLabel('Ad Hoc')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();

    await page.locator('.q-drawer__content > div > i').click();
    await expect(page.getByText('Filters', { exact: true })).toBeHidden();
}