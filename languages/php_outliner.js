/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
* @file php_outliner.js
* @author Will Steinmetz
* This file contains the functionality to generate an outline for
* PHP files.
*/
define(function (require, exports, module) {
	"use strict";

	var EditorManager = brackets.getModule('editor/EditorManager');

	/**
	 * Function to parse the PHP file
	 */
	function parse() {
		var code = currentEditor.document.getText();

		console.log(code);
	}

	exports.parse = parse;
});