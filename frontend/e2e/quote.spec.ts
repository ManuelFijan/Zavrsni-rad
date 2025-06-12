import {test, expect} from '@playwright/test';
import {LoginPage} from './pages';
import {TEST_USER} from './helpers/test-helpers';

const testProject = {
    name: `Projekt za ponudu ${Date.now()}`,
    address: 'Testna adresa 123',
    status: 'Aktivan',
    notes: 'Bilješke za testni projekt.'
};

const testQuoteData = {
    productName: 'Usluga transporta materijala',
    quantity: '5',
    discount: '10',
    description: 'Ovo je testna ponuda kreirana automatskim testom.',
};


test.describe('Quotes/Offers Management', () => {

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USER.email, TEST_USER.password);

        await page.waitForURL('**/homepage');
        await page.getByRole('link', {name: 'Ponude'}).click();

        await expect(page.locator('h1:has-text("Ponude")')).toBeVisible();

        await expect(page.getByRole('status', {name: 'Učitavanje...'})).not.toBeVisible();
    });


    test('should filter quotes by project', async ({page}) => {
        const projectFilter = page.locator('#projectFilter');
        const projectOptionsCount = await projectFilter.locator('option').count();

        if (projectOptionsCount <= 2) {
            test.info().annotations.push({
                type: 'info',
                description: 'Skipping filter test: no projects with quotes exist.'
            });
            return;
        }

        const firstProjectOption = await projectFilter.locator('option').nth(2).innerText();
        await projectFilter.selectOption({index: 2});

        const quoteCards = page.locator('div.border:has-text("Ponuda ID:")');
        await expect(quoteCards.first()).toBeVisible();

        for (const card of await quoteCards.all()) {
            await expect(card).toContainText(`Projekt: ${firstProjectOption}`);
        }
    });

    test('should interact with an existing quote actions', async ({page}) => {
        const firstQuoteCard = page.locator('div.border:has-text("Ponuda ID:")').first();
        if (await firstQuoteCard.count() === 0) {
            test.info().annotations.push({
                type: 'info',
                description: 'Skipping action test: no quotes found on the page.'
            });
            return;
        }

        await firstQuoteCard.getByTitle('Pošalji ponudu emailom').click();
        await expect(page.locator('h2:has-text("Slanje ponude")')).toBeVisible();
        await page.getByRole('button', {name: 'Odustani'}).click();
        await expect(page.locator('h2:has-text("Slanje ponude")')).not.toBeVisible();

        const downloadPromise = page.waitForEvent('download');
        await firstQuoteCard.getByTitle('Preuzmi PDF').click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toContain('.pdf');
    });
});