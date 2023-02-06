/**
 * Callback function invoked by the dispatcher upon any defined actions that get raised by the View 
 * (SVG overlay or control buttons).
 * A switch statement is used to handle most non-tool related actions, while tool related actions are 
 * delegated to ToolHandler. 
 * @param {*} model 
 * @param {*} toolHandler 
 */
const reactToGeneralAction = (model, toolHandler) => {
	return (action) => {
		switch (action.type) {
      /**
       * Action to switch tools, or reset the currently active tool. Achieved by clicking tool buttons 
       * ont the toolbar, or by using any defined hotkeys.
       */
			case 'MODE_UPDATE':
        /**
         * If mode change occurs during an annotation activity, due to erraneous click or hotkey press
         * Clean up annotation being created
         */
				if (model.activityInProgress === true) {
          // Reset click, conduct tool specific cleanup
          toolHandler.cleanTool();
          model.activityInProgress = false;
        }

        /**
         * action.mode defines the payload sent to the dispatcher. Defines the mode to be updated to. Avoid
         * re-initialising if current tool is pressed for an nth time. 
         */
        if (model.mode !== action.mode) {
          model.mode = action.mode;
          toolHandler.updateTool();
        }
				break;
          
      // UNCALLED IN CODEBASE - to be removed. 
			case 'ACTIVITY_UPDATE':
				model.activityInProgress = action.inProgress;
				break;
      
      /**
       * Raised by the exposed setAnnotations() and cleanAnnotations() methods. Resets activity status
       * and sets annotations to passed list, or flushes list. 
       */
      case 'ANNOTATIONS_RESET':
        model.activityInProgress = false;
        model.annotations = action.annotations || [];
    
        break;
      
      /**
       * Raised by the exposed cleanSelection() method. Resets activity status and clears current selection. 
       */
      case 'SELECTION_RESET':
        model.activityInProgress = false;
        model.selection = null;
    
        break;
      
      /**
       * Raised by event handler tied to Openseadragaon Viewer's zoom event. If annotation activity 
       * in progress, delegates event to ToolHandler for tool specific cleanup, if any. Updates model
       * store to current zoom. 
       */
      case 'ZOOM_UPDATE':
        if (model.activityInProgress) {
          toolHandler.handleAction('ZOOM_UPDATE');
        }
    
        model.zoom = action.zoom;
        model.zoomUpdate();
        break;
        
      /**
       * Raised on model creation to set viewer based data in model store. 
       */
      case 'INITIALIZE':
        model.zoom = action.zoom;
        model.width = action.width;
        model.height = action.height;
        break;
        
      /**
       * Delegates all remaining pointer based events (PRESS, RELEASE, MOVE) to the ToolHandler for tool
       * specific activity.
       */
			default:
        toolHandler.handleAction(action);
        break;
		}

    /**
     * Exposes event for views to update.
     */
		model.raiseEvent('CHANGE_EVENT');
	};
};

export default reactToGeneralAction;