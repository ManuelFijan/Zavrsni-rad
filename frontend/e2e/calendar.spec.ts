import {test, expect} from '@playwright/test';
import {LoginPage} from './pages';
import {TEST_USER} from './helpers/test-helpers';

const testEvent = {
    title: `Sastanak za testiranje ${Date.now()}`,
    quoteId: "Ponuda #1",
};

test.describe('Calendar Page Management', () => {

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USER.email, TEST_USER.password);

        await page.waitForURL('**/homepage');
        await page.getByRole('link', {name: 'Kalendar'}).click();

        await expect(page.getByRole('button', {name: 'Danas'})).toBeVisible();
    });

    test('should display the calendar UI and allow view switching', async ({page}) => {
        await expect(page.getByRole('button', {name: 'Danas'})).toBeVisible();
        await expect(page.getByRole('heading', {level: 2})).toBeVisible();

        await page.getByRole('button', {name: 'Tjedan', exact: true}).click();
        await expect(page.getByRole('heading', {name: /Pregled tjedna/i})).toBeVisible();

        await page.getByRole('button', {name: 'Dan', exact: true}).click();
        await expect(page.getByRole('heading', {name: /Pregled dana/i})).toBeVisible();

        await page.getByRole('button', {name: 'Mjesec', exact: true}).click();
        await expect(page.getByRole('heading', {name: /Pregled mjeseca/i})).toBeVisible();
    });

    test('should allow navigation through months, weeks, and days', async ({page}) => {
        const initialMonthHeading = await page.getByRole('heading', {level: 2}).innerText();

        await page.getByRole('button', {name: 'Next'}).click();
        await expect(page.getByRole('heading', {level: 2})).not.toHaveText(initialMonthHeading);

        await page.getByRole('button', {name: 'Previous'}).click();
        await expect(page.getByRole('heading', {level: 2})).toHaveText(initialMonthHeading);

        await page.getByRole('button', {name: 'Tjedan', exact: true}).click();
        const initialWeekHeading = await page.getByRole('heading', {level: 2}).innerText();

        await page.getByRole('button', {name: 'Next'}).click();
        await expect(page.getByRole('heading', {level: 2})).not.toHaveText(initialWeekHeading);

        await page.getByRole('button', {name: 'Dan', exact: true}).click();
        const initialDayHeading = await page.getByRole('heading', {level: 2}).innerText();

        await page.getByRole('button', {name: 'Next'}).click();
        await expect(page.getByRole('heading', {level: 2})).not.toHaveText(initialDayHeading);

        await page.getByRole('button', {name: 'Danas'}).click();
        await expect(page.getByRole('heading', {level: 2})).not.toHaveText(initialDayHeading);
    });

    test('should create and delete a new event', async ({page}) => {
        await page.getByPlaceholder('Opis događaja').fill(testEvent.title);
        await page.getByRole('button', {name: 'Dodaj'}).click();

        const newEventLocator = page.getByTitle(testEvent.title);
        await expect(newEventLocator).toBeVisible();

        await newEventLocator.locator('..').getByRole('button').click();

        await expect(page.getByRole('heading', {name: 'Potvrda brisanja'})).toBeVisible();
        await page.getByRole('button', {name: 'Obriši'}).click();

        await expect(newEventLocator).not.toBeVisible();
    });

    test('should create a new event linked to a quote', async ({page}) => {
        const quoteSelect = page.getByRole('combobox').first();
        const quoteOptionsCount = await quoteSelect.locator('option').count();
        if (quoteOptionsCount <= 1) {
            test.info().annotations.push({type: 'info', description: 'Skipping test: no quotes available to link.'});
            return;
        }

        await page.getByPlaceholder('Opis događaja').fill(testEvent.title);
        const selectedQuoteOption = quoteSelect.locator('option').nth(1);
        const quoteId = await selectedQuoteOption.getAttribute('value');
        await quoteSelect.selectOption({index: 1});

        await page.getByRole('button', {name: 'Dodaj'}).click();

        const newEventLocator = page.getByTitle(`${testEvent.title} (Ponuda #${quoteId})`);
        await expect(newEventLocator).toBeVisible();
        await expect(newEventLocator).toContainText(`(P #${quoteId})`);
    });

});