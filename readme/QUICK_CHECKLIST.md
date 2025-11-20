# Quick Reference Checklist
**For Future Development & Deployment**

## ⚡ **Daily Development Checklist**

### **Before Making Changes:**
- [ ] Am I updating React components in `/src/pages/` or `/src/components/`?
- [ ] Am I avoiding changes to HTML files in root directory?
- [ ] Do I have the correct file open in VS Code?

### **After Making Changes:**
- [ ] Run `npm run build` to test production build
- [ ] Check for any compilation errors
- [ ] Test the specific feature I modified
- [ ] Verify no console errors in browser

---

## 🚀 **Pre-Deployment Checklist**

### **Build Verification:**
- [ ] `npm run build` completes successfully
- [ ] No TypeScript compilation errors
- [ ] Bundle size is reasonable (< 1MB if possible)
- [ ] All components properly imported

### **Feature Testing:**
- [ ] **Calendar Export:** Can download .ics files
- [ ] **Calendar Sync:** URLs generate and copy correctly
- [ ] **Image Gallery:** Lazy loading works, images display properly
- [ ] **Admin Functions:** Booking management, status filtering works
- [ ] **Navigation:** All page routes function correctly

### **API Testing:**
- [ ] Booking data loads correctly
- [ ] Calendar API endpoints respond
- [ ] Image API returns proper data
- [ ] Error handling works for failed requests

---

## 🔍 **Monthly Health Check**

### **File Integrity Check:**
- [ ] Compare HTML file dates with React component dates
- [ ] Ensure no accidental HTML file updates
- [ ] Verify React components have latest features
- [ ] Check for unused HTML files that can be archived

### **Performance Check:**
- [ ] Build time is reasonable (< 15 seconds)
- [ ] Bundle size hasn't grown significantly
- [ ] Image loading performance is good
- [ ] No memory leaks in calendar components

### **Documentation Update:**
- [ ] Update MIGRATION_RECORD.md if new features added
- [ ] Document any new API endpoints
- [ ] Update troubleshooting guide if issues found
- [ ] Record any new dependencies added

---

## 🚨 **Emergency Troubleshooting**

### **If Production Features Are Missing:**

1. **Check File Dates:**
   ```powershell
   Get-ChildItem "*.html" | Sort-Object LastWriteTime -Descending | Select-Object Name, LastWriteTime
   ```

2. **Check React Components:**
   ```powershell
   Get-ChildItem "src/pages/*.tsx" | Sort-Object LastWriteTime -Descending | Select-Object Name, LastWriteTime
   ```

3. **Compare Dates:** If HTML files are newer, features may need migration

### **If Build Fails:**

1. **Clear Cache and Rebuild:**
   ```bash
   npm run build:clean  # or delete dist/ folder
   npm install
   npm run build
   ```

2. **Check TypeScript Errors:**
   - Look for missing imports
   - Verify component prop types
   - Check for syntax errors

3. **Verify Dependencies:**
   ```bash
   npm install  # Reinstall dependencies
   ```

### **If Calendar Features Don't Work:**

1. **Test API Endpoints Manually:**
   - Visit `/api/bookings.php` in browser
   - Check `/api/ical.php?action=subscribe`
   - Verify API responses are valid JSON

2. **Check Console Errors:**
   - Open browser developer tools
   - Look for network or JavaScript errors
   - Test calendar export/sync buttons

---

## 📋 **Quick Command Reference**

### **Build Commands:**
```bash
npm run build          # Production build
npm run dev           # Development server
npm run preview       # Preview production build locally
```

### **File Check Commands:**
```powershell
# Check HTML file modification dates
Get-ChildItem "*.html" | Select-Object Name, LastWriteTime | Sort-Object LastWriteTime -Descending

# Check React component dates
Get-ChildItem "src/pages/*.tsx" | Select-Object Name, LastWriteTime

# Check build output
Get-ChildItem "dist/" -Recurse | Select-Object Name, Length
```

### **Important File Paths:**
- **Admin Management:** `src/pages/AdminManagement.tsx`
- **Image Gallery:** `src/components/ImageGallery.tsx`
- **Calendar View:** `src/pages/AdminCalendar.tsx`
- **Migration Record:** `MIGRATION_RECORD.md`
- **Build Output:** `dist/index.html`

---

## 📊 **Success Indicators**

### **Green Flags (Everything Working):**
- ✅ Build completes in < 15 seconds
- ✅ Bundle size < 600KB
- ✅ No console errors
- ✅ All calendar functions work
- ✅ Images load smoothly with lazy loading
- ✅ Admin panel responsive and functional

### **Red Flags (Needs Attention):**
- ❌ Build fails or takes > 30 seconds
- ❌ Bundle size > 1MB
- ❌ Console errors in browser
- ❌ Calendar export/sync not working
- ❌ Images loading slowly or failing
- ❌ HTML files modified after React components

---

## 🎯 **Contact & Support**

**If You Need Help:**
1. Check `MIGRATION_RECORD.md` for detailed information
2. Review `HTML_TO_REACT_MIGRATION.md` for migration history
3. Run through troubleshooting steps above
4. Document any new issues found for future reference

**Remember:** Always work in React components (`/src/` folder), never in HTML files for production features!