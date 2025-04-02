import { test, expect } from '../shared-context'
import moment from 'moment-timezone'
import { 
    deleteWorkOrder, 
    checkActionsAndTextsInTheSchedule,
    checkTheSwitchToTheWeeklyView,
    checkTheSwitchToTheDailyView,
    deleteSchedule,
    createScheduleInTable,
    editScheduleInTable,
    checkFilterFieldsInTheSchedule,
    checkTheExportActionInTheSchedule,
    checkActionsInTheScheduleTable,
} from './common-tests'

const URL = 'http://localhost:8080/#/ramp/schedule/index'

const selectStation = async (page) => {
    await page.getByLabel('Station').click();
    await page.getByLabel('Station').fill('atlanta');
    await page.getByRole('option', { name: 'Atlanta (ATL)' }).click();
    await expect(page.getByRole('button', { name: 'filters' })).toBeVisible();
    await page.getByRole('button', { name: 'filters' }).click();
}

const openModal = async (page) => {
    await page.locator('tbody').locator('.q-tr.tw-bg-white').first().getByRole('button').click();
    await page.locator('a').filter({ hasText: 'Edit' }).click();
}

test.use({ baseURL: URL });

test('Test the schedule modal for selecting the station', async ({ page }) => {
    await expect(page.locator('#masterModalContent')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Filter schedule')).toBeVisible();
    await expect(page.getByText('You must first select a')).toBeVisible();
    await expect(page.getByLabel('Station')).toBeVisible();

    await selectStation(page);

    await expect(page.locator('#masterModalContent')).toBeHidden();
    await expect(page.getByText('Filter schedule')).toBeHidden();
})
 
test('Test that the modal requesting the station triggers correctly', async ({ page }) => {
    await selectStation(page);

    await page.getByRole('button', { name: 'Scheduler' }).click();
    await page.getByRole('button', { name: 'Back to schedule' }).click();
    await expect(page.getByText('Filter schedule')).not.toBeVisible();
    
    await page.getByLabel('Collapse "Ramp"').click();
    await page.getByLabel('Expand "Ramp"').click();
    await page.locator('#menuItem-qrampadminworkOrders').click();
    await page.locator('#menuItem-qrampadminschedule').click();
    await expect(page.getByText('Filter schedule')).not.toBeVisible();
    
    await page.locator('#menuItem-qrampadminpassengerOperationTypes').click();
    await page.locator('#menuItem-qrampadminschedule').click();
    await expect(page.getByText('Filter schedule')).not.toBeVisible();
    
    await page.getByLabel('Expand "Passenger"').click();
    await page.locator('#menuItem-qrampadminpassengerSchedule').click();
    await expect(page.getByText('Filter schedule')).toBeVisible();
    await page.getByLabel('Station').click();
    await page.getByLabel('Station').fill('Austin, TX');
    await page.getByRole('option', { name: 'Austin, TX (AUS)' }).click();
    await page.getByRole('button', { name: 'filters' }).click();

    await page.getByLabel('Expand "Ramp"').click();
    await page.locator('#menuItem-qrampadminschedule').click();
    await expect(page.getByText('Filter schedule')).toBeVisible();
})

test('Verify the display of actions and text in the schedule', async ({ page }) => {
    await selectStation(page);
    await checkActionsAndTextsInTheSchedule(page, expect);
})

test('Verify the switch to week view', async ({ page }) => {
    await selectStation(page);
    await checkTheSwitchToTheWeeklyView(page, expect);
})

test('Verify the switch to day view', async ({ page }) => {
    await selectStation(page);
    await checkTheSwitchToTheDailyView(page, expect);
})

test.describe.serial('Testing the schedule CRUD', () => {
    test('Create schedule', async ({ page }) => {
        await selectStation(page);
    
        await page.locator('.tw-inline-flex > button').first().click();
        await page.getByLabel('*Flight number').click();
        await page.getByLabel('*Flight number').fill('TEST-00');
        await page.getByLabel('*Operation').click();
        await page.getByLabel('*Operation').fill('Full_turn');
        await page.getByText('Full_turn').click();
    
        await page.getByPlaceholder('HH:mm', { exact: true }).click();
        await page.getByPlaceholder('HH:mm', { exact: true }).fill('14:05');
        await page.getByPlaceholder('MM/DD/YYYY HH:mm').click();
        await page.getByPlaceholder('MM/DD/YYYY HH:mm').fill(moment().format('MM/DD/YYYY HH:mm'));
        await page.getByLabel('Flight Status').click();
        await page.getByRole('option', { name: 'Arrived' }).click();
        await page.getByLabel('Aircraft types').click();
        await page.getByLabel('Aircraft types').fill('A20N');
        await page.getByRole('option', { name: 'A20N' }).locator('div').nth(1).click();
    
        await page.locator('.tw-border > .tw-space-x-2').getByRole('button').nth(0).click();
        await expect(page.getByText('TEST-00/TEST-00')).toBeVisible();
    })
    
    test('Edit schedule', async ({ page }) => {
        await selectStation(page);
    
        await expect(page.locator('#kanban-card-actions').nth(2)).toBeVisible();
        await page.locator('#kanban-card-actions').nth(2).click();
    
        await page.getByTestId('dynamicField-inboundFlightNumber').getByRole('button').click();
        await page.getByLabel('*Flight number').fill('TEST-01');
        await page.getByTestId('dynamicField-operationTypeId').getByRole('button')   .click();
        await page.getByLabel('*Operation').fill('Half_turn_Inbound');
        await page.getByRole('option', { name: 'Half_turn_Inbound' }).click();
        await page.locator('label').filter({ hasText: 'ArrivedFlight Status' }).getByRole('button').click();
        await page.locator('label').filter({ hasText: 'Flight Status' }).locator('i').click();
        await page.getByRole('option', { name: 'Scheduled' }).click();
        await page.locator('label').filter({ hasText: 'Aircraft types' }).locator('i').click();
        await page.getByRole('option').first().click();
    
        await page.locator('.tw-border > .tw-space-x-2').getByRole('button').nth(0).click();
        await expect(page.getByText('TEST-01')).toBeVisible();
    })
    
    test('Delete schedule', async ({ page }) => {
        await selectStation(page);
        await page.locator('#kanban-card-actions').nth(3).click();
        await deleteSchedule(page, expect);
    })
})


test.describe('Testing the actions', () => {
    test('Testing the filters', async ({ page }) => {
        await selectStation(page);
        await checkFilterFieldsInTheSchedule(page, expect);
    })
    
    // test('Testing the "Copy Tiny URL" action', async ({ page }) => {
    //     await selectStation(page);
        
    //     await page.waitForSelector('svg', { state: 'hidden' })
    //     await expect(page.locator('.actions-content > div > .q-btn').first()).toBeVisible();
    //     await page.locator('.actions-content > div > .q-btn').first().click();
    //     await expect(page.getByText('Tiny URL copied!')).toBeVisible();
    // })
    
    test('Testing the "Export" actions', async ({ page }) => {
        await selectStation(page);
        await checkTheExportActionInTheSchedule(page, expect);
    })

    test('Testing the "Scheduler" action', async ({ page }) => {
        await selectStation(page);
        await checkActionsInTheScheduleTable(page, expect);
    })
})

test.describe.serial('Test el CRUD de schedule', () => {
    test('Crear un schedule desde la tabla de schedule', async ({ page }) => {
        await selectStation(page);
        await createScheduleInTable(page, expect);
    })

    test('Editar un schedule desde la tabla de schedule', async ({ page }) => {
        await selectStation(page);
        
        await page.getByRole('button', { name: 'Scheduler' }).click();
        await openModal(page);
        await editScheduleInTable(page, expect);
    })

    test('Delete a schedule from the schedule table', async ({ page }) => {
        await selectStation(page);
        await page.getByRole('button', { name: 'Scheduler' }).click();
        const tr = page.locator('tbody').locator('.q-tr.tw-bg-white').first();
        await expect(tr).toBeVisible({ timeout: 60000 });
        const id: any = await tr.locator('td').nth(0).textContent()
        await tr.getByRole('button').click();
        await deleteWorkOrder(page, expect);
        await expect(page.locator('table').getByText(id)).toBeHidden({ timeout: 60000 });
    })
})
