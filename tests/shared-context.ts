import { test as base } from '@playwright/test';
import { login } from './login';

export const test = base.extend({
    context: async ({ context, baseURL }, use) => {
        const page = await context.newPage();
        if (baseURL) {
            await page.goto(baseURL);
            await login(page)
        }

        await use(context);
    },
    page: async ({ page, baseURL }, use) => {
        if (baseURL) await page.goto(baseURL);
        await use(page);
        await page.close();
    },
})

export { expect } from '@playwright/test';