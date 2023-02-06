import Tool from "./Tool";

class FreeDrawTool extends Tool {
  constructor(model) {
    super(model);
    this.toolName = 'FREEDRAW';
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
    lastAnnotation[1].d += ` L${x} ${y}`;
  }

  onRelease() {
    if (!this.model.activityInProgress) {
      return;
    }

    const lastAnnotation = this.model.annotations[this.model.annotations.length - 1];
    lastAnnotation[1].d += ` Z`;

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

  onZoom() {
    if (!this.model.activityInProgress) {
      return;
    }

    super.onZoom();
    this.model.annotations.pop();
  }
}

export default FreeDrawTool;