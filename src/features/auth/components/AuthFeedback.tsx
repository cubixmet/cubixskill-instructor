import React from "react";
import { Alert } from "../../../components/ui/Alert";

export interface AuthFeedbackProps {
  error?: string | null;
  success?: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}

export const AuthFeedback: React.FC<AuthFeedbackProps> = ({
  error,
  success,
  onClearError,
  onClearSuccess,
}) => {
  if (error) {
    return (
      <Alert type="error" onClose={onClearError} className="mb-4">
        {error}
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert type="success" onClose={onClearSuccess} className="mb-4">
        {success}
      </Alert>
    );
  }

  return null;
};
