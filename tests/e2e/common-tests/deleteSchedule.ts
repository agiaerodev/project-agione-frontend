export const deleteSchedule = async (page, expect) => {
    await expect(page.locator('#cardContent').getByText('TEST-01')).toBeVisible();
    await expect(page.getByText('Are you sure, you want to')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('workOrders was deleted')).toBeVisible();
}