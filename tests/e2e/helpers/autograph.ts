export const autograph = async (page, id) => {
    await page.getByTestId(id).locator('canvas').click({
        position: {
            x: 209,
            y: 45
        }
    });
    await page.getByTestId(id).locator('canvas').click({
        position: {
            x: 259,
            y: 45
        }
    });
    await page.getByTestId(id).locator('canvas').click({
        position: {
            x: 221,
            y: 68
        }
    });
    await page.getByTestId(id).locator('canvas').click({
        position: {
            x: 228,
            y: 74
        }
    });
    await page.getByTestId(id).locator('canvas').click({
        position: {
            x: 239,
            y: 75
        }
    });
    await page.getByTestId(id).locator('canvas').click({
        position: {
            x: 248,
            y: 63
        }
    });
}