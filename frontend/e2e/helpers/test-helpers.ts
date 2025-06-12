import {Page, expect} from '@playwright/test';

export class TestHelpers {
    constructor(private page: Page) {
    }

    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    async waitForElementVisible(selector: string, options?: { timeout?: number }) {
        await this.page.waitForSelector(selector, {
            state: 'visible',
            timeout: options?.timeout || 10000
        });
        await this.page.waitForTimeout(100);
    }


    async clickWithRetry(selector: string, options?: { timeout?: number; retries?: number }) {
        const maxRetries = options?.retries || 3;
        let lastError: Error | undefined;

        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.waitForElementVisible(selector, {timeout: options?.timeout});
                await this.page.click(selector, {timeout: options?.timeout || 10000});
                return;
            } catch (error) {
                lastError = error as Error;
                if (i < maxRetries - 1) {
                    await this.page.waitForTimeout(500);
                }
            }
        }

        throw lastError;
    }

    async fillInput(selector: string, value: string) {
        await this.waitForElementVisible(selector);
        await this.page.click(selector);
        await this.page.fill(selector, '');
        await this.page.fill(selector, value);
    }

    async login(email: string, password: string) {
        await this.page.goto('/sign-in');
        await this.fillInput('input[name="email"]', email);
        await this.fillInput('input[name="password"]', password);
        await this.page.click('button[type="submit"]');

        await this.page.waitForURL('/homepage', {timeout: 10000});
        await this.waitForNetworkIdle();
    }

    async logout() {
        await this.clickWithRetry('[aria-label="Open user menu"], .h-8.w-8.text-gray-400');
        await this.clickWithRetry('button:has-text("Odjava")');
        await this.page.waitForURL('/');
    }

    static generateTestEmail(): string {
        return `test${Date.now()}@example.com`;
    }

    static generateTestProduct(): { name: string; description: string } {
        const timestamp = Date.now();
        return {
            name: `Test Product ${timestamp}`,
            description: `Test Description ${timestamp}`
        };
    }

    async waitForNotification(text?: string) {
        if (text) {
            await this.page.waitForSelector(`text="${text}"`, {timeout: 5000});
        }
        await this.page.waitForTimeout(3500);
    }

    async elementExists(selector: string): Promise<boolean> {
        try {
            await this.page.waitForSelector(selector, {timeout: 1000});
            return true;
        } catch {
            return false;
        }
    }

    async closeModalIfOpen() {
        const closeButton = await this.elementExists('button[aria-label="Close"], .absolute.top-3.right-3');
        if (closeButton) {
            await this.page.click('button[aria-label="Close"], .absolute.top-3.right-3');
            await this.page.waitForTimeout(300);
        }
    }
}

export const TEST_USER = {
    email: 'test@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
    primaryAreaOfWork: 'GRUBI_RADOVI'
};

export const SELECTORS = {
    navPonude: 'a:has-text("Ponude")',
    navKalendar: 'a:has-text("Kalendar")',
    navBazaProizvoda: 'a:has-text("Baza proizvoda")',

    emailInput: 'input[name="email"], input[type="email"]',
    passwordInput: 'input[name="password"], input[type="password"]',
    submitButton: 'button[type="submit"]',

    searchProductInput: 'input[placeholder="Pretraži proizvode..."]',
    addProductButton: 'button:has-text("Dodaj novi proizvod")',

    createQuoteButton: 'button:has-text("Kreiraj novu ponudu")',
    searchQuoteProductInput: 'input[placeholder="Traži proizvod..."]',

    addEventButton: 'button:has-text("Dodaj")',
    eventTitleInput: 'input[placeholder="Opis događaja"]',
    eventDateInput: 'input[type="date"]'
};