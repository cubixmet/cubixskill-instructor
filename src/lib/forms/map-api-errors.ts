import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

export interface ApiErrorResponse {
  [key: string]: string[] | string;
}

export function mapApiErrors<TFieldValues extends FieldValues>(
  errors: ApiErrorResponse,
  setError: UseFormSetError<TFieldValues>
): string[] {
  const nonFieldErrors: string[] = [];

  Object.entries(errors).forEach(([field, messages]) => {
    const msgArray = Array.isArray(messages) ? messages : [messages];
    const message = msgArray[0] || 'Invalid input value';

    if (field === 'non_field_errors' || field === 'detail' || field === 'error') {
      nonFieldErrors.push(message);
    } else {
      setError(field as Path<TFieldValues>, {
        type: 'server',
        message,
      });
    }
  });

  return nonFieldErrors;
}
