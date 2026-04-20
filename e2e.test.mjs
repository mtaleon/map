/**
 * E2E test for Map Coloring Game using Playwright.
 * Run: node e2e.test.mjs
 */
import { chromium } from '/home/oouyang/.npm/_npx/86170c4cd1c5da32/node_modules/playwright/index.mjs';
import { execSync, spawn } from 'child_process';
import { strict as assert } from 'assert';

// Build first
execSync('npm run build', { cwd: '/opt/ws/map', stdio: 'pipe' });

// Start server
const server = spawn('python3', ['-m', 'http.server', '8001', '--directory', 'www'], {
  cwd: '/opt/ws/map',
  stdio: 'pipe',
});

// Wait for server
await new Promise(r => setTimeout(r, 1500));

let browser;
let passed = 0;
let failed = 0;

function log(msg) { console.log(`  ${msg}`); }
function pass(name) { passed++; console.log(`✓ ${name}`); }
function fail(name, err) { failed++; console.log(`✗ ${name}: ${err}`); }

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: '/home/oouyang/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
  });
  const page = await browser.newPage();

  // Navigate to app
  await page.goto('http://localhost:8001', { waitUntil: 'networkidle' });

  // TEST 1: Page loads without errors
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.waitForTimeout(2000); // Wait for async generation

  if (errors.length === 0) {
    pass('Page loads without JS errors');
  } else {
    fail('Page loads without JS errors', errors.join('; '));
  }

  // TEST 2: SVG map is rendered with regions
  const regionCount = await page.locator('#map-svg .region-fill').count();
  if (regionCount >= 20) {
    pass(`SVG map rendered with ${regionCount} regions`);
  } else {
    fail('SVG map rendered with regions', `Only ${regionCount} regions found`);
  }

  // TEST 3: Palette buttons are visible and colored
  const paletteCount = await page.locator('.palette-btn').count();
  const firstPaletteColor = await page.locator('.palette-btn').first().evaluate(el => el.style.backgroundColor);
  if (paletteCount === 4 && firstPaletteColor) {
    pass(`Palette rendered: ${paletteCount} buttons, first color: ${firstPaletteColor}`);
  } else {
    fail('Palette rendered', `count=${paletteCount}, color=${firstPaletteColor}`);
  }

  // TEST 4: First palette button is active by default
  const firstActive = await page.locator('.palette-btn').first().evaluate(el => el.classList.contains('active'));
  if (firstActive) {
    pass('First palette button is active by default');
  } else {
    fail('First palette button is active by default', 'not active');
  }

  // TEST 5: Clicking a non-given region fills it
  const nonGivenRegion = await page.locator('.region-fill:not(.given)').first();
  const regionId = await nonGivenRegion.getAttribute('data-region-id');
  const initialFill = await nonGivenRegion.getAttribute('fill');
  await nonGivenRegion.click();
  await page.waitForTimeout(200);
  const afterFill = await nonGivenRegion.getAttribute('fill');
  if (afterFill !== initialFill && afterFill !== '#f0f0f0') {
    pass(`Clicking region ${regionId} fills it (${initialFill} → ${afterFill})`);
  } else {
    fail('Clicking region fills it', `fill unchanged: ${initialFill} → ${afterFill}`);
  }

  // TEST 6: Moves counter increments
  const movesText = await page.locator('#moves').textContent();
  if (movesText.includes('1')) {
    pass(`Moves counter updated: "${movesText}"`);
  } else {
    fail('Moves counter updated', `text: "${movesText}"`);
  }

  // TEST 7: Undo restores previous state
  await page.locator('#undo-btn').click();
  await page.waitForTimeout(200);
  const undoFill = await nonGivenRegion.getAttribute('fill');
  if (undoFill === initialFill) {
    pass('Undo restores previous fill color');
  } else {
    fail('Undo restores previous fill', `expected ${initialFill}, got ${undoFill}`);
  }

  // TEST 8: Redo re-applies color
  await page.locator('#redo-btn').click();
  await page.waitForTimeout(200);
  const redoFill = await nonGivenRegion.getAttribute('fill');
  if (redoFill === afterFill) {
    pass('Redo re-applies the color');
  } else {
    fail('Redo re-applies the color', `expected ${afterFill}, got ${redoFill}`);
  }

  // TEST 9: Color palette switching
  await page.locator('.palette-btn[data-color="2"]').click();
  const btn2Active = await page.locator('.palette-btn[data-color="2"]').evaluate(el => el.classList.contains('active'));
  const btn0Active = await page.locator('.palette-btn[data-color="0"]').evaluate(el => el.classList.contains('active'));
  if (btn2Active && !btn0Active) {
    pass('Switching palette color: btn2 active, btn0 inactive');
  } else {
    fail('Switching palette color', `btn2=${btn2Active}, btn0=${btn0Active}`);
  }

  // TEST 10: Keyboard shortcut color select (press 4)
  await page.keyboard.press('4');
  const btn3Active = await page.locator('.palette-btn[data-color="3"]').evaluate(el => el.classList.contains('active'));
  if (btn3Active) {
    pass('Keyboard shortcut "4" selects color 3');
  } else {
    fail('Keyboard shortcut "4"', 'btn3 not active');
  }

  // TEST 11: Given regions cannot be modified
  const givenRegion = await page.locator('.region-fill.given').first();
  if (await givenRegion.count() > 0) {
    const givenFillBefore = await givenRegion.getAttribute('fill');
    await givenRegion.click();
    await page.waitForTimeout(200);
    const givenFillAfter = await givenRegion.getAttribute('fill');
    if (givenFillBefore === givenFillAfter) {
      pass('Given region not modifiable');
    } else {
      fail('Given region not modifiable', `fill changed: ${givenFillBefore} → ${givenFillAfter}`);
    }
  } else {
    pass('Given region test skipped (none found — edge case)');
  }

  // TEST 12: Timer is running
  const timer1 = await page.locator('#timer').textContent();
  await page.waitForTimeout(1500);
  const timer2 = await page.locator('#timer').textContent();
  if (timer1 !== timer2) {
    pass(`Timer advances: ${timer1} → ${timer2}`);
  } else {
    fail('Timer advances', `stuck at ${timer1}`);
  }

  // TEST 13: Help modal opens and closes
  await page.locator('#help-btn').click();
  const helpVisible = await page.locator('#help-modal').evaluate(el => el.classList.contains('visible'));
  if (helpVisible) {
    pass('Help modal opens on click');
  } else {
    fail('Help modal opens', 'not visible');
  }
  await page.locator('#help-close').click();
  const helpHidden = await page.locator('#help-modal').evaluate(el => !el.classList.contains('visible'));
  if (helpHidden) {
    pass('Help modal closes on OK');
  } else {
    fail('Help modal closes', 'still visible');
  }

  // TEST 14: Preset dropdown opens
  await page.locator('#menu-type .menu-btn').click();
  await page.waitForTimeout(200);
  const dropdownOpen = await page.locator('#type-dropdown').evaluate(el => el.classList.contains('open'));
  if (dropdownOpen) {
    pass('Preset dropdown opens');
  } else {
    fail('Preset dropdown opens', 'not open');
  }

  // TEST 15: Selecting a preset generates a new map
  const regionCountBefore = regionCount;
  await page.locator('.preset-btn[data-preset="0"]').click(); // Easy preset
  await page.waitForTimeout(2000); // Wait for generation
  const newRegionCount = await page.locator('#map-svg .region-fill').count();
  if (newRegionCount >= 20) {
    pass(`New preset generates map: ${newRegionCount} regions`);
  } else {
    fail('New preset generates map', `only ${newRegionCount} regions`);
  }

  // TEST 16: Remaining counter shows non-zero
  const remaining = await page.locator('#remaining').textContent();
  const leftNum = parseInt(remaining.replace(/\D/g, ''));
  if (leftNum > 0) {
    pass(`Remaining counter: "${remaining}"`);
  } else {
    fail('Remaining counter', `"${remaining}" parsed as ${leftNum}`);
  }

  // TEST 17: Custom modal opens and closes
  await page.locator('#menu-type .menu-btn').click();
  await page.waitForTimeout(200);
  await page.locator('#custom-btn').click();
  await page.waitForTimeout(200);
  const customVis = await page.locator('#custom-modal').evaluate(el => el.classList.contains('visible'));
  if (customVis) {
    pass('Custom modal opens');
  } else {
    fail('Custom modal opens', 'not visible');
  }
  await page.locator('#custom-cancel').click();
  const customHid = await page.locator('#custom-modal').evaluate(el => !el.classList.contains('visible'));
  if (customHid) {
    pass('Custom modal closes on cancel');
  } else {
    fail('Custom modal closes', 'still visible');
  }

  // TEST 18: No console errors after all interactions
  if (errors.length === 0) {
    pass('No JS errors throughout test');
  } else {
    fail('No JS errors throughout test', errors.join('; '));
  }

  // TEST 19: Restart resets the board
  // First fill some regions
  const fillTargets = await page.locator('.region-fill:not(.given)').all();
  for (let i = 0; i < Math.min(3, fillTargets.length); i++) {
    await fillTargets[i].click();
    await page.waitForTimeout(100);
  }
  await page.locator('#restart-btn').click();
  await page.waitForTimeout(500);
  // After restart, all non-given regions should be unfilled
  const unfilledAfterRestart = await page.locator('.region-fill:not(.given)').evaluateAll(els =>
    els.every(el => el.getAttribute('fill') === '#f0f0f0')
  );
  if (unfilledAfterRestart) {
    pass('Restart clears all user-placed colors');
  } else {
    fail('Restart clears colors', 'some regions still filled');
  }

  // TEST 20: Hint fills a region
  await page.locator('#hint-btn').click();
  await page.waitForTimeout(500);
  const filledAfterHint = await page.locator('.region-fill:not(.given)').evaluateAll(els =>
    els.some(el => el.getAttribute('fill') !== '#f0f0f0')
  );
  if (filledAfterHint) {
    pass('Hint fills a region');
  } else {
    fail('Hint fills a region', 'no region filled');
  }

} catch (err) {
  fail('Test execution', err.message);
  console.error(err);
} finally {
  if (browser) await browser.close();
  server.kill();
}

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
