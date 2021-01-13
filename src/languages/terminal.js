export default function terminal(hljs) {
  return {
    name: 'Linux Terminal',
    aliases: ['term'],
    contains: [
      {
        className: 'command',
        begin: /^[^ ^$]*\$/,
        returnBegin: true,
        end: /$/,
        contains: [
          {
            className: 'ps1',
            begin: /^[^$]*\$ */,
          },
        ],
      },
    ],
  };
}
