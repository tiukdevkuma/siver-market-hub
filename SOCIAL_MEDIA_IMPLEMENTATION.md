# Social Media & Sales Metric Implementation

## Completed Features
1. **Social Media Configuration**
   - Updated `StoreEditDialog.tsx` to include input fields for Facebook, Instagram, WhatsApp, and TikTok.
   - Data is stored in the `metadata` JSONB column of the `stores` table.

2. **Store Profile Display**
   - Updated `StoreProfilePage.tsx` to render social media icons if links are present.
   - Added "Approx sales in last 24h" metric (mocked for now based on store ID + date).

3. **Type Definitions**
   - Updated `useStore.ts` to include `metadata` in the `StoreProfile` interface.

## Files Modified
- `src/components/seller/StoreEditDialog.tsx`
- `src/pages/StoreProfilePage.tsx`
- `src/hooks/useStore.ts`

## Next Steps
- Verify the "Sold in last 24h" metric with real data when available.
- Add validation for social media URLs.
