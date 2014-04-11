/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, Mustache */

/**
 * @file outliners.js
 * @author Will Steinmetz
 * @author Chance Snow
 * This file contains the different code outliners for
 * supported languages
 */

define(function (require, exports, module) {
	"use strict";

    var HTMLSimpleDOM = brackets.getModule("language/HTMLSimpleDOM"),
        CSSUtils = brackets.getModule("language/CSSUtils");

	var itemTemplate = require('text!templates/outline-list-item.html');

	var Outliners = {
		// supported languages
		_supported: ['html', 'css'],
		
		/**
		 * Returns whether or not the given file extension is supported
		 * @param string ext
		 * @return boolean
		 */
		supported: function (ext) {
			return Outliners._supported.indexOf(ext) > -1;
		},

        /**
		 * HTML outliner class
		 */
        html: {
            _elements: null,

            /**
			 * Update the display with the list
			 * @param array elements
			 */
			_updateOutline: function (elements) {
				var i,
                    $list = $('#brackets-code-outline ul'),
                    defMargin = 0,
                    templateData;
				$list.empty();

				for (i = 0; i < elements.length; i++) {
                    templateData = {
                        itemClass: 'html-element',
                        line: elements[i].l,
                        ch: elements[i].ch,
                        level: elements[i].level,
                        label: elements[i].label
                    };
                    $list.append(Mustache.render(itemTemplate, templateData));
				}

                defMargin = parseInt($list.find('li').first().css('margin-left'), 10);

                $list.find('li').each(function (index, element) {
                    var $item = $(element);
                    $item.css({
                        marginLeft: defMargin + (2 * (element.dataset.level + 1)) + 'px'
                    });
                });
			},

            /**
			 * Add a HTML node to the element list
			 * @param SimpleNode node Node to add to outline
             * @param number level Node scope level
			 */
            _addNode: function (node, level) {
                var label,
                    id = '',
                    classList = '',
                    i;
                if (node !== null && node.isElement()) {
                    label = node.tag;
                    // format IDs and class lists
                    if (node.attributes.id) {
                        label += '#' + node.attributes.id;
                    }
                    if (node.attributes['class'] && node.attributes['class'] !== '') {
                        label += '.' + node.attributes['class'].replace(/\s+/g, '.');
                    }
                    // format stylesheet links
                    if (node.tag === 'link' && node.attributes.rel &&
                            node.attributes.rel === 'stylesheet' &&
                            node.attributes.href) {
                        label += ' (' + node.attributes.href + ')';
                    }
                    // format external scripts
                    if (node.tag === 'script' && node.attributes.src) {
                        label += ' (' + node.attributes.src + ')';
                    }
                    Outliners.html._elements.push({
                        'l': node.startPos.line,
                        'ch': node.startPos.ch,
                        'level': level,
                        'label': label
                    });
                    level++;
                    for (i = 0; i < node.children.length; i++) {
                        Outliners.html._addNode(node.children[i], level);
                    }
                }
            },

            /**
			 * Parse the HTML file
			 * @param mixed code
			 */
            parse: function (code) {
                var dom = HTMLSimpleDOM.build(code, false),
                    i,
                    level = 0;

                Outliners.html._elements = [];

                Outliners.html._addNode(dom, 0);

                Outliners.html._updateOutline(Outliners.html._elements);
            }
        },

		/**
		 * CSS outliner class
		 */
		css: {
			_imports: null,
			_selectors: null,
			
			/**
			 * Clean up the import line
			 * @param string line
			 * @return string
			 */
			_cleanImport: function (line) {
				return line.replace('@import', '').replace(';', '').replace(/["\']/g, '').replace('url(', '').replace(')', '').trim();
			},
			
			/**
			 * Update the display with the list
			 * @param array imports
			 * @param array selectors
			 */
			_updateOutline: function (imports, selectors) {
				var i,
                    $list = $('#brackets-code-outline ul'),
                    templateData;
				$list.empty();

				// add the imports
				for (i = 0; i < imports.length; i++) {
                    templateData = {
                        itemClass: 'css-import',
                        line: imports[i].l,
                        ch: imports[i].ch,
                        level: 0,
                        label: imports[i].i
                    };
					$list.append(Mustache.render(itemTemplate, templateData));
				}
				for (i = 0; i < selectors.length; i++) {
                    templateData = {
                        itemClass: 'css-selector',
                        line: selectors[i].l,
                        ch: selectors[i].ch,
                        level: 0,
                        label: selectors[i].s
                    };
					$list.append(Mustache.render(itemTemplate, templateData));
				}
			},
			
			/**
			 * Parse the CSS file
			 * @param mixed code
			 */
			parse: function (code) {
                var selectors = CSSUtils.extractAllSelectors(code),
                    line,
                    i;
                
				code = code.split('\n');
				
				// empty the arrays
				Outliners.css._imports = [];
				Outliners.css._selectors = [];
				
				for (line = 0; line < code.length; line++) {
					// check for import statements
					if (code[line].indexOf('@import') > -1) {
						// is there more than one import statement in this line
						if (code[line].match(/;/g).length > 1) {
							var lines = code[line].split(';');
							for (i = 0; i < lines.length; i++) {
								Outliners.css._imports.push({
                                    'l': line,
                                    'ch': 0,
                                    'i': Outliners.css._cleanImport(lines[i])
                                });
							}
						} else {
							Outliners.css._imports.push({
                                'l': line,
                                'ch': 0,
                                'i': Outliners.css._cleanImport(line)
                            });
						}
					}
				}
                
                for (i = 0; i < selectors.length; i++) {
                    Outliners.css._selectors.push({
                        'l': selectors[i].selectorStartLine,
                        'ch': selectors[i].selectorStartChar,
                        's': selectors[i].selector
                    });
                }

				// update the outline display
				Outliners.css._updateOutline(Outliners.css._imports, Outliners.css._selectors);
			}
		}
	};

    // TODO: Make this work with nested SCSS
    Outliners.scss = Outliners.css;
	
	exports.supported = Outliners.supported;
    exports.htmlParse = Outliners.html.parse;
	exports.cssParse = Outliners.css.parse;
    exports.scssParse = Outliners.scss.parse;
});
