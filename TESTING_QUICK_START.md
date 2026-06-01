# Quick Testing Guide

This is the fastest way to verify your SDK works before publishing to npm.

## ⚡ Quick Test (30 seconds)

### Step 1: Build the SDK
```bash
cd sdk
npm install
npm run build
```

### Step 2: Run Verification Tests
```bash
npx ts-node test-quick.ts
```

**Expected Output:**
```
🧪 ModelBridge SDK Verification Tests

==================================================
✅ 1. SDK Initialization
✅ 2. Configuration Storage
✅ 3. API Key Masking
✅ 4. Chat Resource Available
✅ 5. Models Resource Available
✅ 6. Usage Resource Available
✅ 7. Credits Resource Available
✅ 8. Future Resources Available
✅ 9. Error Classes Exported
✅ 10. Stream Class Exported
✅ 11. ApiError Hierarchy
✅ 12. RateLimitError with retryAfter
✅ 13. InsufficientCreditsError Details
✅ 14. ProviderError Retryable Flag
✅ 15. ValidationError with Details
✅ 16. SDK Close Method Exists
✅ 17. Custom Configuration
✅ 18. SDK Version Available
✅ 19. Browser Warning Configuration
✅ 20. All Barrel Exports Work
==================================================

📊 Results: 20 passed, 0 failed
✅ All tests passed! SDK is ready for use.
```

---

## 📋 Full Testing Suite (5 minutes)

### Step 1: Build and Check Types
```bash
npm run build              # Compile TypeScript
npm run type-check         # Verify types
npm run lint               # Check code style
npm run format             # Format code
```

**Expected:** No errors from all commands

### Step 2: Run Unit Tests
```bash
npm test                   # Run Jest tests
npm test:coverage          # See coverage report
```

**Expected:** Tests pass with >70% coverage

### Step 3: Run Verification Tests
```bash
npx ts-node test-quick.ts
```

**Expected:** All 20 tests pass ✅

---

## 🔗 Test SDK in Another Project (10 minutes)

This simulates real-world usage before publishing to npm.

### Step 1: Link the SDK Globally

```bash
cd sdk
npm link
```

### Step 2: Create a Test Project

```bash
cd ..
mkdir sdk-demo
cd sdk-demo
npm init -y
npm install typescript @types/node --save-dev
npm link @model-bridge/sdk
```

### Step 3: Create Test File

Create `index.ts`:

```typescript
import { ModelBridge } from '@model-bridge/sdk';

async function main() {
  const client = new ModelBridge({
    apiKey: 'sk-test-key',
  });

  console.log('✅ SDK loaded successfully!');
  console.log('✅ Chat resource:', !!client.chat);
  console.log('✅ Models resource:', !!client.models);
  console.log('✅ Usage resource:', !!client.usage);
  console.log('✅ Credits resource:', !!client.credits);

  const config = client.getConfig();
  console.log('✅ Configuration:', JSON.stringify(config, null, 2));
}

main();
```

### Step 4: Run It

```bash
npx ts-node index.ts
```

**Expected Output:**
```
✅ SDK loaded successfully!
✅ Chat resource: true
✅ Models resource: true
✅ Usage resource: true
✅ Credits resource: true
✅ Configuration: {
  "apiKey": "sk-test...key",
  "baseURL": "https://api.modelbridge.ai/v1",
  "timeout": 30000,
  "maxRetries": 3,
  "userAgent": "ModelBridge SDK/1.0.0 (Node.js/...)",
  "dangerouslyAllowBrowser": false
}
```

---

## 🧪 Test With Real API (Optional)

If you have a real API key and want to test actual endpoints:

### Step 1: Create `.env` File

Create `sdk-demo/.env`:

```
MODELBRIDGE_API_KEY=sk-your-real-api-key-here
```

### Step 2: Create Real API Test

Create `real-test.ts`:

```typescript
import * as dotenv from 'dotenv';
import { ModelBridge } from '@model-bridge/sdk';

dotenv.config();

async function main() {
  const client = new ModelBridge({
    apiKey: process.env.MODELBRIDGE_API_KEY!,
  });

  try {
    console.log('Testing real API endpoints...\n');

    // Test 1: List models
    console.log('1️⃣ Listing models...');
    const models = await client.models.list(3);
    console.log('✅ Models:', models);

    // Test 2: Get model details
    console.log('\n2️⃣ Getting model details...');
    const gpt4 = await client.models.retrieve('gpt-4');
    console.log('✅ GPT-4:', gpt4);

    // Test 3: Get balance
    console.log('\n3️⃣ Getting credit balance...');
    const balance = await client.credits.balance();
    console.log('✅ Balance:', balance);

    // Test 4: Get usage
    console.log('\n4️⃣ Getting current usage...');
    const usage = await client.usage.getCurrent();
    console.log('✅ Usage:', usage);

    console.log('\n✅ All API tests passed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
```

### Step 3: Run Real Tests

```bash
npm install dotenv
npx ts-node real-test.ts
```

---

## 📦 Pre-Publishing Verification

Run this checklist before publishing to npm:

```bash
# In sdk directory
npm run build              # ✅ No errors
npm run type-check         # ✅ Type safe
npm run lint               # ✅ Code quality
npm run format             # ✅ Formatted
npm test                   # ✅ Tests pass
npx ts-node test-quick.ts  # ✅ All 20 verification tests pass

# Check distribution
ls -lh dist/               # ✅ Reasonable size
cat package.json           # ✅ Correct metadata
```

**When all pass:** Ready to publish! 🎉

---

## 🚀 Publishing to npm

```bash
# Update version
npm version patch          # or minor/major

# Publish
npm publish --access public
```

After publishing, you can install it anywhere with:
```bash
npm install @model-bridge/sdk
```

---

## ❓ Troubleshooting

### "Cannot find module '@model-bridge/sdk'"
```bash
# Make sure you ran npm link in sdk directory
cd sdk
npm link

# Then link in test project
cd ../sdk-demo
npm link @model-bridge/sdk
```

### "TypeScript compilation errors"
```bash
# Rebuild SDK
cd sdk
npm run build
```

### "Changes not showing in test project"
```bash
# Rebuild SDK after changes
cd sdk
npm run build

# Clear test project cache
cd ../sdk-demo
rm -rf node_modules/.cache
npm install
```

### "Module resolution issues"
Make sure test project has proper `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "module": "commonjs",
    "target": "es2020"
  }
}
```

---

## 📊 Test Coverage

The SDK includes tests for:

✅ SDK Initialization  
✅ Configuration Management  
✅ Resource Availability  
✅ Error Classes  
✅ Type Exports  
✅ Stream Implementation  
✅ Error Hierarchy  
✅ Special Error Handling  
✅ Version Information  
✅ Browser Configuration  

Total: **20 verification tests** that should all pass

---

## 📖 Next Steps

1. **Run quick tests** → `npx ts-node test-quick.ts`
2. **Test in demo project** → Use npm link method above
3. **Test with real API** → See "Test With Real API" section
4. **Publish to npm** → `npm publish --access public`

**Questions?** See [TEST_GUIDE.md](TEST_GUIDE.md) for detailed documentation.
