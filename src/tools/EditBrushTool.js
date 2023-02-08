import Tool from "./Tool";

class EditBrushTool extends Tool {
  constructor(model) {
    super(model);
    this.toolName = 'EDITBRUSH';
  }

  onPress() {}

  onMove() {}

  onRelease() {}

  onLeaveCanvas() {}
}

export default EditBrushTool;