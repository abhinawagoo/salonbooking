# Troubleshooting: UI Not Updating

If changes are not reflected in the UI, try these steps:

## 1. Restart Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 2. Clear Browser Cache
- **Chrome/Edge**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- **Firefox**: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
- Or open DevTools → Network → Check "Disable cache"

## 3. Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

## 4. Check Browser Console
Open DevTools (F12) and check for:
- JavaScript errors
- Network errors (failed API calls)
- React errors

## 5. Verify Environment
Make sure:
- Database is running and connected
- `.env` file is configured correctly
- All dependencies are installed: `npm install`

## 6. Check API Endpoints
Test the API directly:
```bash
curl http://localhost:3000/api/admin/bookings
```

## Common Issues:

### Issue: Page shows "Loading..." forever
- Check if `/api/admin/bookings` is returning data
- Check browser console for errors
- Verify database connection

### Issue: Empty page or "No bookings found"
- Check if there are bookings in the database
- Run `npm run db:seed` to add sample data
- Check API response in Network tab

### Issue: Styling not updating
- Hard refresh browser (Cmd+Shift+R)
- Clear `.next` folder
- Restart dev server

### Issue: Component not rendering
- Check browser console for React errors
- Verify all imports are correct
- Check if there are TypeScript errors

---

**Still not working?** Check the terminal where `npm run dev` is running for error messages.
