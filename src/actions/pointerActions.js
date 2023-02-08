/**
 * Callback higher-order function invoked by the dispatcher upon any action related to 
 * pointer events. 
 * 
 * @param {*} model 
 * @param {*} toolHandler
 */
const reactToPointerActions = (model, toolHandler) => {
  return (action) => {
    switch (action.type) {
      /**
       * Action raised upon a mouseDown event on the SVG overlay. 
       * 
       * Payload:
       *  - x: The x co-ordinate of the event in viewport co-ordinates (out of 100)
       *  - y: The y co-ordinate of the event in viewport co-ordinates (out of 100)
       */
      case 'PRESS':
        toolHandler.handleAction(action);
        break;

      /**
       * Action raised upon a mouseMove event on the SVG overlay. 
       * 
       * Payload:
       *  - x: The x co-ordinate of the event in viewport co-ordinates (out of 100)
       *  - y: The y co-ordinate of the event in viewport co-ordinates (out of 100)
       */
      case 'MOVE':
        toolHandler.handleAction(action);
        break;

      /**
       * Action raised upon a mouseUp event on the SVG overlay. 
       * 
       * Payload:
       *  - x: The x co-ordinate of the event in viewport co-ordinates (out of 100)
       *  - y: The y co-ordinate of the event in viewport co-ordinates (out of 100)
       */
      case 'RELEASE':
        toolHandler.handleAction(action);
        break;

      /**
       * Action raised upon a mouseLeave event on the SVG overlay. 
       * 
       * Payload:
       *  - x: The x co-ordinate of the event in viewport co-ordinates (out of 100)
       *  - y: The y co-ordinate of the event in viewport co-ordinates (out of 100)
       */
      case 'LEAVE_CANVAS':
        toolHandler.handleAction(action);
        break;

      default: 
        break;
    }

    /**
     * Exposes event for views to update.
     */
    model.raiseEvent('CHANGE_EVENT')
  };
};

export default reactToPointerActions;