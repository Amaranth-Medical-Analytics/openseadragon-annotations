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

function pointDistance(start,end) {
  let distance = 0;
  const dx = (end.x - start.x);
  const dy = (end.y - start.y);
  distance = Math.sqrt((dx * dx) + (dy * dy)) * viewer.viewport.getZoom();
  return distance;
}


const reactToGeneralAction = (model) =>
  (action) => {
    switch (action.type) {
      case 'MODE_UPDATE':
        if (model.activityInProgress === true){
          if ((model.mode === 'FREEDRAW' || model.mode === 'POLYDRAW')){
            model.clicks = 0;
            model.annotations.pop();
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
        //console.log(model.clicks);
        if (model.controlsactive && model.activityInProgress === false){
          if (model.mode === 'LINEDRAW' 
                || model.mode === 'FREEDRAW' 
                || model.mode === 'POLYDRAW'
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
                  //console.log('Starting polygon...');
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
                }
                break;
              default:
                break;
            }
          }
        } else if (model.controlsactive && model.activityInProgress === true){
          if (model.mode === 'POLYDRAW' 
              && model.clicks >= 2              // each click registers twice
              && model.clicks % 2 === 0){      // only consider one click
            console.log(model.clicks);
            const lastAnnotation = model.annotations[model.annotations.length - 1];
            console.log(lastAnnotation);

            if (lastAnnotation && lastAnnotation[0] === 'path'){
              const distanceToStart = pointDistance(lastAnnotation[1].points[0], {'x':action.x,'y':action.y})
              if (distanceToStart < 1.3 && lastAnnotation[1].points.length > 1){
                // Remove duplicate held to visualise MOVE
                lastAnnotation[1].points.pop();
                lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
                lastAnnotation[1].d += ' Z';
                model.activityInProgress = false;
                model.clicks = 0;
                model.raiseEvent('ANNOTATIONRELEASE_EVENT', model.annotations[model.annotations.length - 1]);
                console.log('Done with poly');
              } else {
                lastAnnotation[1].points.push({'x':action.x, 'y':action.y});
                lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
              }
            }
          }
        }
        break;

      case 'LEAVE_CANVAS':
        if ((model.mode === 'FREEDRAW' || model.mode === 'POLYDRAW') 
            && model.activityInProgress === true){
          model.activityInProgress = false;
          model.clicks = 0;
          model.annotations.pop();
        }
        break;
      case 'RELEASE':
        // End linedraw, freedraw, text process
        if ((model.mode === 'FREEDRAW') 
            && model.activityInProgress === true) {
          // Close annotation
          const lastAnnotation = model.annotations[model.annotations.length - 1];
          lastAnnotation[1].d += ` Z`;
          
          model.activityInProgress = false;
          model.clicks = 0;
          model.raiseEvent('ANNOTATIONRELEASE_EVENT', model.annotations[model.annotations.length - 1]);
        }
        break;
      case 'MOVE':
        if ((model.mode === 'LINEDRAW' 
              || model.mode === 'FREEDRAW' 
              || model.mode === 'POLYDRAW'
              || model.mode === 'TEXT') 
              && model.activityInProgress === true) {
          const lastAnnotation = model.annotations[model.annotations.length - 1];      
          if (lastAnnotation && lastAnnotation[0] === 'path' && model.mode === 'FREEDRAW'){
            lastAnnotation[1].d += ` L${action.x} ${action.y}`;
          } else if (lastAnnotation && lastAnnotation[0] === 'path' && model.mode === 'POLYDRAW'){
            // In first move, removes current duplicate + all duplicates while moving
            lastAnnotation[1].points.pop();
            // Creates the duplicate - remove on END
            lastAnnotation[1].points.push({'x':action.x, 'y':action.y});
            lastAnnotation[1].d = createSvgFromPoints(lastAnnotation[1].points);
          } else if (lastAnnotation && lastAnnotation[0] === 'line') {
            lastAnnotation[1].x2 = `${action.x}`;
            lastAnnotation[1].y2 = `${action.y}`;
          } else if (lastAnnotation && lastAnnotation[0] === 'text') {
            lastAnnotation[1].x = `${action.x}`;
            lastAnnotation[1].y = `${action.y}`;
          }
        }
        break;
      
      case 'ANNOTATIONS_RESET':
        model.activityInProgress = false;
        model.annotations = action.annotations || [];
        break;

      case 'ZOOM_UPDATE':
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