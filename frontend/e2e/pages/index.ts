import {Page} from '@playwright/test';
import {TestHelpers} from '../helpers/test-helpers';

export class LoginPage {
    private helpers: TestHelpers;

    constructor(private page: Page) {
        this.helpers = new TestHelpers(page);
    }

    async goto() {
        await this.page.goto('/sign-in');
    }

    async login(email: string, password: string) {
        await this.helpers.fillInput('input[name="email"]', email);
        await this.helpers.fillInput('input[name="password"]', password);
        await this.page.click('button[type="submit"]');
    }

    async clickForgotPassword() {
        await this.page.click('button:has-text("Zaboravljena lozinka?")');
    }

    async submitForgotPassword(email: string) {
        await this.helpers.fillInput('input[placeholder="Email"]', email);
        await this.page.click('button:has-text("Pošalji")');
    }

    async getErrorMessage(): Promise<string | null> {
        const errorElement = await this.page.$('.text-red-700');
        return errorElement ? await errorElement.textContent() : null;
    }
}

export class RegisterPage {
    private helpers: TestHelpers;

    constructor(private page: Page) {
        this.helpers = new TestHelpers(page);
    }

    async goto() {
        await this.page.goto('/register');
    }

    async fillRegistrationForm(data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        primaryAreaOfWork: string;
    }) {
        await this.helpers.fillInput('input[name="firstName"]', data.firstName);
        await this.helpers.fillInput('input[name="lastName"]', data.lastName);
        await this.helpers.fillInput('input[name="email"]', data.email);
        await this.helpers.fillInput('input[name="password"]', data.password);
        await this.page.selectOption('select[name="primaryAreaOfWork"]', data.primaryAreaOfWork);
    }

    async submit() {
        await this.page.click('button[type="submit"]');
    }
}

export class ProductsPage {
    private helpers: TestHelpers;

    constructor(private page: Page) {
        this.helpers = new TestHelpers(page);
    }

    async goto() {
        await this.page.click('a:has-text("Baza proizvoda")');
        await this.helpers.waitForNetworkIdle();
    }

    async searchProducts(query: string) {
        await this.helpers.fillInput('input[placeholder="Pretraži proizvode..."]', query);
        await this.page.waitForTimeout(500);
    }

    async openAddProductModal() {
        await this.helpers.clickWithRetry('button:has-text("Dodaj novi proizvod")');
    }

    async fillProductForm(data: {
        name: string;
        category: string;
        price: number;
        measureUnit: string;
        description: string;
    }) {
        await this.helpers.fillInput('input[name="name"]', data.name);
        await this.page.selectOption('select[name="category"]', data.category);
        await this.helpers.fillInput('input[name="price"]', data.price.toString());
        await this.page.selectOption('select[name="measureUnit"]', data.measureUnit);
        await this.helpers.fillInput('textarea[name="description"]', data.description);
    }

    async submitProduct() {
        await this.page.click('button:has-text("Dodaj proizvod")');
    }

    async editProduct(productName: string) {
        const row = this.page.locator('tr', {hasText: productName});
        await row.locator('button:has-text("Uredi")').click();
    }

    async updateProduct() {
        await this.page.click('button:has-text("Spremi promjene")');
    }

    async getProductCount(): Promise<number> {
        const rows = await this.page.$$('tbody tr');
        const noProductsRow = await this.page.$('td:has-text("Nema pronađenih proizvoda.")');
        return noProductsRow ? 0 : rows.length;
    }
}

export class QuotesPage {
    private helpers: TestHelpers;

    constructor(private page: Page) {
        this.helpers = new TestHelpers(page);
    }

    async goto() {
        await this.page.click('a:has-text("Ponude")');
        await this.helpers.waitForNetworkIdle();
    }

    async openCreateQuoteModal() {
        await this.helpers.clickWithRetry('button:has-text("Kreiraj novu ponudu")');
    }

    async searchProduct(productName: string) {
        await this.helpers.fillInput('input[placeholder="Traži proizvod..."]', productName);
        await this.page.waitForTimeout(300);
    }

    async addProductToQuote(productName: string, quantity: number) {
        await this.searchProduct(productName);

        await this.page.waitForSelector('.border.border-gray-200.bg-white', {timeout: 5000});

        const productRow = this.page.locator('.border.border-gray-200.bg-white').locator('div', {hasText: productName}).first();
        const quantityInput = productRow.locator('input[type="text"]');
        await quantityInput.fill(quantity.toString());
    }

    async setDiscount(discount: number) {
        await this.helpers.fillInput('input[placeholder="npr. 15"]', discount.toString());
    }

    async createQuote() {
        await this.page.click('button:has-text("Kreiraj ponudu & PDF")');
    }

    async getQuoteCount(): Promise<number> {
        const quotes = await this.page.$$('[class*="border p-4 rounded-lg"]');
        return quotes.length;
    }

    async sendQuoteEmail(quoteId: number, recipientEmail: string, recipientName?: string) {
        const quoteElement = this.page.locator(`h3:has-text("Ponuda ID: ${quoteId}")`).locator('..');
        await quoteElement.locator('button[title="Pošalji ponudu emailom"]').click();

        await this.helpers.fillInput('input[placeholder="Upišite email primatelja"]', recipientEmail);
        if (recipientName) {
            await this.helpers.fillInput('input[placeholder="Unesite ime za personalizaciju emaila"]', recipientName);
        }

        await this.page.click('button:has-text("Pošalji Email")');
    }

    async createProject(data: { name: string; address: string; status?: string; notes?: string }) {
        await this.page.click('button:has-text("Novi Projekt")');
        await this.helpers.fillInput('input[name="name"]', data.name);
        await this.helpers.fillInput('input[name="address"]', data.address);
        if (data.status) {
            await this.page.selectOption('select[name="status"]', data.status);
        }
        if (data.notes) {
            await this.helpers.fillInput('textarea[name="notes"]', data.notes);
        }
        await this.page.click('button:has-text("Spremi Projekt")');
    }
}

export class CalendarPage {
    private helpers: TestHelpers;

    constructor(private page: Page) {
        this.helpers = new TestHelpers(page);
    }

    async goto() {
        await this.page.click('a:has-text("Kalendar")');
        await this.helpers.waitForNetworkIdle();
    }

    async addEvent(title: string, date?: string) {
        if (date) {
            await this.page.fill('input[type="date"]', date);
        }
        await this.helpers.fillInput('input[placeholder="Opis događaja"]', title);
        await this.page.click('button:has-text("Dodaj"):not(:has-text("Dodaj novi"))');
    }

    async switchView(view: 'Dan' | 'Tjedan' | 'Mjesec') {
        await this.page.click(`button:has-text("${view}")`);
    }

    async navigateToToday() {
        await this.page.click('button:has-text("Danas")');
    }

    async deleteEvent(eventTitle: string) {
        const event = this.page.locator(`text="${eventTitle}"`).locator('..');
        await event.locator('button[class*="text-red-500"]').click();

        await this.page.click('button:has-text("Obriši")');
    }
}

export class ProfilePage {
    private helpers: TestHelpers;

    constructor(private page: Page) {
        this.helpers = new TestHelpers(page);
    }

    async goto() {
        await this.helpers.clickWithRetry('[aria-label="Open user menu"], .h-8.w-8.text-gray-400');
        await this.page.click('a:has-text("Vaš profil")');
    }

    async updateProfile(data: { firstName?: string; lastName?: string; primaryAreaOfWork?: string }) {
        if (data.firstName) {
            await this.helpers.fillInput('input[name="firstName"]', data.firstName);
        }
        if (data.lastName) {
            await this.helpers.fillInput('input[name="lastName"]', data.lastName);
        }
        if (data.primaryAreaOfWork) {
            await this.page.selectOption('select[name="primaryAreaOfWork"]', data.primaryAreaOfWork);
        }
        await this.page.click('button:has-text("Ažuriraj profil")');
    }

    async getSuccessMessage(): Promise<string | null> {
        const successElement = await this.page.$('.text-green-700');
        return successElement ? await successElement.textContent() : null;
    }
}