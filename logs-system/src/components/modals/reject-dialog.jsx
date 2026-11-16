import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";

export default function RejectDialog({ open, onOpenChange, onConfirm, studentEmail }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await onConfirm(reason);
      // Reset form
      setReason("");
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to reject appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Reject Appointment
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this appointment. 
            An email notification with this reason will be sent to:
            <br />
            <span className="font-semibold text-red-700">{studentEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-right">
              Reason for Rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="E.g., Incomplete requirements, Schedule conflict, etc."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              className={`min-h-[120px] ${error ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Minimum 10 characters. Be specific and professional.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading || !reason.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject & Send Email'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
