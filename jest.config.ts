/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'

const config: Config = {
  clearMocks: true,

  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  // ✅ TS/ESM(import) 변환
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },

  // ✅ "@/..." alias 해결 (src 구조 기준)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // (선택) 테스트 파일 패턴 명확히
  testMatch: ['**/*.test.(ts|tsx)'],
}

export default config
