import {
  normalizeCategorySlug,
  getCategoryTaxRate,
  TAX_CATEGORY_TAXONOMY,
  DEFAULT_CATEGORY_TAXES,
  calculateCartTotals,
  calculateItemTax,
} from "../pricing";

export function runPricingTestSuite() {
  console.log("================================================================================");
  console.log("🧪 FRONTEND PRICING & TAX RATE INTEGRITY TEST MATRIX");
  console.log("================================================================================\n");

  const results: Array<{ test: string; input: any; expected: any; actual: any; passed: boolean }> = [];

  function assert(testName: string, input: any, actual: any, expected: any) {
    const passed = actual === expected;
    results.push({ test: testName, input, expected, actual, passed });
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} | ${testName} [input: ${JSON.stringify(input)}] => ${actual}% (expected ${expected}%)`);
    if (!passed) {
      throw new Error(`Assertion failed: ${testName}. Expected ${expected}, got ${actual}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 1: normalizeCategorySlug
  // --------------------------------------------------------------------------
  console.log("👉 Test Suite 1: normalizeCategorySlug Sanitization Edge Cases");
  const normTests = [
    { input: "  plants  ", expected: "plants" },
    { input: "gardening_tools", expected: "gardening-tools" },
    { input: "Gardening Tools", expected: "gardening-tools" },
    { input: "Seeds & Bulbs", expected: "seeds-bulbs" },
    { input: "plant-stands-shelves", expected: "plant-stands-shelves" },
    { input: "", expected: "" },
    { input: null, expected: "" },
    { input: undefined, expected: "" },
  ];

  for (const t of normTests) {
    const actual = normalizeCategorySlug(t.input);
    const passed = actual === t.expected;
    console.log(`  ${passed ? "✅ PASS" : "❌ FAIL"} | normalizeCategorySlug(${JSON.stringify(t.input)}) => "${actual}" (expected "${t.expected}")`);
    if (!passed) {
      throw new Error(`normalizeCategorySlug failed for ${t.input}`);
    }
  }
  console.log();

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Mandatory Prompt Test Matrix
  // --------------------------------------------------------------------------
  console.log("👉 Test Suite 2: Mandatory Slug Tax Rate Test Matrix");
  assert('Slug "plants"', "plants", getCategoryTaxRate("plants"), 5);
  assert('Slug "gardening-tools"', "gardening-tools", getCategoryTaxRate("gardening-tools"), 18);
  assert('Slug "plant-care"', "plant-care", getCategoryTaxRate("plant-care"), 18);
  assert('Slug "seeds-bulbs" (backend matching rate)', "seeds-bulbs", getCategoryTaxRate("seeds-bulbs"), 0);
  assert('Slug "stands-shelves"', "stands-shelves", getCategoryTaxRate("stands-shelves"), 18);
  assert('Fallback: "unknown-random-slug"', "unknown-random-slug", getCategoryTaxRate("unknown-random-slug"), 18);
  assert('Edge case: empty string ""', "", getCategoryTaxRate(""), 18);
  assert('Edge case: undefined', undefined, getCategoryTaxRate(undefined), 18);
  assert('Edge case: null', null, getCategoryTaxRate(null), 18);
  console.log();

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Marketplace Taxonomy Aliases
  // --------------------------------------------------------------------------
  console.log("👉 Test Suite 3: Marketplace Taxonomy Bidirectional Aliases");
  assert('Alias "live-plants"', "live-plants", getCategoryTaxRate("live-plants"), 5);
  assert('Alias "tools"', "tools", getCategoryTaxRate("tools"), 18);
  assert('Alias "fertilizers"', "fertilizers", getCategoryTaxRate("fertilizers"), 18);
  assert('Alias "seeds"', "seeds", getCategoryTaxRate("seeds"), 0);
  assert('Alias "pots-planters"', "pots-planters", getCategoryTaxRate("pots-planters"), 18);
  assert('Alias "planters"', "planters", getCategoryTaxRate("planters"), 18);
  assert('Alias "plant-stands-shelves"', "plant-stands-shelves", getCategoryTaxRate("plant-stands-shelves"), 18);
  assert('Alias "artificial-dried"', "artificial-dried", getCategoryTaxRate("artificial-dried"), 18);
  assert('Alias "decor"', "decor", getCategoryTaxRate("decor"), 18);
  console.log();

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Cart Calculation Parity (1x Plant @ ₹500 + 1x Tool @ ₹1000)
  // --------------------------------------------------------------------------
  console.log("👉 Test Suite 4: Cart Calculation (1x Plant @ ₹500 + 1x Tool @ ₹1000)");
  const cart = [
    {
      product: {
        price: 500,
        category: "plants",
      },
      quantity: 1,
    },
    {
      product: {
        price: 1000,
        category: "gardening-tools",
      },
      quantity: 1,
    },
  ];

  const totals = calculateCartTotals(cart);
  console.log(`    Subtotal:    ₹${totals.subtotal} (expected ₹1500)`);
  console.log(`    Tax (GST):   ₹${totals.tax} (expected ₹205 = ₹25 on Plant + ₹180 on Tool)`);
  console.log(`    Shipping:    ₹${totals.shipping} (expected ₹0 free shipping)`);
  console.log(`    Grand Total: ₹${totals.grandTotal} (expected ₹1705)`);

  if (totals.subtotal !== 1500) throw new Error(`Cart subtotal mismatch: expected 1500, got ${totals.subtotal}`);
  if (totals.tax !== 205) throw new Error(`Cart tax mismatch: expected 205, got ${totals.tax}`);
  if (totals.grandTotal !== 1705) throw new Error(`Cart grandTotal mismatch: expected 1705, got ${totals.grandTotal}`);

  console.log("\n================================================================================");
  console.log("✅ ALL FRONTEND PRICING INTEGRITY TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================");
}

// Auto-run if executed directly
if (typeof require !== "undefined" && require.main === module) {
  runPricingTestSuite();
}
