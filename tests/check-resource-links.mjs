import fs from "node:fs/promises";

const source = await fs.readFile(new URL("../resources.js", import.meta.url), "utf8");
const urls = [...new Set(source.match(/https:\/\/[^'"\s)]+/g) ?? [])].sort();
const automationRestricted = new Set([
  "https://www.24-7prayer.com/resource/lectio-365/",
  "https://www.ntwrightonline.org/",
]);
const results = await Promise.all(
  urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { "user-agent": "Formation-V3-release-link-check/1.0" },
      });
      return {
        url,
        status: response.status,
        ok: response.status >= 200 && response.status < 400,
      };
    } catch (error) {
      return { url, ok: false, error: error.message };
    }
  }),
);
const failures = results.filter(
  (result) => !result.ok && !automationRestricted.has(result.url),
);
results.forEach((result) =>
  console.log(
    `${result.ok ? "PASS" : automationRestricted.has(result.url) ? "WARN" : "FAIL"} ${result.status ?? ""} ${result.url}${result.error ? ` — ${result.error}` : ""}`,
  ),
);

if (failures.length) {
  console.error(`\n${failures.length} resource link(s) need review.`);
  process.exitCode = 1;
} else {
  const passed = results.filter((result) => result.ok).length;
  const warnings = results.filter(
    (result) => !result.ok && automationRestricted.has(result.url),
  ).length;
  console.log(
    `\n${passed} resource links responded successfully; ${warnings} official link(s) could not be verified by automation.`,
  );
}
