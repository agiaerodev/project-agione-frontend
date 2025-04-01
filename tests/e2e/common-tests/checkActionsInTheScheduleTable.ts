export const checkActionsInTheScheduleTable = async (page, expect) => {
    await page.getByRole('button', { name: 'Scheduler' }).click();
    await expect(page.locator('#titleCrudTable')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to schedule' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
    await expect(page.locator('#crudIndexViewAction')).toBeVisible();
    await expect(page.locator('#filter-button-crud')).toBeVisible();
    await expect(page.locator('#refresh-button-crud')).toBeVisible();
    await expect(page.getByLabel('Customer')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filters:' })).toBeVisible();
}