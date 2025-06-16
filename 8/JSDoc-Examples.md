# 📚 Inline Documentation & JSDoc Reference

This validation library includes comprehensive **JSDoc inline documentation** that provides IntelliSense support, parameter descriptions, examples, and type information for all methods and classes.

## 🎯 **Documentation Features**

### ✅ **Complete JSDoc Coverage**
- **Class documentation** with descriptions and examples
- **Method documentation** with parameters, return types, and usage examples  
- **Parameter validation** with type checking and error descriptions
- **Real-world examples** for every method and validator
- **Error handling** documentation with common pitfalls

### ✅ **IDE Integration**
- **IntelliSense** support in VS Code, WebStorm, and other IDEs
- **Auto-completion** for method names and parameters
- **Type hints** and parameter descriptions on hover
- **Example code** snippets in documentation popups
- **Error explanations** for better debugging

## 📖 **Documentation Examples**

### **1. TypeUtils Documentation**

```javascript
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
```

### **2. Validator Method Documentation**

```javascript
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
```

### **3. Schema Factory Documentation**

```javascript
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
```

## 🛠️ **How to Use the Documentation**

### **1. In Your IDE**

When you type `Schema.` your IDE will show:
- Available methods with descriptions
- Parameter types and descriptions
- Return types and what they do
- Usage examples for each method

### **2. Method Chaining Support**

```javascript
// Your IDE will show documentation for each method in the chain
const validator = Schema.string()    // Shows StringValidator docs
  .minLength(5)                      // Shows minLength parameter docs
  .maxLength(50)                     // Shows maxLength constraints
  .email()                           // Shows email validation docs
  .optional()                        // Shows optional behavior docs
  .withMessage('Custom error');      // Shows custom message usage
```

### **3. Complex Type Documentation**

```javascript
// Comprehensive object validation with inline docs
const userSchema = Schema.object({   // Shows object schema docs
  name: Schema.string()              // Shows string validator docs
    .minLength(1)                    // Parameter validation docs
    .trim(),                         // Trim behavior explanation
  email: Schema.string()
    .email(),                        // Email pattern documentation
  tags: Schema.array(                // Array validator docs
    Schema.string()                  // Item validator docs
  ).unique()                         // Unique constraint docs
});
```

## 📚 **Comprehensive Real-World Examples**

The library includes extensive **commented examples** for common use cases:

### **User Registration Validation**
```javascript
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
    .withMessage('Password must be 8+ chars with upper, lower, digit, and special char')
});
```

### **E-Commerce Product Schema**
```javascript
const productSchema = Schema.object({
  id: Schema.string()
    .pattern(/^prod_[a-zA-Z0-9]{10}$/)
    .withMessage('Product ID must be in format prod_XXXXXXXXXX'),
  
  variants: Schema.array(
    Schema.object({
      sku: Schema.string().pattern(/^[A-Z0-9-]{8,20}$/),
      size: Schema.enum('XS', 'S', 'M', 'L', 'XL', 'XXL').optional(),
      price: Schema.number().positive().optional(),
      stock: Schema.number().integer().min(0)
    })
  ).minLength(1)
}).strict();
```

### **API Configuration Validation**
```javascript
const apiConfigSchema = Schema.object({
  server: Schema.object({
    host: Schema.string().withMessage('Server host is required'),
    port: Schema.number().integer().min(1).max(65535),
    protocol: Schema.enum('http', 'https')
  }),
  
  database: Schema.object({
    url: Schema.string().url(),
    maxConnections: Schema.number().integer().positive(),
    retryAttempts: Schema.number().integer().min(0).max(10)
  })
}).strict();
```

## 🎯 **Documentation Benefits**

### **For Developers:**
- ✅ **Faster Development** - No need to check external docs
- ✅ **Better IntelliSense** - Complete parameter information
- ✅ **Error Prevention** - See parameter types and constraints
- ✅ **Learning by Example** - Practical usage examples for every method

### **For Teams:**
- ✅ **Consistent Usage** - Clear documentation prevents misuse
- ✅ **Onboarding** - New developers can learn from inline examples
- ✅ **Code Quality** - JSDoc enforces better documentation standards
- ✅ **Maintainability** - Self-documenting code is easier to maintain

## 🚀 **Getting Started with Documentation**

1. **Install the Library** and open in your IDE
2. **Type `Schema.`** to see available methods with documentation
3. **Hover over methods** to see detailed parameter information
4. **Follow examples** provided in the JSDoc comments
5. **Use IntelliSense** for auto-completion and type checking

## 📝 **Documentation Standards**

The inline documentation follows **JSDoc best practices**:
- **Complete parameter documentation** with types and descriptions
- **Return type documentation** with explanations
- **Practical examples** for every method
- **Error documentation** with common causes
- **Cross-references** between related methods
- **Real-world usage patterns** and best practices

This comprehensive inline documentation makes the validation library **self-documenting** and **developer-friendly**, ensuring teams can use it effectively without external documentation! 🎉 