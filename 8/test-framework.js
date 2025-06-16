/**
 * Simple Test Framework for Validation Library
 * Provides test running, assertions, and coverage tracking functionality
 */

'use strict';

class TestFramework {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      failures: []
    };
    this.coverage = {
      functions: new Set(),
      methods: new Set(),
      branches: new Set(),
      lines: new Set()
    };
  }

  /**
   * Define a test case
   */
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Test suite grouping
   */
  describe(suiteName, suiteFn) {
    console.log(`\n📦 ${suiteName}`);
    console.log('='.repeat(50));
    suiteFn();
  }

  /**
   * Assertion methods
   */
  assert = {
    isTrue: (condition, message = 'Expected true') => {
      if (!condition) {
        throw new Error(message);
      }
    },

    isFalse: (condition, message = 'Expected false') => {
      if (condition) {
        throw new Error(message);
      }
    },

    equals: (actual, expected, message = `Expected ${expected}, got ${actual}`) => {
      if (actual !== expected) {
        throw new Error(message);
      }
    },

    notEquals: (actual, expected, message = `Expected not to equal ${expected}`) => {
      if (actual === expected) {
        throw new Error(message);
      }
    },

    deepEquals: (actual, expected, message = 'Deep equality failed') => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message}. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
      }
    },

    throws: (fn, expectedError = null, message = 'Expected function to throw') => {
      try {
        fn();
        throw new Error(message);
      } catch (error) {
        if (expectedError && !error.message.includes(expectedError)) {
          throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
        }
      }
    },

    isValid: (result, message = 'Expected validation to pass') => {
      if (!result.isValid) {
        throw new Error(`${message}. Errors: ${result.errors.join(', ')}`);
      }
    },

    isInvalid: (result, message = 'Expected validation to fail') => {
      if (result.isValid) {
        throw new Error(message);
      }
    },

    hasErrors: (result, expectedErrors, message = 'Expected specific errors') => {
      if (!Array.isArray(expectedErrors)) {
        expectedErrors = [expectedErrors];
      }
      
      const hasAllErrors = expectedErrors.every(expectedError => 
        result.errors.some(actualError => actualError.includes(expectedError))
      );
      
      if (!hasAllErrors) {
        throw new Error(`${message}. Expected errors containing: ${expectedErrors.join(', ')}. Got: ${result.errors.join(', ')}`);
      }
    }
  };

  /**
   * Track function/method coverage
   */
  trackCoverage(type, name) {
    this.coverage[type].add(name);
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('🧪 Running Validation Library Test Suite\n');
    
    for (const { name, testFn } of this.tests) {
      this.results.total++;
      
      try {
        await testFn();
        this.results.passed++;
        console.log(`✅ ${name}`);
      } catch (error) {
        this.results.failed++;
        this.results.failures.push({ name, error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
      }
    }

    this.printResults();
    return this.results;
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✅`);
    console.log(`Failed: ${this.results.failed} ❌`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.failures.length > 0) {
      console.log('\n❌ FAILURES:');
      this.results.failures.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.error}`);
      });
    }

    console.log('\n📈 COVERAGE SUMMARY:');
    console.log(`Functions Tested: ${this.coverage.functions.size}`);
    console.log(`Methods Tested: ${this.coverage.methods.size}`);
    console.log(`Branches Tested: ${this.coverage.branches.size}`);
  }

  /**
   * Generate coverage report
   */
  generateCoverageReport() {
    const totalFunctions = 50; // Approximate number of functions/methods in the library
    const coveragePercent = ((this.coverage.functions.size + this.coverage.methods.size) / totalFunctions * 100);
    
    return {
      percentage: Math.round(coveragePercent),
      functions: Array.from(this.coverage.functions),
      methods: Array.from(this.coverage.methods),
      branches: Array.from(this.coverage.branches),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: Math.round((this.results.passed / this.results.total) * 100)
      }
    };
  }
}

// Global test framework instance
const framework = new TestFramework();

// Export test utilities
module.exports = {
  test: framework.test.bind(framework),
  describe: framework.describe.bind(framework),
  assert: framework.assert,
  trackCoverage: framework.trackCoverage.bind(framework),
  run: framework.run.bind(framework),
  generateCoverageReport: framework.generateCoverageReport.bind(framework)
}; 