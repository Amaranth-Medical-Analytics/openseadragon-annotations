import MoveTool from './MoveTool';
import SelectionTool from './SelectionTool';
import FreeDrawTool from './FreeDrawTool';
import PolyDrawTool from './PolyDrawTool';
import RectangleDrawTool from './RectangleDrawTool';
import EditBrushTool from './EditBrushTool';
import DeleteBinTool from './DeleteBinTool';

/**
 * @class ToolHandler
 * ToolHandler is a singleton class that remains unique for a given dispatcher. While a layer is 
 * active, a toolhandler delegates actions to all tools in the current layer. Instance is re-created
 * when a dispatcher is flushed. 
 */
class ToolHandler {
  /**
   * Instantiate an instance 
   */
  static instance = null;

  static getInstance(model) {
    if (!ToolHandler.instance || ToolHandler.instance.model !== model) {
      ToolHandler.instance = new ToolHandler(model);
    }
    return ToolHandler.instance;
  }
  
  /**
   * Create an instance of the ToolHandler class
   * @param {*} model - The model being used in the current dispatcher. 
   */
  constructor(model) {
    if (ToolHandler.instance) {
      if (ToolHandler.instance.model !== model) {
        ToolHandler.instance.model = model;
      }
      return ToolHandler.instance;
    }

    this.model = model;
    /**
     * Map model modes to tools
     */
    this.toolMap = new Map([
      ['MOVE', () => new MoveTool(this.model)],
      ['SELECT', () => new SelectionTool(this.model)],
      ['FREEDRAW', () => new FreeDrawTool(this.model)],
      ['POLYDRAW', () => new PolyDrawTool(this.model)],
      ['RECTANGLE', () => new RectangleDrawTool(this.model)],
      ['EDITBRUSH', () => new EditBrushTool(this.model)],
      ['DELETEBIN', () => new DeleteBinTool(this.model)]
    ]);

    /**
     * Map the dispatcher fired events to class methods
     */ 
    this.eventMap = new Map([
      ['PRESS', 'onPress'],
      ['MOVE', 'onMove'],
      ['RELEASE', 'onRelease'],
      ['LEAVE_CANVAS', 'onLeaveCanvas'],
      ['ZOOM_UPDATE', 'onZoom']
    ]) 

    this.setCurrentTool();
    ToolHandler.instance = this;
  }

  cleanTool() {
    this.currentTool.reset();
  }

  setCurrentTool() {
    this.currentTool = this.toolMap.get(this.model.mode)();
  }

  handleAction(action) {
    const event = this.eventMap.get(action.type);
    // Fire if action is available for given tool
    if (event && this.currentTool[event]) {
      this.currentTool[event](action);
    }
  }
}

export default ToolHandler;