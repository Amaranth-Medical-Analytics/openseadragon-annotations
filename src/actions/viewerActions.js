/**
 * Callback higher-order function invoked by the dispatcher upon any action related to 
 * the OpenSeadragon viewer
 * @param {*} model
 * @param {*} toolHandler
 */
const reactToViewerActions = (model, toolHandler) => {
  return (action) => {
    switch (action.type) {
      /**
       * Action to update the zoom level of the model.
       * 
       * Payload: 
       *  - zoom (float): The zoom level to be updated to.  
       */
      case 'ZOOM_UPDATE':
        if (model.activityInProgress) {
          toolHandler.handleAction(action.type);
        }
    
        model.zoom = action.zoom;
        model.zoomUpdate();

        break;

      /**
       * Action to iniitialize the model to the state of the viewer. Used to generate 
       * the initial SVG overlay. 
       * 
       * Payload:
       *  - zoom (float): The intial zoom level of the viewer.
       *  - width (integer): The initial width of the viewer viewport. 
       *  - height (integer): The initial height of the viewer viewport. 
       */
      case 'INITIALIZE': 
        model.zoom = action.zoom;
        model.width = action.width;
        model.height = action.height;

        break;
      
      default:
        break;
    }

    /** 
     * Exposes event for views to update. 
     */
    model.raiseEvent('CHANGE_EVENT');
  };
};

export default reactToViewerActions;