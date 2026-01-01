import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import pluginJest from 'eslint-plugin-jest'
import tsEslint from 'typescript-eslint'
import pluginJs from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['*.config.js', '*.config.ts', '*.config.mjs', 'jest.setup.ts', '.next/'] },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  pluginJest.configs['flat/recommended'],
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
    },
  },
  {
    rules: {
      'max-classes-per-file': 'off', // 파일당 허용되는 클래스의 최대 개수 설정
      'react/react-in-jsx-scope': 'off', // JSX 를 사용시 React 를 스코프 내에 가져올지 확인
      'arrow-body-style': 'off',
      'spaced-comment': 'off',
      'react/function-component-definition': 'off', // 함수 컴포넌트 정의 방식
      'import/no-extraneous-dependencies': 'off', // 외부 패키지 가져오기 제한
      '@typescript-eslint/no-unused-vars': 'off', // 사용하지 않는 변수 검사
      '@typescript-eslint/no-explicit-any': 'off', // any 타입 사용 방지
      'import/prefer-default-export': 'off', // default export 를 이용해 내보내기 검사
      'react/require-default-props': 'off', // 컴포넌트의 property 에 기본값을 설정하는 것을 검사
      'class-methods-use-this': 'off', // 클래스에서 this 키워드를 사용하는지 검사
      'no-unused-vars': 'off', // 사용하지 않는 변수 검사
      'no-var': 'error', // var 키워드 사용 방지
      'react/jsx-curly-brace-presence': [
        // JSX 내부에서 중괄호 사용 적절성 검사
        'warn',
        {
          props: 'always', // property 에서는 중괄호 항상 사용
          children: 'never', // children 에서는 중괄호 미사용
        },
      ],
      'react/jsx-boolean-value': ['error', 'always'], // JSX에서 boolean 타입 속성값 명시 검사: boolean 값을 항상 명시
      '@typescript-eslint/no-empty-object-type': 'off', // 빈 인터페이스 규칙 비활성화
      '@typescript-eslint/no-namespace': 'off', // namespace 사용 방지
      '@typescript-eslint/no-unsafe-function-type': 'off', // 함수 타입 사용 방지
      'no-warning-comments': ['warn', { terms: ['fixme'] }], // 경고 대상 키워드 설정
      'no-console': 'warn', // console 사용 방지
    },
  },
]
