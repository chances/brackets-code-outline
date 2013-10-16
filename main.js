/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
 * This extension adds a sidebar to Brackets to display an outline of the current file
 */
define(function (require, exports, module) {
    "use strict";
    
    var NAME = 'willsteinmetz.bracketsCodeOutline';
	var OUTLINE_WIDTH = 250;

	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	var DocumentManager = brackets.getModule('document/DocumentManager');
	var EditorManager = brackets.getModule('editor/EditorManager');
	var CommandManager = brackets.getModule('command/CommandManager');
	var Menus = brackets.getModule('command/Menus');
	var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
	
	ExtensionUtils.loadStyleSheet(module, 'main.css');
	
	var preferences = PreferencesManager.getPreferenceStorage(module, { enabled: false });
	var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
	
	var currentEditor;
	var enabled = preferences.getValue('enabled');
	var hidden = false;
	//var dragging = false;
	var contentCssRight = 0;
	var resizeInterval;
	var editorHeight = 0;
	
	enabled = (enabled !== undefined ? enabled : true);
	
	// hide the outline
	function hide() {
		if (enabled) {
			//$('#wdMinimap').hide();
			$('#brackets-code-outline').hide();
			$('.main-view .content').css('right', contentCssRight + 'px');
			hidden = true;
		}
	}
	
	// show the outline
	function show() {
		//$('#wdMinimap').show();
		$('#brackets-code-outline').show();
		$('.main-view .content').css('right', OUTLINE_WIDTH + contentCssRight + 'px');
		hidden = false;
	}
	
	// enable the extension
	function enable() {
		enabled = true;
		
		contentCssRight = parseInt($('.main-view .content').css('right'), 10);
		$('.main-view').append('<div id="brackets-code-outline"></div>');
		//$('.main-view').append('<div id="wdMinimap"><div class="visible-box"></div><pre></pre></div>');
		$('.main-view .content').css('right', OUTLINE_WIDTH + contentCssRight + 'px');		
		/*updateListeners();
		documentSwitch();*/
		
		/*resizeInterval = setInterval(function() {
			if (currentEditor) {
				if (editorHeight != $('#editor-holder').height()) {
					editorResize();
					editorHeight = $('#editor-holder').height();
				}
			}
			if ($('#wdMinimap').css('background-color') != $('.CodeMirror').css('background-color')) setThemeColors();
		}, 500);*/
		if ($('#wdMinimap').css('background-color') != $('.CodeMirror').css('background-color')) {
            setThemeColors();
        }
		
		preferences.setValue('enabled', true);	
		CommandManager.get(NAME + 'showOutline').setChecked(true);		
	}
	
	// disable the extension
	function disable() {
		enabled = false;
		
		//$('#wdMinimap').remove();
		$('#brackets-code-outline').remove();
		$('.main-view .content').css('right', contentCssRight + 'px');
		/*updateListeners();
		
		clearInterval(resizeInterval);*/
		
		preferences.setValue('enabled', false);	
		CommandManager.get(NAME + 'showOutline').setChecked(false);
	}
	
	// toggle the outline's state
	function toggle() {
		if (!enabled) {
            enable();
        } else {
            disable();
        }
	}
	
	// set the colors for the outline
	function setThemeColors() {
		//var minimap = $('#wdMinimap');
		//var pre = $('#wdMinimap pre');
		var editor = $('.CodeMirror');
		
		//minimap.css({
        $('#brackets-code-outline').css({
            'background-color': editor.css('background-color'),
            'color': editor.css('color')
        });
		//pre.css('color', editor.css('color'));
	}
	
	// add the menu item
	CommandManager.register('Show Code Outline', NAME + 'showOutline', toggle);
	menu.addMenuItem(NAME + 'showOutline');
	
	if (enabled) {
        enable();
    }
	if (DocumentManager.getWorkingSet().length === 0) {
        hide();
    }
});
