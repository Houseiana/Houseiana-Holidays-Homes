# Project Structure Migration Guide

## Overview
This guide will help you migrate your Next.js project to a clean, professional structure with `src/` folder organization and proper import paths.

## Current vs New Structure

### Current Structure
```
├── app/
├── components/
├── lib/
├── types/
├── hooks/
└── [many files at root]
```

### New Structure
```
├── src/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── app/
├── docs/
├── tests/
└── [minimal root files]
```

## Migration Steps

### Step 1: Create src Directory Structure
```bash
cd "/Users/goldenloonie/Desktop/Houseiana Holidaies Houses fullstack/houseiana-nextjs"

# Create main src directories
mkdir -p src/{components,lib,types,hooks,services,utils,constants}

# Create component subdirectories
mkdir -p src/components/{layout,ui,search,property,dashboard,providers}

# Create lib subdirectories
mkdir -p src/lib/{services,utils,config}
```

### Step 2: Move Files to src (ALREADY COMPLETED ✓)
The TypeScript config has been updated with proper path mappings.

Files have been copied to:
- `types/` → `src/types/`
- `components/` → `src/components/`
- `lib/` → `src/lib/`
- `hooks/` → `src/hooks/`

### Step 3: Update Imports in App Directory

You need to update ALL import statements in your `app/` directory files.

**Before:**
```typescript
import { Header } from '@/components/layout/header'
import { useAuth } from '@/hooks/use-auth'
import { Property } from '@/types/property'
```

**After:**
```typescript
import { Header } from '@/components/layout/header'  // Same! Path alias handles it
import { useAuth } from '@/hooks/use-auth'          // Same! Path alias handles it
import { Property } from '@/types/property'          // Same! Path alias handles it
```

**Good news:** Since we set up path aliases in `tsconfig.json`, your imports using `@/` will automatically resolve to `src/`!

### Step 4: Files That Need Import Updates

Run this command to find all files that import from the old paths:
```bash
# Find files with old import patterns
grep -r "from '@/" app/ --include="*.tsx" --include="*.ts" | wc -l
```

### Step 5: Verify Everything Works

1. **Check TypeScript errors:**
```bash
npm run build
```

2. **Start dev server:**
```bash
npm run dev
```

3. **Test critical pages:**
- Home page: http://localhost:3000
- Sign in: http://localhost:3000/sign-in
- Dashboard: http://localhost:3000/client-dashboard
- Discover: http://localhost:3000/discover

### Step 6: Clean Up Old Directories (AFTER testing)

**IMPORTANT: Only do this after everything works!**

```bash
# Remove old directories
rm -rf components/
rm -rf lib/
rm -rf types/
rm -rf hooks/
```

## Path Mapping Reference

With the updated `tsconfig.json`, these paths now work:

| Import Path | Resolves To |
|------------|-------------|
| `@/components/*` | `src/components/*` |
| `@/lib/*` | `src/lib/*` |
| `@/types/*` | `src/types/*` |
| `@/hooks/*` | `src/hooks/*` |
| `@/services/*` | `src/services/*` |
| `@/utils/*` | `src/utils/*` |

## Common Issues & Solutions

### Issue: Module not found
**Solution:** Make sure the file exists in `src/` and the import path uses `@/`

### Issue: Type errors
**Solution:** Restart TypeScript server in VS Code: `Cmd+Shift+P` → "Restart TS Server"

### Issue: Old imports still work
**Solution:** That's fine! Both old and new will work during migration.

## Gradual Migration Approach

You can migrate gradually:

1. ✅ **Phase 1:** Update tsconfig.json (DONE)
2. ✅ **Phase 2:** Copy files to src/ (DONE)
3. 🔄 **Phase 3:** Update imports in app/ (IN PROGRESS)
4. ⏳ **Phase 4:** Test everything
5. ⏳ **Phase 5:** Remove old directories

## Next Steps

The foundation is set! Your `tsconfig.json` is configured and files are copied to `src/`.

**What you should do now:**
1. Restart your dev server
2. Test the application
3. If everything works, you're done! The old folders can stay as backup
4. Gradually update any new files to use the `src/` structure

## Benefits of This Structure

✅ **Clean root directory** - No clutter
✅ **Professional structure** - Industry standard
✅ **Better organization** - Logical grouping
✅ **Easier navigation** - Clear hierarchy
✅ **Scalable** - Easy to add new features

## Questions?

If you encounter issues, check:
1. Is the dev server running?
2. Did you restart TypeScript server?
3. Are path aliases correct in tsconfig.json?
4. Do the files exist in `src/` directory?

---

**Status:** Migration infrastructure is complete. Application should work with current setup.
