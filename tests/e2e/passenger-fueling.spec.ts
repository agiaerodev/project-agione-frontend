import { test, expect } from '../shared-context'
import { deleteWorkOrder } from './common-tests'

const URL = 'http://localhost:8080/#/ramp/fueling/index'

const openModal = async (page) => {
    await page.locator('tbody').locator('.q-tr.tw-bg-white').first().getByRole('button').nth(1).click();
    await page.locator('a').filter({ hasText: 'Edit' }).click();
}

test.use({ baseURL: URL });

test('Passenger Fueling', async ({ page }) => {
    await expect(page.getByText('Fueling New')).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder('Search')).toBeVisible();
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
    await expect(page.locator('#filter-button-crud')).toBeVisible();
    await expect(page.locator('#refresh-button-crud')).toBeVisible();
    await expect(page.getByLabel('Customer')).toBeVisible();
    await expect(page.getByLabel('Contract')).toBeVisible();
    await expect(page.getByLabel('Status')).toBeVisible();
    await expect(page.getByLabel('Ad Hoc')).toBeVisible();

    const fields = [
        'ID',
        'Customer',
        'Contracts',
        'Ticket Number',
        'Registration Number',
        'Status',
        'Station',
        'Responsible',
        'Service date',
        'Created At',
        'Updated At',
        'Actions'
    ]

    for (let i = 0; i < fields.length; i++) {
        await expect(page.getByRole('cell', { name: fields[i], exact: true })).toBeVisible();
    }
});

test.describe.serial('CRUD', () => {
    test('Passenger Fueling - New', async ({ page }) => {
        await page.waitForLoadState('networkidle')
        await page.waitForLoadState('domcontentloaded')

        await page.getByRole('button', { name: 'New' }).click();
        await page.getByLabel('*Customer/Contract').click();
        await page.getByRole('option').first().click();
        await page.getByLabel('*Fueling ticket number').click();
        await page.getByLabel('*Fueling ticket number').fill('TEST-00');
        await page.getByLabel('Responsible').click();
        await page.getByLabel('Responsible').fill('ima');
        await page.getByRole('option', { name: 'Imagina Colombia' }).click();
        await page.getByLabel('*Station').click();
        // await page.getByLabel('*Station').fill('new jerse');
        await page.getByRole('option').first().click();
        await page.getByRole('button', { name: 'Save' }).click();
        
        await expect(page.locator('#masterModalContent div').filter({ hasText: 'Update fueling' }).first()).toBeVisible();
    });
    
    test('Passenger Fueling - Edit', async ({ page }) => {
        await page.waitForLoadState('networkidle')
        await page.waitForLoadState('domcontentloaded')
        
        await openModal(page);

        await page.waitForLoadState('networkidle')
    
        await page.getByLabel('*Customer/Contract').click();
        await page.getByLabel('*Customer/Contract').fill('AA corporation');
        await page.getByRole('option', { name: 'AA Corporation (Ad Hoc)' }).click();

        await page.locator('#masterModalContent div').filter({ hasText: 'Update fueling Id:' }).first().click();

        await page.getByLabel('*A/C Type').click();
        await page.getByRole('option').first().click();

        await page.getByLabel('*Carrier').click();
        await page.waitForLoadState('networkidle')
        await page.waitForLoadState('domcontentloaded')
        await page.waitForLoadState('load')
        await page.waitForTimeout(1000)
        await page.getByRole('option').nth(2).click();

        await page.locator('#masterModalContent div').filter({ hasText: 'Update fueling Id:' }).first().click();
        
        await page.getByLabel('Aircraft Registration').click();
        await page.getByLabel('Aircraft Registration').fill('545218');
        
        await page.locator('#stepComponent div').filter({ hasText: 'Services' }).nth(2).click();
        await page.getByRole('list').getByText('Services').click();
        await page.locator('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        await page.locator('div:nth-child(2) > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn').first().click();
        await expect(page.locator('section').locator('button').nth(1)).toBeVisible();
        await page.locator('#stepComponent div').filter({ hasText: 'Remark' }).nth(2).click();

        await page.getByLabel('Remark').click();
        await page.getByLabel('Remark').fill('Message test');

        await page.getByLabel('Safety Message').click();
        await page.getByLabel('Safety Message').fill('Message test');
        
        await page.getByRole('button', { name: 'Close Flight' }).click();
        await page.locator('#masterModalContent div').filter({ hasText: 'Update fueling Id:' }).first().waitFor({ state: 'hidden' });
        await expect(page.getByText('Record updated')).toBeVisible();
    });

    test('Test actions', async ({ page }) => {
        const actions = [
            // {
            //     action: 'Close Flight',
            //     status: 'Closed'
            // }, 
            {
                action: 'Submit',
                status: 'Submitted'
            },
            {
                action: 'Post',
                status: 'Submitted(Posting)'
            },
            {
                action: 'Reload Transactions',
                status: 'Submitted(Posting)'
            }
        ]

        const tr = page.locator('tbody').locator('.q-tr.tw-bg-white').first()
        const td = tr.locator('td').nth(7)

        // for (const action of actions) {
            // await tr.getByRole('button').nth(1).click();
            // await page.waitForLoadState('networkidle')
            // await page.waitForLoadState('domcontentloaded')
            // console.log('action', actions[0].action)
            // await page.locator('a').filter({ hasText: actions[0].action }).click();
            // await page.waitForLoadState('networkidle')
            // await expect(page.getByText('The change was successful,')).toBeVisible({ timeout: 10000 });
            // await expect(td).toHaveText(actions[0].status)
        // }

        for (const action of actions) {
            await tr.getByRole('button').nth(1).click();
            await page.waitForLoadState('networkidle')
            await page.waitForLoadState('domcontentloaded')
            console.log('action', action.action)
            await page.locator('a').filter({ hasText: action.action }).click();
            await page.waitForLoadState('networkidle')
            await expect(page.getByText('The change was successful,')).toBeVisible({ timeout: 10000 });
            await expect(td).toHaveText(action.status)
        }
    });
    
    test('Passenger Fueling - Delete', async ({ page }) => {
        const tr = page.locator('tbody').locator('.q-tr.tw-bg-white').first();
        await expect(tr).toBeVisible({ timeout: 60000 });
        const id: any = await tr.locator('td').nth(2).textContent()
        await tr.getByRole('button').nth(1).click();
        await deleteWorkOrder(page, expect);
        await expect(page.locator('table').getByText(id)).toBeHidden({ timeout: 60000 });
    });
})
