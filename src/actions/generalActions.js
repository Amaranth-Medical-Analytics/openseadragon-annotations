const reactToGeneralAction = (model, toolHandler) => {
	return (action) => {
		switch (action.type) {
			case 'MODE_UPDATE':
				if (model.activityInProgress === true) {
          toolHandler.cleanTool();
          model.activityInProgress = false;
        }

        if (model.mode !== action.mode) {
          model.mode = action.mode;
          toolHandler.updateTool();
        }
				break;
          
      // UNCALLED
			case 'ACTIVITY_UPDATE':
				model.activityInProgress = action.inProgress;
				break;

      case 'ANNOTATIONS_RESET':
        model.activityInProgress = false;
        model.annotations = action.annotations || [];
    
        break;
        
      case 'SELECTION_RESET':
        model.activityInProgress = false;
        model.selection = null;
    
        break;
    
      case 'ZOOM_UPDATE':
        if (model.activityInProgress) {
          toolHandler.handleAction('ZOOM_UPDATE');
        }
    
        model.zoom = action.zoom;
        model.zoomUpdate();
        break;
    
      case 'INITIALIZE':
        model.zoom = action.zoom;
        model.width = action.width;
        model.height = action.height;
        break;
            
			default:
        toolHandler.handleAction(action);
        break;
		}

		model.raiseEvent('CHANGE_EVENT');
	};
};

export default reactToGeneralAction;