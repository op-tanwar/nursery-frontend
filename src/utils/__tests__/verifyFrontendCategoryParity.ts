import {
  PRODUCT_CATEGORIES,
  CANONICAL_TAX_CATEGORIES,
  normalizeCategorySlug,
  normalizeTaxCategory,
} from "../../constants/categories";
import {
  TAX_CATEGORY_TAXONOMY,
  getCategoryTaxRate,
} from "../pricing";
import {
  getShopCategorySegment,
  getProductShopUrl,
} from "../productUrl";

function runFrontendParityAudit() {
  console.log("===============================================================");
  console.log("🎨 STARTING FRONTEND CATEGORY PARITY & URL AUDIT");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // 1. SSOT Category Constants
  assert(
    PRODUCT_CATEGORIES.STANDS_SHELVES === "plant-stands-shelves",
    "Frontend PRODUCT_CATEGORIES.STANDS_SHELVES is 'plant-stands-shelves'"
  );

  // 2. Normalization & Tax Resolution
  const metaCanonical = normalizeTaxCategory("plant-stands-shelves");
  assert(
    metaCanonical.slug === "plant-stands-shelves" && metaCanonical.taxPercentage === 18,
    "Frontend normalizeTaxCategory('plant-stands-shelves') -> 18% GST"
  );

  const metaLegacy = normalizeTaxCategory("stands-shelves");
  assert(
    metaLegacy.slug === "plant-stands-shelves" && metaLegacy.taxPercentage === 18,
    "Frontend normalizeTaxCategory('stands-shelves') -> canonical 'plant-stands-shelves' & 18% GST"
  );

  const metaAnd = normalizeTaxCategory("plant-stands-and-shelves");
  assert(
    metaAnd.slug === "plant-stands-shelves" && metaAnd.taxPercentage === 18,
    "Frontend normalizeTaxCategory('plant-stands-and-shelves') -> canonical 'plant-stands-shelves' & 18% GST"
  );

  // 3. Tax Rate Resolver in pricing.ts
  assert(
    getCategoryTaxRate("plant-stands-shelves") === 18,
    "getCategoryTaxRate('plant-stands-shelves') === 18"
  );
  assert(
    getCategoryTaxRate("stands-shelves") === 18,
    "getCategoryTaxRate('stands-shelves') === 18"
  );
  assert(
    getCategoryTaxRate("plant-stands-and-shelves") === 18,
    "getCategoryTaxRate('plant-stands-and-shelves') === 18"
  );

  // 4. URL Segment & Routing Helpers in productUrl.ts
  assert(
    getShopCategorySegment("plant-stands-shelves") === "plant-stands-shelves",
    "getShopCategorySegment('plant-stands-shelves') === 'plant-stands-shelves'"
  );
  assert(
    getShopCategorySegment("stands-shelves") === "plant-stands-shelves",
    "getShopCategorySegment('stands-shelves') === 'plant-stands-shelves'"
  );
  assert(
    getShopCategorySegment("plant-stands-and-shelves") === "plant-stands-shelves",
    "getShopCategorySegment('plant-stands-and-shelves') === 'plant-stands-shelves'"
  );

  const productUrlCanonical = getProductShopUrl({
    category: "plant-stands-shelves",
    slug: "tiered-wood-stand",
  });
  assert(
    productUrlCanonical === "/shop/plant-stands-shelves/tiered-wood-stand",
    `getProductShopUrl with category='plant-stands-shelves' generates '${productUrlCanonical}'`
  );

  const productUrlLegacy = getProductShopUrl({
    category: "stands-shelves",
    slug: "tiered-wood-stand",
  });
  assert(
    productUrlLegacy === "/shop/plant-stands-shelves/tiered-wood-stand",
    `getProductShopUrl with category='stands-shelves' generates '${productUrlLegacy}'`
  );

  console.log("\n===============================================================");
  console.log(`📊 FRONTEND AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFrontendParityAudit();
