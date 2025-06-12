import {test, expect} from '@playwright/test';
import {LoginPage} from './pages';
import {TEST_USER} from './helpers/test-helpers';

const updatedProfileData = {
    firstName: `Pero-${Date.now()}`,
    lastName: 'Peric',
    primaryAreaOfWork: 'KERAMIKA',
};

test.describe('User Profile Page', () => {

    test.beforeEach(async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USER.email, TEST_USER.password);

        await page.waitForURL('**/homepage');

        await page.getByRole('button', {name: 'Open user menu'}).click();

        await page.getByRole('menuitem', {name: 'Vaš profil'}).click();

        await expect(page.locator('h2')).toContainText('Moj profil');
    });

    test('should display existing user information in the form', async ({page}) => {
        await expect(page.locator('#firstName')).not.toBeEmpty();

        await expect(page.locator('#lastName')).not.toBeEmpty();
        await expect(page.locator('#email')).not.toBeEmpty();
        await expect(page.locator('#primaryAreaOfWork')).not.toBeEmpty();
    });

    test('should show the email field as disabled and read-only', async ({page}) => {
        const emailInput = page.locator('#email');
        await expect(emailInput).toBeDisabled();
        await expect(emailInput).toHaveAttribute('readonly', '');
    });

    test('should successfully update user profile information', async ({page}) => {
        await expect(page.locator('#firstName')).not.toBeEmpty();

        await page.locator('#firstName').fill(updatedProfileData.firstName);
        await page.locator('#lastName').fill(updatedProfileData.lastName);
        await page.locator('#primaryAreaOfWork').selectOption({label: 'Keramika'});

        await page.getByRole('button', {name: 'Ažuriraj profil'}).click();

        await expect(page.locator('div[role="status"]')).toBeVisible();
        await expect(page.locator('div[role="status"]')).toContainText('Podaci su uspješno ažurirani.');

        await page.reload();

        await expect(page.locator('#firstName')).toHaveValue(updatedProfileData.firstName);
        await expect(page.locator('#lastName')).toHaveValue(updatedProfileData.lastName);
        await expect(page.locator('#primaryAreaOfWork')).toHaveValue(updatedProfileData.primaryAreaOfWork);
    });

    test('should navigate back to the homepage when "Nazad" is clicked', async ({page}) => {
        await page.getByRole('button', {name: 'Nazad'}).click();
        await expect(page).toHaveURL(/.*homepage/);
    });
});
