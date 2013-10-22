/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
* @file css_outliner.js
* @author Will Steinmetz
* This file contains the functionality to generate an outline for
* JavaScript files.
*/
define(function (require, exports, module) {
	"use strict";
	
	var _imports = [],
		selectors = [];
	
	/**
	 * Function to parse the CSS file
	 * @param mixed code
	 */
	function parse(code) {
		code = code.split('\n');
		
		// check for import statements
		
		
		console.log(code);
	}

	exports.parse = parse;
});