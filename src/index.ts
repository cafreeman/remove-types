import { transformAsync } from '@babel/core';

export default async function removeTypes(code: string) {
  code = code.replace(/\n\n/g, '/* ___NEWLINE___ */\n');

  const transformed = await transformAsync(code, {
    // retainLines: true,
    plugins: [
      '@babel/plugin-transform-typescript',
      [
        '@babel/plugin-syntax-decorators',
        {
          legacy: true,
        },
      ],
    ],
  });

  const fixed = transformed?.code
    ?.replace(/\/\* ___NEWLINE___ \*\//g, '\n')
    .replace(/\n\n+/g, '\n');

  return fixed;
}
