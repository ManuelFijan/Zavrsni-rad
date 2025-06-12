import {test, expect} from '@playwright/test';
import {LoginPage, RegisterPage} from './pages';
import {TestHelpers, TEST_USER} from './helpers/test-helpers';

test.describe('Authentication', () => {
    test.beforeEach(async ({page}) => {
        await page.context().clearCookies();
        await page.goto('/');
    });

    test('should display landing page correctly', async ({page}) => {
        await expect(page).toHaveURL('/');
        await expect(page.locator('h1')).toContainText('Ponude koje čvrsto stoje');
        await expect(page.locator('button:has-text("Prijava")')).toBeVisible();
        await expect(page.locator('button:has-text("Registracija")')).toBeVisible();
    });

    test('should navigate to login page', async ({page}) => {
        await page.click('button:has-text("Prijava")');
        await expect(page).toHaveURL('/sign-in');
        await expect(page.locator('h2')).toContainText('Prijavite se u svoj račun');
    });

    test('should navigate to register page', async ({page}) => {
        await page.click('button:has-text("Registracija")');
        await expect(page).toHaveURL('/register');
        await expect(page.locator('h2')).toContainText('Registrirajte se');
    });

    test('should show error on invalid login', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.login('invalid@email.com', 'wrongpassword');

        const errorElement = page.locator('div.my-4.rounded.bg-red-100.border.border-red-300.text-red-700');
        await expect(errorElement).toBeVisible({timeout: 10000});
        await expect(errorElement).toContainText('Email ili lozinka su pogrešni');
    });

    test('should show validation errors on empty login', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await page.click('button[type="submit"]');

        const emailInput = page.locator('input[name="email"]');
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
    });

    test('should handle forgot password flow', async ({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.clickForgotPassword();

        await expect(page.locator('h3:has-text("Zaboravljena lozinka")')).toBeVisible();

        await loginPage.submitForgotPassword('test@example.com');

        await expect(page.locator('.text-green-600')).toContainText('Ako je email registriran');
    });

    test('should register new user successfully', async ({page}) => {
        const registerPage = new RegisterPage(page);
        const helpers = new TestHelpers(page);
        const uniqueEmail = TestHelpers.generateTestEmail();

        await registerPage.goto();

        await registerPage.fillRegistrationForm({
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            password: 'TestPassword123',
            primaryAreaOfWork: 'GRUBI_RADOVI'
        });

        await registerPage.submit();

        await page.waitForURL('/homepage', {timeout: 10000});
        await expect(page).toHaveURL('/homepage');

        await expect(page.locator('a:has-text("Ponude")')).toBeVisible();
    });

    test('should show error for duplicate email registration', async ({page}) => {
        const registerPage = new RegisterPage(page);

        await registerPage.goto();

        await registerPage.fillRegistrationForm({
            firstName: 'Test',
            lastName: 'User',
            email: TEST_USER.email,
            password: 'TestPassword123',
            primaryAreaOfWork: 'GRUBI_RADOVI'
        });

        await registerPage.submit();

        await expect(page.locator('.text-red-700')).toContainText('Ovaj email je već registriran');
    });

    test('should validate password requirements', async ({page}) => {
        const registerPage = new RegisterPage(page);
        const uniqueEmail = TestHelpers.generateTestEmail();

        await registerPage.goto();

        await registerPage.fillRegistrationForm({
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            password: 'weak',
            primaryAreaOfWork: 'GRUBI_RADOVI'
        });

        await registerPage.submit();

        await expect(page.locator('.text-red-700')).toContainText('Lozinka mora imati najmanje 8 znakova');
    });

    test('should login with valid credentials', async ({page}) => {
        const loginPage = new LoginPage(page);
        const helpers = new TestHelpers(page);

        await loginPage.goto();
        await loginPage.login(TEST_USER.email, TEST_USER.password);

        await page.waitForURL('/homepage', {timeout: 10000});
        await expect(page).toHaveURL('/homepage');

        await expect(page.locator('a:has-text("Ponude")')).toBeVisible();
        await expect(page.locator('a:has-text("Kalendar")')).toBeVisible();
        await expect(page.locator('a:has-text("Baza proizvoda")')).toBeVisible();
    });

    test('should logout successfully', async ({page}) => {
        const helpers = new TestHelpers(page);

        await helpers.login(TEST_USER.email, TEST_USER.password);

        await helpers.logout();

        await expect(page).toHaveURL('/');
        await expect(page.locator('h1')).toContainText('Ponude koje čvrsto stoje');
    });

    test('should handle navigation between login and register', async ({page}) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();

        await page.click('a:has-text("Registrirajte se")');
        await expect(page).toHaveURL('/register');

        await page.click('a:has-text("Prijavite se")');
        await expect(page).toHaveURL('/sign-in');
    });
});