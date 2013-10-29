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
		css: {
			_imports: null,
			_selectors: null,
			
			/**
			 * Clean up the import line
			 * @param string line
			 * @return string
			 */
			_cleanImport: function(line) {
				return $.trim(line.replace('@import', '').replace(';', '').replace(/"/g, '').replace(/\'/g, '').replace('url(', '').replace(')', ''));
			},
			
			/**
			 * Update the display with the list
			 * @param array imports
			 * @param array selectors
			 */
			_updateOutline: function(imports, selectors) {
				var $outline = $('div#brackets-code-outline nav'),
					$list = $('<ul />');
				$outline.html('');
				
				// add the imports
				for (var i = 0; i < imports.length; i++) {
					$list.append(
						$('<li class="css-import" data-line="' + imports[i].l + '"><span>' + imports[i].i + '</span></li>')
					);
				}
				for (var i = 0; i < selectors.length; i++) {
					$list.append(
						$('<li class="css-selector" data-line="' + selectors[i].l + '"><span>' + selectors[i].s + '</span></li>')
					);
				}
				
				$outline.append($list);
			},
			
			/**
			 * Function to parse the CSS file
			 * @param mixed code
			 */
			parse: function(code) {
				code = code.split('\n');
				
				// empty the arrays
				Outliners.css._imports = [];
				Outliners.css._selectors = [];
				
				var selectors = true;
				for (var line = 0; line < code.length; line++) {
					// check for import statements
					if (code[line].indexOf('@import') > -1) {
						// is there more than one import statement in this line
						if (code[line].match(/;/g).length > 1) {
							var lines = code[line].split(';');
							for (var x in lines) {
								Outliners.css._imports.push({'i': Outliners.css._cleanImport(lines[x]), 'l': (line + 1)});
							}
						} else {
							Outliners.css._imports.push({'i': Outliners.css._cleanImport(code[line]), 'l': (line + 1)});
						}
						continue;// keep going because there should only be imports on this line
					}
					// find all of the selectors
					if (selectors) {
						if (code[line].indexOf(',').length > -1) {
							var lines = code[line].split(',');
							for (var i = 0; i < lines.length; i++) {
								Outliners.css._selectors.push({'s': $.trim(lines[i]), 'l': (line + 1)});
							}
						}
						if (code[line].indexOf('{') > -1) {
							selectors = false;
							var l = $.trim(code[line].replace('{', ''));
							if (l == '') {
								continue;
							} else {
								Outliners.css._selectors.push({'s': l, 'l': (line + 1)});
							}
						}
						if (code[line].indexOf('}') > -1) {
							selectors = true;
						}
					} else {
						if (code[line].indexOf('}') > -1) {
							selectors = true;
						}
					}
				}
				
				// sort the css code
				Outliners.css._imports.sort();
				Outliners.css._selectors.sort(function(a,b) {
					if (a.s < b.s) { return -1; }
					if (a.s > b.s) { return 1; }
					return 0;
				});
				
				// update the outline display
				Outliners.css._updateOutline(Outliners.css._imports, Outliners.css._selectors);
			}
		}	
	};
	
	exports.cssParse = Outliners.css.parse;
});