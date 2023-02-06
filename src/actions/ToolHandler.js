import MoveTool from './tools/MoveTool';
import SelectionTool from './tools/SelectionTool';
import FreeDrawTool from './tools/FreeDrawTool';
import PolyDrawTool from './tools/PolyDrawTool';
import RectangleDrawTool from './tools/RectangleDrawTool';

class ToolHandler {
  static instance = null;

  static getInstance(model) {
    if (!ToolHandler.instance || ToolHandler.instance.model !== model) {
      ToolHandler.instance = new ToolHandler(model);
    }
    return ToolHandler.instance;
  }

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
      ['RECTANGLE', () => new RectangleDrawTool(this.model)]
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

    console.log(this.model.mode);
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
    console.log("Before updateTool: this.model.mode =", this.model.mode);
    console.log("Before updateTool: this.currentTool =", this.currentTool);
    
    this.currentTool = this.selectTool(this.model.mode);

    console.log("After updateTool: this.model.mode =", this.model.mode);
    console.log("After updateTool: this.currentTool =", this.currentTool);
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