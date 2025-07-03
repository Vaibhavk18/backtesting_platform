import { test, expect } from '@playwright/test';

test.describe('Strategy Builder Full Flow', () => {
  test('create, validate, save, backtest, and view dashboard', async ({ page }) => {
    // 1. Go to the app
    await page.goto('http://localhost:3000'); // Adjust if your dev server runs elsewhere

    // 2. Go to the Strategy Builder (adjust selector/route as needed)
    await page.click('text=Strategy Builder');

    // 3. Drag Asset node to canvas
    await page.dragAndDrop('text=Asset Selector', '.react-flow__pane');

    // 4. Drag Indicator node to canvas
    await page.dragAndDrop('text=RSI', '.react-flow__pane');

    // 5. Drag Logic node to canvas
    await page.dragAndDrop('text=AND', '.react-flow__pane');

    // 6. Drag Execution node to canvas
    await page.dragAndDrop('text=Market Order', '.react-flow__pane');

    // 7. Connect nodes (simulate user connecting nodes, adjust selectors as needed)
    // Example: connect Asset -> Indicator, Indicator -> Logic, Logic -> Execution
    // You may need to use page.mouse or custom selectors depending on your React Flow setup

    // 8. Validate strategy
    await page.click('button:has-text("Validate")');
    await expect(page.locator('text=Valid')).toBeVisible();

    // 9. Save strategy
    await page.click('button:has-text("Save")');
    // Optionally, check for a success notification or that the strategy appears in a list

    // 10. Backtest strategy
    await page.click('button:has-text("Backtest")');
    // Optionally, check for a result or notification

    // 11. Go to Dashboard
    await page.click('text=Dashboard');

    // 12. Select the saved strategy in the dashboard dropdown
    await page.click('label:has-text("Strategy") + div [role="button"]');
    await page.click('text=RSI Mean Reversion'); // Or whatever name your strategy has

    // 13. Check that performance data is displayed
    await expect(page.locator('text=Total Return')).toBeVisible();
    await expect(page.locator('text=Sharpe Ratio')).toBeVisible();
    await expect(page.locator('text=Max Drawdown')).toBeVisible();
    await expect(page.locator('text=Win Rate')).toBeVisible();
  });
}); 