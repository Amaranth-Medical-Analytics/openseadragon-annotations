import Tool from "./Tool";

class MoveTool extends Tool {
  constructor(model) {
    super(model);
    this.toolName = 'MOVE';
  }

  onPress() {}

  onMove() {}

  onRelease() {}

  onLeaveCanvas() {}
}

export default MoveTool;