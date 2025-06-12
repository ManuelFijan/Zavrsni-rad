import {test, expect} from '@playwright/test';
import {LoginPage} from './pages';
import {TestHelpers, TEST_USER} from './helpers/test-helpers';

const testProduct = {
    name: `Testni Proizvod ${Date.now()}`,
    category: 'GRAĐEVINSKI_MATERIJAL',
    price: '123.45',
    measureUnit: 'KOM',
    description: 'Ovo je opis testnog proizvoda.',
};

const updatedProduct = {
    name: `Ažurirani Proizvod ${Date.now()}`,
    price: '99.99',
    description: 'Ovo je ažurirani opis.',
}

test.describe('Product Management Page', () => {

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USER.email, TEST_USER.password);

        await page.waitForURL('**/homepage');
        await page.getByRole('link', {name: 'Baza proizvoda'}).click();

        await expect(page.locator('h2')).toContainText('Baza proizvoda');
    });

    test('should display the products page UI correctly', async ({page}) => {
        await expect(page.locator('h2:has-text("Baza proizvoda")')).toBeVisible();
        await expect(page.getByPlaceholder('Pretraži proizvode...')).toBeVisible();
        await expect(page.getByRole('button', {name: 'Dodaj novi proizvod'})).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('should open and validate the "Add Product" modal', async ({page}) => {
        await page.getByRole('button', {name: 'Dodaj novi proizvod'}).click();

        await expect(page.locator('h3:has-text("Dodaj novi proizvod")')).toBeVisible();

        await page.getByRole('button', {name: 'Dodaj proizvod'}).click();

        const nameInput = page.locator('input[name="name"]');
        const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toContain('Please fill out this field');
    });

    test('should successfully create, edit, and verify a new product', async ({page}) => {
        await page.getByRole('button', {name: 'Dodaj novi proizvod'}).click();

        await page.locator('input[name="name"]').fill(testProduct.name);
        await page.locator('select[name="category"]').selectOption({label: 'Građevinski materijal'});
        await page.locator('input[name="price"]').fill(testProduct.price);
        await page.locator('select[name="measureUnit"]').selectOption({label: 'kom'});
        await page.locator('textarea[name="description"]').fill(testProduct.description);

        await page.getByRole('button', {name: 'Dodaj proizvod'}).click();

        const row = page.locator(`tr:has-text("${testProduct.name}")`);
        await expect(row).toBeVisible();

        await expect(row).toContainText(testProduct.name);
        await expect(row).toContainText('Građevinski materijal');

        await row.getByRole('button', {name: 'Uredi'}).click();

        await expect(page.locator('h3:has-text("Uredi proizvod")')).toBeVisible();
        await expect(page.locator('#edit-name')).toHaveValue(testProduct.name);

        await page.locator('#edit-name').fill(updatedProduct.name);
        await page.locator('#edit-price').fill(updatedProduct.price);
        await page.locator('#edit-description').fill(updatedProduct.description);

        await page.getByRole('button', {name: 'Spremi promjene'}).click();

        const updatedRow = page.locator(`tr:has-text("${updatedProduct.name}")`);
        await expect(updatedRow).toBeVisible();

        await expect(updatedRow).toContainText(updatedProduct.price);
        await expect(updatedRow).toContainText(updatedProduct.description);

        await expect(page.locator(`tr:has-text("${testProduct.name}")`)).not.toBeVisible();
    });

    test('should show an error when creating a duplicate product', async ({page}) => {
        await page.getByRole('button', {name: 'Dodaj novi proizvod'}).click();
        await page.locator('input[name="name"]').fill(testProduct.name);
        await page.locator('select[name="category"]').selectOption({label: 'Usluga'});
        await page.locator('input[name="price"]').fill('100');
        await page.locator('textarea[name="description"]').fill('desc');
        await page.getByRole('button', {name: 'Dodaj proizvod'}).click();
        await expect(page.locator(`tr:has-text("${testProduct.name}")`)).toBeVisible();

        await page.getByRole('button', {name: 'Dodaj novi proizvod'}).click();
        await page.locator('input[name="name"]').fill(testProduct.name);
        await page.locator('select[name="category"]').selectOption({label: 'Usluga'});
        await page.locator('input[name="price"]').fill('100');
        await page.locator('textarea[name="description"]').fill('desc');
        await page.getByRole('button', {name: 'Dodaj proizvod'}).click();

        await expect(page.locator('div[role="alert"]')).toBeVisible();
        await expect(page.locator('div[role="alert"]')).toContainText('Ovaj proizvod već postoji');
    });

    test('should filter products using the search bar', async ({page}) => {
        const productNameToSearch = "Cement";
        await page.getByPlaceholder('Pretraži proizvode...').fill(productNameToSearch);


        const rows = page.locator('tbody tr');
        await expect(rows).toHaveCount(1);

        await expect(page.locator(`tr:has-text("${productNameToSearch}")`)).toBeVisible();
    });

    test('should paginate through product list', async ({page}) => {

        const paginationControls = page.locator('div > span:has-text("/")').first().locator('..');

        const nextButton = paginationControls.getByRole('button').last();
        const prevButton = paginationControls.getByRole('button').first();

        const isNextDisabled = await nextButton.isDisabled();

        if (isNextDisabled) {
            test.info().annotations.push({
                type: 'info',
                description: 'Skipping pagination test: not enough products for multiple pages.'
            });
            return;
        }

        await expect(paginationControls.locator('span')).toContainText('1 /');

        await nextButton.click();
        await expect(paginationControls.locator('span')).toContainText('2 /');

        await prevButton.click();
        await expect(paginationControls.locator('span')).toContainText('1 /');
    });
});