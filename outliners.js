/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
 * @file outliners.js
 * @author Will Steinmetz
 * This file contains the different code outliners for
 * supported languages
 */

define(function (require, exports, module) {
	"use strict";
	
	var Outliners = {
		// supported languages
		_supported: ['css', 'scss'],
		
		/**
		 * Returns whether or not the given file extension is supported
		 * @param string ext
		 * @return bool
		 */
		supported: function (ext) {
			return Outliners._supported.indexOf(ext) > -1;
		},
		
		/**
		 * CSS outliner class
		 */
		css: {
			_imports: null,
			_selectors: null,
            _selectorRegex: /\}?\/?\s*([a-zA-Z\.#\-@:][a-zA-Z\.\s\-\(\)\*\[\]\#\^"'$~|=,>:]*)\{/g,
			
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
                    $outline = $('div#brackets-code-outline nav'),
					$list = $('<ul />');
				$outline.html('');
				
				// add the imports
				for (i = 0; i < imports.length; i++) {
					$list.append(
						$('<li class="css-import" data-line="' + imports[i].l + '" title="' + imports[i].i + '"><span>' + imports[i].i + '</span></li>')
					);
				}
				for (i = 0; i < selectors.length; i++) {
					$list.append(
						$('<li class="css-selector" data-line="' + selectors[i].l + '" title="' + selectors[i].s + '"><span>' + selectors[i].s + '</span></li>')
					);
				}
				
				$outline.append($list);
			},
			
			/**
			 * Function to parse the CSS file
			 * @param mixed code
			 */
			parse: function (code) {
                var selectors = true,
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
								Outliners.css._imports.push({'i': Outliners.css._cleanImport(lines[i]), 'l': line});
							}
						} else {
							Outliners.css._imports.push({'i': Outliners.css._cleanImport(code[line]), 'l': line});
						}
					} else { // find all of the selectors
                        var selector = '',
                            selectorGroup,
                            selectorMatches;
                        while ((selectorMatches = Outliners.css._selectorRegex.exec(code[line])) !== null) {
                            selector = selectorMatches[1].trim();
                            if (selector.indexOf(',') > -1) {
                                selectorGroup = selector.split(',');
                                for (i = 0; i < selectorGroup.length; i++) {
                                    Outliners.css._selectors.push({'s': selectorGroup[i].trim(), 'l': line});
                                }
                            } else if (selector !== '') {
                                Outliners.css._selectors.push({'s': selector, 'l': line});
                            }
                        }
					}
				}
                
				// update the outline display
				Outliners.css._updateOutline(Outliners.css._imports, Outliners.css._selectors);
			}
		}
	};

    Outliners.scss = Outliners.css;
	
	exports.supported = Outliners.supported;
	exports.cssParse = Outliners.css.parse;
    exports.scssParse = Outliners.scss.parse;
});
