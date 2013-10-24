/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
 * @file css_outliner.js
 * @author Will Steinmetz
 * This file contains the functionality to generate an outline for
 * CSS files. The outliner will only work for non-minified files 
 * for obvious reasons.
 */
define(function (require, exports, module) {
	"use strict";
	
	var _imports = [],
		_selectors = [];
	
	/**
	 * Function clean up the import line
	 * @param string line
	 * @return string
	 */
	function _cleanImport(line) {
		return $.trim(line.replace('@import', '').replace(';', '').replace(/"/g, '').replace(/\'/g, '').replace('url(', '').replace(')', ''));
	}
	
	/**
	 * Function to parse the CSS file
	 * @param mixed code
	 */
	function parse(code) {
		code = code.split('\n');
		
		var selectors = true;
		for (var line = 0; line < code.length; line++) {
			// check for import statements
			if (code[line].indexOf('@import') > -1) {
				// is there more than one import statement in this line
				if (code[line].match(/;/g).length > 1) {
					var lines = code[line].split(';');
					for (var x in lines) {
						_imports.push({'i': _cleanImport(lines[x]), 'l': (line + 1)});
					}
				} else {
					_imports.push({'i': _cleanImport(code[line]), 'l': (line + 1)});
				}
				continue;// keep going because there should only be imports on this line
			}
			// find all of the selectors
			if (selectors) {
				if (code[line].indexOf(',').length > -1) {
					var lines = code[line].split(',');
					for (var i = 0; i < lines.length; i++) {
						_selectors.push({'s': $.trim(lines[i]), 'l': (line + 1)});
					}
				}
				if (code[line].indexOf('{') > -1) {
					selectors = false;
					var l = $.trim(code[line].replace('{', ''));
					if (l == '') {
						continue;
					} else {
						_selectors.push({'s': l, 'l': (line + 1)});
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
		
		_imports.sort();
		_selectors.sort(function(a,b) {
			if (a.s < b.s) { return -1; }
			if (a.s > b.s) { return 1; }
			return 0;
		});
	}

	exports.parse = parse;
});