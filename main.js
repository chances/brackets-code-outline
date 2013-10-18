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
	//var editorHeight = 0;
	
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
		$('.main-view').append('<div id="brackets-code-outline"><header>Code Outline</header><nav></nav></div>');
		//$('.main-view').append('<div id="wdMinimap"><div class="visible-box"></div><pre></pre></div>');
		$('.main-view .content').css('right', OUTLINE_WIDTH + contentCssRight + 'px');
		updateListeners();
		documentSwitch();
		
		resizeInterval = setInterval(function() {
			/*if (currentEditor) {
				if (editorHeight != $('#editor-holder').height()) {
					editorResize();
					editorHeight = $('#editor-holder').height();
				}
			}
			if ($('#wdMinimap').css('background-color') != $('.CodeMirror').css('background-color')) setThemeColors();*/
			if ($('#brackets-code-outline').css('background-color') != $('.CodeMirror').css('background-color')) {
				setThemeColors();
			}
		}, 500);
		
		preferences.setValue('enabled', true);	
		CommandManager.get(NAME + 'showOutline').setChecked(true);
	}
	
	// update the listeners
	function updateListeners() {
		if (enabled) {
			/*$(DocumentManager).on('currentDocumentChange.wdMinimap', documentSwitch);
			$(DocumentManager).on('workingSetRemove.wdMinimap', documentClose);
			$('#wdMinimap pre, #wdMinimap .visible-box').on('mousedown.wdMinimap', visibleBoxMouseDown);
			$(document).on('mouseup.wdMinimap', visibleBoxMouseUp);
			$('#wdMinimap pre, #wdMinimap .visible-box').on('mousemove.wdMinimap', visibleBoxMouseMove);*/
			$(DocumentManager).on('currentDocumentChange.bracketsCodeOutline', documentSwitch);
			$(DocumentManager).on('workingSetRemove.bracketsCodeOutline', documentClose);
		} else {
			if (currentEditor) {
                //$(currentEditor.document).off('.wdMinimap');
                $(currentEditor.document).off('.bracketsCodeOutline');
            }
			/*$(DocumentManager).off('.wdMinimap');
			$(document).off('.wdMinimap');*/
			$(DocumentManager).off('.bracketsCodeOutline');
			$(document).off('.bracketsCodeOutline');
		}
	}
	
	// handle a document being swapped
	function documentSwitch() {
		if (hidden) {
            show();
        }
		
		if (currentEditor) {
			//$(currentEditor.document).off('.wdMinimap');
			$(currentEditor.document).off('.bracketsCodeOutline');
		}
		
		currentEditor = EditorManager.getCurrentFullEditor();
		//currentEditor.document.file.name << file
		if (!currentEditor) { 
			//$('#wdMinimap').hide();
			$('#brackets-code-outline').hide();
			return;
		}
		else {
			//$('#wdMinimap').show();
			$('#brackets-code-outline').show();
		}
		
		//$('#wdMinimap pre').css('top', 0);
		documentEdit();
		
		//$(currentEditor.document).on('change.wdMinimap', documentEdit);
		$(currentEditor.document).on('change.bracketsCodeOutline', documentEdit);
		//$(currentEditor).on('scroll.wdMinimap', editorScroll);
	}
	
	// get the current document
	function documentEdit() {
		//$('#wdMinimap pre').text(currentEditor.document.getText());
		//editorScroll();
	}
	
	// handle a document being closed
	function documentClose() {
		if (DocumentManager.getWorkingSet().length == 0) {
            hide();
        }
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
	menu.addMenuItem(NAME + 'showOutline', 'Ctrl-Alt-Shift-O');
	
	if (enabled) {
        enable();
    }
	if (DocumentManager.getWorkingSet().length === 0) {
        hide();
    }
});
