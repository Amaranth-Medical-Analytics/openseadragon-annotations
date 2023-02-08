/**
 * Callback higher-order function invoked by the dispatcher upon any action related to 
 * the main engine/system
 * @param {*} model 
 * @param {*} toolHandler
 */
const reactToEngineActions = (model, toolHandler) => {
  return (action) => {
    switch (action.type) {
      /**
       * Action to update the current mode of the model, typically changed my clicking on 
       * tool buttons on the toolbar or through hotkeys. Action is also exposed as a library
       * method.
       * 
       * Payload:
       *  - mode (string): The mode to be updated to.
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
         * Avoid re-initialising if current tool is pressed for an nth time. 
         */
        if (model.mode !== action.mode) {
          model.mode = action.mode;
          toolHandler.setCurrentTool();
        }

        break;

      /**
       * Action to reset the annotations in the model. Typically raised by the exposed library 
       * method. 
       * 
       * Payload:
       *  - annotations (Array): The annotations to be set in the model, or undefined to clear
       *      the annotations.
       */
      case 'ANNOTATIONS_RESET':
        model.activityInProgress = false;
        model.annotations = action.annotations || [];

        break;
      
      /**
       * Action to reset the current selection in the model. Typically raised by the exposed 
       * library method. 
       * 
       * Payload: None
       */
      case 'SELECTION_RESET':
        model.activityInProgress = false;
        model.selection = null;
        
        break;

      default:
        break;
    }

    /**
     * Exposes event for views to update
     */
    model.raiseEvent('CHANGE_EVENT');
  };
};

export default reactToEngineActions;