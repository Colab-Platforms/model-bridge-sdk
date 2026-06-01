/**
 * Validation utilities
 * Helper functions for input validation
 */

import { ValidationError } from '../core/errors/ValidationError';

/**
 * Validation error details
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Validate that a required field is present
 * @param value - Value to validate
 * @param fieldName - Name of the field
 * @throws ValidationError if value is empty/null/undefined
 */
export function validateRequired(value: unknown, fieldName: string): void {
  if (!value) {
    throw new ValidationError(`${fieldName} is required`, [
      { field: fieldName, message: `${fieldName} is required` },
    ]);
  }
}

/**
 * Validate that a string field meets minimum length
 * @param value - String value to validate
 * @param minLength - Minimum length required
 * @param fieldName - Name of the field
 * @throws ValidationError if string is too short
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): void {
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`,
      [
        {
          field: fieldName,
          message: `${fieldName} must be at least ${minLength} characters long`,
        },
      ],
    );
  }
}

/**
 * Validate that a string field does not exceed maximum length
 * @param value - String value to validate
 * @param maxLength - Maximum length allowed
 * @param fieldName - Name of the field
 * @throws ValidationError if string is too long
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): void {
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} characters`,
      [
        {
          field: fieldName,
          message: `${fieldName} must not exceed ${maxLength} characters`,
        },
      ],
    );
  }
}

/**
 * Validate that a number is within a range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Name of the field
 * @throws ValidationError if number is out of range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
): void {
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      [
        {
          field: fieldName,
          message: `${fieldName} must be between ${min} and ${max}`,
        },
      ],
    );
  }
}

/**
 * Validate that value is one of allowed values
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field
 * @throws ValidationError if value is not in allowed list
 */
export function validateEnum<T>(value: T, allowedValues: T[], fieldName: string): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      [
        {
          field: fieldName,
          message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        },
      ],
    );
  }
}

/**
 * Batch validate multiple conditions
 * @param validations - Array of validation functions that throw on failure
 * @throws ValidationError with all collected validation errors
 */
export function validateBatch(validations: Array<() => void>): void {
  const errors: ValidationErrorDetail[] = [];

  for (const validation of validations) {
    try {
      validation();
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(...error.validationErrors);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Validate JSON stringifiable object
 * @param value - Value to validate
 * @param fieldName - Name of the field
 * @throws ValidationError if value cannot be stringified to JSON
 */
export function validateJSON(value: unknown, fieldName: string): void {
  try {
    JSON.stringify(value);
  } catch {
    throw new ValidationError(`${fieldName} is not valid JSON`, [
      { field: fieldName, message: `${fieldName} is not valid JSON` },
    ]);
  }
}
