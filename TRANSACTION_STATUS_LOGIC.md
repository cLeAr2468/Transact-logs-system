# Transaction Status Logic Documentation

## Overview
This document explains how transaction statuses are automatically set based on who creates the transaction (Admin/Staff vs Client).

## Status Assignment Rules

### 🔵 **Admin/Staff Creates Transaction** (via add-transact.jsx)
- **Initial Status**: `approved` (Displays as **Processing**)
- **Endpoint**: `POST /api/transactions/create-by-admin`
- **Method**: `TransactionController@storeByAdmin`
- **Reasoning**: When admin/staff creates a transaction on behalf of a student, it's pre-approved and ready to be processed
- **Workflow**: Transaction is created → Status is `approved` → Admin can mark as `completed`

### 🔴 **Client Creates Transaction** (via new-appointment.jsx)
- **Initial Status**: `pending` (Displays as **Pending**)
- **Endpoint**: `POST /api/appointments`
- **Method**: `TransactionController@store`
- **Reasoning**: When a client self-registers for an appointment, it needs admin approval first
- **Workflow**: Transaction is created → Status is `pending` → Admin approves → Status becomes `approved` → Admin completes → Status becomes `completed`

## Complete Status Flow

### Admin/Staff Created Transaction Flow:
```
┌─────────────────────────────┐
│  Admin Creates Transaction  │
│   (add-transact.jsx)        │
└──────────┬──────────────────┘
           │
           ↓
    ┌──────────────┐
    │  Processing  │ (status: approved)
    │  (Blue)      │
    └──────┬───────┘
           │
           │ Admin clicks "Complete"
           ↓
    ┌──────────────┐
    │  Completed   │ (status: completed)
    │  (Green)     │
    └──────────────┘
```

### Client Created Transaction Flow:
```
┌─────────────────────────────┐
│  Client Creates Transaction │
│   (new-appointment.jsx)     │
└──────────┬──────────────────┘
           │
           ↓
    ┌──────────────┐
    │   Pending    │ (status: pending)
    │   (Red)      │
    └──┬────────┬──┘
       │        │
       │        │ Admin clicks "Reject"
       │        ↓
       │   ┌──────────────┐
       │   │   Rejected   │ (status: rejected)
       │   │   (Gray)     │
       │   └──────────────┘
       │
       │ Admin clicks "Approve"
       ↓
    ┌──────────────┐
    │  Processing  │ (status: approved)
    │  (Blue)      │
    └──────┬───────┘
           │
           │ Admin clicks "Complete"
           ↓
    ┌──────────────┐
    │  Completed   │ (status: completed)
    │  (Green)     │
    └──────────────┘
```

## Backend Implementation

### Admin/Staff Endpoint: `storeByAdmin()`

**Location**: `TransactionController.php`

```php
public function storeByAdmin(Request $request)
{
    // ... validation and checks ...

    // Create transaction with status 'approved' (Processing)
    $transaction = Transaction::create([
        'user_id' => $user->id,
        'purpose' => $request->purpose,
        // ... other fields ...
        'status' => 'approved', // ✅ Admin/Staff created = automatically approved
    ]);

    return response()->json([
        'message' => 'Transaction created successfully with Processing status',
        'transaction' => $transaction
    ], 201);
}
```

**Key Points:**
- ✅ Status is set to `approved` (Processing)
- ✅ Validates student_id exists in users table
- ✅ Checks for duplicate appointments
- ✅ Checks for time slot conflicts
- ✅ Message confirms "Processing status"

### Client Endpoint: `store()`

**Location**: `TransactionController.php`

```php
public function store(Request $request)
{
    // ... validation and checks ...

    // Create transaction with status 'pending'
    $transaction = Transaction::create([
        'user_id' => $request->user()->id,
        'purpose' => $request->purpose,
        // ... other fields ...
        'status' => 'pending', // ✅ Client created = needs approval
    ]);

    return response()->json([
        'message' => 'Appointment created successfully',
        'transaction' => $transaction
    ], 201);
}
```

**Key Points:**
- ✅ Status is set to `pending`
- ✅ Uses authenticated user's ID (`$request->user()->id`)
- ✅ Checks for duplicate appointments for same user
- ✅ Checks for time slot conflicts for same user
- ✅ Message confirms appointment creation

## Frontend Display Mapping

### Status Values in Database vs Frontend Display:

| Database Status | Frontend Display | Badge Color | Available Actions |
|----------------|------------------|-------------|-------------------|
| `pending` | **Pending** | 🔴 Red | Approve, Reject |
| `approved` | **Processing** | 🔵 Blue | Complete |
| `completed` | **Completed** | 🟢 Green | No actions |
| `rejected` | **Rejected** | ⚫ Gray | No actions |
| `cancelled` | **Cancelled** | 🟠 Orange | No actions |

## Action Buttons by Status

### Pending Status (🔴 Red):
- **Approve Button** → Changes status to `approved` (Processing)
- **Reject Button** → Changes status to `rejected`

### Processing Status (🔵 Blue):
- **Complete Button** → Changes status to `completed`

### Final Statuses (🟢🟠⚫):
- **No Actions Available**

## Use Cases

### Use Case 1: Walk-in Student (Admin Creates)
**Scenario**: Student walks into the office for immediate service

1. Admin opens add-transact.jsx
2. Admin validates student ID
3. Admin fills in appointment details
4. Admin submits transaction
5. **Transaction is created with status = `approved` (Processing)**
6. Service can be provided immediately
7. Admin marks as complete when done

**Benefit**: No waiting for approval, immediate service

### Use Case 2: Online Appointment (Client Creates)
**Scenario**: Student creates appointment from home

1. Client opens new-appointment.jsx
2. Client fills in appointment details
3. Client submits appointment
4. **Transaction is created with status = `pending`**
5. Admin reviews appointment in transact.jsx
6. Admin approves or rejects
7. If approved, admin can later mark as complete

**Benefit**: Admin control over appointments, prevents conflicts

## Authentication Requirements

### Admin/Staff Endpoint:
- **Middleware**: `admin.auth`
- **Token**: `admin_token` (stored in localStorage)
- **Access**: Only admin and staff users
- **Validation**: Token must be valid for admin/staff user

### Client Endpoint:
- **Middleware**: `auth:sanctum`
- **Token**: `auth_token` (stored in localStorage)
- **Access**: Regular users (students)
- **Validation**: Token must be valid for regular user

## Database Schema

### Transactions Table - Status Column:
```php
$table->enum('status', [
    'pending',    // Initial status for client-created
    'approved',   // Processing status, initial for admin-created
    'completed',  // Final successful status
    'cancelled',  // User cancelled
    'rejected'    // Admin rejected
])->default('pending');
```

## API Endpoints Summary

### 1. Admin/Staff Create Transaction (Pre-Approved)
```
POST /api/transactions/create-by-admin
Authorization: Bearer {admin_token}
Middleware: admin.auth

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

Response:
{
  "message": "Transaction created successfully with Processing status",
  "transaction": {
    "status": "approved",  // ← Processing status
    ...
  }
}
```

### 2. Client Create Transaction (Pending Approval)
```
POST /api/appointments
Authorization: Bearer {auth_token}
Middleware: auth:sanctum

Body:
{
  "purpose": "ID Validation",
  "street_house_no": "123 Main St",
  "brgy": "San Jose",
  "municipality": "Manila",
  "province": "Metro Manila",
  "schedule_date": "2026-07-15",
  "time_slot": "09:30 AM"
}

Response:
{
  "message": "Appointment created successfully",
  "transaction": {
    "status": "pending",  // ← Needs approval
    "user_id": 5,  // ← Authenticated user
    ...
  }
}
```

## Testing Guide

### Test Admin/Staff Transaction Creation:

1. **Login as Admin/Staff**
   ```
   Login page → Use admin credentials
   Token saved as 'admin_token'
   ```

2. **Create Transaction**
   ```
   Navigate to /add-transact
   Enter student ID: "21-sj00307"
   Click "Validate"
   Fill in all fields
   Click "SUBMIT TRANSACTION"
   ```

3. **Verify Status**
   ```
   Navigate to /transact
   Find the newly created transaction
   Expected: Status badge shows "Processing" (Blue)
   Expected: Only "Complete" button is visible
   ```

### Test Client Transaction Creation:

1. **Login as Client/Student**
   ```
   Client-Module → Login page → Use student credentials
   Token saved as 'auth_token'
   ```

2. **Create Appointment**
   ```
   Click "New Appointment" button
   Fill in purpose, address, date, time slot
   Click "CREATE APPOINTMENT"
   ```

3. **Verify Status (Admin Side)**
   ```
   Switch to Admin workspace
   Navigate to /transact
   Find the newly created transaction
   Expected: Status badge shows "Pending" (Red)
   Expected: "Approve" and "Reject" buttons are visible
   ```

## Validation Rules

### Common Validations (Both Endpoints):
- ✅ Purpose is required
- ✅ Address fields are required (street, brgy, municipality, province)
- ✅ Schedule date must be today or future
- ✅ Time slot is required
- ✅ No duplicate appointments with same purpose (pending/approved)
- ✅ Time slot must be available for selected date

### Admin-Specific Validations:
- ✅ Student ID must exist in users table
- ✅ Student ID format validation

### Client-Specific Validations:
- ✅ User must be authenticated
- ✅ Uses authenticated user's ID automatically

## Error Handling

### Common Errors:

**1. Duplicate Purpose**
```json
{
  "message": "You/This student already has a pending or approved appointment for 'ID Validation'"
}
Status Code: 409 Conflict
```

**2. Time Slot Conflict**
```json
{
  "message": "This time slot is already booked for the selected date"
}
Status Code: 409 Conflict
```

**3. Student Not Found (Admin Only)**
```json
{
  "message": "User with this Student ID not found"
}
Status Code: 404 Not Found
```

**4. Unauthorized**
```json
{
  "message": "Unauthenticated"
}
Status Code: 401 Unauthorized
```

## Benefits of This Approach

### For Admin/Staff:
- ✅ **Faster Processing**: Walk-in students get immediate service
- ✅ **Less Steps**: No need to approve transactions they created
- ✅ **Better Workflow**: Can immediately mark as complete after service

### For Clients:
- ✅ **Request-Based**: Appointments are requests, not confirmations
- ✅ **Admin Control**: Prevents scheduling conflicts and overload
- ✅ **Accountability**: Admin reviews each client request

### For System:
- ✅ **Clear Workflow**: Different paths for different user types
- ✅ **Audit Trail**: Easy to identify who created what
- ✅ **Flexibility**: Can adjust approval process later

## Future Enhancements

Possible improvements:
1. **Automatic Approval Rules**: Auto-approve certain purposes
2. **Priority Levels**: VIP students get auto-approved
3. **Business Hours Check**: Warn if appointment outside office hours
4. **Capacity Limits**: Limit appointments per time slot
5. **Notification System**: Email/SMS when status changes
6. **Reason for Rejection**: Admin can add notes when rejecting

---

**Status Logic Implementation Complete! 🎉**

Admin/Staff transactions start as **Processing** (approved)  
Client transactions start as **Pending** and need approval
