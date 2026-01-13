import moment  from "moment-timezone";

export const editScheduleInTable = async (page, expect) => {
    await expect(page.getByText('Update scheduler Id:')).toBeVisible();
    await page.getByLabel('Airlines').click();
    await page.getByLabel('Airlines').fill('canada');
    await page.getByRole('option', { name: 'Air Canada', exact: true }).click();
    await page.locator('#masterModalContent div').filter({ hasText: 'Update scheduler Id:' }).first().click();
    await page.getByLabel('Aircraft types').click();
    await page.getByLabel('Aircraft types').fill('74N');
    await page.getByRole('option', { name: '74N' }).click();
    await page.locator('#masterModalContent div').filter({ hasText: 'Update scheduler Id:' }).first().click();
    await page.getByLabel('*Flight number').click();
    await page.getByLabel('*Flight number').fill('TEST-03');
    await page.getByLabel('* Inbound Schedule Arrival').click();
    await page.getByLabel('* Inbound Schedule Arrival').fill(moment().add(20, 'minutes').format('HH:mm'));
    await page.getByLabel('*Outbound Flight Number').click();
    await page.getByLabel('*Outbound Flight Number').fill('850');
    await page.getByLabel('*Outbound Schedule Departure').click();
    await page.getByLabel('*Outbound Schedule Departure').fill(moment().add(2, 'hour').format('HH:mm'));
    await page.getByLabel('Dep. +Days').click();
    await page.getByLabel('Dep. +Days').fill('8');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('#masterModalContent #innerLoadingMaster circle')).toBeVisible();
    await page.locator('#masterModalContent #innerLoadingMaster circle').waitFor({ state: 'hidden'});
    await expect(page.locator('#masterModalContent div').filter({ hasText: 'Update scheduler Id:' }).first()).toBeHidden();
}