# Task 3-a: Extract Ranking Tab from page.tsx

## Summary
Successfully extracted the Ranking Tab from `src/app/page.tsx` into a standalone component at `src/components/tabs/RankingTab.tsx`.

## What was done
1. Created `/home/z/my-project/src/components/tabs/RankingTab.tsx` (999 lines) as a `'use client'` component
2. Moved all 14 ranking-related state variables into the component
3. Moved all 5 ranking-related functions (fetchRanking, getRankingPrintHTML, handleRankingPreview, handleRankingPrintPDF, handleRankingExportExcel)
4. Moved the ranking tab JSX and RankingPreview dialog
5. Component fetches data on mount via `useEffect`
6. Updated page.tsx to use dynamic import and `<RankingTab>` component
7. Removed all ranking state, functions, and JSX from page.tsx
8. Lint passes cleanly

## Props interface
```typescript
interface RankingTabProps {
  authUser: { id: string; username: string; namaLengkap: string; role: string } | null
  toast: any
  subJalurOptions: Array<{ label: string; value: string }>
  rankingTampilan?: string  // optional default
}
```

## Files changed
- Created: `src/components/tabs/RankingTab.tsx`
- Modified: `src/app/page.tsx` (removed ~600 lines of ranking code)
