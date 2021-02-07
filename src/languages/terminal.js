export default function terminal(hljs) {
  return {
    name: 'Linux Terminal',
    aliases: ['term'],
    classNameAliases: {
      ps1: 'title',
      spacing: 'comment',
    },
    contains: [
      {
        className: 'spacing',
        begin: /^\.\.\.\s*/,
        returnBegin: true,
        end: /$/,
      },
      {
        className: 'ps1',
        begin: /^[^\n$]*\$ */,
        returnBegin: true,
        end: /\$ */,
        returnEnd: true,
        contains: [
          {
            className: 'ps1-userhost',
            match: /^[\w][-\w]*@[\w][-\w]*/,
          },
          {
            className: 'ps1-splitter',
            match: /:/,
            starts: {
              className: 'ps1-path',
              end: /[^~/\w-.]/,
              returnEnd: true,
            },
          },
          {
            className: 'ps1-end',
            match: /[$\s]*/,
            endsParent: true,
          },
        ],
        starts: {
          className: 'command',
          end: /[^\\]$/,
        },
      },
    ],
  };
}
