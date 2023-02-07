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
    if (!this.model.controlsactive) {
      return;
    }
    if (this.model.activityInProgress) {
      return;
    }

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

  onMove( action ) {
    if (!this.model.activityInProgress) {
      return;
    }
    
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

  onRelease() {
    if (!this.model.activityInProgress) {
      return;
    } 

    this.model.activityInProgress = false;
    this.model.clicks = 0;
    
    this.model.raiseEvent('ANNOTATIONRELEASE_EVENT', this.model.annotations[this.model.annotations.length - 1]);
  }

  onLeaveCanvas() {
    if (!this.model.activityInProgress) {
      return;
    }

    super.onLeaveCanvas();
    this.model.annotations.pop();
  }
}

export default RectangleDrawTool;