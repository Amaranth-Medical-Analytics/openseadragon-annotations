import Tool from "./Tool";
import { createSvgFromPoints } from "../utils";
import { createCircleOverlay } from "../utils";
import { pointDistance } from "../utils";

class PolyDrawTool extends Tool {
  constructor(model) {
    super(model);
    this.toolName = 'POLYDRAW';
    this.THRESHOLD = 1.5;
  }

  reset() {
    super.reset();
    this.model.annotations.pop();
  }

  onPress( action ) {
    const { x, y } = action;

    super.onPress();

    if (this.model.controlsactive && !this.model.activityInProgress) {   
      this.model.activityInProgress = true;

      if (this.model.clicks !== 1){
        return;
      }
      this.model.annotations.push([
        'path',
        {
          fill: 'none',
          points: [ {'x': x, 'y': y} ],
          d: `M${x} ${y}`,
          stroke: `${this.model.annotationcolor}`,
          'stroke-width': `${this.model.annotationlinewidth}`,
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
          'vector-effect': 'non-scaling-stroke',
        }, `${this.model.annotationname}`,
      ]);
      d3.select('#poly_overlay').remove();
      createCircleOverlay(x, y, this.THRESHOLD);
    } else if (this.model.controlsactive && this.model.activityInProgress === true){
      if (!(this.model.clicks >= 2             // each click registers twice
        && this.model.clicks % 2 === 0)){      // only consider one click
        return;
      }

      const lastAnnotation = this.model.annotations[this.model.annotations.length - 1];
      if (!(lastAnnotation && lastAnnotation[0] === 'path')) {
        return;
      }
    
      const distanceToStart = pointDistance(
        lastAnnotation[1].points[0], 
        {'x': x,'y': y}
      );

      if (distanceToStart < this.THRESHOLD && lastAnnotation[1].points.length > 1){
        // Remove duplicate held to visualise MOVE
        lastAnnotation[1].points.pop();
        lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
        lastAnnotation[1].d += ' Z';
          
        // Close overlay
        d3.select('#poly_overlay').remove();
            
        this.model.activityInProgress = false;
        this.model.clicks = 0;
        this.model.raiseEvent('ANNOTATIONRELEASE_EVENT', this.model.annotations[this.model.annotations.length - 1]);
      } else {
        lastAnnotation[1].points.push({'x': x, 'y': y});
        lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
      } 
    }
  }

  onMove( action ) {
    if (this.model.activityInProgress === true) {
      const { x, y } = action;
      const lastAnnotation = this.model.annotations[this.model.annotations.length - 1];  
      
      // In first move, removes current duplicate + all duplicates made while moving
      lastAnnotation[1].points.pop();
      // Creates the duplicate, will remove at end of move - remove on click
      lastAnnotation[1].points.push({'x': x, 'y': y});
      lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);

      const distanceToStart = pointDistance(lastAnnotation[1].points[0], {'x': x,'y': y})
      if (distanceToStart < this.THRESHOLD && lastAnnotation[1].points.length > 1){
        // Keep cleaning overlays on move to maintain opacity
        d3.select('#poly_overlay').remove();
        createCircleOverlay(lastAnnotation[1].points[0].x, lastAnnotation[1].points[0].y, this.THRESHOLD);
      } else {
        d3.select('#poly_overlay').remove();
      }
    }
  }

  onLeaveCanvas() {
    if (this.model.activityInProgress === true) {
      this.model.annotations.pop();
    }
  }

  onRelease() {}

  onZoom() {
    if (this.model.activityInProgress === true) {
      super.onZoom();
      this.model.annotations.pop();
    }
  }
}

export default PolyDrawTool;