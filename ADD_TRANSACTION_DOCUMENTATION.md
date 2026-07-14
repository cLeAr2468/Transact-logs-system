# Add Transaction Feature Documentation

## Overview
This document describes the implementation of the Add Transaction feature that allows admin/staff to create transactions for students by validating their Student ID and auto-filling their information.

## Backend Implementation

### 1. New API Endpoints

#### Validate Student ID
- **Endpoint**: `POST /api/transactions/validate-student`
- **Auth**: Requires admin authentication (`admin.auth` middleware)
- **Request Body**:
  ```json
  {
    "student_id": "2021-12345"
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "message": "Student found",
    "found": true,
    "user": {
      "id": 1,
      "student_id": "2021-12345",
      "fname": "Juan",
      "mname": "Santos",
      "lname": "Dela Cruz",
      "course": "BSIT",
      "year_level": "4",
      "email": "juan@example.com"
    }
  }
  ```
- **Response (Not Found - 404)**:
  ```json
  {
    "message": "Student ID not found in the database",
    "found": false
  }
  ```

#### Create Transaction by Admin
- **Endpoint**: `POST /api/transactions/create-by-admin`
- **Auth**: Requires admin authentication (`admin.auth` middleware)
- **Request Body**:
  ```json
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
- **Response (Success - 201)**:
  ```json
  {
    "message": "Transaction created successfully",
    "transaction": {
      "id": 1,
      "user_id": 1,
      "purpose": "ID Validation",
      "street_house_no": "123 Main St",
      "brgy": "San Jose",
      "municipality": "Manila",
      "province": "Metro Manila",
      "schedule_date": "2026-07-15",
      "time_slot": "09:30 AM",
      "status": "pending",
      "user": {
        "id": 1,
        "student_id": "2021-12345",
        "fname": "Juan",
        "mname": "Santos",
        "lname": "Dela Cruz",
        "course": "BSIT"
      }
    }
  }
  ```
- **Response (Conflict - 409)**:
  ```json
  {
    "message": "This student already has a pending or approved appointment for 'ID Validation'"
  }
  ```

### 2. Backend Files Modified

#### TransactionController.php
Location: `c:\xampp\htdocs\Logs-server-system\logs-server\app\Http\Controllers\TransactionController.php`

**New Methods Added**:
- `validateStudentId(Request $request)`: Validates if student ID exists in users table
- `storeByAdmin(Request $request)`: Creates transaction for a student by admin/staff

**Validation Rules**:
- Student ID must exist in users table
- Schedule date cannot be in the past
- No duplicate appointments with same purpose for the same student (if pending/approved)
- Time slot must be available for the selected date

#### api.php
Location: `c:\xampp\htdocs\Logs-server-system\logs-server\routes\api.php`

**New Routes Added**:
```php
Route::middleware('admin.auth')->group(function () {
    // ... existing routes ...
    
    // Transaction management by admin/staff
    Route::post('/transactions/validate-student', [TransactionController::class, 'validateStudentId']);
    Route::post('/transactions/create-by-admin', [TransactionController::class, 'storeByAdmin']);
});
```

## Frontend Implementation

### 1. Updated Component: add-transact.jsx
Location: `c:\Users\User\Desktop\Transact-logs-system\logs-system\src\components\pages\add-transact.jsx`

### Key Features Implemented:

#### 1. Student ID Validation
- Input field for entering Student ID
- "Validate" button to check if student exists
- Loading state during validation
- Success indicator when student is found
- Error toast notification if student not found

#### 2. Auto-Fill User Information
When Student ID is validated successfully:
- First Name (auto-filled, read-only)
- Middle Name (auto-filled, read-only)
- Last Name (auto-filled, read-only)
- Course (auto-filled, read-only)

#### 3. Schedule Date Picker
- Date input with `min={today}` attribute
- Prevents selection of past dates
- Only enabled after Student ID validation

#### 4. Purpose Selection
- Dropdown with predefined purposes:
  - ID Validation
  - Scholarship
  - Good Moral
  - Assistance in Scholarship
  - ID Request Form
  - Student Clearance
- Only enabled after Student ID validation

#### 5. Address Fields
- Street / House No.
- Barangay
- City / Municipality
- Province
- All enabled only after Student ID validation

#### 6. Time Slot Selection
- Morning slots: 09:00 AM to 11:30 AM (30-minute intervals)
- Afternoon slots: 01:00 PM to 03:30 PM (30-minute intervals)
- Visual feedback for selected time
- Disabled until Student ID is validated

#### 7. Form Submission
- Validates all required fields before submission
- Shows loading state during submission
- Success toast and navigation on successful creation
- Error toast with message if creation fails

### 2. Toast Notifications Setup

#### Package Installed:
```bash
npm install sonner
```

#### main.jsx Configuration
Location: `c:\Users\User\Desktop\Transact-logs-system\logs-system\src\main.jsx`

Added Toaster component:
```jsx
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" richColors />
  </BrowserRouter>
);
```

## State Management

### Form States:
```javascript
const [studentId, setStudentId] = useState('');
const [userData, setUserData] = useState(null);
const [isUserValidated, setIsUserValidated] = useState(false);
const [isValidating, setIsValidating] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const [selectedTime, setSelectedTime] = useState('09:30 AM');
const [scheduleDate, setScheduleDate] = useState('');
const [purpose, setPurpose] = useState('');

const [streetHouseNo, setStreetHouseNo] = useState('');
const [barangay, setBarangay] = useState('');
const [municipality, setMunicipality] = useState('');
const [province, setProvince] = useState('');
```

## Workflow

### User Flow:
1. **Enter Student ID**: Admin/staff enters the student's ID
2. **Click Validate**: System checks if student exists in database
3. **Auto-fill Information**: If found, student details are automatically filled
4. **Select Schedule Date**: Choose appointment date (no past dates allowed)
5. **Select Purpose**: Choose reason for appointment
6. **Fill Address**: Complete residential address fields
7. **Select Time Slot**: Choose preferred time from available slots
8. **Submit**: Create the transaction

### Validation Flow:
1. Student ID must be validated first
2. All fields are disabled until validation succeeds
3. Date picker blocks past dates automatically
4. Form submission validates:
   - Student ID is validated
   - Schedule date is selected
   - Purpose is selected
   - All address fields are filled
   - Time slot is selected

## Testing the Feature

### Prerequisites:
1. Laravel backend running on `http://127.0.0.1:8000`
2. React frontend running
3. Admin/staff user logged in with valid token

### Test Cases:

#### Test 1: Valid Student ID
1. Enter a valid student ID from users table
2. Click "Validate"
3. ✅ Expected: Success message, student info auto-fills

#### Test 2: Invalid Student ID
1. Enter a non-existent student ID
2. Click "Validate"
3. ✅ Expected: Error toast "Student ID not found in the database"

#### Test 3: Past Date Selection
1. Validate a student ID
2. Try to select a past date
3. ✅ Expected: Date picker prevents selection of past dates

#### Test 4: Successful Transaction Creation
1. Validate student ID
2. Select future date
3. Select purpose
4. Fill address fields
5. Select time slot
6. Click "SUBMIT TRANSACTION"
7. ✅ Expected: Success toast, redirect to /transact

#### Test 5: Duplicate Purpose
1. Create transaction with purpose "ID Validation"
2. Try to create another with same purpose for same student
3. ✅ Expected: Error toast about duplicate appointment

#### Test 6: Time Slot Conflict
1. Create transaction for specific date/time
2. Try to create another for same date/time
3. ✅ Expected: Error toast about time slot being booked

## API Configuration

### Environment Variable:
The frontend uses `VITE_API_URL` from `.env`:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### Authentication:
All requests include the admin token from localStorage:
```javascript
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Error Handling

### Frontend Error Handling:
- Network errors: Shows generic error toast
- Validation errors: Shows specific error message from backend
- 404 errors: Shows "Student ID not found" message
- 409 errors: Shows duplicate/conflict message

### Backend Error Handling:
- Returns appropriate HTTP status codes
- Includes descriptive error messages
- Validates all input data
- Checks for conflicts before creating transactions

## Future Enhancements

Potential improvements:
1. Real-time availability check for time slots
2. Email notification to student when transaction is created
3. Bulk transaction creation from CSV
4. Calendar view for selecting dates
5. Student search by name as alternative to ID
6. Auto-complete for address fields
7. Transaction history for the student

## Dependencies

### Backend:
- Laravel 11.x
- Laravel Sanctum (for API authentication)

### Frontend:
- React 19.x
- React Router DOM 7.x
- Sonner (toast notifications)
- Lucide React (icons)
- Shadcn UI components

## Troubleshooting

### Issue: "Student ID not found" but ID exists
- Solution: Check users table in database, ensure student_id column matches

### Issue: Token expired or unauthorized
- Solution: Re-login as admin/staff to get new token

### Issue: Date picker shows wrong format
- Solution: Check browser locale settings, date input uses native picker

### Issue: Toast notifications not showing
- Solution: Ensure Toaster component is added to main.jsx

### Issue: CORS errors
- Solution: Check Laravel CORS configuration in config/cors.php

## Database Schema Reference

### Users Table (Relevant Fields):
- `id` (primary key)
- `student_id` (unique identifier)
- `fname` (first name)
- `mname` (middle name)
- `lname` (last name)
- `course`
- `year_level`
- `email`

### Transactions Table:
- `id` (primary key)
- `user_id` (foreign key to users)
- `purpose`
- `street_house_no`
- `brgy`
- `municipality`
- `province`
- `schedule_date`
- `time_slot`
- `status` (pending, approved, completed, cancelled, rejected)
- `created_at`
- `updated_at`

## Contact & Support

For issues or questions about this feature, refer to:
- Backend Controller: TransactionController.php
- Frontend Component: add-transact.jsx
- API Routes: routes/api.php
