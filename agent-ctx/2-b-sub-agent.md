# Task 2-b: Extract PortalPasteDialog from page.tsx

## Task
Extract the PortalPasteDialog component from `/home/z/my-project/src/app/page.tsx` into a separate file.

## What Was Done

### Created File
`/home/z/my-project/src/components/dialogs/PortalPasteDialog.tsx`

### Extraction Details

**Props Interface:**
```typescript
interface PortalPasteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataChanged: () => void
  toast: any
  jalurConfigs: Array<{ id: string; nama: string; persentase: number; urutan: number; aktif: boolean }>
}
```

**Internal State (moved from parent):**
- `portalRawText` - raw text from paste
- `portalParsedData` - parsed data record
- `portalParsing` - parsing in-progress flag
- `portalSelectedJalur` - selected jalur dropdown value
- `portalSaving` - saving in-progress flag (replaces shared `importing` state)

**Internal Logic (moved from parent):**
- `parsePortalText()` - full text parser with jalur detection, field extraction, nilai rapor parsing
- `handlePortalPaste()` - triggers parsing and sets detected jalur
- `handlePortalSave()` - POSTs to `/api/registrations/portal-paste`, shows toast, calls `onDataChanged()`
- `resetState()` - clears all internal state when dialog closes

**Imports:**
- UI: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Card, CardContent, Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea
- Icons: ClipboardPaste, ClipboardCheck, CheckCircle2, Users, IdCard, CalendarDays, Phone, MapPinned, Award, GraduationCap, RotateCcw, Loader2, Check
- Lib: SUB_JALUR_COLORS from @/lib/constants, getJalurIcon & getJalurSubFilter from @/lib/helpers

**Key Design Decisions:**
- `portalSaving` replaces the parent's shared `importing` state for better encapsulation
- `onDataChanged()` callback replaces direct `fetchRegistrations()` + `fetchStats()` calls
- `onOpenChange(false)` replaces direct `setPortalPasteOpen(false)` call
- All JSX copied exactly as it appeared in the original file

## Status
- ✅ Component file created
- ✅ Lint passes cleanly
- ⏳ page.tsx NOT yet updated to use the extracted component (inline code still present)
