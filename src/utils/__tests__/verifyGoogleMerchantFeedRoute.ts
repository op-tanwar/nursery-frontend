import * as merchantRoute from "../../app/api/feeds/google-merchant/route";

async function verifyGoogleMerchantFeed() {
  console.log("===============================================================");
  console.log("🛒 AUDIT & VERIFICATION: GOOGLE MERCHANT FEED ROUTE (ISR)");
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

  // 1. Segment Export Configurations
  console.log("1️⃣ Next.js App Router Segment Configuration Audit:");
  assert(
    merchantRoute.revalidate === 3600,
    `revalidate export is strictly 3600 (actual: ${merchantRoute.revalidate})`
  );
  assert(
    (merchantRoute as any).dynamic === undefined,
    `dynamic export is undefined ('force-dynamic' eliminated)`
  );
  assert(
    (merchantRoute as any).dynamicParams === undefined,
    `dynamicParams export is undefined`
  );
  assert(
    (merchantRoute as any).fetchCache === undefined,
    `fetchCache export is undefined`
  );

  // 2. Route Execution & Response Headers
  console.log("\n2️⃣ Route Handler GET Execution & Headers:");
  assert(typeof merchantRoute.GET === "function", "GET export is a valid async function");

  const response = await merchantRoute.GET();
  assert(response instanceof Response, "GET() returns a valid Web standard Response object");
  assert(response.status === 200, `Response HTTP status is 200 (actual: ${response.status})`);

  const contentType = response.headers.get("Content-Type");
  assert(
    contentType === "application/xml; charset=utf-8",
    `Content-Type is 'application/xml; charset=utf-8' (actual: '${contentType}')`
  );

  const cacheControl = response.headers.get("Cache-Control");
  assert(
    cacheControl?.includes("s-maxage=3600") === true &&
    cacheControl?.includes("public") === true,
    `Cache-Control header contains 'public' and 's-maxage=3600' (actual: '${cacheControl}')`
  );

  const xRobots = response.headers.get("X-Robots-Tag");
  assert(
    xRobots === "noindex, follow",
    `X-Robots-Tag is 'noindex, follow' (actual: '${xRobots}')`
  );

  // 3. XML Payload Validation
  console.log("\n3️⃣ XML Document Structure & Google Merchant RSS Namespace:");
  const xmlBody = await response.text();

  assert(
    xmlBody.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
    "XML payload begins with standard XML declaration"
  );
  assert(
    xmlBody.includes('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">'),
    "XML root is RSS 2.0 with Google Base Merchant namespace 'xmlns:g'"
  );
  assert(
    xmlBody.includes("<channel>") && xmlBody.includes("</channel>") && xmlBody.includes("</rss>"),
    "XML contains well-formed channel and closing tags"
  );

  // Verify Google Merchant Item Elements
  assert(xmlBody.includes("<g:id>"), "Payload contains <g:id> tag");
  assert(xmlBody.includes("<g:title>"), "Payload contains <g:title> tag");
  assert(xmlBody.includes("<g:description>"), "Payload contains <g:description> tag");
  assert(xmlBody.includes("<g:link>"), "Payload contains <g:link> tag");
  assert(xmlBody.includes("<g:image_link>"), "Payload contains <g:image_link> tag");
  assert(xmlBody.includes("<g:availability>"), "Payload contains <g:availability> tag");
  assert(xmlBody.includes("<g:price>"), "Payload contains <g:price> tag");
  assert(xmlBody.includes("<g:brand>"), "Payload contains <g:brand> tag");
  assert(xmlBody.includes("<g:google_product_category>"), "Payload contains <g:google_product_category> tag");
  assert(xmlBody.includes("<g:condition>new</g:condition>"), "Payload contains <g:condition>new</g:condition> tag");

  // Verify XML does not contain raw unescaped HTML error tags
  assert(!xmlBody.includes("<!DOCTYPE html>"), "Payload is pure XML (no HTML doc doctype)");
  assert(!xmlBody.includes("<html"), "Payload contains no <html> tags");

  // 4. Resilience Test: Simulate network failure during fetch
  console.log("\n4️⃣ Resilience & Fault-Tolerance Verification:");
  const originalFetch = global.fetch;
  try {
    global.fetch = () => Promise.reject(new Error("Simulated network timeout/failure"));
    const fallbackResponse = await merchantRoute.GET();
    assert(fallbackResponse.status === 200, "Route recovers from network failure with status 200");
    const fallbackXml = await fallbackResponse.text();
    assert(
      fallbackXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
      "Fault-tolerant response produces valid XML"
    );
    assert(
      fallbackXml.includes("Monstera Deliciosa") || fallbackXml.includes("Sansevieria"),
      "Fault-tolerant response serves fallback feed items"
    );
  } finally {
    global.fetch = originalFetch;
  }

  console.log("\n===============================================================");
  console.log(`📊 AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyGoogleMerchantFeed().catch((err) => {
  console.error("Fatal error in test suite:", err);
  process.exit(1);
});
