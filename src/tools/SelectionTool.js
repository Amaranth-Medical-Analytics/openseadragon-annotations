import { createRef } from "preact";
import Tool from "./Tool";
import { createSvgFromPoints } from "../utils";

class SelectionTool extends Tool {
  constructor(model) {
    super(model);
    this.toolName = 'SELECT';
  }

  reset() {
    super.reset();
    this.model.selection = null;
  }

  onPress( action ) {
    /**
     * Do not propagate if control buttons are inactive. 
     * Do not propogate if another annotation action is in progress (eg. a click while 
     * creating a freedraw annotation should not trigger a second annotation)
     * 
     * NOTE: This should not occur as a release event will be fired before a second click. 
     * However, will need to add checks in model to ensure state is correctly state before 
     * requested update from next action. 
     */
    if (this.model.controlsactive === true && this.model.activityInProgress === false) {
      super.onPress();
      this.model.activityInProgress = true;

      const { x, y } = action;
      const ref = createRef();

      this.model.selection = [
        'path',
        {
          ref: ref,
          fill: 'none',
          points: [],
          start: {'x': x, 'y': y},
          d: `M${x} ${y}`,
          stroke: 'lightgray',
          'stroke-width': '2',
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
          'stroke-dasharray': '5,3', 
          'vector-effect': 'non-scaling-stroke',
        }, 'selection',
      ];
    }
  }

  onMove( action ) {
    if (this.model.activityInProgress === true) {
      const { x, y } = action;
      
      let first_point = this.model.selection[1].start;
      let third_point = {'x':x,'y':y};
      this.model.selection[1].points = [
        first_point,
        {'x':first_point.x ,'y':third_point.y},
        third_point,
        {'x':third_point.x ,'y':first_point.y}
      ]
      this.model.selection[1].d = createSvgFromPoints(this.model.selection[1].points);
      this.model.selection[1].d += ` Z`;
    }
  }

  onRelease() {
    if (this.model.activityInProgress === true) {
      this.model.activityInProgress = false;
      this.model.clicks = 0;
      this.model.raiseEvent('SELECTIONRELEASE_EVENT', this.model.selection);
    }
  }

  onLeaveCanvas() {
    if (this.model.activityInProgress === true) {
      super.onLeaveCanvas();
      this.model.selection = null;
    }
  }

  onZoom() {
    super.onZoom();
  }
}

export default SelectionTool;