// Parse API errors and return user-friendly messages
export function parseApiError(error) {
  // Handle network errors
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      isRetryable: true,
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return {
        code: data?.error?.code || 'VALIDATION_ERROR',
        message: data?.error?.message || 'Invalid input',
        fields: data?.error?.fields,
        isRetryable: false,
      };

    case 401:
      return {
        code: 'AUTHENTICATION_ERROR',
        message: 'Your session expired. Please login again.',
        isRetryable: false,
      };

    case 403:
      return {
        code: 'AUTHORIZATION_ERROR',
        message: 'You do not have permission to do this.',
        isRetryable: false,
      };

    case 404:
      return {
        code: 'NOT_FOUND',
        message: 'The resource was not found.',
        isRetryable: false,
      };

    case 409:
      return {
        code: 'CONFLICT',
        message: 'This resource already exists.',
        isRetryable: false,
      };

    case 429:
      return {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please try again later.',
        isRetryable: true,
        retryAfter: data?.error?.retryAfter || 60,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        code: 'SERVER_ERROR',
        message: 'Server error. Please try again later.',
        isRetryable: true,
      };

    default:
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred.',
        isRetryable: true,
      };
  }
}
