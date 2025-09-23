/// <reference types="jest" />

import 'jest';

declare global {
  namespace NodeJS {
    interface Global {
      // Add any global test utilities here if needed
    }
  }
}

export {};