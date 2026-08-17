import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { parseApiError } from "../api/errors";
import type { NormalizedApiError } from "../api/types";

export function scrollToFirstError(firstFieldName?: string) {
  setTimeout(() => {
    let targetEl: HTMLElement | null = null;

    if (firstFieldName) {
      targetEl =
        document.querySelector(`[name="${firstFieldName}"]`) ||
        document.querySelector(`[data-field-name="${firstFieldName}"]`) ||
        document.getElementById(firstFieldName);
    }

    if (!targetEl) {
      targetEl = document.querySelector('[aria-invalid="true"], .border-rose-500');
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = targetEl.querySelector("input, textarea, select, button") || targetEl;
      if (focusable && typeof (focusable as HTMLElement).focus === "function") {
        (focusable as HTMLElement).focus();
      }
    }
  }, 100);
}

export function useFormScrollAndErrorMap<TFieldValues extends FieldValues = FieldValues>() {
  const mapApiErrorsToForm = (
    error: unknown,
    setError: UseFormSetError<TFieldValues>
  ): NormalizedApiError => {
    const parsed = parseApiError(error);

    if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
      let firstMappedField: string | undefined;

      Object.entries(parsed.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as Path<TFieldValues>, {
            type: "server",
            message: messages[0],
          });
          if (!firstMappedField) {
            firstMappedField = field;
          }
        }
      });

      if (firstMappedField) {
        scrollToFirstError(firstMappedField);
      }
    }

    return parsed;
  };

  return {
    mapApiErrorsToForm,
    scrollToFirstError,
  };
}
