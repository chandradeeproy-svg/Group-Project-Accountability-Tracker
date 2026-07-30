// Circuit Breaker Pattern - prevents cascading failures
export class CircuitBreaker {
  constructor(name, fn, options = {}) {
    this.name = name;
    this.fn = fn;
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000;
    this.resetTimeout = null;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      throw new Error(`Circuit breaker "${this.name}" is OPEN`);
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        console.log(`✅ Circuit breaker "${this.name}" is now CLOSED`);
      }
    }
  }

  onFailure() {
    this.failures++;

    if (this.failures >= this.failureThreshold && this.state === 'CLOSED') {
      this.state = 'OPEN';
      console.log(`❌ Circuit breaker "${this.name}" is now OPEN`);

      this.resetTimeout = setTimeout(() => {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        console.log(`🟡 Circuit breaker "${this.name}" is now HALF_OPEN (testing)`);
      }, this.timeout);
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }
}
