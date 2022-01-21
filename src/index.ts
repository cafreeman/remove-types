import { transformAsync, createConfigItem } from '@babel/core';
import type { VisitNodeObject, Node } from '@babel/traverse';
import prettier from 'prettier';

// @ts-expect-error We're only importing so we can create a config item, so we don't care about types
import bts from '@babel/plugin-transform-typescript';

const babelTsTransform = createConfigItem(bts);

// @ts-expect-error We're only importing so we can create a config item, so we don't care about types
import bsd from '@babel/plugin-syntax-decorators';

const babelDecoratorSyntax = createConfigItem([bsd, { legacy: true }]);

export default async function removeTypes(code: string) {
  code = code.replace(/\n\n+/g, '/* ___NEWLINE___ */\n');
  console.log(code);

  // Babel visitor to remove leading comments
  const removeComments: VisitNodeObject<unknown, Node> = {
    enter(p) {
      if (!p.node.leadingComments) return;

      for (let i = p.node.leadingComments.length - 1; i >= 0; i--) {
        const comment = p.node.leadingComments[i];

        if (
          code.slice(comment.end).match(/^\s*\n\s*\n/) ||
          comment.value.includes('___NEWLINE___')
        ) {
          // There is at least one empty line between the comment and the TypeScript specific construct
          // We should keep this comment and those before it
          break;
        }
        comment.value = '___REMOVE_ME___';
      }
    },
  };

  const transformed = await transformAsync(code, {
    // retainLines: true,
    plugins: [
      {
        name: 'comment-remover',
        visitor: {
          TSTypeAliasDeclaration: removeComments,
          TSInterfaceDeclaration: removeComments,
          TSDeclareFunction: removeComments,
          TSDeclareMethod: removeComments,
          TSImportType: removeComments,
        },
      },
      babelTsTransform,
      babelDecoratorSyntax,
    ],
    generatorOpts: {
      retainLines: true,
      shouldPrintComment: (comment) => comment !== '___REMOVE_ME___',
    },
  });

  if (!transformed || !transformed.code) {
    throw new Error('There was an issue with the Babel transform.');
  }

  const fixed = transformed.code.replace(/\/\* ___NEWLINE___ \*\//g, '\n');

  return prettier.format(fixed, {
    singleQuote: true,
    parser: 'babel',
  });
}
