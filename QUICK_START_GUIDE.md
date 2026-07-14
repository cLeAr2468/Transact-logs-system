# Quick Start Guide - Add Transaction Feature

## Prerequisites

1. **Backend (Laravel)** running on `http://127.0.0.1:8000`
2. **Frontend (React)** - Transact-logs-system
3. **Admin/Staff** user logged in

## Setup Steps

### 1. Ensure Backend is Running
```bash
cd c:\xampp\htdocs\Logs-server-system\logs-server
php artisan serve
```

### 2. Start Frontend Development Server
```bash
cd c:\Users\User\Desktop\Transact-logs-system\logs-system
npm run dev
```

## Testing the Feature

### Step 1: Login as Admin/Staff
- Navigate to the login page
- Login with admin or staff credentials
- Token will be stored in localStorage

### Step 2: Navigate to Add Transaction
- Go to `/add-transact` route
- Or click "Add New Transaction" from the transactions page

### Step 3: Test Student ID Validation

#### Test Case 1: Valid Student ID
1. Enter a valid student ID (e.g., from your users table)
2. Click **"Validate"** button
3. **Expected Result**:
   - Green checkmark appears "✓ Student found"
   - First name, middle name, last name, and course auto-fill
   - All form fields become enabled
   - Success toast notification appears

#### Test Case 2: Invalid Student ID
1. Enter a non-existent student ID (e.g., "INVALID-123")
2. Click **"Validate"** button
3. **Expected Result**:
   - Error toast: "Student ID not found in the database"
   - Form remains disabled
   - No data auto-fills

### Step 4: Test Date Selection

#### Test Case 3: Past Date Prevention
1. After validating a student ID
2. Click on the Schedule Date field
3. Try to select a past date
4. **Expected Result**:
   - Date picker prevents selection of past dates
   - Only today and future dates are selectable

### Step 5: Fill Form and Submit

#### Test Case 4: Complete Form Submission
1. Validate a student ID (e.g., a real student from your database)
2. Select a **future date** for Schedule Date
3. Select a **Purpose** (e.g., "ID Validation")
4. Fill in all **Address fields**:
   - Street / House No.
   - Barangay
   - City / Municipality
   - Province
5. Select a **Time Slot** (morning or afternoon)
6. Click **"SUBMIT TRANSACTION"**
7. **Expected Result**:
   - Success toast: "Transaction created successfully!"
   - Redirects to `/transact` page
   - Transaction appears in the transactions list

#### Test Case 5: Incomplete Form Validation
1. Validate a student ID
2. Leave some fields empty (e.g., don't select date)
3. Click **"SUBMIT TRANSACTION"**
4. **Expected Result**:
   - Error toast with specific message about missing field
   - Form does not submit
   - Remains on the page

### Step 6: Test Duplicate Prevention

#### Test Case 6: Duplicate Purpose
1. Create a transaction with purpose "ID Validation" for a student
2. Try to create another transaction with the same purpose for the same student
3. **Expected Result**:
   - Error toast: "This student already has a pending or approved appointment for 'ID Validation'"
   - Transaction not created

#### Test Case 7: Time Slot Conflict
1. Create a transaction for specific date and time (e.g., July 15, 09:30 AM)
2. Try to create another transaction for the same date and time (even different student)
3. **Expected Result**:
   - Error toast: "This time slot is already booked for the selected date."
   - Transaction not created

### Step 7: Test Cancel Button
1. Start filling the form
2. Click **"Cancel"** button
3. **Expected Result**:
   - Confirmation dialog: "Are you sure you want to cancel?"
   - If confirmed, navigates back to `/transact`

## Sample Test Data

### Sample Valid Student IDs (from your database)
You need to check your `users` table for actual student IDs. Example query:
```sql
SELECT student_id, fname, mname, lname, course FROM users LIMIT 5;
```

### Sample Form Data
```
Student ID: [Use actual ID from your database]
Schedule Date: July 15, 2026
Purpose: ID Validation
Street/House No: 123 Main Street
Barangay: San Jose
Municipality: Manila
Province: Metro Manila
Time Slot: 09:30 AM
```

## Troubleshooting

### Issue: "Failed to validate Student ID"
**Possible Causes:**
- Backend not running
- Wrong API URL in `.env`
- Network error

**Solution:**
1. Check if Laravel backend is running on port 8000
2. Verify `.env` has: `VITE_API_URL=http://127.0.0.1:8000/api`
3. Check browser console for errors

### Issue: "Unauthorized" or 401 error
**Cause:** Token expired or not set

**Solution:**
1. Logout and login again as admin/staff
2. Check localStorage has `token` key
3. Verify token is sent in Authorization header

### Issue: Toast notifications not showing
**Cause:** Toaster component not mounted

**Solution:**
1. Check `main.jsx` has `<Toaster />` component
2. Verify sonner is installed: `npm list sonner`
3. Restart dev server

### Issue: Date picker showing past dates
**Cause:** Browser compatibility or wrong format

**Solution:**
- Use Chrome/Edge/Firefox (modern browsers)
- Check `min={today}` attribute is set correctly
- Browser will natively prevent past date selection

### Issue: Form fields not enabling after validation
**Cause:** Validation state not updating

**Solution:**
1. Check browser console for API errors
2. Verify student ID exists in database
3. Check `isUserValidated` state in React DevTools

## API Endpoints Reference

### Validate Student ID
```
POST http://127.0.0.1:8000/api/transactions/validate-student
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
  {
    "student_id": "2021-12345"
  }
```

### Create Transaction by Admin
```
POST http://127.0.0.1:8000/api/transactions/create-by-admin
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
  {
    "student_id": "2021-12345",
    "purpose": "ID Validation",
    "street_house_no": "123 Main St",
    "brgy": "San Jose",
    "municipality": "Manila",
    "province": "Metro Manila",
    "schedule_date": "2026-07-15",
    "time_slot": "09:30 AM"
  }
```

## Browser Developer Tools

### Check Token
1. Open Developer Tools (F12)
2. Go to Application tab
3. Look for localStorage → token

### Check API Calls
1. Open Developer Tools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for `/transactions/validate-student` and `/transactions/create-by-admin`
5. Check request headers, body, and response

### Check Console for Errors
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages

## Success Indicators

✅ Student validation works
✅ Auto-fill displays correct information
✅ Date picker blocks past dates
✅ All form fields are interactive after validation
✅ Toast notifications appear
✅ Form submits successfully
✅ Redirects to transactions page
✅ Transaction appears in database
✅ Duplicate prevention works

## Next Steps After Testing

Once the feature works correctly:
1. Test with multiple students
2. Test edge cases (special characters in address, etc.)
3. Test on different browsers
4. Test with different screen sizes (responsive design)
5. Consider adding more validation rules
6. Add loading states for better UX
7. Consider adding time slot availability indicator

## Need Help?

- Check Laravel logs: `c:\xampp\htdocs\Logs-server-system\logs-server\storage\logs\laravel.log`
- Check browser console for JavaScript errors
- Verify database has users with valid student_ids
- Ensure all migrations have been run
- Check API is accessible via Postman/Insomnia first

## Files Modified/Created

### Backend:
- ✅ `app/Http/Controllers/TransactionController.php` - Added 2 new methods
- ✅ `routes/api.php` - Added 2 new routes

### Frontend:
- ✅ `src/components/pages/add-transact.jsx` - Complete rewrite with validation
- ✅ `src/main.jsx` - Added Toaster component
- ✅ `package.json` - Added sonner dependency

### Documentation:
- ✅ `ADD_TRANSACTION_DOCUMENTATION.md` - Complete feature documentation
- ✅ `QUICK_START_GUIDE.md` - This file

---

**Happy Testing! 🚀**
