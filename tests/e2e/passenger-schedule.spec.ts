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
    checkActionsInTheScheduleTable,
} from './common-tests'
import { config } from '../config'

const PATH = '/passenger/schedule/index'

test.use({ baseURL: `${config.url}${PATH}` });

const selectStation = async (page) => {
    await page.getByLabel('Station').click();
    await page.getByRole('option').first().click();
    await expect(page.getByRole('button', { name: 'filters' })).toBeVisible();
    await page.getByRole('button', { name: 'filters' }).click();
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('load')
    await page.waitForLoadState('domcontentloaded')
}

const openModal = async (page) => {
    await page.locator('tbody').locator('.q-tr.tw-bg-white').first().getByRole('button').click();
    await page.locator('a').filter({ hasText: 'Edit' }).click();
}

test('Testing the station selection modal in the "schedule"', async ({ page }) => {
    await expect(page.locator('#masterModalContent')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Filter schedule')).toBeVisible();
    await expect(page.getByText('You must first select a')).toBeVisible();
    await expect(page.getByLabel('Station')).toBeVisible();

    await selectStation(page);

    await expect(page.locator('#masterModalContent')).toBeHidden();
    await expect(page.getByText('Filter schedule')).toBeHidden();
})

test('Testing that the modal requesting the station is triggered correctly', async ({ page }) => {
    await selectStation(page);

    await page.getByRole('button', { name: 'Scheduler' }).click();
    await page.getByRole('button', { name: 'Back to schedule' }).click();
    await expect(page.getByText('Filter schedule')).not.toBeVisible();

    await page.getByLabel('Collapse "Passenger"').click();
    await page.getByLabel('Expand "Passenger"').click();
    await page.locator('#menuItem-qrampadminpassenger').click();
    await page.locator('#menuItem-qrampadminpassengerSchedule').click();
    await expect(page.getByText('Filter schedule')).not.toBeVisible();

    await page.locator('#menuItem-qrampadminoperationTypesPassenger').click();
    await page.locator('#menuItem-qrampadminpassengerSchedule').click();
    await expect(page.getByText('Filter schedule')).not.toBeVisible();

    await page.getByLabel('Expand "Ramp"').click();
    await page.locator('#menuItem-qrampadminschedule').click();
    await page.getByLabel('Station').click();
    await page.getByLabel('Station').fill('Chicago');
    await page.getByRole('option', { name: 'Chicago (ORD)' }).click();
    await page.getByRole('button', { name: 'filters' }).click();

    await page.getByLabel('Expand "Passenger"').click();
    await page.locator('#menuItem-qrampadminpassengerSchedule').click();
    await expect(page.getByText('Filter schedule')).toBeVisible();
})

test('Testing the visibility of actions and titles in the "schedule"', async ({ page }) => {
    await selectStation(page);
    await checkActionsAndTextsInTheSchedule(page, expect);
})

test('Testing changes from day to week and from week to day', async ({ page }) => {
    await selectStation(page);
    await checkTheSwitchToTheWeeklyView(page, expect);
    await checkTheSwitchToTheDailyView(page, expect);
})

test.describe.serial('Testing the schedule CRUD', () => {
    test('Testing to create a "Work Order" in Schedule', async ({ page }) => {
        await selectStation(page);

        await page.getByLabel('Expand', { exact: true }).nth(1).click();
        await page.getByText('Create Flight').click();
        await page.getByLabel('*Flight number').fill('TEST-00');

        await page.getByLabel('*Operation').fill('Ferry Originate');
        await page.getByRole('option', { name: 'Ferry Originate' }).click();

        await page.getByPlaceholder('HH:mm', { exact: true }).click();
        await page.getByPlaceholder('HH:mm', { exact: true }).fill(moment().format('HH:mm'));
        await page.getByPlaceholder('MM/DD/YYYY HH:mm').fill(moment().add(20, 'minute').format('MM/DD/YYYY HH:mm'));
        await page.getByLabel('Flight Status').click();
        await page.getByRole('option', { name: 'Departed' }).click();
        await page.getByLabel('Aircraft types').click();
        await page.getByRole('option').first().click();

        await page.locator('.tw-border > .tw-space-x-2').getByRole('button').nth(0).click();
        await expect(page.getByText('TEST-00/TEST-00')).toBeVisible({ timeout: 20000 });
    })

    test('Testing updating a "Work Order" in Schedule', async ({ page }) => {
        await selectStation(page);
        const actuaIn = moment().format('MM/DD/YYYY HH:mm');
        const actualOut = moment().add(1, 'days').format('MM/DD/YYYY HH:mm');

        await page.getByText('TEST-00/TEST-').click();
        await page.getByRole('combobox', { name: '*Customer' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('combobox', { name: 'Cancellation type' }).click();
        await page.getByRole('option', { name: 'Cancelled Flight', exact: true }).click();

        await page.getByRole('combobox', { name: '*A/C Type' }).click();
        await page.getByRole('option').first().click();

        await page.getByRole('spinbutton', { name: '*Cancellation Notice time' }).click();
        await page.getByRole('spinbutton', { name: '*Cancellation Notice time' }).fill('51');

        await page.getByTestId('dynamicField-inboundFlightNumber').getByLabel('*Flight number').click();
        await page.getByTestId('dynamicField-inboundFlightNumber').getByLabel('*Flight number').fill('TEST-01');

        await page.getByTestId('dynamicField-outboundFlightNumber').getByLabel('*Flight number').click();
        await page.getByTestId('dynamicField-outboundFlightNumber').getByLabel('*Flight number').fill('TEST-01');

        await page.getByLabel('Origin').click();
        await page.getByLabel('Origin').fill('acadiana');
        await page.getByRole('option', { name: 'Acadiana Rgnl (ARA)' }).click();

        await page.getByTestId('dynamicField-inboundTailNumber').getByLabel('Tail N°').click();
        await page.getByTestId('dynamicField-inboundTailNumber').getByLabel('Tail N°').fill('78');

        await page.getByLabel('Inbound Gate Arrival').click();
        await page.getByLabel('Inbound Gate Arrival').fill('18');

        await page.getByLabel('Destination').click();
        await page.getByLabel('Destination').fill('Almaty');
        await page.getByRole('option', { name: 'Almaty (ALA)' }).click();

        await page.getByText('Update Work Order Id:').click();
        await page.getByTestId('dynamicField-outboundTailNumber').getByLabel('Tail N°').click();
        await page.getByTestId('dynamicField-outboundTailNumber').getByLabel('Tail N°').fill('78');

        await page.getByLabel('Outbound Gate Departure').click();
        await page.getByLabel('Outbound Gate Departure').fill('19');

        // await page.getByTestId('dynamicField-inboundBlockIn').locator('input').click();
        // await page.getByTestId('dynamicField-inboundBlockIn').locator('input').fill(actuaIn);

        // await page.getByTestId('dynamicField-outboundBlockOut').locator('input').click();
        // await page.getByTestId('dynamicField-outboundBlockOut').locator('input').fill(actualOut);

        // const inboundBlockIn = page.getByTestId('dynamicField-inboundBlockIn');
        // const outboundBlockOut = page.getByTestId('dynamicField-outboundBlockOut');

        // const inboundBlockInLabel = await inboundBlockIn.locator('label').textContent();
        // const outboundBlockOutLabel = await outboundBlockOut.locator('label').textContent();

        // console.log({ inboundBlockInLabel, outboundBlockOutLabel });

        // if ((inboundBlockInLabel !== 'Time') && (outboundBlockOutLabel !== 'Time')) {
        //     await inboundBlockIn.locator('input').click();
        //     await inboundBlockIn.locator('input').fill(actuaIn);

        //     await outboundBlockOut.locator('input').click();
        //     await outboundBlockOut.locator('input').fill(actualOut);
        // }

        await page.locator('#stepComponent div').filter({ hasText: 'Services' }).nth(2).click();
        await page.getByText('Cargo Man Power').click();
        await page.locator('.fa-star').first().click();
        await page.locator('.tw-flex > div:nth-child(3) > .q-btn').first().click();
        await page.locator('div:nth-child(2) > div > div > #dynamicFieldComponent > div > .tw-flex > div:nth-child(3) > .q-btn').first().click();

        await page.locator('#stepComponent div').filter({ hasText: 'Delay' }).nth(2).click();
        await page.locator('div').filter({ hasText: /^Our delay$/ }).first().click();
        await page.getByRole('option', { name: 'No' }).click();

        await page.getByLabel('Delay Comment').click();
        await page.getByLabel('Delay Comment').fill('4');

        await page.getByLabel('Code').first().click();
        await page.getByLabel('Code').first().fill('AIRLINE');
        await page.getByRole('option').first().click();

        await page.getByLabel('Time', { exact: true }).first().click();
        await page.getByLabel('Time', { exact: true }).first().fill('24');

        await page.locator('#stepComponent div').filter({ hasText: 'Remark' }).nth(2).click();
        await page.getByLabel('Remark').click();
        await page.getByLabel('Remark').fill('Message');
        await page.getByLabel('Remark').press('Tab');
        await page.getByLabel('Safety Message').fill('Message');

        await page.getByRole('button', { name: 'Close' }).click();
        await page.locator('#innerLoadingMaster div').waitFor({ state: 'hidden' });

        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('load');
        await page.waitForLoadState('domcontentloaded');

        await expect(page.getByText('Record updated')).toBeVisible({ timeout: 20000 });
        await expect(page.getByText('TEST-01').first()).toBeVisible({ timeout: 10000 });
    })

    test('Testing to delete a "Work Order" in Schedule', async ({ page }) => {
        await selectStation(page);
        await page.getByTestId('kanbanDay').locator('div').filter({ hasText: 'TEST-01/TEST-01' }).locator('#kanban-card-actions').nth(2).click();
        await deleteSchedule(page, expect);
    })
})


test.describe('Testing the actions', () => {
    test('Testing the schedule filters', async ({ page }) => {
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

    test('Testing the sheduler view actions', async ({ page }) => {
        await selectStation(page);
        await checkActionsInTheScheduleTable(page, expect);
    })
})

test.describe.serial('Test el CRUD de schedule', () => {
    test('Testing create a Scheduler', async ({ page }) => {
        await selectStation(page);
        await createScheduleInTable(page, expect);
    })

    test('Testing updating a scheduler', async ({ page }) => {
        await selectStation(page);

        await page.getByRole('button', { name: 'Scheduler' }).click();
        await openModal(page);
        await editScheduleInTable(page, expect);
    })

    test('Testing the removal of a Scheduler', async ({ page }) => {
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
