import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../types/api.types";

export function formatAuthError(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    const errObj = error as AxiosError<ApiErrorResponse>;
    if (errObj.response?.data) {
      const data = errObj.response.data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (data.errors && typeof data.errors === "object") {
        const firstKey = Object.keys(data.errors)[0];
        const val = data.errors[firstKey];
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === "string") return val;
      }
    }
    return errObj.message || "An unexpected error occurred.";
  }

  return "An unexpected error occurred. Please try again.";
}
