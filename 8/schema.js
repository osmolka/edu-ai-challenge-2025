'use strict';

/**
 * @fileoverview Advanced Validation Library with JavaScript Best Practices
 * @description A production-ready, type-safe validation library for JavaScript following 
 * strict best practices and robust type system handling. Built with performance, security, 
 * and reliability in mind.
 * 
 * @example
 * // Basic usage
 * const { Schema } = require('./schema.js');
 * 
 * const userSchema = Schema.object({
 *   name: Schema.string().minLength(2),
 *   email: Schema.string().email(),
 *   age: Schema.number().min(0).optional()
 * });
 * 
 * const result = userSchema.validate(userData);
 * console.log(result.isValid, result.errors);
 * 
 * @author Validation Library Team
 * @version 2.0.0
 * @since 1.0.0
 */

/**
 * Utility functions for enhanced type checking and object comparison.
 * Provides robust type detection and comparison methods that handle JavaScript edge cases.
 * 
 * @namespace TypeUtils
 * @example
 * // Type checking
 * TypeUtils.getType(null);        // 'null'
 * TypeUtils.getType([]);          // 'array'
 * TypeUtils.isValidNumber(NaN);   // false
 * 
 * // Object comparison
 * TypeUtils.deepEqual({a: 1}, {a: 1}); // true
 */
const TypeUtils = {
  /**
   * Gets the accurate type of a JavaScript value, handling edge cases properly.
   * More reliable than typeof for distinguishing between different object types.
   * 
   * @param {*} value - The value to get the type of
   * @returns {string} The lowercase type name (e.g., 'null', 'array', 'date', 'object')
   * 
   * @example
   * TypeUtils.getType(null);           // 'null'
   * TypeUtils.getType(undefined);      // 'undefined'
   * TypeUtils.getType([]);             // 'array'
   * TypeUtils.getType(new Date());     // 'date'
   * TypeUtils.getType(/regex/);        // 'regexp'
   * TypeUtils.getType({});             // 'object'
   */
  getType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  },

  /**
   * Performs deep equality comparison between two values without JSON.stringify issues.
   * Handles circular references, dates, arrays, and nested objects properly.
   * 
   * @param {*} a - First value to compare
   * @param {*} b - Second value to compare
   * @returns {boolean} True if values are deeply equal, false otherwise
   * 
   * @example
   * // Primitive values
   * TypeUtils.deepEqual(1, 1);                    // true
   * TypeUtils.deepEqual('hello', 'hello');        // true
   * 
   * // Objects and arrays
   * TypeUtils.deepEqual({a: 1}, {a: 1});          // true
   * TypeUtils.deepEqual([1, 2], [1, 2]);          // true
   * 
   * // Dates
   * const date1 = new Date('2023-01-01');
   * const date2 = new Date('2023-01-01');
   * TypeUtils.deepEqual(date1, date2);            // true
   * 
   * // Nested structures
   * TypeUtils.deepEqual(
   *   {user: {name: 'John', tags: ['admin']}},
   *   {user: {name: 'John', tags: ['admin']}}
   * );                                            // true
   */
  deepEqual(a, b) {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a !== 'object') return a === b;
    
    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    
    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    // Handle objects (avoid prototype pollution)
    if (Array.isArray(a) || Array.isArray(b)) return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!this.deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  },

  /**
   * Validates if a value is a valid, finite number (excludes NaN and Infinity).
   * More robust than typeof === 'number' for validation purposes.
   * 
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a valid, finite number
   * 
   * @example
   * TypeUtils.isValidNumber(42);        // true
   * TypeUtils.isValidNumber(-3.14);     // true
   * TypeUtils.isValidNumber(0);         // true
   * TypeUtils.isValidNumber(NaN);       // false
   * TypeUtils.isValidNumber(Infinity);  // false
   * TypeUtils.isValidNumber('42');      // false
   * TypeUtils.isValidNumber(null);      // false
   */
  isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  /**
   * Validates if a value represents a valid date that can be parsed.
   * Accepts Date objects, date strings, and timestamps.
   * 
   * @param {*} value - The value to check (Date object, string, or number)
   * @returns {boolean} True if value represents a valid date
   * 
   * @example
   * TypeUtils.isValidDate(new Date());           // true
   * TypeUtils.isValidDate('2023-01-01');         // true
   * TypeUtils.isValidDate('January 1, 2023');    // true
   * TypeUtils.isValidDate(1672531200000);        // true (timestamp)
   * TypeUtils.isValidDate('invalid-date');       // false
   * TypeUtils.isValidDate(new Date('invalid'));  // false
   * TypeUtils.isValidDate(null);                 // false
   */
  isValidDate(value) {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    
    return false;
  },

  /**
   * Safely gets own property names from an object, avoiding prototype pollution.
   * Filters out inherited properties for security.
   * 
   * @param {Object} obj - The object to get property names from
   * @returns {string[]} Array of own property names
   * 
   * @example
   * const obj = { a: 1, b: 2 };
   * TypeUtils.getOwnPropertyNames(obj);  // ['a', 'b']
   * 
   * // Safely handles objects with prototype pollution attempts
   * const dangerous = { name: 'test', __proto__: { evil: true } };
   * TypeUtils.getOwnPropertyNames(dangerous);  // ['name'] (excludes __proto__)
   */
  getOwnPropertyNames(obj) {
    return Object.getOwnPropertyNames(obj).filter(key => 
      Object.prototype.hasOwnProperty.call(obj, key)
    );
  }
};

/**
 * Represents the result of a validation operation with enhanced error context.
 * Provides immutable validation results with detailed error information.
 * 
 * @class ValidationResult
 * @example
 * // Success result
 * const success = ValidationResult.success();
 * console.log(success.isValid);  // true
 * console.log(success.errors);   // []
 * 
 * // Failure result
 * const failure = ValidationResult.failure(['Required field missing']);
 * console.log(failure.isValid);  // false
 * console.log(failure.errors);   // ['Required field missing']
 * 
 * // Combining multiple results
 * const combined = ValidationResult.combine([success, failure]);
 * console.log(combined.isValid); // false (if any failed)
 */
class ValidationResult {
  /**
   * Creates a new ValidationResult instance.
   * 
   * @param {boolean} isValid - Whether the validation passed
   * @param {string|string[]} [errors=[]] - Error messages (string or array of strings)
   * 
   * @example
   * const result = new ValidationResult(false, 'Invalid email format');
   * const result2 = new ValidationResult(true, []);
   */
  constructor(isValid, errors = []) {
    /**
     * Whether the validation was successful.
     * @type {boolean}
     * @readonly
     */
    this.isValid = Boolean(isValid);
    
    /**
     * Array of error messages. Empty if validation succeeded.
     * @type {string[]}
     * @readonly
     */
    this.errors = Array.isArray(errors) ? [...errors] : [String(errors)];
    
    // Make the result immutable
    Object.freeze(this);
  }

  /**
   * Creates a successful validation result with no errors.
   * 
   * @static
   * @returns {ValidationResult} A successful validation result
   * 
   * @example
   * const success = ValidationResult.success();
   * console.log(success.isValid);  // true
   * console.log(success.errors);   // []
   */
  static success() {
    return new ValidationResult(true, []);
  }

  /**
   * Creates a failed validation result with error messages.
   * 
   * @static
   * @param {string|string[]} errors - Error message(s)
   * @returns {ValidationResult} A failed validation result
   * 
   * @example
   * const failure = ValidationResult.failure('Value is required');
   * const multiFailure = ValidationResult.failure(['Too short', 'Invalid format']);
   */
  static failure(errors) {
    return new ValidationResult(false, errors);
  }

  /**
   * Combines multiple validation results into a single result.
   * Returns success only if all results are successful.
   * 
   * @static
   * @param {ValidationResult[]} results - Array of validation results to combine
   * @returns {ValidationResult} Combined validation result
   * 
   * @example
   * const result1 = ValidationResult.success();
   * const result2 = ValidationResult.failure('Error 1');
   * const result3 = ValidationResult.failure('Error 2');
   * 
   * const combined = ValidationResult.combine([result1, result2, result3]);
   * console.log(combined.isValid);  // false
   * console.log(combined.errors);   // ['Error 1', 'Error 2']
   */
  static combine(results) {
    const allErrors = results.reduce((acc, result) => {
      if (!result.isValid) {
        acc.push(...result.errors);
      }
      return acc;
    }, []);

    return allErrors.length > 0 
      ? ValidationResult.failure(allErrors)
      : ValidationResult.success();
  }
}

/**
 * Base validator class providing core validation functionality.
 * All specific validators extend this class to inherit common behavior like
 * optional validation, custom messages, and rule chaining.
 * 
 * @class Validator
 * @abstract
 * 
 * @example
 * // Validators are typically created through Schema factory methods
 * const stringValidator = Schema.string()
 *   .minLength(5)
 *   .optional()
 *   .withMessage('Name must be at least 5 characters');
 * 
 * const result = stringValidator.validate('hello');
 * console.log(result.isValid);  // true
 */
class Validator {
  /**
   * Creates a new Validator instance.
   * Initializes private properties for optional flag, custom message, and validation rules.
   */
  constructor() {
    /** @private */
    this._isOptional = false;
    /** @private */
    this._customMessage = null;
    /** @private */
    this._validationRules = [];
  }

  /**
   * Gets whether this validator allows optional (null/undefined) values.
   * 
   * @readonly
   * @type {boolean}
   */
  get isOptional() {
    return this._isOptional;
  }

  /**
   * Marks this validator as optional, allowing null/undefined values to pass validation.
   * 
   * @returns {Validator} This validator instance for method chaining
   * 
   * @example
   * const optionalEmail = Schema.string()
   *   .email()
   *   .optional();
   * 
   * console.log(optionalEmail.validate(null).isValid);      // true
   * console.log(optionalEmail.validate(undefined).isValid); // true
   * console.log(optionalEmail.validate('test@example.com').isValid); // true
   */
  optional() {
    this._isOptional = true;
    return this;
  }

  /**
   * Sets a custom error message that will override default validation error messages.
   * 
   * @param {string} message - The custom error message
   * @returns {Validator} This validator instance for method chaining
   * @throws {TypeError} If message is not a string
   * 
   * @example
   * const passwordValidator = Schema.string()
   *   .minLength(8)
   *   .withMessage('Password must be at least 8 characters long');
   * 
   * const result = passwordValidator.validate('123');
   * console.log(result.errors); // ['Password must be at least 8 characters long']
   */
  withMessage(message) {
    if (typeof message !== 'string') {
      throw new TypeError('Custom message must be a string');
    }
    this._customMessage = message;
    return this;
  }

  /**
   * Validates a value against all configured validation rules.
   * Handles optional values, runs all validation rules, and combines results.
   * 
   * @param {*} value - The value to validate
   * @returns {ValidationResult} The validation result with success/failure and errors
   * 
   * @example
   * const validator = Schema.string().minLength(3);
   * 
   * const result1 = validator.validate('hello');
   * console.log(result1.isValid);  // true
   * 
   * const result2 = validator.validate('hi');
   * console.log(result2.isValid);  // false
   * console.log(result2.errors);   // ['String must be at least 3 characters long']
   */
  validate(value) {
    try {
      // Handle optional values first
      if (this._isNullish(value)) {
        return this._isOptional 
          ? ValidationResult.success()
          : ValidationResult.failure(this._customMessage || 'Value is required');
      }

      // Run all validation rules
      const results = this._validationRules.map(rule => {
        try {
          return rule.call(this, value);
        } catch (error) {
          return ValidationResult.failure(`Validation rule error: ${error.message}`);
        }
      });

      return ValidationResult.combine(results);
    } catch (error) {
      return ValidationResult.failure(`Validation error: ${error.message}`);
    }
  }

  /**
   * Checks if a value is null or undefined.
   * 
   * @protected
   * @param {*} value - The value to check
   * @returns {boolean} True if value is null or undefined
   */
  _isNullish(value) {
    return value === null || value === undefined;
  }

  /**
   * Adds a validation rule to this validator.
   * 
   * @protected
   * @param {Function} rule - The validation rule function
   * @returns {Validator} This validator instance for method chaining
   * @throws {TypeError} If rule is not a function
   */
  _addRule(rule) {
    if (typeof rule !== 'function') {
      throw new TypeError('Validation rule must be a function');
    }
    this._validationRules.push(rule);
    return this;
  }

  /**
   * Creates a failure result with custom or default message.
   * 
   * @protected
   * @param {string} message - The default error message
   * @returns {ValidationResult} A failure result
   */
  _createFailureResult(message) {
    return ValidationResult.failure(this._customMessage || message);
  }
}

/**
 * String validator with enhanced type checking and string-specific validation rules.
 * Provides comprehensive string validation including length, pattern matching, and format validation.
 * 
 * @class StringValidator
 * @extends Validator
 * 
 * @example
 * // Basic string validation
 * const nameValidator = Schema.string()
 *   .minLength(2)
 *   .maxLength(50)
 *   .trim();
 * 
 * // Email validation
 * const emailValidator = Schema.string()
 *   .email()
 *   .withMessage('Please enter a valid email address');
 * 
 * // Custom pattern validation
 * const phoneValidator = Schema.string()
 *   .pattern(/^\+\d{1,3}\d{10}$/)
 *   .withMessage('Phone number must be in international format');
 */
class StringValidator extends Validator {
  /**
   * Creates a new StringValidator instance.
   * Automatically adds a rule to check that the value is a string type.
   */
  constructor() {
    super();
    this._addRule((value) => {
      // More robust string checking
      if (typeof value !== 'string') {
        // Handle string-like objects
        if (value != null && typeof value.toString === 'function') {
          return this._createFailureResult('Value must be a string, not a string-like object');
        }
        return this._createFailureResult(`Value must be a string, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  /**
   * Validates that the string has a minimum length.
   * 
   * @param {number} min - The minimum length (non-negative integer)
   * @returns {StringValidator} This validator instance for method chaining
   * @throws {TypeError} If min is not a non-negative integer
   * 
   * @example
   * const nameValidator = Schema.string().minLength(2);
   * 
   * console.log(nameValidator.validate('John').isValid);  // true
   * console.log(nameValidator.validate('J').isValid);     // false
   * console.log(nameValidator.validate('').isValid);      // false
   */
  minLength(min) {
    if (!Number.isInteger(min) || min < 0) {
      throw new TypeError('minLength must be a non-negative integer');
    }
    
    this._addRule((value) => {
      if (value.length < min) {
        return this._createFailureResult(`String must be at least ${min} characters long`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  /**
   * Validates that the string has a maximum length.
   * 
   * @param {number} max - The maximum length (non-negative integer)
   * @returns {StringValidator} This validator instance for method chaining
   * @throws {TypeError} If max is not a non-negative integer
   * 
   * @example
   * const usernameValidator = Schema.string().maxLength(20);
   * 
   * console.log(usernameValidator.validate('john_doe').isValid);     // true
   * console.log(usernameValidator.validate('very_long_username_that_exceeds_limit').isValid); // false
   */
  maxLength(max) {
    if (!Number.isInteger(max) || max < 0) {
      throw new TypeError('maxLength must be a non-negative integer');
    }
    
    this._addRule((value) => {
      if (value.length > max) {
        return this._createFailureResult(`String must be at most ${max} characters long`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  /**
   * Validates that the string matches a regular expression pattern.
   * 
   * @param {RegExp} regex - The regular expression to match against
   * @returns {StringValidator} This validator instance for method chaining
   * @throws {TypeError} If regex is not a RegExp object
   * 
   * @example
   * // Validate phone number format
   * const phoneValidator = Schema.string()
   *   .pattern(/^\d{3}-\d{3}-\d{4}$/)
   *   .withMessage('Phone must be in format XXX-XXX-XXXX');
   * 
   * console.log(phoneValidator.validate('123-456-7890').isValid); // true
   * console.log(phoneValidator.validate('1234567890').isValid);   // false
   * 
   * // Validate alphanumeric strings
   * const alphanumericValidator = Schema.string().pattern(/^[a-zA-Z0-9]+$/);
   * console.log(alphanumericValidator.validate('abc123').isValid); // true
   * console.log(alphanumericValidator.validate('abc-123').isValid); // false
   */
  pattern(regex) {
    if (!(regex instanceof RegExp)) {
      throw new TypeError('Pattern must be a RegExp object');
    }
    
    this._addRule((value) => {
      if (!regex.test(value)) {
        return this._createFailureResult(`String does not match pattern ${regex.toString()}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  /**
   * Validates that the string is a valid email address format.
   * Uses a comprehensive regex pattern that follows RFC standards.
   * 
   * @returns {StringValidator} This validator instance for method chaining
   * 
   * @example
   * const emailValidator = Schema.string().email();
   * 
   * console.log(emailValidator.validate('user@example.com').isValid);    // true
   * console.log(emailValidator.validate('test.email+tag@domain.co.uk').isValid); // true
   * console.log(emailValidator.validate('invalid.email').isValid);       // false
   * console.log(emailValidator.validate('user@').isValid);               // false
   */
  email() {
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return this.pattern(emailRegex).withMessage('Must be a valid email address');
  }

  /**
   * Validates that the string is a valid URL format (HTTP or HTTPS).
   * 
   * @returns {StringValidator} This validator instance for method chaining
   * 
   * @example
   * const urlValidator = Schema.string().url();
   * 
   * console.log(urlValidator.validate('https://example.com').isValid);        // true
   * console.log(urlValidator.validate('http://localhost:3000/path').isValid); // true
   * console.log(urlValidator.validate('ftp://example.com').isValid);          // false
   * console.log(urlValidator.validate('not-a-url').isValid);                  // false
   */
  url() {
    // More comprehensive URL validation
    const urlRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;
    return this.pattern(urlRegex).withMessage('Must be a valid URL');
  }

  /**
   * Validates that the string has no leading or trailing whitespace.
   * Useful for ensuring clean data input without accidental spaces.
   * 
   * @returns {StringValidator} This validator instance for method chaining
   * 
   * @example
   * const cleanStringValidator = Schema.string().trim();
   * 
   * console.log(cleanStringValidator.validate('hello').isValid);    // true
   * console.log(cleanStringValidator.validate(' hello').isValid);   // false
   * console.log(cleanStringValidator.validate('hello ').isValid);   // false
   * console.log(cleanStringValidator.validate(' hello ').isValid);  // false
   */
  trim() {
    this._addRule((value) => {
      if (value !== value.trim()) {
        return this._createFailureResult('String must not have leading or trailing whitespace');
      }
      return ValidationResult.success();
    });
    return this;
  }
}

// Enhanced Number Validator with better edge case handling
class NumberValidator extends Validator {
  constructor() {
    super();
    this._addRule((value) => {
      if (!TypeUtils.isValidNumber(value)) {
        if (typeof value === 'number') {
          if (isNaN(value)) {
            return this._createFailureResult('Value must be a valid number, not NaN');
          }
          if (!isFinite(value)) {
            return this._createFailureResult('Value must be a finite number');
          }
        }
        return this._createFailureResult(`Value must be a number, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  min(min) {
    if (!TypeUtils.isValidNumber(min)) {
      throw new TypeError('min must be a valid number');
    }
    
    this._addRule((value) => {
      if (value < min) {
        return this._createFailureResult(`Number must be at least ${min}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  max(max) {
    if (!TypeUtils.isValidNumber(max)) {
      throw new TypeError('max must be a valid number');
    }
    
    this._addRule((value) => {
      if (value > max) {
        return this._createFailureResult(`Number must be at most ${max}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  integer() {
    this._addRule((value) => {
      if (!Number.isInteger(value)) {
        return this._createFailureResult('Number must be an integer');
      }
      return ValidationResult.success();
    });
    return this;
  }

  positive() {
    this._addRule((value) => {
      if (value <= 0) {
        return this._createFailureResult('Number must be positive');
      }
      return ValidationResult.success();
    });
    return this;
  }

  negative() {
    this._addRule((value) => {
      if (value >= 0) {
        return this._createFailureResult('Number must be negative');
      }
      return ValidationResult.success();
    });
    return this;
  }

  finite() {
    this._addRule((value) => {
      if (!Number.isFinite(value)) {
        return this._createFailureResult('Number must be finite');
      }
      return ValidationResult.success();
    });
    return this;
  }

  safe() {
    this._addRule((value) => {
      if (!Number.isSafeInteger(value)) {
        return this._createFailureResult('Number must be a safe integer');
      }
      return ValidationResult.success();
    });
    return this;
  }
}

// Enhanced Boolean Validator
class BooleanValidator extends Validator {
  constructor() {
    super();
    this._addRule((value) => {
      if (typeof value !== 'boolean') {
        return this._createFailureResult(`Value must be a boolean, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  true() {
    this._addRule((value) => {
      if (value !== true) {
        return this._createFailureResult('Value must be true');
      }
      return ValidationResult.success();
    });
    return this;
  }

  false() {
    this._addRule((value) => {
      if (value !== false) {
        return this._createFailureResult('Value must be false');
      }
      return ValidationResult.success();
    });
    return this;
  }
}

// Enhanced Date Validator with better date handling
class DateValidator extends Validator {
  constructor() {
    super();
    this._addRule((value) => {
      if (!TypeUtils.isValidDate(value)) {
        return this._createFailureResult(`Value must be a valid date, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  before(date) {
    if (!TypeUtils.isValidDate(date)) {
      throw new TypeError('before() requires a valid date');
    }
    
    const beforeDate = new Date(date);
    this._addRule((value) => {
      const valueDate = new Date(value);
      if (valueDate >= beforeDate) {
        return this._createFailureResult(`Date must be before ${beforeDate.toISOString()}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  after(date) {
    if (!TypeUtils.isValidDate(date)) {
      throw new TypeError('after() requires a valid date');
    }
    
    const afterDate = new Date(date);
    this._addRule((value) => {
      const valueDate = new Date(value);
      if (valueDate <= afterDate) {
        return this._createFailureResult(`Date must be after ${afterDate.toISOString()}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  between(startDate, endDate) {
    if (!TypeUtils.isValidDate(startDate) || !TypeUtils.isValidDate(endDate)) {
      throw new TypeError('between() requires valid dates');
    }
    
    return this.after(startDate).before(endDate);
  }
}

// Enhanced Array Validator with better performance and type checking
class ArrayValidator extends Validator {
  constructor(itemValidator) {
    super();
    
    if (!(itemValidator instanceof Validator)) {
      throw new TypeError('itemValidator must be a Validator instance');
    }
    
    this._itemValidator = itemValidator;
    this._addRule((value) => {
      if (!Array.isArray(value)) {
        return this._createFailureResult(`Value must be an array, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  validate(value) {
    // First run the base validation
    const baseResult = super.validate(value);
    if (!baseResult.isValid) {
      return baseResult;
    }

    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    // Validate each item in the array efficiently
    const errors = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = this._itemValidator.validate(value[i]);
      if (!itemResult.isValid) {
        errors.push(...itemResult.errors.map(error => `Item ${i}: ${error}`));
      }
    }

    return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
  }

  minLength(min) {
    if (!Number.isInteger(min) || min < 0) {
      throw new TypeError('minLength must be a non-negative integer');
    }
    
    this._addRule((value) => {
      if (value.length < min) {
        return this._createFailureResult(`Array must have at least ${min} items`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  maxLength(max) {
    if (!Number.isInteger(max) || max < 0) {
      throw new TypeError('maxLength must be a non-negative integer');
    }
    
    this._addRule((value) => {
      if (value.length > max) {
        return this._createFailureResult(`Array must have at most ${max} items`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  notEmpty() {
    return this.minLength(1);
  }

  unique() {
    this._addRule((value) => {
      const seen = new Set();
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        
        // Use a more efficient uniqueness check
        let key;
        if (item === null || item === undefined) {
          key = String(item);
        } else if (typeof item === 'object') {
          // Use a hash for objects instead of JSON.stringify
          key = this._getObjectHash(item);
        } else {
          key = item;
        }
        
        if (seen.has(key)) {
          return this._createFailureResult(`Array contains duplicate item at index ${i}`);
        }
        seen.add(key);
      }
      return ValidationResult.success();
    });
    return this;
  }

  contains(expectedValue) {
    this._addRule((value) => {
      const found = value.some(item => TypeUtils.deepEqual(item, expectedValue));
      if (!found) {
        return this._createFailureResult(`Array must contain ${this._formatValue(expectedValue)}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  sorted(compareFn) {
    this._addRule((value) => {
      for (let i = 1; i < value.length; i++) {
        const compareResult = compareFn 
          ? compareFn(value[i - 1], value[i])
          : this._defaultCompare(value[i - 1], value[i]);
        
        if (compareResult > 0) {
          return this._createFailureResult(`Array is not sorted at index ${i}`);
        }
      }
      return ValidationResult.success();
    });
    return this;
  }

  // Helper methods
  _getObjectHash(obj) {
    // Simple hash function for objects
    const keys = Object.keys(obj).sort();
    return keys.map(key => `${key}:${obj[key]}`).join('|');
  }

  _defaultCompare(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  _formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

// Enhanced Object Validator with better security and performance
class ObjectValidator extends Validator {
  constructor(schema) {
    super();
    
    if (!schema || typeof schema !== 'object') {
      throw new TypeError('Schema must be an object');
    }
    
    // Validate schema contains only validators
    for (const [key, validator] of Object.entries(schema)) {
      if (!(validator instanceof Validator)) {
        throw new TypeError(`Schema property "${key}" must be a Validator instance`);
      }
    }
    
    this._schema = Object.freeze({ ...schema });
    this._addRule((value) => {
      // More specific object type checking
      if (value === null || Array.isArray(value) || typeof value !== 'object') {
        return this._createFailureResult(`Value must be an object, received ${TypeUtils.getType(value)}`);
      }
      
      // Check for prototype pollution attempts
      // Method 1: Check for direct dangerous properties
      if (Object.prototype.hasOwnProperty.call(value, '__proto__') ||
          Object.prototype.hasOwnProperty.call(value, 'constructor') ||
          Object.prototype.hasOwnProperty.call(value, 'prototype')) {
        return this._createFailureResult('Object contains potentially dangerous properties');
      }
      
      // Method 2: Check if object has been tampered with via __proto__
      // If the object has inherited properties that are not from Object.prototype,
      // it might be a prototype pollution attempt
      try {
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) {
          // Check if the prototype has been modified with suspicious properties
          const protoProps = Object.getOwnPropertyNames(proto);
          const suspiciousProps = protoProps.filter(prop => 
            !['constructor', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'].includes(prop)
          );
          
          if (suspiciousProps.length > 0) {
            return this._createFailureResult('Object contains potentially dangerous properties');
          }
        }
      } catch (error) {
        // If we can't check the prototype safely, reject the object
        return this._createFailureResult('Object contains potentially dangerous properties');
      }
      
      return ValidationResult.success();
    });
  }

  validate(value) {
    // First run the base validation
    const baseResult = super.validate(value);
    if (!baseResult.isValid) {
      return baseResult;
    }

    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    // Validate each property in the schema
    const errors = [];
    for (const [key, validator] of Object.entries(this._schema)) {
      const propertyResult = validator.validate(value[key]);
      if (!propertyResult.isValid) {
        errors.push(...propertyResult.errors.map(error => `${key}: ${error}`));
      }
    }

    return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
  }

  strict() {
    this._addRule((value) => {
      const allowedKeys = Object.keys(this._schema);
      const actualKeys = TypeUtils.getOwnPropertyNames(value);
      const extraKeys = actualKeys.filter(key => !allowedKeys.includes(key));
      
      if (extraKeys.length > 0) {
        return this._createFailureResult(`Unexpected properties: ${extraKeys.join(', ')}`);
      }
      return ValidationResult.success();
    });
    return this;
  }

  partial() {
    const partialSchema = {};
    for (const [key, validator] of Object.entries(this._schema)) {
      // Create a new instance to avoid modifying the original
      const newValidator = Object.create(Object.getPrototypeOf(validator));
      Object.assign(newValidator, validator);
      partialSchema[key] = newValidator.optional();
    }
    return new ObjectValidator(partialSchema);
  }

  pick(keys) {
    if (!Array.isArray(keys)) {
      throw new TypeError('pick() requires an array of keys');
    }
    
    const pickedSchema = {};
    for (const key of keys) {
      if (this._schema[key]) {
        pickedSchema[key] = this._schema[key];
      }
    }
    return new ObjectValidator(pickedSchema);
  }

  omit(keys) {
    if (!Array.isArray(keys)) {
      throw new TypeError('omit() requires an array of keys');
    }
    
    const omittedSchema = {};
    for (const [key, validator] of Object.entries(this._schema)) {
      if (!keys.includes(key)) {
        omittedSchema[key] = validator;
      }
    }
    return new ObjectValidator(omittedSchema);
  }

  extend(otherSchema) {
    let schemaToExtend;
    
    if (otherSchema instanceof ObjectValidator) {
      schemaToExtend = otherSchema._schema;
    } else if (typeof otherSchema === 'object' && otherSchema !== null) {
      schemaToExtend = otherSchema;
    } else {
      throw new TypeError('extend() requires an ObjectValidator or schema object');
    }
    
    const extendedSchema = { ...this._schema, ...schemaToExtend };
    return new ObjectValidator(extendedSchema);
  }
}

// Enhanced Tuple Validator
class TupleValidator extends Validator {
  constructor(validators) {
    super();
    
    if (!Array.isArray(validators) || validators.length === 0) {
      throw new TypeError('Tuple requires a non-empty array of validators');
    }
    
    validators.forEach((validator, index) => {
      if (!(validator instanceof Validator)) {
        throw new TypeError(`Tuple validator at index ${index} must be a Validator instance`);
      }
    });
    
    this._validators = Object.freeze([...validators]);
    this._addRule((value) => {
      if (!Array.isArray(value)) {
        return this._createFailureResult(`Value must be an array, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  validate(value) {
    // First run the base validation
    const baseResult = super.validate(value);
    if (!baseResult.isValid) {
      return baseResult;
    }

    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    // Check length matches exactly
    if (value.length !== this._validators.length) {
      return ValidationResult.failure(
        `Tuple must have exactly ${this._validators.length} items, got ${value.length}`
      );
    }

    // Validate each position with its specific validator
    const errors = [];
    for (let i = 0; i < this._validators.length; i++) {
      const itemResult = this._validators[i].validate(value[i]);
      if (!itemResult.isValid) {
        errors.push(...itemResult.errors.map(error => `Position ${i}: ${error}`));
      }
    }

    return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
  }
}

// Enhanced Union Validator
class UnionValidator extends Validator {
  constructor(validators) {
    super();
    
    if (!Array.isArray(validators) || validators.length === 0) {
      throw new TypeError('Union requires a non-empty array of validators');
    }
    
    validators.forEach((validator, index) => {
      if (!(validator instanceof Validator)) {
        throw new TypeError(`Union validator at index ${index} must be a Validator instance`);
      }
    });
    
    this._validators = Object.freeze([...validators]);
  }

  validate(value) {
    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    // Collect all errors for better debugging
    const allErrors = [];
    
    // Check if value passes any of the validators
    for (let i = 0; i < this._validators.length; i++) {
      const result = this._validators[i].validate(value);
      if (result.isValid) {
        return ValidationResult.success();
      }
      allErrors.push(`Option ${i}: ${result.errors.join(', ')}`);
    }

    return this._createFailureResult(
      `Value does not match any of the allowed types. Errors: ${allErrors.join('; ')}`
    );
  }
}

// Enhanced Intersection Validator
class IntersectionValidator extends Validator {
  constructor(validators) {
    super();
    
    if (!Array.isArray(validators) || validators.length === 0) {
      throw new TypeError('Intersection requires a non-empty array of validators');
    }
    
    validators.forEach((validator, index) => {
      if (!(validator instanceof Validator)) {
        throw new TypeError(`Intersection validator at index ${index} must be a Validator instance`);
      }
    });
    
    this._validators = Object.freeze([...validators]);
  }

  validate(value) {
    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    // Check that value passes all validators
    const errors = [];
    for (let i = 0; i < this._validators.length; i++) {
      const result = this._validators[i].validate(value);
      if (!result.isValid) {
        errors.push(...result.errors.map(error => `Schema ${i}: ${error}`));
      }
    }

    return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
  }
}

// Enhanced Literal Validator
class LiteralValidator extends Validator {
  constructor(expectedValue) {
    super();
    this._expectedValue = expectedValue;
  }

  validate(value) {
    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    const isEqual = TypeUtils.deepEqual(value, this._expectedValue);
    if (!isEqual) {
      return this._createFailureResult(
        `Value must be exactly ${this._formatValue(this._expectedValue)}, received ${this._formatValue(value)}`
      );
    }

    return ValidationResult.success();
  }

  _formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

// Enhanced Enum Validator
class EnumValidator extends Validator {
  constructor(allowedValues) {
    super();
    
    if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
      throw new TypeError('Enum requires a non-empty array of allowed values');
    }
    
    this._allowedValues = Object.freeze([...allowedValues]);
  }

  validate(value) {
    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    const isAllowed = this._allowedValues.some(allowedValue => 
      TypeUtils.deepEqual(value, allowedValue)
    );

    if (!isAllowed) {
      return this._createFailureResult(
        `Value must be one of: ${this._allowedValues.map(v => this._formatValue(v)).join(', ')}`
      );
    }

    return ValidationResult.success();
  }

  _formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

// Enhanced Record Validator
class RecordValidator extends Validator {
  constructor(keyValidator, valueValidator) {
    super();
    
    if (!(keyValidator instanceof Validator)) {
      throw new TypeError('keyValidator must be a Validator instance');
    }
    
    if (!(valueValidator instanceof Validator)) {
      throw new TypeError('valueValidator must be a Validator instance');
    }
    
    this._keyValidator = keyValidator;
    this._valueValidator = valueValidator;
    
    this._addRule((value) => {
      if (value === null || Array.isArray(value) || typeof value !== 'object') {
        return this._createFailureResult(`Value must be an object, received ${TypeUtils.getType(value)}`);
      }
      return ValidationResult.success();
    });
  }

  validate(value) {
    // First run the base validation
    const baseResult = super.validate(value);
    if (!baseResult.isValid) {
      return baseResult;
    }

    // Handle optional values
    if (this._isNullish(value) && this._isOptional) {
      return ValidationResult.success();
    }

    // Validate each key-value pair
    const errors = [];
    const entries = Object.entries(value);
    
    for (const [key, val] of entries) {
      // Validate key
      const keyResult = this._keyValidator.validate(key);
      if (!keyResult.isValid) {
        errors.push(...keyResult.errors.map(error => `Key "${key}": ${error}`));
      }

      // Validate value
      const valueResult = this._valueValidator.validate(val);
      if (!valueResult.isValid) {
        errors.push(...valueResult.errors.map(error => `Value for key "${key}": ${error}`));
      }
    }

    return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
  }
}

/**
 * Main Schema builder class providing factory methods for all validator types.
 * This is the primary entry point for the validation library, offering a fluent API
 * for creating type-safe validators with comprehensive validation rules.
 * 
 * @class Schema
 * 
 * @example
 * // Basic usage - primitive types
 * const nameValidator = Schema.string().minLength(2).maxLength(50);
 * const ageValidator = Schema.number().min(0).max(150).integer();
 * const activeValidator = Schema.boolean();
 * 
 * // Complex types
 * const userValidator = Schema.object({
 *   name: Schema.string().minLength(2),
 *   email: Schema.string().email(),
 *   age: Schema.number().min(0).optional(),
 *   tags: Schema.array(Schema.string()).unique()
 * });
 * 
 * // Advanced patterns
 * const flexibleValidator = Schema.union(
 *   Schema.string(),
 *   Schema.number(),
 *   Schema.boolean()
 * );
 */
class Schema {
  /**
   * Creates a string validator with enhanced type checking and string-specific validations.
   * 
   * @static
   * @returns {StringValidator} A new string validator instance
   * 
   * @example
   * // Basic string validation
   * const basicString = Schema.string();
   * console.log(basicString.validate('hello').isValid); // true
   * 
   * // String with constraints
   * const nameValidator = Schema.string()
   *   .minLength(2)
   *   .maxLength(50)
   *   .trim();
   * 
   * // Email validation
   * const emailValidator = Schema.string()
   *   .email()
   *   .withMessage('Please enter a valid email');
   */
  static string() {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator with enhanced edge case handling for NaN, Infinity, etc.
   * 
   * @static
   * @returns {NumberValidator} A new number validator instance
   * 
   * @example
   * // Basic number validation
   * const basicNumber = Schema.number();
   * console.log(basicNumber.validate(42).isValid); // true
   * console.log(basicNumber.validate(NaN).isValid); // false
   * 
   * // Number with range and type constraints
   * const ageValidator = Schema.number()
   *   .integer()
   *   .min(0)
   *   .max(150);
   * 
   * // Safe integer validation
   * const idValidator = Schema.number()
   *   .integer()
   *   .positive()
   *   .safe();
   */
  static number() {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator with strict type checking.
   * 
   * @static
   * @returns {BooleanValidator} A new boolean validator instance
   * 
   * @example
   * // Basic boolean validation
   * const basicBoolean = Schema.boolean();
   * console.log(basicBoolean.validate(true).isValid);  // true
   * console.log(basicBoolean.validate('true').isValid); // false
   * 
   * // Specific value validation
   * const mustBeTrue = Schema.boolean().true();
   * const mustBeFalse = Schema.boolean().false();
   */
  static boolean() {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator with robust parsing and range validation.
   * 
   * @static
   * @returns {DateValidator} A new date validator instance
   * 
   * @example
   * // Basic date validation
   * const basicDate = Schema.date();
   * console.log(basicDate.validate(new Date()).isValid); // true
   * console.log(basicDate.validate('2023-01-01').isValid); // true
   * 
   * // Date range validation
   * const birthdateValidator = Schema.date()
   *   .before(new Date())
   *   .after('1900-01-01');
   * 
   * // Convenient range validation
   * const eventDateValidator = Schema.date()
   *   .between('2023-01-01', '2023-12-31');
   */
  static date() {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with schema-based property validation.
   * 
   * @static
   * @param {Object.<string, Validator>} schema - Object schema with property validators
   * @returns {ObjectValidator} A new object validator instance
   * 
   * @example
   * // Basic object validation
   * const userValidator = Schema.object({
   *   name: Schema.string().minLength(1),
   *   email: Schema.string().email(),
   *   age: Schema.number().min(0).optional()
   * });
   * 
   * // Nested object validation
   * const profileValidator = Schema.object({
   *   user: Schema.object({
   *     name: Schema.string(),
   *     settings: Schema.object({
   *       theme: Schema.enum('light', 'dark'),
   *       notifications: Schema.boolean()
   *     })
   *   })
   * });
   * 
   * // Strict object validation (no extra properties)
   * const strictValidator = Schema.object({
   *   id: Schema.string(),
   *   name: Schema.string()
   * }).strict();
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }
  
  /**
   * Creates an array validator with item-level validation and array-specific constraints.
   * 
   * @static
   * @param {Validator} itemValidator - Validator for array items
   * @returns {ArrayValidator} A new array validator instance
   * 
   * @example
   * // Basic array validation
   * const stringArrayValidator = Schema.array(Schema.string());
   * console.log(stringArrayValidator.validate(['a', 'b', 'c']).isValid); // true
   * 
   * // Array with constraints
   * const tagValidator = Schema.array(Schema.string())
   *   .minLength(1)
   *   .maxLength(10)
   *   .unique();
   * 
   * // Array of objects
   * const usersValidator = Schema.array(
   *   Schema.object({
   *     id: Schema.number(),
   *     name: Schema.string()
   *   })
   * ).minLength(1);
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }

  /**
   * Creates a tuple validator for fixed-length arrays with position-specific type validation.
   * 
   * @static
   * @param {...Validator} validators - Validators for each tuple position
   * @returns {TupleValidator} A new tuple validator instance
   * 
   * @example
   * // Coordinate tuple [x, y]
   * const coordinateValidator = Schema.tuple(
   *   Schema.number(),
   *   Schema.number()
   * );
   * console.log(coordinateValidator.validate([10, 20]).isValid); // true
   * 
   * // Mixed-type tuple [name, age, active]
   * const personTupleValidator = Schema.tuple(
   *   Schema.string(),
   *   Schema.number().min(0),
   *   Schema.boolean()
   * );
   * console.log(personTupleValidator.validate(['John', 30, true]).isValid); // true
   */
  static tuple(...validators) {
    return new TupleValidator(validators);
  }

  /**
   * Creates a union validator that accepts values matching any of the provided validators.
   * 
   * @static
   * @param {...Validator} validators - Validators to union together
   * @returns {UnionValidator} A new union validator instance
   * 
   * @example
   * // String or number
   * const stringOrNumberValidator = Schema.union(
   *   Schema.string(),
   *   Schema.number()
   * );
   * console.log(stringOrNumberValidator.validate('hello').isValid); // true
   * console.log(stringOrNumberValidator.validate(42).isValid); // true
   * 
   * // Status enum using union of literals
   * const statusValidator = Schema.union(
   *   Schema.literal('pending'),
   *   Schema.literal('approved'),
   *   Schema.literal('rejected')
   * );
   */
  static union(...validators) {
    return new UnionValidator(validators);
  }

  /**
   * Creates an intersection validator that requires values to match all provided validators.
   * 
   * @static
   * @param {...Validator} validators - Validators that must all match
   * @returns {IntersectionValidator} A new intersection validator instance
   * 
   * @example
   * // Object that must satisfy multiple schemas
   * const namedValidator = Schema.object({ name: Schema.string() });
   * const agedValidator = Schema.object({ age: Schema.number() });
   * 
   * const personValidator = Schema.intersection(namedValidator, agedValidator);
   * // Requires both name and age properties
   */
  static intersection(...validators) {
    return new IntersectionValidator(validators);
  }

  /**
   * Creates a literal validator that only accepts a specific value using deep equality.
   * 
   * @static
   * @param {*} value - The exact value that must match
   * @returns {LiteralValidator} A new literal validator instance
   * 
   * @example
   * // Literal string value
   * const statusValidator = Schema.literal('active');
   * console.log(statusValidator.validate('active').isValid); // true
   * console.log(statusValidator.validate('inactive').isValid); // false
   * 
   * // Literal object value
   * const configValidator = Schema.literal({ debug: true, env: 'test' });
   */
  static literal(value) {
    return new LiteralValidator(value);
  }

  /**
   * Creates an enum validator that accepts values from a specific set using deep equality.
   * 
   * @static
   * @param {...*} values - The allowed values
   * @returns {EnumValidator} A new enum validator instance
   * 
   * @example
   * // String enum
   * const colorValidator = Schema.enum('red', 'green', 'blue');
   * console.log(colorValidator.validate('red').isValid); // true
   * console.log(colorValidator.validate('yellow').isValid); // false
   * 
   * // Mixed-type enum
   * const mixedValidator = Schema.enum('auto', 42, true, null);
   */
  static enum(...values) {
    return new EnumValidator(values);
  }

  /**
   * Creates a record validator for dynamic key-value pairs with type validation.
   * 
   * @static
   * @param {Validator} keyValidator - Validator for object keys
   * @param {Validator} valueValidator - Validator for object values
   * @returns {RecordValidator} A new record validator instance
   * 
   * @example
   * // String keys to number values
   * const scoresValidator = Schema.record(
   *   Schema.string(),
   *   Schema.number().min(0).max(100)
   * );
   * 
   * // Configuration object with specific key pattern
   * const configValidator = Schema.record(
   *   Schema.string().pattern(/^[A-Z_]+$/),
   *   Schema.union(Schema.string(), Schema.number(), Schema.boolean())
   * );
   */
  static record(keyValidator, valueValidator) {
    return new RecordValidator(keyValidator, valueValidator);
  }

  /**
   * Marks an existing validator as optional (allows null/undefined).
   * 
   * @static
   * @param {Validator} validator - The validator to make optional
   * @returns {Validator} The validator marked as optional
   * @throws {TypeError} If validator is not a Validator instance
   * 
   * @example
   * const optionalStringValidator = Schema.optional(Schema.string());
   * console.log(optionalStringValidator.validate(null).isValid); // true
   * console.log(optionalStringValidator.validate('hello').isValid); // true
   */
  static optional(validator) {
    if (!(validator instanceof Validator)) {
      throw new TypeError('optional() requires a Validator instance');
    }
    return validator.optional();
  }

  /**
   * Creates a validator that accepts the original type or null.
   * 
   * @static
   * @param {Validator} validator - The base validator
   * @returns {UnionValidator} A validator that accepts the type or null
   * @throws {TypeError} If validator is not a Validator instance
   * 
   * @example
   * const nullableStringValidator = Schema.nullable(Schema.string());
   * console.log(nullableStringValidator.validate('hello').isValid); // true
   * console.log(nullableStringValidator.validate(null).isValid); // true
   * console.log(nullableStringValidator.validate(undefined).isValid); // false
   */
  static nullable(validator) {
    if (!(validator instanceof Validator)) {
      throw new TypeError('nullable() requires a Validator instance');
    }
    return Schema.union(validator, Schema.literal(null));
  }

  /**
   * Creates a validator that accepts the original type, null, or undefined.
   * 
   * @static
   * @param {Validator} validator - The base validator
   * @returns {UnionValidator} A validator that accepts the type, null, or undefined
   * @throws {TypeError} If validator is not a Validator instance
   * 
   * @example
   * const nullishStringValidator = Schema.nullish(Schema.string());
   * console.log(nullishStringValidator.validate('hello').isValid); // true
   * console.log(nullishStringValidator.validate(null).isValid); // true
   * console.log(nullishStringValidator.validate(undefined).isValid); // true
   */
  static nullish(validator) {
    if (!(validator instanceof Validator)) {
      throw new TypeError('nullish() requires a Validator instance');
    }
    return Schema.union(validator, Schema.literal(null), Schema.literal(undefined));
  }

  /**
   * Creates a validator that accepts any value except null/undefined (unless optional).
   * 
   * @static
   * @returns {Validator} A validator that accepts any non-nullish value
   * 
   * @example
   * const anyValidator = Schema.any();
   * console.log(anyValidator.validate('anything').isValid); // true
   * console.log(anyValidator.validate(123).isValid); // true
   * console.log(anyValidator.validate(null).isValid); // false (unless optional)
   * 
   * const optionalAnyValidator = Schema.any().optional();
   * console.log(optionalAnyValidator.validate(null).isValid); // true
   */
  static any() {
    return new (class extends Validator {
      validate() {
        return this._isNullish(arguments[0]) && !this._isOptional 
          ? ValidationResult.failure('Value is required')
          : ValidationResult.success();
      }
    })();
  }

  /**
   * Creates a validator that never accepts any value (always fails).
   * Useful for representing impossible states or placeholder validation.
   * 
   * @static
   * @returns {Validator} A validator that always fails
   * 
   * @example
   * const neverValidator = Schema.never();
   * console.log(neverValidator.validate('anything').isValid); // false
   * console.log(neverValidator.validate(null).isValid); // false
   */
  static never() {
    return new (class extends Validator {
      validate() {
        return ValidationResult.failure('Value is not allowed');
      }
    })();
  }
}

// Define example schemas (keeping the existing examples)
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  age: Schema.number().min(0).max(150).integer().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});

// Test data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Schema,
    ValidationResult,
    Validator,
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ArrayValidator,
    ObjectValidator,
    TupleValidator,
    UnionValidator,
    IntersectionValidator,
    LiteralValidator,
    EnumValidator,
    RecordValidator,
    TypeUtils
  };
}

// Enhanced example usage and testing
console.log('=== Enhanced JavaScript Best Practices Validation ===');
console.log('User Schema Result:', result.isValid);

// Test with invalid data showcasing better error messages
const invalidUserData = {
  id: 123, // Should be string
  name: "J", // Too short
  email: "invalid-email", // Invalid format
  age: "thirty", // Should be number
  isActive: "yes", // Should be boolean
  tags: ["developer", 123], // Array item should be string
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "123", // Should be 5 digits
    country: "USA"
  }
};

const invalidResult = userSchema.validate(invalidUserData);
console.log('\nInvalid User Data:', invalidResult.isValid);
console.log('Detailed Errors:', invalidResult.errors);

// Test edge cases that are now properly handled
console.log('\n=== Edge Case Testing ===');

// Test NaN handling
const nanTest = Schema.number().validate(NaN);
console.log('NaN validation:', nanTest.isValid, nanTest.errors);

// Test Infinity handling
const infinityTest = Schema.number().validate(Infinity);
console.log('Infinity validation:', infinityTest.isValid, infinityTest.errors);

// Test Date edge cases
const invalidDateTest = Schema.date().validate('invalid-date');
console.log('Invalid date validation:', invalidDateTest.isValid, invalidDateTest.errors);

// Test prototype pollution protection
const maliciousObject = {
  name: 'John',
  __proto__: { admin: true }
};
const prototypePollutionTest = Schema.object({ name: Schema.string() }).validate(maliciousObject);
console.log('Prototype pollution protection:', prototypePollutionTest.isValid, prototypePollutionTest.errors);

// Test improved unique array functionality
const uniqueTest = Schema.array(Schema.string()).unique().validate(['a', 'b', 'a']);
console.log('Unique array validation:', uniqueTest.isValid, uniqueTest.errors);

console.log('\n=== Enhanced Validation Library Ready! ===');

/**
 * @fileoverview COMPREHENSIVE USAGE EXAMPLES
 * 
 * This section provides detailed, real-world examples of how to use the validation library
 * for common scenarios. These examples demonstrate best practices and advanced patterns.
 */

/*
// =============================================================================
// BASIC VALIDATION EXAMPLES
// =============================================================================

// 1. USER REGISTRATION VALIDATION
const userRegistrationSchema = Schema.object({
  username: Schema.string()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric or underscore only'),
  
  email: Schema.string()
    .email()
    .withMessage('Please provide a valid email address'),
  
  password: Schema.string()
    .minLength(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8+ chars with upper, lower, digit, and special char'),
  
  confirmPassword: Schema.string(),
  
  age: Schema.number()
    .integer()
    .min(13)
    .max(120)
    .optional()
    .withMessage('Age must be between 13 and 120'),
  
  acceptTerms: Schema.boolean()
    .true()
    .withMessage('You must accept the terms and conditions')
});

// Usage:
const registrationData = {
  username: 'john_doe123',
  email: 'john@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  age: 25,
  acceptTerms: true
};

const result = userRegistrationSchema.validate(registrationData);
console.log('Registration valid:', result.isValid);

// =============================================================================
// E-COMMERCE PRODUCT VALIDATION
// =============================================================================

// 2. COMPLEX E-COMMERCE PRODUCT SCHEMA
const productSchema = Schema.object({
  id: Schema.string()
    .pattern(/^prod_[a-zA-Z0-9]{10}$/)
    .withMessage('Product ID must be in format prod_XXXXXXXXXX'),
  
  name: Schema.string()
    .trim()
    .minLength(1)
    .maxLength(200),
  
  description: Schema.string()
    .maxLength(2000)
    .optional(),
  
  price: Schema.number()
    .positive()
    .finite()
    .withMessage('Price must be a positive number'),
  
  currency: Schema.enum('USD', 'EUR', 'GBP', 'JPY')
    .withMessage('Currency must be USD, EUR, GBP, or JPY'),
  
  category: Schema.object({
    id: Schema.number().integer().positive(),
    name: Schema.string().minLength(1),
    parentId: Schema.number().integer().positive().optional()
  }),
  
  tags: Schema.array(Schema.string().trim().minLength(1))
    .unique()
    .maxLength(10)
    .optional(),
  
  variants: Schema.array(
    Schema.object({
      sku: Schema.string().pattern(/^[A-Z0-9-]{8,20}$/),
      size: Schema.enum('XS', 'S', 'M', 'L', 'XL', 'XXL').optional(),
      color: Schema.string().optional(),
      price: Schema.number().positive().optional(),
      stock: Schema.number().integer().min(0)
    })
  ).minLength(1),
  
  metadata: Schema.record(
    Schema.string().pattern(/^[a-z_]+$/),
    Schema.union(
      Schema.string(),
      Schema.number(),
      Schema.boolean()
    )
  ).optional()
}).strict();

// =============================================================================
// API CONFIGURATION VALIDATION
// =============================================================================

// 3. API CONFIGURATION SCHEMA
const apiConfigSchema = Schema.object({
  server: Schema.object({
    host: Schema.string().withMessage('Server host is required'),
    port: Schema.number().integer().min(1).max(65535),
    protocol: Schema.enum('http', 'https'),
    timeout: Schema.number().positive().optional()
  }),
  
  database: Schema.object({
    url: Schema.string().url(),
    maxConnections: Schema.number().integer().positive(),
    ssl: Schema.boolean().optional(),
    retryAttempts: Schema.number().integer().min(0).max(10)
  }),
  
  features: Schema.object({
    logging: Schema.boolean(),
    caching: Schema.boolean(),
    rateLimit: Schema.object({
      enabled: Schema.boolean(),
      maxRequests: Schema.number().integer().positive(),
      windowMs: Schema.number().integer().positive()
    }).optional()
  }),
  
  environment: Schema.enum('development', 'staging', 'production')
}).strict();

// =============================================================================
// FORM VALIDATION EXAMPLES
// =============================================================================

// 4. CONTACT FORM VALIDATION
const contactFormSchema = Schema.object({
  name: Schema.string()
    .trim()
    .minLength(2)
    .maxLength(100)
    .withMessage('Name must be 2-100 characters'),
  
  email: Schema.string()
    .email()
    .withMessage('Please enter a valid email'),
  
  phone: Schema.string()
    .pattern(/^\+?[\d\s-()]{10,}$/)
    .optional()
    .withMessage('Phone number format is invalid'),
  
  subject: Schema.enum(
    'general-inquiry',
    'support',
    'billing',
    'technical',
    'other'
  ).withMessage('Please select a valid subject'),
  
  message: Schema.string()
    .trim()
    .minLength(10)
    .maxLength(1000)
    .withMessage('Message must be 10-1000 characters'),
  
  attachments: Schema.array(
    Schema.object({
      filename: Schema.string().minLength(1),
      size: Schema.number().positive().max(10485760), // 10MB max
      type: Schema.string().pattern(/^(image|text|application)\//),
    })
  ).maxLength(5).optional(),
  
  consent: Schema.boolean()
    .true()
    .withMessage('You must consent to data processing')
});

// =============================================================================
// DATA TRANSFORMATION VALIDATION
// =============================================================================

// 5. CSV IMPORT DATA VALIDATION
const csvRowSchema = Schema.tuple(
  Schema.string().minLength(1),              // ID
  Schema.string().trim().minLength(1),       // Name
  Schema.string().email(),                   // Email
  Schema.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // Date (YYYY-MM-DD)
  Schema.union(                              // Status
    Schema.literal('active'),
    Schema.literal('inactive'),
    Schema.literal('pending')
  ),
  Schema.number().min(0).optional()          // Score (optional)
);

// Validate each CSV row
const csvData = [
  ['001', 'John Doe', 'john@example.com', '2023-01-15', 'active', 95],
  ['002', 'Jane Smith', 'jane@example.com', '2023-01-16', 'pending'],
  // ... more rows
];

csvData.forEach((row, index) => {
  const result = csvRowSchema.validate(row);
  if (!result.isValid) {
    console.error(`Row ${index + 1} validation failed:`, result.errors);
  }
});

// =============================================================================
// NESTED OBJECT VALIDATION
// =============================================================================

// 6. ORGANIZATION HIERARCHY VALIDATION
const departmentSchema = Schema.object({
  id: Schema.number().integer().positive(),
  name: Schema.string().minLength(1),
  manager: Schema.object({
    id: Schema.number().integer().positive(),
    name: Schema.string().minLength(1),
    email: Schema.string().email()
  }),
  employees: Schema.array(
    Schema.object({
      id: Schema.number().integer().positive(),
      name: Schema.string().minLength(1),
      email: Schema.string().email(),
      position: Schema.string().minLength(1),
      salary: Schema.number().positive().optional(),
      startDate: Schema.date().before(new Date()),
      skills: Schema.array(Schema.string()).unique().optional()
    })
  ),
  budget: Schema.number().positive(),
  location: Schema.object({
    building: Schema.string(),
    floor: Schema.number().integer().positive(),
    room: Schema.string().optional()
  }).optional()
});

// =============================================================================
// CONDITIONAL VALIDATION PATTERNS
// =============================================================================

// 7. SHIPPING INFORMATION VALIDATION
const shippingSchema = Schema.object({
  method: Schema.enum('standard', 'express', 'overnight'),
  address: Schema.object({
    street: Schema.string().minLength(1),
    city: Schema.string().minLength(1),
    state: Schema.string().minLength(2).maxLength(2),
    zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
    country: Schema.string().minLength(2).maxLength(2)
  }),
  
  // Express and overnight require phone number
  contactPhone: Schema.union(
    Schema.string().pattern(/^\+?[\d\s-()]{10,}$/),
    Schema.literal(null)
  ),
  
  // Special instructions for express/overnight
  specialInstructions: Schema.string().maxLength(500).optional(),
  
  // Insurance value for express/overnight
  insuranceValue: Schema.number().positive().optional()
});

// =============================================================================
// PERFORMANCE-OPTIMIZED VALIDATION
// =============================================================================

// 8. BULK DATA VALIDATION WITH EARLY TERMINATION
function validateBulkData(dataArray, schema, maxErrors = 10) {
  const errors = [];
  
  for (let i = 0; i < dataArray.length && errors.length < maxErrors; i++) {
    const result = schema.validate(dataArray[i]);
    if (!result.isValid) {
      errors.push({
        index: i,
        data: dataArray[i],
        errors: result.errors
      });
    }
  }
  
  return {
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    totalProcessed: dataArray.length,
    errors: errors
  };
}

// Usage with large datasets
const largeDataset = []; // Imagine thousands of records
const bulkResult = validateBulkData(largeDataset, userRegistrationSchema, 5);

console.log('Bulk validation completed:', bulkResult);
*/
