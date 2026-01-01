export default {
  plugins: ['prettier-plugin-tailwindcss'], // TailwindCSS 클래스 자동 정렬 플러그인
  embeddedLanguageFormatting: 'auto', // 내장된 언어 포매팅 여부 (예: HTML 안의 JavaScript 코드)
  htmlWhitespaceSensitivity: 'css', // HTML 공백 처리 민감도: CSS 표시 방식을 존중
  singleAttributePerLine: false, // 한 줄에 여러 HTML 속성을 허용 (true면 한 줄에 하나씩만)
  experimentalTernaries: false, // 중첩 삼항 연산자 시 들여쓰기 여부
  jsxBracketSameLine: false, // JSX 마지막 꺽쇠 괄호(>)를 같은 줄에 위치시킬지 여부
  quoteProps: 'as-needed', // 객체 속성에 따옴표 사용 여부: 필요한 경우만
  bracketSameLine: false, // 객체/JSX 닫는 괄호를 같은 줄에 둘지 여부
  arrowParens: 'always', // 화살표 함수 매개변수 괄호 사용 여부: 항상 사용 (예: (x) => x)
  proseWrap: 'preserve', // Markdown/HTML 텍스트 줄바꿈 방식: 원문 유지
  jsxSingleQuote: false, // JSX 속성에서 작은따옴표 대신 큰따옴표 사용
  bracketSpacing: true, // 객체 리터럴 중괄호 주위에 공백 추가 여부 { foo: bar }
  trailingComma: 'es5', // 후행 쉼표 스타일: ES5에서 허용된 경우에만 추가
  requirePragma: false, // 특정 주석(pragma)이 있어야만 포매팅할지 여부
  insertPragma: false, // Prettier가 파일 상단에 포매팅 주석을 추가할지 여부
  singleQuote: true, // 문자열에서 작은따옴표 사용 ('text')
  printWidth: 120, // 한 줄 최대 길이
  useTabs: false, // 탭 대신 공백으로 들여쓰기
  tabWidth: 2, // 들여쓰기 시 공백 개수
  semi: false, // 세미콜론 자동 추가 여부
}
