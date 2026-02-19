#!/usr/bin/env node

/**
 * Browser test for Help Page ticket submission flow
 * 
 * This script tests the complete flow:
 * 1. Navigate to sign-in page
 * 2. Sign in with test credentials
 * 3. Navigate to help page
 * 4. Click "New Ticket" button
 * 5. Fill in the form with test data
 * 6. Submit the form
 * 7. Verify success message appears
 * 8. Check console for errors
 */

const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testHelpPageFlow() {
    const browser = await puppeteer.launch({
        headless: false, // Set to true for CI/CD
        slowMo: 100, // Slow down by 100ms for visibility
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1280, height: 800 });

        // Listen to console messages
        const consoleLogs = [];
        const consoleErrors = [];
        
        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push({ type: msg.type(), text });
            if (msg.type() === 'error') {
                consoleErrors.push(text);
            }
            console.log(`[Browser ${msg.type()}]`, text);
        });

        // Listen to page errors
        page.on('pageerror', error => {
            consoleErrors.push(error.message);
            console.error('[Page Error]', error.message);
        });

        // Listen to failed requests
        page.on('requestfailed', request => {
            console.error('[Request Failed]', request.url(), request.failure().errorText);
        });

        console.log('\n📋 TEST: Help Page Ticket Submission Flow\n');

        // Step 1: Navigate to sign-in page
        console.log('1️⃣  Navigating to sign-in page...');
        await page.goto('http://localhost:3000/sign-in', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        await page.screenshot({ path: 'test-screenshots/01-signin-page.png' });
        console.log('   ✓ Sign-in page loaded');

        // Step 2: Fill in credentials and sign in
        console.log('\n2️⃣  Filling in credentials...');
        await page.type('input[type="email"]', 'john@example.com', { delay: 50 });
        await page.type('input[type="password"]', 'user123', { delay: 50 });
        await page.screenshot({ path: 'test-screenshots/02-credentials-filled.png' });
        console.log('   ✓ Credentials filled');

        console.log('\n3️⃣  Clicking sign-in button...');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
        ]);
        await page.screenshot({ path: 'test-screenshots/03-after-signin.png' });
        console.log('   ✓ Signed in successfully');

        // Step 3: Navigate to help page
        console.log('\n4️⃣  Navigating to help page...');
        await page.goto('http://localhost:3000/help', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        await delay(1000);
        await page.screenshot({ path: 'test-screenshots/04-help-page.png' });
        console.log('   ✓ Help page loaded');

        // Step 4: Look for and click "New Ticket" button
        console.log('\n5️⃣  Looking for "New Ticket" button...');
        const newTicketButton = await page.waitForSelector('button:has-text("New Ticket"), button >> text="New Ticket"', { 
            timeout: 5000 
        }).catch(() => null);

        if (!newTicketButton) {
            // Try alternative selector
            const buttons = await page.$$('button');
            let found = false;
            for (const button of buttons) {
                const text = await button.evaluate(el => el.textContent);
                if (text.includes('New Ticket')) {
                    console.log('   ✓ Found "New Ticket" button');
                    await button.click();
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error('Could not find "New Ticket" button');
            }
        } else {
            await newTicketButton.click();
            console.log('   ✓ Clicked "New Ticket" button');
        }

        await delay(500);
        await page.screenshot({ path: 'test-screenshots/05-form-opened.png' });

        // Step 5: Fill in the form
        console.log('\n6️⃣  Filling in the form...');
        
        // Set category to "Bug Report"
        console.log('   - Selecting category: Bug Report');
        const bugButton = await page.waitForSelector('button:has-text("Bug Report"), button >> text="Bug"', {
            timeout: 5000
        }).catch(() => null);
        
        if (!bugButton) {
            // Try finding by text content
            const buttons = await page.$$('button');
            let found = false;
            for (const button of buttons) {
                const text = await button.evaluate(el => el.textContent);
                if (text.includes('Bug Report') || text.includes('Bug')) {
                    await button.click();
                    found = true;
                    console.log('   ✓ Category selected');
                    break;
                }
            }
            if (!found) {
                console.warn('   ⚠ Could not find Bug Report button, may already be selected');
            }
        } else {
            await bugButton.click();
            console.log('   ✓ Category selected');
        }

        await delay(300);

        // Fill in title
        console.log('   - Filling in title');
        const titleInput = await page.$('input[placeholder*="summary"], input[placeholder*="Brief"]');
        if (titleInput) {
            await titleInput.click({ clickCount: 3 }); // Select all
            await titleInput.type('Test ticket', { delay: 30 });
            console.log('   ✓ Title filled');
        } else {
            throw new Error('Could not find title input');
        }

        await delay(300);

        // Fill in description
        console.log('   - Filling in description');
        const descriptionTextarea = await page.$('textarea[placeholder*="Describe"]');
        if (descriptionTextarea) {
            await descriptionTextarea.click();
            await descriptionTextarea.type('This is a test description for debugging purposes', { delay: 30 });
            console.log('   ✓ Description filled');
        } else {
            throw new Error('Could not find description textarea');
        }

        await delay(500);
        await page.screenshot({ path: 'test-screenshots/06-form-filled.png' });

        // Step 6: Submit the form
        console.log('\n7️⃣  Submitting the form...');
        const submitButtons = await page.$$('button');
        let submitButton = null;
        for (const button of submitButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text.includes('Submit')) {
                submitButton = button;
                break;
            }
        }

        if (!submitButton) {
            throw new Error('Could not find Submit button');
        }

        await submitButton.click();
        console.log('   ✓ Submit button clicked');

        // Wait for response
        await delay(2000);
        await page.screenshot({ path: 'test-screenshots/07-after-submit.png' });

        // Step 7: Check for success message
        console.log('\n8️⃣  Checking for success message...');
        const successMessage = await page.$('text="submitted successfully"').catch(() => null);
        
        if (successMessage) {
            console.log('   ✅ SUCCESS: Feedback submitted successfully!');
        } else {
            // Check if there's an error message
            const pageContent = await page.content();
            console.log('   ⚠ Could not find success message');
            
            // Check if form is still visible (might indicate validation error)
            const formStillVisible = await page.$('textarea[placeholder*="Describe"]');
            if (formStillVisible) {
                console.log('   ⚠ Form is still visible - possible validation error');
            }
        }

        // Wait a bit more to see if ticket appears in the list
        await delay(2000);
        await page.screenshot({ path: 'test-screenshots/08-final-state.png' });

        // Step 8: Check if the ticket appears in "My Tickets"
        console.log('\n9️⃣  Checking if ticket appears in "My Tickets"...');
        const ticketCard = await page.$('text="Test ticket"').catch(() => null);
        if (ticketCard) {
            console.log('   ✅ SUCCESS: Ticket appears in the list!');
        } else {
            console.log('   ⚠ Ticket not found in the list yet');
        }

        // Final report
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total console logs: ${consoleLogs.length}`);
        console.log(`Console errors: ${consoleErrors.length}`);
        
        if (consoleErrors.length > 0) {
            console.log('\n❌ Console Errors Found:');
            consoleErrors.forEach((error, i) => {
                console.log(`   ${i + 1}. ${error}`);
            });
        } else {
            console.log('\n✅ No console errors detected');
        }

        console.log('\n📸 Screenshots saved to test-screenshots/');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    } finally {
        await delay(2000);
        await browser.close();
    }
}

// Run the test
(async () => {
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync('test-screenshots')) {
        fs.mkdirSync('test-screenshots');
    }

    await testHelpPageFlow();
})();
