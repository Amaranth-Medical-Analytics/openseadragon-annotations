import { createRef } from "preact";

function createSvgFromPoints(points){
  var path = null;
  for (var i=0; i<points.length; i++){
    if (i === 0){
      path = `M${points[i].x} ${points[i].y}`;
    } else {
      path += ` L${points[i].x} ${points[i].y}`;
    }
  }
  return path;
}

function pointDistance(start,end){
  let distance = 0;
  const dx = (end.x - start.x);
  const dy = (end.y - start.y);
  distance = Math.sqrt((dx * dx) + (dy * dy)) * viewer.viewport.getZoom();
  return distance;
}

function createCircleOverlay(x, y, threshold){
  const content_size = viewer.world._contentSize;
  const asp_ratio = content_size.y/content_size.x;

  let overlay = viewer.svgOverlay();
  
  // Keep annotations in focus, disable overlay click events
  overlay.node().parentNode.style.pointerEvents = 'none';
  
  // Define and render SVG circle
  let d3Circle = d3.select(overlay.node()).append("circle")
    .attr("id","poly_overlay")
    .attr("cx", x / 100)
    .attr("cy", y*asp_ratio / 100)
    .attr("r", threshold / (100*viewer.viewport.getZoom()))
    .style('fill', '#f00')
    .style("opacity", 0.5);
}

const reactToGeneralAction = (model) =>
  (action) => {
    const threshold = 1.5;
    switch (action.type) {
      case 'MODE_UPDATE':
        if (model.activityInProgress === true){
          if ((model.mode === 'FREEDRAW' || model.mode === 'POLYDRAW')){
            model.clicks = 0;
            model.annotations.pop();
          }
          if (model.mode === 'SELECT') {
            model.clicks = 0;
            // Reset any active selection
            model.selection = null;
          }
          model.activityInProgress = false;
        }

        if (model.mode !== action.mode) {
          model.mode = action.mode;
        }
        break;

      case 'ACTIVITY_UPDATE':
        model.activityInProgress = action.inProgress;
        break;

      case 'PRESS':
        // TO-DO : Map tp higher level in canvas_utils.js
        model.clicks ++;
        if (model.controlsactive && model.activityInProgress === false){
          if (model.mode === 'LINEDRAW' 
                || model.mode === 'FREEDRAW' 
                || model.mode === 'POLYDRAW'
                || model.mode === 'RECTANGLE'
                || model.mode === 'SELECT'
                || model.mode === 'TEXT'){
            // Remove existing annotation if it has same non-empty name
            if (model.annotationname !== '') {
              const i = model.getAnnotationsIdxByName(model.annotationname);
              if (i >= 0) {
                model.annotations.splice(i, 1);
              }
            }
            
            model.activityInProgress = true;
            switch (model.mode) {
              case 'LINEDRAW':
                model.annotations.push([
                  'line',
                  {
                    x1: `${action.x}`,
                    y1: `${action.y}`,
                    x2: `${action.x}`,
                    y2: `${action.y}`,
                    stroke: `${model.annotationcolor}`,
                    'stroke-width': `${model.annotationlinewidth}`,
                    'vector-effect': 'non-scaling-stroke',
                  }, `${model.annotationname}`,
                ]);
                break;
              case 'FREEDRAW':
                model.annotations.push([
                  'path',
                  {
                    fill: 'none',
                    d: `M${action.x} ${action.y}`,
                    stroke: `${model.annotationcolor}`,
                    'stroke-width': `${model.annotationlinewidth}`,
                    'stroke-linejoin': 'round',
                    'stroke-linecap': 'round',
                    'vector-effect': 'non-scaling-stroke',
                  }, `${model.annotationname}`,
                ]);
                break;
              case 'TEXT':
                model.annotations.push([
                  'text', 
                  {
                    x: `${action.x}`,
                    y: `${action.y}`,
                    fill: `${model.annotationcolor}`,
                    'font-family': 'sans-serif',
                    'font-size': `${model.getCurrentFontsize()}`,
                    'text-anchor': 'middle',
                  }, `${model.annotationtext}`,  `${model.annotationname}`,
                ]);
                break;
              case 'POLYDRAW':
                if (model.clicks === 1){
                  model.annotations.push([
                    'path',
                    {
                      fill: 'none',
                      points: [ {'x': action.x, 'y': action.y} ],
                      d: `M${action.x} ${action.y}`,
                      stroke: `${model.annotationcolor}`,
                      'stroke-width': `${model.annotationlinewidth}`,
                      'stroke-linejoin': 'round',
                      'stroke-linecap': 'round',
                      'vector-effect': 'non-scaling-stroke',
                    }, `${model.annotationname}`,
                  ]);
                  d3.select('#poly_overlay').remove();
                  createCircleOverlay(action.x, action.y, threshold);
                }
                break;
              case 'RECTANGLE':
                if (model.clicks === 1){
                  model.annotations.push([
                    'path',
                    {
                      fill: 'none',
                      points: [],
                      start: {'x':action.x, 'y':action.y},
                      d: `M${action.x} ${action.y}`,
                      stroke: `${model.annotationcolor}`,
                      'stroke-width': `${model.annotationlinewidth}`,
                      'stroke-linejoin': 'round',
                      'stroke-linecap': 'round',
                      'vector-effect': 'non-scaling-stroke',
                    }, `${model.annotationname}`,
                  ]);
                }
                break;
                case 'SELECT':
                  if (model.clicks === 1){
                    const ref = createRef();

                    model.selection = [
                      'path',
                      {
                        ref: ref,
                        fill: 'none',
                        points: [],
                        start: {'x':action.x, 'y':action.y},
                        d: `M${action.x} ${action.y}`,
                        stroke: 'lightgray',
                        'stroke-width': '2',
                        'stroke-linejoin': 'round',
                        'stroke-linecap': 'round',
                        'stroke-dasharray': '5,3', 
                        'vector-effect': 'non-scaling-stroke',
                      }, `selection`,
                    ];
                  }
                  break;
              default:
                break;
            }
          }
        } else if (model.controlsactive && model.activityInProgress === true){
          if (model.mode === 'POLYDRAW' 
              && model.clicks >= 2             // each click registers twice
              && model.clicks % 2 === 0){      // only consider one click
            const lastAnnotation = model.annotations[model.annotations.length - 1];

            if (lastAnnotation && lastAnnotation[0] === 'path'){
              const distanceToStart = pointDistance(lastAnnotation[1].points[0], {'x':action.x,'y':action.y})
              if (distanceToStart < threshold && lastAnnotation[1].points.length > 1){
                // Remove duplicate held to visualise MOVE
                lastAnnotation[1].points.pop();
                lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
                lastAnnotation[1].d += ' Z';
                
                // Close overlay
                d3.select('#poly_overlay').remove();
                
                model.activityInProgress = false;
                model.clicks = 0;
                model.raiseEvent('ANNOTATIONRELEASE_EVENT', model.annotations[model.annotations.length - 1]);
              } else {
                lastAnnotation[1].points.push({'x':action.x, 'y':action.y});
                lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
              }
            }
          }
        }
        break;

      case 'LEAVE_CANVAS':
        if (model.activityInProgress === false) {
          break;
        }

        model.activityInProgress = false;
        model.clicks = 0;

        if (model.mode === 'FREEDRAW' || model.mode === 'POLYDRAW' || model.mode === 'RECTANGLE'){
          model.annotations.pop();
        }

        if ((model.mode === 'SELECT') && model.activityInProgress === true) {
          model.selection = null;
        }
        break;
      
      case 'RELEASE':
        if (model.activityInProgress === false) {
          break;
        }

        model.activityInProgress = false;
        model.clicks = 0;

        // End linedraw, freedraw, text process
        if (model.mode === 'FREEDRAW' || model.mode === 'RECTANGLE'){
          // Close freedraw annotation
          if (model.mode === 'FREEDRAW' ) {
            const lastAnnotation = model.annotations[model.annotations.length - 1];
            lastAnnotation[1].d += ` Z`;
          }
          model.raiseEvent('ANNOTATIONRELEASE_EVENT', model.annotations[model.annotations.length - 1]);
        }

        if (model.mode === 'SELECT') {
          model.raiseEvent('SELECTIONRELEASE_EVENT', model.selection);
        }

        break;
      
      case 'MOVE':
        // Ignore if activity not in progress
        if (model.activityInProgress === false) {
          break;
        }

        if (model.mode === 'LINEDRAW' 
            || model.mode === 'FREEDRAW' 
            || model.mode === 'POLYDRAW'
            || model.mode === 'RECTANGLE'
            || model.mode === 'TEXT') {
          const lastAnnotation = model.annotations[model.annotations.length - 1];      
          if (lastAnnotation && lastAnnotation[0] === 'path' && model.mode === 'FREEDRAW'){
            lastAnnotation[1].d += ` L${action.x} ${action.y}`;
          
          } else if (lastAnnotation && lastAnnotation[0] === 'path' && model.mode === 'POLYDRAW'){
            // In first move, removes current duplicate + all duplicates made while moving
            lastAnnotation[1].points.pop();
            // Creates the duplicate, will remove at end of move - remove on click
            lastAnnotation[1].points.push({'x':action.x, 'y':action.y});
            lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);

            const distanceToStart = pointDistance(lastAnnotation[1].points[0], {'x':action.x,'y':action.y})
            if (distanceToStart < threshold && lastAnnotation[1].points.length > 1){
              // Keep cleaning overlays on move to maintain opacity
              d3.select('#poly_overlay').remove();
              createCircleOverlay(lastAnnotation[1].points[0].x, lastAnnotation[1].points[0].y, threshold);
            } else {
              d3.select('#poly_overlay').remove();
            }

          } else if (lastAnnotation && lastAnnotation[0] === 'path' && model.mode === 'RECTANGLE'){
            let first_point = lastAnnotation[1].start;
            let third_point = {'x':action.x,'y':action.y};
            lastAnnotation[1].points = [first_point,
                                        {'x':first_point.x ,'y':third_point.y},
                                        third_point,
                                        {'x':third_point.x ,'y':first_point.y}]
            lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
            lastAnnotation[1].d += ` Z`;
          
          } else if (lastAnnotation && lastAnnotation[0] === 'line') {
            lastAnnotation[1].x2 = `${action.x}`;
            lastAnnotation[1].y2 = `${action.y}`;
          
          } else if (lastAnnotation && lastAnnotation[0] === 'text') {
            lastAnnotation[1].x = `${action.x}`;
            lastAnnotation[1].y = `${action.y}`;
          }
        }

        if (model.mode === 'SELECT') {
          if (!model.selection) {
            break;
          }
          let first_point = model.selection[1].start;
          let third_point = {'x':action.x,'y':action.y};
          model.selection[1].points = [first_point,
                                      {'x':first_point.x ,'y':third_point.y},
                                      third_point,
                                      {'x':third_point.x ,'y':first_point.y}]
          model.selection[1].d = createSvgFromPoints(model.selection[1].points);
          model.selection[1].d += ` Z`;
        }
        break;
      
      case 'ANNOTATIONS_RESET':
        model.activityInProgress = false;
        model.annotations = action.annotations || [];

        break;
      
      case 'SELECTION_RESET':
        model.activityInProgress = false;
        model.selection = null;

        break;

      case 'ZOOM_UPDATE':
        if (model.activityInProgress === true){
          if ((model.mode === 'FREEDRAW' || model.mode === 'POLYDRAW')){
            model.clicks = 0;
            model.annotations.pop();
          }
          model.activityInProgress = false;
        }

        model.zoom = action.zoom;
        model.zoomUpdate();
        break;

      case 'INITIALIZE':
        model.zoom = action.zoom;
        model.width = action.width;
        model.height = action.height;
        break;

      default:
        break;
    }

    model.raiseEvent('CHANGE_EVENT');
  };

export default reactToGeneralAction;