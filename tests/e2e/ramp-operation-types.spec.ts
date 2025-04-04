import { test, expect } from '../shared-context'
import { deleteWorkOrder } from './common-tests'
import { config } from '../config'

const PATH = '/ramp/operation-types/index'

test.use({ baseURL: `${config.url}${PATH}` });

const openModal = async (page) => {
    await page.locator('tbody').locator('.q-tr.tw-bg-white').first().getByRole('button').nth(1).click();
    await page.locator('a').filter({ hasText: 'Edit' }).click();
}

test('Operation Types', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Operation name').click();
    await page.getByLabel('Operation name').fill('test operation');
    await page.getByLabel('Company Name').click();
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'null' }).click();
    await page.getByTestId('dynamicField-options').getByLabel('').press('Enter');
    await page.getByRole('treeitem', { name: '{ : value }' }).getByRole('textbox').fill('type');
    await page.getByRole('button', { name: 'value' }).click();
    await page.getByRole('treeitem', { name: '{ type : }' }).getByRole('textbox').fill('full');

    await page.getByRole('button', { name: 'Save' }).click();
});

test('Edit', async ({ page }) => {
    await openModal(page)
})

test('Delete', async ({ page }) => {
    const tr = page.locator('tbody').locator('.q-tr.tw-bg-white').first();
    await expect(tr).toBeVisible({ timeout: 60000 });
    const id: any = await tr.locator('td').nth(2).textContent()
    await tr.getByRole('button').nth(1).click();
    await deleteWorkOrder(page, expect);
    await expect(page.locator('table').getByText(id)).toBeHidden({ timeout: 60000 });
})