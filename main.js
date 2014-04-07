/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/**
 * @file main.js
 * @author Will Steinmetz
 * This extension adds a panel to the right side of Brackets to outline particular
 * code files. See the README for the supported file types.
 */

define(['require', 'exports', 'module', 'outliners'], function (require, exports, module, outliners) {
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
	
	var preferences = PreferencesManager.getExtensionPrefs(NAME),
        menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);

    preferences.definePreference("enabled", "boolean", false);
	
	var currentEditor,
        enabled = preferences.get('enabled'),
        hidden = false,
        contentCssRight = 0,
        resizeInterval,
        currentType = null,
        supported = true,
        updateInterval;

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
	 * Go to the clicked line in the outline
	 * @param object event
	 */
	function goToLine(event) {
		var line = $(event.target).data('line');
		if (DocumentManager.getCurrentDocument()) {
			var editor = EditorManager.getCurrentFullEditor();
			editor.setCursorPos(line, 0, true);
		}
	}

    /**
	 * Get the current document and set up the outliner class for use
	 */
	function documentEdit() {
		var file = currentEditor.document.file.name,
			type = file.substr(file.lastIndexOf('.') + 1);
		if (type && (typeof type !== 'undefined') && (type !== null) && (type !== currentType)) {
            currentType = type;
        }

        // make sure that the file type is supported
        // @TODO show message instead
        if ((typeof currentType !== 'undefined') && (currentType !== null) && (!outliners.supported(currentType))) {
	        supported = false;
            $('div#brackets-code-outline').find('nav').html('<p>This file type is not supported.</p>');
            return;
        }

        //outline the document
        outliners[currentType + 'Parse'](currentEditor.document.getText());
	}

    /**
	 * handle a document being closed
	 */
	function documentClose() {
		if (DocumentManager.getWorkingSet().length === 0) {
            hide();
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
		documentEdit();
		
		$(currentEditor.document).on('change.bracketsCodeOutline', documentEdit);
	}

    /**
	 * update the event listeners for the extension
	 */
	function updateListeners() {
		$('div#brackets-code-outline nav').delegate('li', 'click', goToLine);
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
	 * Set the colors for the outline based on the editor's theme
	 */
	function setThemeColors() {
		var editor = $('.CodeMirror');

        $('#brackets-code-outline').css({
            'background-color': editor.css('background-color'),
            'color': editor.css('color')
		}).find('header').css({
			'background-color': editor.css('background-color')
		});
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

		resizeInterval = setInterval(function () {
			if ($('#brackets-code-outline').css('background-color') !== $('.CodeMirror').css('background-color')) {
				setThemeColors();
			}
		}, 500);

		preferences.set('enabled', true);
        preferences.save();
		CommandManager.get(NAME + 'showOutline').setChecked(true);
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
		
		preferences.set('enabled', false);
        preferences.save();
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
