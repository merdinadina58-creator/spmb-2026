# Task 2-a: Extract SumutBerkahDialog Component

## Summary
Successfully extracted the SumutBerkahDialog component from `src/app/page.tsx` into a separate file `src/components/dialogs/SumutBerkahDialog.tsx`.

## What Was Done

### New File Created
- `src/components/dialogs/SumutBerkahDialog.tsx` — A `'use client'` component containing:
  - All SumutBerkah state variables (rawText, htmlContent, parsed, importing, result, showRaw)
  - All parsing logic (classifyTokens, parseSumutBerkahHtml, parseSumutBerkahText with 4 strategies, handleSumutBerkahPaste, doSumutBerkahParse, handleSumutBerkahImport)
  - The complete dialog JSX
  - `SumutBerkahEntry` type defined locally
  - `resetState()` helper for dialog close cleanup

### Changes to page.tsx
- Added import: `import SumutBerkahDialog from '@/components/dialogs/SumutBerkahDialog'`
- Removed 6 SumutBerkah state variables (kept `sumutBerkahOpen`/`setSumutBerkahOpen`)
- Removed ~530 lines of parsing logic
- Replaced ~250 lines of inline dialog JSX with `<SumutBerkahDialog>` component
- Net reduction: ~780 lines from page.tsx

### Component Interface
```typescript
interface SumutBerkahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataChanged: () => void
  toast: any
}
```

### Verification
- Lint passes cleanly
- Dev server running successfully
- No dangling references to removed code in page.tsx
