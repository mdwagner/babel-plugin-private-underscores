export default function privateUnderscoress({ types: t, template }: any): babel.PluginObj {
  const buildSym = template(`
    const ID = Symbol(SYM);
  `);

  return {
    name: 'private-underscores-const',
    visitor: {
      Class(classPath: any) {
        const members: any = {};
        const program = classPath.hub.file.path;

        function createReference(name: any) {
          const ref = classPath.scope.generateUidIdentifier(name);

          program.get('body')[0].insertBefore(
            buildSym({
              ID: ref,
              SYM: t.stringLiteral(name)
            })
          );
        }

        classPath.traverse({
          'ClassMethod|ClassProperty'(memberPath: any) {
            if (memberPath.node.computed) return;
            const name = memberPath.node.key.name;
            if (!name.startsWith('_')) return;

            const ref = createReference(name);

            members[name] = ref;
            memberPath.node.computed = true;
            memberPath.get('key').replaceWith(ref);
          }
        });

        classPath.traverse({
          ThisExpression(path: any) {
            const parent = path.parentPath;

            if (parent.isMemberExpression() && !parent.node.computed) {
              const property = parent.get('property');
              const ref = members[property.node.name];

              if (ref) {
                parent.node.computed = true;
                property.replaceWith(ref);
              }
            }
          }
        });

      }
    }
  };
}
