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
    // Do not propagate if control buttons are inactive. 
    if (!this.model.controlsactive) {
      return;
    }

    // Do not propogate if another annotation action is in progress 
    // (eg. a click while creating a freedraw annotation should not trigger a second annotation)
    // NOTE: This should not occur as a release event will be fired before a second click. However, will
    // need to add checks in model to ensure state is correctly state before requested update from next 
    // action. 
    if (this.model.activityInProgress) {
      return;
    }

    super.onPress();
    // Mark state as annotation creation in progress. 
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