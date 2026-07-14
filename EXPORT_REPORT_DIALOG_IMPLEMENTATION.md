# Export Report Dialog Implementation

## Overview
Added a customizable export report dialog that allows admin/staff to generate reports with specific options (date range, file format, included sections). Also made the "Recent Reports" section visible to show download history.

## Features Implemented

### 1. Export Report Dialog
A comprehensive dialog that allows customization of report exports with the following options:

#### Report Type Selection
- Monthly Transaction Summary
- Detailed Transaction Report
- Purpose Analysis Report  
- Performance Metrics Report

#### Date Range Selection
- Start Date picker
- End Date picker
- Defaults to current month

#### File Format Selection (Visual Buttons)
- **PDF** - Red file icon
- **Excel** - Green spreadsheet icon
- **CSV** - Gray spreadsheet icon
- Selected format highlighted with green border

#### Include in Report (Checkboxes)
- ✅ Summary (status overview)
- ✅ Detailed Transactions
- ☐ Feedback Summary

### 2. Recent Reports Section
- Now visible (was previously hidden)
- Shows download history of previously generated reports
- Each report shows:
  - Report name
  - Generated date
  - File format (badge)
  - File size
  - Download button

## Frontend Changes

### Updated reports.jsx
**File:** `c:\Users\User\Desktop\Transact-logs-system\logs-system\src\components\pages\reports.jsx`

#### New State Variables
```javascript
const [exportDialogOpen, setExportDialogOpen] = useState(false);
const [reportType, setReportType] = useState("Monthly Transaction Summary");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [fileFormat, setFileFormat] = useState("pdf");
const [includeSummary, setIncludeSummary] = useState(true);
const [includeDetails, setIncludeDetails] = useState(true);
const [includeFeedback, setIncludeFeedback] = useState(false);
```

#### New Imports
```javascript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, FileSpreadsheet, Calendar, X } from "lucide-react";
```

#### Updated Export Function
```javascript
const handleExportReport = async () => {
  // Builds query parameters from dialog selections
  const params = new URLSearchParams({
    format: fileFormat,
    start_date: startDate,
    end_date: endDate,
    report_type: reportType,
    include_summary: includeSummary ? '1' : '0',
    include_details: includeDetails ? '1' : '0',
    include_feedback: includeFeedback ? '1' : '0',
  });

  // Makes API call with parameters
  // Downloads file
  // Closes dialog
  // Refreshes recent reports list
};
```

## UI Components

### Export Dialog Structure
```
┌─────────────────────────────────────────┐
│  📄 Export Report                       │
├─────────────────────────────────────────┤
│  Select Report Type                     │
│  [Monthly Transaction Summary      ▼]   │
│                                         │
│  Date Range                             │
│  START DATE          END DATE           │
│  [📅 May 01, 2026]  [📅 May 31, 2026]  │
│                                         │
│  File Format                            │
│  ┌────────┬────────┬────────┐          │
│  │   📄   │   📊   │   📊   │          │
│  │  PDF   │ Excel  │  CSV   │          │
│  └────────┴────────┴────────┘          │
│                                         │
│  Include in Report                      │
│  ☑ Summary (status overview)            │
│  ☑ Detailed Transactions                │
│  ☐ Feedback Summary                     │
│                                         │
│         [Cancel]  [📥 Export Report]    │
└─────────────────────────────────────────┘
```

### Recent Reports Section
```
┌─────────────────────────────────────────┐
│  Recent Reports                         │
│  View and download previously...        │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📄  Monthly Transaction Summary   │ │
│  │     May 31, 2026                  │ │
│  │              [PDF] 1.2 MB [Download]│
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📄  Detailed Report - April       │ │
│  │     April 30, 2026                │ │
│  │              [CSV] 850 KB [Download]│
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## User Flow

### Export Report Flow
1. **User clicks** "Export Report" button
2. **Dialog opens** with default settings:
   - Report Type: Monthly Transaction Summary
   - Date Range: Current month
   - Format: PDF
   - Include: Summary + Details (checked)
3. **User customizes** options:
   - Select different report type
   - Adjust date range
   - Choose file format (PDF/Excel/CSV)
   - Toggle included sections
4. **User clicks** "Export Report" button
5. **System generates** report with selected options
6. **File downloads** automatically
7. **Dialog closes**
8. **Recent Reports** section refreshes with new entry

### Download Previous Report Flow
1. **User scrolls** to Recent Reports section
2. **User finds** desired report
3. **User clicks** "Download" button
4. **File downloads** immediately
5. **Toast notification** confirms success

## API Integration

### Export Endpoint
```
GET /api/reports/export
```

**Query Parameters:**
- `format` - File format (pdf/excel/csv)
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)
- `report_type` - Type of report
- `include_summary` - Include summary (1/0)
- `include_details` - Include details (1/0)
- `include_feedback` - Include feedback (1/0)

**Example Request:**
```
GET /api/reports/export?format=pdf&start_date=2026-05-01&end_date=2026-05-31&report_type=Monthly Transaction Summary&include_summary=1&include_details=1&include_feedback=0
```

**Response:**
- Binary file download (PDF/Excel/CSV)
- Content-Disposition header with filename

### Recent Reports Endpoint
```
GET /api/reports/recent
```

**Response:**
```json
{
  "reports": [
    {
      "name": "Monthly Transaction Summary - May",
      "date": "May 31, 2026",
      "format": "PDF",
      "size": "1.2 MB",
      "download_url": "/reports/download/123"
    },
    {
      "name": "Detailed Report - April",
      "date": "April 30, 2026",
      "format": "CSV",
      "size": "850 KB",
      "download_url": "/reports/download/122"
    }
  ]
}
```

## Backend Requirements (To Be Implemented)

### ReportController Updates Needed

1. **Update export method** to accept new parameters:
```php
public function exportReport(Request $request)
{
    $format = $request->query('format', 'csv');
    $startDate = $request->query('start_date');
    $endDate = $request->query('end_date');
    $reportType = $request->query('report_type');
    $includeSummary = $request->query('include_summary') === '1';
    $includeDetails = $request->query('include_details') === '1';
    $includeFeedback = $request->query('include_feedback') === '1';

    // Generate report based on parameters
    // Return file download
}
```

2. **Implement PDF generation** (if not already done):
```php
use Barryvdh\DomPDF\Facade\Pdf;

// Generate PDF
$pdf = PDF::loadView('reports.transaction-report', [
    'transactions' => $transactions,
    'statistics' => $statistics,
    // ...
]);

return $pdf->download('report.pdf');
```

3. **Implement Excel generation**:
```php
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionsExport;

return Excel::download(new TransactionsExport($data), 'report.xlsx');
```

4. **Store report metadata** for recent reports:
```php
// Store report generation record
DB::table('report_history')->insert([
    'admin_id' => auth()->id(),
    'report_type' => $reportType,
    'format' => $format,
    'start_date' => $startDate,
    'end_date' => $endDate,
    'file_path' => $filePath,
    'file_size' => $fileSize,
    'generated_at' => now(),
]);
```

5. **Implement getRecentReports method**:
```php
public function getRecentReports()
{
    $reports = DB::table('report_history')
        ->where('admin_id', auth()->id())
        ->orderBy('generated_at', 'desc')
        ->limit(10)
        ->get();

    return response()->json([
        'reports' => $reports->map(function($report) {
            return [
                'name' => $report->report_type . ' - ' . date('F', strtotime($report->start_date)),
                'date' => date('F d, Y', strtotime($report->generated_at)),
                'format' => strtoupper($report->format),
                'size' => $this->formatBytes($report->file_size),
                'download_url' => '/reports/download/' . $report->id,
            ];
        })
    ]);
}
```

## Database Schema (Optional)

### report_history table
```sql
CREATE TABLE report_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    report_type VARCHAR(255) NOT NULL,
    format VARCHAR(10) NOT NULL,
    start_date DATE,
    end_date DATE,
    file_path VARCHAR(500),
    file_size BIGINT,
    generated_at TIMESTAMP NOT NULL,
    INDEX idx_admin_id (admin_id),
    INDEX idx_generated_at (generated_at),
    FOREIGN KEY (admin_id) REFERENCES staff(id) ON DELETE CASCADE
);
```

## Styling Features

### Dialog Styling
- Clean white background
- Rounded corners
- Shadow for depth
- Responsive width (max 600px)

### File Format Buttons
- Visual icons (PDF red, Excel green, CSV gray)
- Border highlight when selected
- Green background tint when selected
- Hover effect on non-selected

### Recent Reports Cards
- White background with border
- Hover effect (gray background)
- Icon with colored background
- Clean typography
- Download button always visible

## Validation

### Frontend Validation
- Start date must be before end date
- At least one "Include" option must be selected
- All required fields must be filled

### Backend Validation
```php
$request->validate([
    'format' => 'required|in:pdf,excel,csv',
    'start_date' => 'required|date',
    'end_date' => 'required|date|after_or_equal:start_date',
    'report_type' => 'required|string',
]);
```

## Error Handling

### Frontend Error Handling
```javascript
try {
    // Export logic
} catch (error) {
    console.error('Error exporting report:', error);
    toast.error('Failed to export report. Please try again.');
} finally {
    setExporting(false);
}
```

### Backend Error Handling
```php
try {
    // Generate report
} catch (\Exception $e) {
    \Log::error('Report export failed: ' . $e->getMessage());
    return response()->json([
        'message' => 'Failed to generate report'
    ], 500);
}
```

## Testing Checklist

### Export Dialog
- [ ] Dialog opens when "Export Report" clicked
- [ ] Default values populated correctly
- [ ] Report type dropdown works
- [ ] Date pickers functional
- [ ] File format buttons toggle correctly
- [ ] Checkboxes toggle correctly
- [ ] Cancel button closes dialog
- [ ] Export button triggers download
- [ ] Loading state shows during export
- [ ] Success toast appears after export
- [ ] Dialog closes after successful export

### Recent Reports Section
- [ ] Section visible (not hidden)
- [ ] Reports load from API
- [ ] Empty state shows when no reports
- [ ] Loading state shows during fetch
- [ ] Download buttons work
- [ ] File icons display correctly
- [ ] Format badges display correctly
- [ ] Hover effect works

### Backend
- [ ] Export endpoint accepts all parameters
- [ ] PDF generation works
- [ ] Excel generation works
- [ ] CSV generation works
- [ ] File downloads correctly
- [ ] Recent reports API returns data
- [ ] Report history stored correctly

## Future Enhancements

1. **Scheduled Reports**: Auto-generate reports weekly/monthly
2. **Email Reports**: Send reports to admin email
3. **Report Templates**: Save custom report configurations
4. **Advanced Filters**: Filter by status, purpose, etc.
5. **Report Sharing**: Share reports with other staff
6. **Chart Exports**: Include charts in PDF reports
7. **Comparison Reports**: Compare periods side-by-side
8. **Real-time Preview**: Preview report before downloading

## Files Modified

1. ✅ `src/components/pages/reports.jsx` - Added export dialog and showed recent reports

## Files To Create/Modify (Backend)

1. ⏳ Update `app/Http/Controllers/ReportController.php` - Handle new export parameters
2. ⏳ Create PDF generation logic
3. ⏳ Create Excel generation logic
4. ⏳ Create report history tracking
5. ⏳ Create `report_history` database table migration

## Status
✅ **Frontend COMPLETED** - Export dialog and recent reports section implemented
⏳ **Backend PENDING** - Need to implement advanced export logic and report history

## Related Documentation
- `REPORTS_BACKEND_IMPLEMENTATION.md` - Original reports implementation
- Laravel PDF: https://github.com/barryvdh/laravel-dompdf
- Laravel Excel: https://laravel-excel.com/
