# ThoughtDown

A project for generating beautiful HTML simply by writing Markdown. The project includes a number of extensions, and supports easy extension for new methods of expression.

Currently powered by [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown processing, and [d3](https://github.com/d3/d3) for powering visualisations.

## Current TODO list:

### General:

- Support both ESM6 & AMD modules (i.e. import & require)

### Syntax highlighting:

- Figure out how to integrate PrismJs properly (at the moment I can get a code style, but no language specific syntax highlighting)

### GitGraph:

- Consolidate & generalise implementation
- Support for changing colouring criteria (i.e. currently there is no way to give a link from a higher level to a lower level the colour of the lower level)
