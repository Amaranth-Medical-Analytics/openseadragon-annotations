import MoveTool from './tools/MoveTool';
import SelectionTool from './tools/SelectionTool';
import FreeDrawTool from './tools/FreeDrawTool';
import PolyDrawTool from './tools/PolyDrawTool';
import RectangleDrawTool from './tools/RectangleDrawTool';
import EditBrushTool from './tools/EditBrushTool';
import DeleteBinTool from './tools/DeleteBinTool';

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

    this.currentTool = this.selectTool(this.model.mode);
    ToolHandler.instance = this;
  }

  selectTool(mode) {
    return this.toolMap.get(mode)();
  }

  cleanTool() {
    this.currentTool.reset();
  }

  updateTool() {
    this.currentTool = this.selectTool(this.model.mode);
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