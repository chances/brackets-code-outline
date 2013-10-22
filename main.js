/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
 * @file main.js
 * @author Will Steinmetz
 * This extension adds a panel to the right side of Brackets to outline particular
 * code files. See the README for the supported file types.
 */

define(['require', 'exports', 'module', 'languages/css_outliner', 'languages/js_outliner', 'languages/php_outliner'], function (require, exports, module, css_outliner, js_outliner, php_outline) {
    "use strict";
    
    var NAME = 'willsteinmetz.bracketsCodeOutline',
	   OUTLINE_WIDTH = 250;

	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');
	
	ExtensionUtils.loadStyleSheet(module, 'main.css');
	
	var preferences = PreferencesManager.getPreferenceStorage(module, { enabled: false }),
	   menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
	
	var currentEditor,
        enabled = preferences.getValue('enabled'),
        hidden = false,
        contentCssRight = 0,
        resizeInterval,
        outliner,
        currentType;
	
	enabled = (enabled !== undefined ? enabled : true);
	
	/**
	 * Hide the outline panel
	 */
	function hide() {
		if (enabled) {
			$('#brackets-code-outline').hide();
			$('.main-view .content').css('right', contentCssRight + 'px');
			hidden = true;
		}
	}
	
	/*
	 * Show the outline panel
	 */
	function show() {
		$('#brackets-code-outline').show();
		$('.main-view .content').css('right', OUTLINE_WIDTH + contentCssRight + 'px');
		hidden = false;
	}
	
	/**
	 * Enable the outline panel
	 */
	function enable() {
		enabled = true;
		
		contentCssRight = parseInt($('.main-view .content').css('right'), 10);
		$('.main-view').append('<div id="brackets-code-outline"><header>Code Outline</header><nav></nav></div>');
		$('.main-view .content').css('right', OUTLINE_WIDTH + contentCssRight + 'px');
		updateListeners();
		documentSwitch();
		
		resizeInterval = setInterval(function() {
			if ($('#brackets-code-outline').css('background-color') != $('.CodeMirror').css('background-color')) {
				setThemeColors();
			}
		}, 500);
		
		preferences.setValue('enabled', true);	
		CommandManager.get(NAME + 'showOutline').setChecked(true);
	}
	
	/**
	 * update the event listeners for the extension
	 */
	function updateListeners() {
		if (enabled) {
			$(DocumentManager).on('currentDocumentChange.bracketsCodeOutline', documentSwitch);
			$(DocumentManager).on('workingSetRemove.bracketsCodeOutline', documentClose);
		} else {
			if (currentEditor) {
                $(currentEditor.document).off('.bracketsCodeOutline');
            }
			$(DocumentManager).off('.bracketsCodeOutline');
			$(document).off('.bracketsCodeOutline');
		}
	}
	
	/**
	 * Handle a document being swapped
	 */
	function documentSwitch() {
		if (hidden) {
            show();
        }
		
		if (currentEditor) {
			$(currentEditor.document).off('.bracketsCodeOutline');
		}
		
		currentEditor = EditorManager.getCurrentFullEditor();
		if (!currentEditor) {
			$('#brackets-code-outline').hide();
			return;
		} else {
			$('#brackets-code-outline').show();
		}
		console.log(currentEditor);
		documentEdit();
		
		$(currentEditor.document).on('change.bracketsCodeOutline', documentEdit);
	}
	
	/**
	 * Get the current document and set up the outliner class for use
	 */
	function documentEdit() {
		var file = currentEditor.document.file.name,
			type = file.substr(file.lastIndexOf('.') + 1);
		if (type && (typeof type != 'undefined') && (type != null) && (type != currentType)) {
            currentType = type;
            try {
	            outliner = require('./languages/' + type + '_outliner');
	        } catch(e) {
		        console.log(e);
		        console.log("couldn't load ./languages/" + type + '_outliner');
		        return;
	        }
        }
        
        //outline the document
        outliner.parse(currentEditor.document.getText());
	}
	
	/**
	 * handle a document being closed
	 */
	function documentClose() {
		if (DocumentManager.getWorkingSet().length == 0) {
            hide();
        }
	}
	
    /**
	 * Disable the extension
	 */
	function disable() {
		enabled = false;
		
		$('#brackets-code-outline').remove();
		$('.main-view .content').css('right', contentCssRight + 'px');
		updateListeners();
		
		clearInterval(resizeInterval);
		
		preferences.setValue('enabled', false);	
		CommandManager.get(NAME + 'showOutline').setChecked(false);
	}
	
	/**
	 * Toggle the outline panel's state
	 */
	function toggle() {
		if (!enabled) {
            enable();
        } else {
            disable();
        }
	}
	
	/**
	 * Set the colors for the outline based on the editor's theme
	 */
	function setThemeColors() {
		var editor = $('.CodeMirror');
		
        $('#brackets-code-outline').css({
            'background-color': editor.css('background-color'),
            'color': editor.css('color')
		});
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
