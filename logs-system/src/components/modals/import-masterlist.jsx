import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importMasterlistCSV } from '../../api/masterlistApi';

const ImportMasterlistDialog = ({ isOpen, onClose, onImportSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Success
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  const resetDialog = () => {
    setStep(1);
    setFile(null);
    setError("");
    setImportResult(null);
    setPreviewData([]);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError("Please select a valid CSV file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
      parseCSVPreview(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
        setError("Please select a valid CSV file");
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(droppedFile);
      setError("");
      parseCSVPreview(droppedFile);
    }
  };

  const parseCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError("CSV file must contain at least a header row and one data row");
        return;
      }

      // Parse first 4 rows for preview (header + 3 data rows)
      const preview = lines.slice(0, 4).map(line => {
        // Simple CSV parsing (handles basic cases)
        return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      });

      setPreviewData(preview);
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleImport = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('csv_file', file);

      const result = await importMasterlistCSV(formData);
      console.log("✅ Import result:", result);
      
      setImportResult(result);
      setStep(3);
      
      // Notify parent to refresh data
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error("❌ Import error:", err);
      setError(err.message || "Failed to import CSV file");
      setStep(2); // Stay on preview step to show error
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample CSV content
    const csvContent = `student_id,fname,mname,lname,email,course,year_level
2024-00001,Juan,Miguel,Dela Cruz,juan.delacruz@nwssu.edu.ph,BSIT,1st Year
2024-00002,Maria,Santos,Garcia,maria.garcia@nwssu.edu.ph,BSCS,2nd Year
2024-00003,Pedro,,Reyes,pedro.reyes@nwssu.edu.ph,BEED,3rd Year`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'masterlist_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center bg-black/50 z-50 justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Import Students</h2>
            {step < 3 && (
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 ? 'Upload your student database via CSV file' : 'Step 2 of 2: Review & Confirm'}
              </p>
            )}
            {step === 3 && (
              <p className="text-sm text-green-600 mt-1">Process Complete</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      CSV files only (max. 10MB)
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-md">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                  )}

                  <Button
                    type="button"
                    className="bg-[#15592F] hover:bg-[#124b28] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Select CSV File
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Important Requirements:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• The first row must contain column headers: student_id, fname, mname, lname, email, course, year_level</li>
                      <li>• Student ID and email must be unique</li>
                      <li>• Middle name (mname) is optional, other fields are required</li>
                      <li>• Course names must match existing programs (BSIT, BSCS, BEED, etc.)</li>
                      <li>• Year level format: "1st Year", "2nd Year", "3rd Year", "4th Year"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-[#15592F] hover:text-[#124b28] text-sm font-medium underline"
                >
                  Need help with the format? Download template
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-[#15592F] hover:bg-[#124b28] text-white"
                  onClick={handleNext}
                  disabled={!file}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* File Info */}
              <div className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-3 rounded-md">
                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{file?.name}</span>
                <span className="text-gray-500">({(file?.size / 1024).toFixed(2)} KB)</span>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Data Preview (First 3 rows)
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {previewData[0]?.map((header, idx) => (
                            <th key={idx} className="px-4 py-3 text-left font-semibold text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(1).map((row, rowIdx) => (
                          <tr key={rowIdx} className="border-b last:border-b-0">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-4 py-3 text-gray-600">
                                {cell || <span className="text-gray-400 italic">empty</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Please review the data structure above. Once you click "Finish Import", the records will be added to the student database.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-[#15592F] hover:bg-[#124b28] text-white"
                  onClick={handleImport}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Finish Import
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && importResult && (
            <div className="space-y-6 text-center py-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h3>
                <p className="text-gray-600">
                  {importResult.imported || 0} students have been successfully added to the system.
                </p>
              </div>

              {/* Import Details */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    FILE NAME
                  </span>
                  <span className="font-medium text-gray-900">{file?.name}</span>
                </div>
                <div className="border-t"></div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    TOTAL RECORDS
                  </span>
                  <span className="font-bold text-2xl text-green-600">{importResult.imported || 0}</span>
                </div>
                {importResult.skipped > 0 && (
                  <>
                    <div className="border-t"></div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        SKIPPED (Duplicates)
                      </span>
                      <span className="font-bold text-xl text-orange-500">{importResult.skipped}</span>
                    </div>
                  </>
                )}
              </div>

              {/* View Students Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  className="bg-[#15592F] hover:bg-[#124b28] text-white px-8"
                  onClick={handleClose}
                >
                  View Students
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportMasterlistDialog;
