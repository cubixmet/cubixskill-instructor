import type { NormalizedApiError } from "./types";

export function parseApiError(error: any): NormalizedApiError {
  // If already parsed
  if (error && typeof error === "object" && "message" in error && ("fieldErrors" in error || "isNetworkError" in error)) {
    return error as NormalizedApiError;
  }

  // Network / Timeout Errors
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return {
        message: "Request timed out. Please check your network connection and try again.",
        isTimeout: true,
      };
    }
    return {
      message: "Unable to connect to server. Please check your internet connection.",
      isNetworkError: true,
    };
  }

  const status: number = error.response.status;
  const responseData = error.response.data || {};

  let message = "An unexpected error occurred. Please try again.";
  let code: string | undefined = responseData.code;
  const fieldErrors: Record<string, string[]> = {};

  // Extract message and error code from common backend response structures
  if (typeof responseData === "string") {
    message = responseData;
  } else if (responseData.error && typeof responseData.error === "object") {
    code = responseData.error.code || code;
    if (typeof responseData.error.message === "string") {
      message = responseData.error.message;
    } else if (typeof responseData.error.message === "object" && responseData.error.message !== null) {
      Object.entries(responseData.error.message).forEach(([fieldKey, val]) => {
        if (Array.isArray(val)) {
          fieldErrors[fieldKey] = val.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
        } else if (typeof val === "string") {
          fieldErrors[fieldKey] = [val];
        }
      });
      message = "Please correct the highlighted fields.";
    }
  } else if (responseData.message) {
    message = responseData.message;
  } else if (responseData.detail) {
    message = responseData.detail;
  }

  // Parse field errors (e.g. Django REST Framework serializers, Zod API outputs)
  if (typeof responseData === "object" && responseData !== null) {
    const rawErrors = responseData.errors || responseData;
    if (typeof rawErrors === "object" && rawErrors !== null) {
      Object.keys(rawErrors).forEach((key) => {
        if (["detail", "message", "code", "success", "error"].includes(key)) return;

        const val = rawErrors[key];
        if (Array.isArray(val)) {
          fieldErrors[key] = val.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
        } else if (typeof val === "string") {
          fieldErrors[key] = [val];
        } else if (typeof val === "object" && val !== null) {
          fieldErrors[key] = [JSON.stringify(val)];
        }
      });
    }
  }

  // Specific business error code overrides
  if (code === "INVALID_CREDENTIALS") {
    message = "Email or password is incorrect. Please try again.";
  } else if (code === "ACCOUNT_SETUP_PENDING") {
    message = "Your account setup is not complete. Please check your activation email.";
  } else if (code === "USER_EXISTS") {
    message = "An account with this email address already exists.";
  } else if (code === "EMAIL_NOT_FOUND") {
    const emailMsg =
      typeof responseData.error?.message?.email === "string"
        ? responseData.error.message.email
        : Array.isArray(responseData.error?.message?.email)
        ? responseData.error.message.email[0]
        : typeof responseData.error?.message === "string"
        ? responseData.error.message
        : "This email is not registered.";
    fieldErrors["email"] = [emailMsg];
    message = emailMsg;
  }


  // Status code specific user-friendly message overrides
  switch (status) {
    case 400:
      if (!responseData.message && !responseData.detail && !responseData.error) {
        message = "Please correct the highlighted fields.";
      }
      break;
    case 401:
      if (code !== "INVALID_CREDENTIALS") {
        message = responseData.detail || responseData.message || "Your session has expired. Please sign in again.";
      }
      break;
    case 403:
      message = responseData.detail || responseData.message || "You do not have permission to perform this action.";
      break;
    case 404:
      message = responseData.detail || responseData.message || "The requested resource was not found.";
      break;
    case 409:
      message = responseData.detail || responseData.message || "A conflict occurred with the current state of the resource.";
      break;
    case 422:
      message = responseData.detail || responseData.message || "Validation failed. Please correct the highlighted fields.";
      break;
    case 429:
      message = "Too many requests. Please slow down and try again later.";
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = "Something went wrong on the server. Please try again shortly.";
      break;
  }

  return {
    status,
    code,
    message,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}
