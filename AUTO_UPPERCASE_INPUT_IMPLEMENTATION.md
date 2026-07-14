# Auto-Uppercase Input Implementation Guide

## 🎯 GOAL
Make all text inputs automatically convert to UPPERCASE as you type, even when CAPS LOCK is OFF.

---

## ✅ FILES TO UPDATE

1. ✅ `add-transact.jsx` (Transact-logs-system)
2. ✅ `add-staff.jsx` or staff management page
3. ✅ `add-manual.jsx` or masterlist page  
4. ✅ `announce-form.jsx` (Transact-logs-system)
5. ✅ `register.jsx` (Client-Module)

---

## 🔧 IMPLEMENTATION METHOD

### **Method: Transform on Change + CSS**

```jsx
// Add to onChange handler
onChange={(e) => setFieldName(e.target.value.toUpperCase())}

// Add CSS class for visual consistency
className="uppercase"
```

---

## 📝 COMPLETE EXAMPLES

### **Example 1: Simple Input**

```jsx
// BEFORE
<Input
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// AFTER ✅
<Input
  placeholder="ENTER NAME"
  className="uppercase"
  value={name}
  onChange={(e) => setName(e.target.value.toUpperCase())}
/>
```

### **Example 2: Address Input**

```jsx
// Barangay
<Input 
  placeholder="BARANGAY" 
  className="uppercase"
  value={barangay}
  onChange={(e) => setBarangay(e.target.value.toUpperCase())}
/>

// Municipality
<Input 
  placeholder="CITY / MUNICIPALITY" 
  className="uppercase"
  value={municipality}
  onChange={(e) => setMunicipality(e.target.value.toUpperCase())}
/>

// Province
<Input 
  placeholder="PROVINCE" 
  className="uppercase"
  value={province}
  onChange={(e) => setProvince(e.target.value.toUpperCase())}
/>

// Street/House No
<Input 
  placeholder="STREET / HOUSE NO." 
  className="uppercase"
  value={streetHouseNo}
  onChange={(e) => setStreetHouseNo(e.target.value.toUpperCase())}
/>
```

### **Example 3: Textarea**

```jsx
// Purpose or Content
<Textarea
  placeholder="ENTER PURPOSE"
  className="uppercase"
  value={purpose}
  onChange={(e) => setPurpose(e.target.value.toUpperCase())}
/>
```

---

## 🎯 SPECIFIC FILE UPDATES

### 1. **add-transact.jsx** ✅

Update these inputs:

```jsx
// Street/House No
<Input 
  placeholder="STREET / HOUSE NO." 
  className="uppercase"
  value={streetHouseNo}
  onChange={(e) => setStreetHouseNo(e.target.value.toUpperCase())}
  disabled={!isUserValidated}
/>

// Barangay
<Input 
  placeholder="BARANGAY" 
  className="uppercase"
  value={barangay}
  onChange={(e) => setBarangay(e.target.value.toUpperCase())}
  disabled={!isUserValidated}
/>

// Municipality
<Input 
  placeholder="CITY / MUNICIPALITY" 
  className="uppercase"
  value={municipality}
  onChange={(e) => setMunicipality(e.target.value.toUpperCase())}
  disabled={!isUserValidated}
/>

// Province
<Input 
  placeholder="PROVINCE" 
  className="uppercase"
  value={province}
  onChange={(e) => setProvince(e.target.value.toUpperCase())}
  disabled={!isUserValidated}
/>
```

---

### 2. **announce-form.jsx** ✅

Update announcement title input:

```jsx
// Title
<Input
  placeholder="ENTER TITLE HERE..."
  className="h-11 uppercase"
  value={title}
  onChange={(e) => setTitle(e.target.value.toUpperCase())}
  disabled={loading}
/>

// Content
<textarea
  placeholder="WRITE ANNOUNCEMENT DETAILS HERE..."
  className="w-full h-[230px] resize-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 p-4 text-sm uppercase"
  value={content}
  onChange={(e) => setContent(e.target.value.toUpperCase())}
  disabled={loading}
/>
```

---

### 3. **register.jsx (Client-Module)** ✅

Update all name and address fields:

```jsx
// First Name
<Input
  id="fname"
  type="text"
  placeholder="FIRST NAME"
  className="uppercase"
  value={formData.fname}
  onChange={(e) => setFormData({...formData, fname: e.target.value.toUpperCase()})}
  required
/>

// Middle Name
<Input
  id="mname"
  type="text"
  placeholder="MIDDLE NAME"
  className="uppercase"
  value={formData.mname}
  onChange={(e) => setFormData({...formData, mname: e.target.value.toUpperCase()})}
/>

// Last Name
<Input
  id="lname"
  type="text"
  placeholder="LAST NAME"
  className="uppercase"
  value={formData.lname}
  onChange={(e) => setFormData({...formData, lname: e.target.value.toUpperCase()})}
  required
/>

// Course
<Input
  id="course"
  type="text"
  placeholder="COURSE/PROGRAM"
  className="uppercase"
  value={formData.course}
  onChange={(e) => setFormData({...formData, course: e.target.value.toUpperCase()})}
  required
/>

// Address
<Input
  id="address"
  type="text"
  placeholder="COMPLETE ADDRESS"
  className="uppercase"
  value={formData.address}
  onChange={(e) => setFormData({...formData, address: e.target.value.toUpperCase()})}
  required
/>
```

---

### 4. **add-staff.jsx** (Staff Management)

```jsx
// First Name
<Input
  placeholder="FIRST NAME"
  className="uppercase"
  value={fname}
  onChange={(e) => setFname(e.target.value.toUpperCase())}
/>

// Middle Name
<Input
  placeholder="MIDDLE NAME"
  className="uppercase"
  value={mname}
  onChange={(e) => setMname(e.target.value.toUpperCase())}
/>

// Last Name
<Input
  placeholder="LAST NAME"
  className="uppercase"
  value={lname}
  onChange={(e) => setLname(e.target.value.toUpperCase())}
/>

// Position
<Input
  placeholder="POSITION"
  className="uppercase"
  value={position}
  onChange={(e) => setPosition(e.target.value.toUpperCase())}
/>
```

---

### 5. **master-list.jsx / add-manual** (Masterlist)

```jsx
// Student ID
<Input
  placeholder="STUDENT ID"
  className="uppercase"
  value={studentId}
  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
/>

// Name
<Input
  placeholder="FULL NAME"
  className="uppercase"
  value={name}
  onChange={(e) => setName(e.target.value.toUpperCase())}
/>

// Course
<Input
  placeholder="COURSE"
  className="uppercase"
  value={course}
  onChange={(e) => setCourse(e.target.value.toUpperCase())}
/>

// Year Level
<Input
  placeholder="YEAR LEVEL"
  className="uppercase"
  value={yearLevel}
  onChange={(e) => setYearLevel(e.target.value.toUpperCase())}
/>
```

---

## ⚠️ EXCEPTIONS (DON'T UPPERCASE)

**Keep these fields LOWERCASE:**

```jsx
// ❌ Email - Keep lowercase
<Input
  type="email"
  placeholder="email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value.toLowerCase())}
/>

// ❌ Password - Keep as-is
<Input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// ❌ Date inputs - No transformation needed
<Input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>

// ❌ Number inputs - No transformation needed
<Input
  type="number"
  value={age}
  onChange={(e) => setAge(e.target.value)}
/>
```

---

## 🎨 CSS STYLING

Add this to your Tailwind config or CSS for consistent uppercase display:

```css
/* Already available in Tailwind */
.uppercase {
  text-transform: uppercase;
}
```

---

## 🔄 PATTERN SUMMARY

**For ALL text inputs that should be uppercase:**

1. ✅ Add `className="uppercase"`
2. ✅ Change `onChange={(e) => setField(e.target.value)}` 
   - To: `onChange={(e) => setField(e.target.value.toUpperCase())}`
3. ✅ Update placeholder to UPPERCASE (visual consistency)

---

## 📋 COMPLETE CHECKLIST

### add-transact.jsx
- [ ] Street/House No → uppercase
- [ ] Barangay → uppercase
- [ ] Municipality → uppercase
- [ ] Province → uppercase

### announce-form.jsx
- [ ] Title → uppercase
- [ ] Content → uppercase

### register.jsx (Client-Module)
- [ ] First Name → uppercase
- [ ] Middle Name → uppercase
- [ ] Last Name → uppercase
- [ ] Course → uppercase
- [ ] Address → uppercase
- [ ] Student ID → uppercase

### add-staff.jsx
- [ ] First Name → uppercase
- [ ] Middle Name → uppercase
- [ ] Last Name → uppercase
- [ ] Position → uppercase

### master-list.jsx / add-manual
- [ ] Student ID → uppercase
- [ ] Name → uppercase
- [ ] Course → uppercase
- [ ] Year Level → uppercase

---

## 🧪 TESTING

After implementing:

1. **Type in lowercase** → Should display UPPERCASE
2. **Type with Caps Lock OFF** → Should still be UPPERCASE
3. **Copy-paste lowercase text** → Should convert to UPPERCASE
4. **Check database** → Should save as UPPERCASE

---

## 💡 QUICK APPLY SCRIPT

Use Find & Replace in VS Code:

**Find:**
```
onChange={(e) => set(\w+)\(e\.target\.value\)}
```

**Replace:**
```
onChange={(e) => set$1(e.target.value.toUpperCase())}
```

**Note:** Only apply to text inputs, not email/password/number inputs!

---

## ✅ RESULT

After implementation:
- ✅ Users type "john doe" → Displays as "JOHN DOE"
- ✅ Saves to database as "JOHN DOE"
- ✅ Works even without Caps Lock
- ✅ Consistent uppercase across all forms

---

*Apply these changes to all specified files for automatic uppercase input!*
