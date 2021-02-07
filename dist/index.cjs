'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var md = _interopDefault(require('markdown-it'));
var yaml = _interopDefault(require('yaml'));
require('d3');
require('seedrandom');
var jsdom = require('jsdom');

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function createDummyDom() {
  return new jsdom.JSDOM("<!DOCTYPE html><head></head><body></body").window.document;
}

var _DOM = createDummyDom();

var fences = {// gitgraph: gitgraph,
  // systemdiagram: systemdiagram,
};

var HEADER_CLASS = 'td-header';
var HEADER_OPEN = "<div class=\"".concat(HEADER_CLASS, "\">");
var HEADER_CLOSE = '</div>';
var REGEX_BEGIN = new RegExp("(".concat(HEADER_OPEN, ")"));
var REGEX_END = new RegExp("(".concat(HEADER_OPEN, ".*?)(").concat(HEADER_CLOSE, "<pre>)"));
var BUTTON_TEXT = {};

function addHeader(output) {
  return output.includes(HEADER_OPEN) ? output : "".concat(HEADER_OPEN).concat(HEADER_CLOSE).concat(output);
}

function addHeaderContent(output, content) {
  var begin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  return addHeader(output).replace(begin ? REGEX_BEGIN : REGEX_END, "$1".concat(content).concat(begin ? '' : '$2'));
}

function idToString(id) {
  return id.replace(/(^[a-z])/, function (m) {
    return m.toUpperCase();
  }).replace(/-/g, ' ');
}

function button(output, option, optionValue) {
  var v = optionValue ? optionValue : option;
  return addHeaderContent(output, "<button class=\"td-".concat(v, "\"><span>").concat(v in BUTTON_TEXT ? BUTTON_TEXT[v] : idToString(v), "</span></button>"), false);
}
function label(output, option, optionValue) {
  return addHeaderContent(output, "<span class=\"td-".concat(option, "\">").concat(optionValue, "</span>"));
}

var fenceOptions = {
  button: button,
  filename: label,
  label: label
};

function terminal(hljs) {
  return {
    name: 'Linux Terminal',
    aliases: ['term'],
    classNameAliases: {
      ps1: 'title',
      spacing: 'comment'
    },
    contains: [{
      className: 'spacing',
      begin: /^\.\.\.\s*/,
      returnBegin: true,
      end: /$/
    }, {
      className: 'ps1',
      begin: /^[^\n$]*\$ */,
      returnBegin: true,
      end: /\$ */,
      returnEnd: true,
      contains: [{
        className: 'ps1-userhost',
        match: /^[\w][-\w]*@[\w][-\w]*/
      }, {
        className: 'ps1-splitter',
        match: /:/,
        starts: {
          className: 'ps1-path',
          end: /[^~/\w-.]/,
          returnEnd: true
        }
      }, {
        className: 'ps1-end',
        match: /[$\s]*/,
        endsParent: true
      }],
      starts: {
        className: 'command',
        end: /[^\\]$/
      }
    }]
  };
}

var languages = {
  terminal: terminal
};

function extractFenceOptions(infoString) {
  var options = infoString.replace(/^[^{]*/, '');
  return options ? yaml.parse(options) : {};
}

function thoughtdown(options) {
  var r = md(options).use(require('markdown-it-highlightjs'), {
    register: languages
  });
  r.renderer.rules_default = Object.assign({}, r.renderer.rules);

  r.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
    return slf.rules_default.code_inline(tokens, idx, options, env, slf).replace(/^<code/, '<code class="hljs hljs-inline language-none"');
  };

  r.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    // Get output for our fence (first check if there's a custom fence,
    // otherwise defer to the default markdown-it rendering process)
    var opts = extractFenceOptions(tokens[idx].info);
    var out = undefined;
    Object.entries(fences).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];

      var fenceName = tokens[idx].info.match(/^[^{^ ]*/).toString();

      if (fenceName && fenceName === k) {
        out = v(tokens[idx].content, opts);
      }
    });

    if (typeof out === 'undefined') {
      out = slf.rules_default.fence(tokens, idx, options, env, slf);
    } // Give fence options a chance to modify the output before returning


    Object.entries(opts).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          ok = _ref4[0],
          ov = _ref4[1];

      Object.entries(fenceOptions).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            k = _ref6[0],
            v = _ref6[1];

        if (k === ok) out = v(out, ok, ov);
      });
    });
    return out;
  };

  return r;
}

module.exports = thoughtdown;
