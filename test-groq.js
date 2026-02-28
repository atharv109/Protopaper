#!/usr/bin/env node
/**
 * Quick test script to verify Groq integration
 * Run with: node test-groq.js
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 Paper-to-Prototype Groq Integration Test\n");

const checksToPerform = [
  {
    name: "✓ .env.local configured",
    check: () => {
      const envLocal = path.join(process.cwd(), ".env.local");
      if (!fs.existsSync(envLocal)) {
        return { pass: false, message: ".env.local not found" };
      }
      const content = fs.readFileSync(envLocal, "utf-8");
      if (!content.includes("GROQ_API_KEY")) {
        return { pass: false, message: "GROQ_API_KEY not in .env.local" };
      }
      if (content.includes("gsk_YOUR_KEY_HERE")) {
        return { pass: false, message: "GROQ_API_KEY not set (still has placeholder)" };
      }
      return { pass: true, message: "Found GROQ_API_KEY in .env.local" };
    },
  },
  {
    name: "✓ groq-sdk installed",
    check: () => {
      try {
        require("groq-sdk");
        return { pass: true, message: "groq-sdk package found" };
      } catch {
        return { pass: false, message: "groq-sdk not installed - run 'npm install'" };
      }
    },
  },
  {
    name: "✓ TypeScript files created",
    check: () => {
      const typeDir = path.join(process.cwd(), "lib");
      const files = ["types.ts", "prompts.ts"];
      const missing = files.filter((f) => !fs.existsSync(path.join(typeDir, f)));
      if (missing.length > 0) {
        return { pass: false, message: `Missing files: ${missing.join(", ")}` };
      }
      return { pass: true, message: "lib/types.ts and lib/prompts.ts found" };
    },
  },
  {
    name: "✓ API route created",
    check: () => {
      const apiRoute = path.join(process.cwd(), "app", "api", "generate", "route.ts");
      if (!fs.existsSync(apiRoute)) {
        return { pass: false, message: "app/api/generate/route.ts not found" };
      }
      return { pass: true, message: "API route found" };
    },
  },
  {
    name: "✓ package.json updated",
    check: () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
      );
      if (!pkg.dependencies["groq-sdk"]) {
        return { pass: false, message: "groq-sdk not in package.json dependencies" };
      }
      return { pass: true, message: `groq-sdk v${pkg.dependencies["groq-sdk"]} added` };
    },
  },
];

let allPass = true;
for (const check of checksToPerform) {
  const result = check.check();
  const status = result.pass ? "✅" : "❌";
  console.log(`${status} ${check.name}`);
  console.log(`   ${result.message}\n`);
  if (!result.pass) allPass = false;
}

if (allPass) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ All checks passed! Ready to run.\n");
  console.log("Next steps:");
  console.log("1. Verify GROQ_API_KEY is set in .env.local");
  console.log("2. Run: npm run dev");
  console.log("3. Open: http://localhost:3000");
  console.log("4. Test with sample paper text");
} else {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  Some checks failed. See above for details.\n");
  process.exit(1);
}
