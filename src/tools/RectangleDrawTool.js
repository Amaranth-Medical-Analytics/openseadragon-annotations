import Tool from "./Tool";
import { createSvgFromPoints } from "../utils";

class RectangleDrawTool extends Tool {
  constructor(model) {
    super(model);
    this.toolName = 'RECTANGLE';
  }

  reset() {
    super.reset();
    this.model.annotations.pop();
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
      this.model.annotations.push([
        'path',
        {
          fill: 'none',
          points: [],
          start: {'x':x, 'y':y},
          d: `M${x} ${y}`,
          stroke: `${this.model.annotationcolor}`,
          'stroke-width': `${this.model.annotationlinewidth}`,
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
          'vector-effect': 'non-scaling-stroke',
        }, `${this.model.annotationname}`,
      ]);
    }
  }

  onMove( action ) {
    if (this.model.activityInProgress === true) {
      const { x, y } = action;
      const lastAnnotation = this.model.annotations[this.model.annotations.length - 1];  
      
      let first_point = lastAnnotation[1].start;
      let third_point = {'x':x,'y':y};
      lastAnnotation[1].points = [first_point,
                                  {'x':first_point.x ,'y':third_point.y},
                                  third_point,
                                  {'x':third_point.x ,'y':first_point.y}]
      lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
      lastAnnotation[1].d += ` Z`;
    }
  }

  onRelease() {
    if (this.model.activityInProgress === true) {
      this.model.activityInProgress = false;
      this.model.clicks = 0;
      
      this.model.raiseEvent('ANNOTATIONRELEASE_EVENT', this.model.annotations[this.model.annotations.length - 1]);
    }
  }

  onLeaveCanvas() {
    if (this.model.activityInProgress === true) {
      super.onLeaveCanvas();
      this.model.annotations.pop();
    }
  }
}

export default RectangleDrawTool;