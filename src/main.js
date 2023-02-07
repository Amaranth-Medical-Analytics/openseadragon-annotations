import { Rect } from 'OpenSeadragon';
import { h, render } from 'preact';
import Overlay from './views/Overlay';
import { DeleteBinControl, DrawFreeControl, DrawPolyControl, DrawRectControl, EditBrushControl, MoveControl, SelectControl } from './views/Controls';
import createDispatcher from './model/createDispatcher';
import actionsStore from './actions'
import createModel from './model/createModel';

const annotationsPrototype = {
  onOpen(layer='default', resetControls=true) {
    const homeBounds = this.viewer.world.getHomeBounds();
    const zoom = this.viewer.viewport.getZoom();
    this.activeLayer = layer;
    
    if (!viewer.getOverlayById(layer)) {
      this.viewer.addOverlay(this.overlays[layer].svg, new Rect(0, 0, homeBounds.width, homeBounds.height));
    }

    const { width, height } = this.overlays[layer].svg.getBoundingClientRect();
    this.dispatch({ type: 'INITIALIZE', zoom, width, height });
    
    const controlConfig = { 
      dispatch: this.dispatch, 
      model: this.overlays[layer].model, 
      viewer: this.viewer 
    }

    this.overlays[layer].model.activityInProgress = false;

    for (const overlay in this.overlays) {
      if (overlay === layer) {
        this.overlays[overlay].svg.style.pointerEvents = 'visiblePainted';
      } else {
        this.overlays[overlay].svg.style.pointerEvents = 'none';
      }
    }

    if (resetControls === false) {
      return;
    }

    if (this.controls) {
      for (let i=0; i<this.controls.length; i++) {
        this.controls[i].destroy();
      }
    }

    this.controls = [
      new MoveControl(controlConfig),
      new SelectControl(controlConfig),
      new DrawPolyControl(controlConfig),
      new DrawFreeControl(controlConfig),
      new DrawRectControl(controlConfig),
      new EditBrushControl(controlConfig),
      new DeleteBinControl(controlConfig)
    ];
    return;
  },

  onClose() {
    // TODO
    // Clear model
    // Clear dispatcher
    // Remove controls
  },

  /*
   Layer controls
  */
  addLayer(layerName) {
    const model = createModel();
    this.dispatch = createDispatcher(model, actionsStore);

    this.overlays[layerName] = {
      model: model,
      svg: render(h(Overlay, { name: layerName, dispatch: this.dispatch, model: model }))
    };

    this.onOpen(layerName);
  },

  setLayer(layerName, resetControls=true) {
    this.dispatch = createDispatcher(this.overlays[layerName].model, actionsStore);
    this.onOpen(layerName, resetControls);
  },

  removeLayer(layerName) {
    if (layerName === 'default') {
      console.warn('Cannot delete default layer!');
      return;
    }

    // If active layer, set engine to default layer
    if (layerName === this.activeLayer) {
      this.setLayer('default');
    }

    // remove visual overlay and remove overlay object
    this.viewer.removeOverlay(this.overlays[layerName]);
    delete this.overlays[layerName];
  },

  getLayer() {
    return this.activeLayer;
  },

  toggleLayer(layerName, visible) {
    switch (visible) {
      case true:
        // show svg overlay
        this.overlays[layerName].svg.style.visibility = 'visible';
        break;
      case false:
        // hide svg overlay
        this.overlays[layerName].svg.style.visibility = 'hidden';
        break;
      default:
        break;
    }

    if (layerName === this.activeLayer) {
      this.EnableControls(visible);
    }
  },

  getAnnotations() {
    const activeLayer = this.activeLayer;
    return this.overlays[activeLayer].model.annotations;
  },

  getSelection() {
    const activeLayer = this.activeLayer;
    return this.overlays[activeLayer].model.selection;
  },

  cleanSelection() {
    this.dispatch({ type: 'SELECTION_RESET', annotations })
  },

  setAnnotations(annotations) {
    // Sets annotations of currently active layer
    this.dispatch({ type: 'ANNOTATIONS_RESET', annotations });
  },

  setLayerAnnotations(annotations, layerName) {
    const layer_model = this.overlays[layerName].model;
    layer_model.activityInProgress = false;
    layer_model.annotations = annotations || [];
    return;
  },

  cleanAnnotations() {
    const activeLayer = this.activeLayer;
    this.dispatch({ type: 'ANNOTATIONS_RESET' });
  },

  getMode() {
    const activeLayer = this.activeLayer;
    return this.overlays[activeLayer].model.mode;
  },

  setMode(mode) {
    let mode_btn = null;
    for (let i=0; i<this.controls.length; i++) {
      if (this.controls[i].mode === mode) {
        mode_btn = this.controls[i].btn.element;
        break;
      }
    }
    if (mode_btn.disabled === true) {
      return;
    }
    this.controls[0].dispatch({ type: 'MODE_UPDATE', mode });
    return;
  },

  setAnnotationColor(color) {
    const activeLayer = this.activeLayer;
    this.overlays[activeLayer].model.annotationcolor = color;
  },

  setAnnotationLineWidth(linewidth) {
    const activeLayer = this.activeLayer;
    this.overlays[activeLayer].model.annotationlinewidth = linewidth;
  },

  setAnnotationName(name) {
    const activeLayer = this.activeLayer;
    this.overlays[activeLayer].model.annotationname = name;
  },

  setAnnotationText(text) {
    const activeLayer = this.activeLayer;
    this.overlays[activeLayer].model.annotationtext = text;
  },

  setAnnotationFontsize(fontsize) {
    const activeLayer = this.activeLayer;
    this.overlays[activeLayer].model.annotationfontsize = parseFloat(fontsize);
    this.overlays[activeLayer].model.zoomUpdate()
  },

  getStatus() {
    return { active: !!this.overlays[this.activeLayer].svg };
  },

  EnableControls(active) {
    this.overlays[this.activeLayer].model.controlsactive = !!active;
    if (this.controls) {
      for (let index = 0; index < this.controls.length; index += 1) {
        if (this.overlays[this.activeLayer].model.controlsactive
          || this.controls[index].mode === 'MOVE') {
          this.controls[index].btn.enable();
        } else {
          this.controls[index].btn.disable();
        }
      }
    }
  },

  getLength(annotation) {
    let linelength = 0;
    const homeBounds = this.viewer.source.dimensions;
    const ImageWidthInPercent = homeBounds.x / 100;
    const ImageHeightInPercent = homeBounds.y / 100;
    switch (annotation[0]) {
      case 'line': {
        const dx = ((annotation[1].x2 - annotation[1].x1) * ImageWidthInPercent);
        const dy = ((annotation[1].y2 - annotation[1].y1) * ImageHeightInPercent);
        linelength = Math.sqrt((dx * dx) + (dy * dy));
        break;
      }
      case 'path': {
        // remove first 'M'
        const points = annotation[1].d.substring(1).split(' L');
        if (points.length > 1) {
          for (let index = 1; index < points.length; index += 1) {
            const p1 = points[index - 1].split(' ');
            const p2 = points[index].split(' ');
            const dx = ((p1[0] - p2[0]) * ImageWidthInPercent);
            const dy = ((p1[1] - p2[1]) * ImageHeightInPercent);
            linelength += Math.sqrt((dx * dx) + (dy * dy));
          }
        }
        break;
      }
      default:
    }
    return (linelength);
  },
};

export default ({ viewer }) => {
  // Object to be returned
  const annotations = Object.create(annotationsPrototype);

  // Initialise default model
  const model = createModel();
  // Create global dispatcher linked to default model
  const dispatch = createDispatcher(model, actionsStore);
  const overlays = {
    'default': {
      model: model,
      svg: render(h(Overlay, { name: 'default', dispatch: dispatch, model: model }))
    }
  };
  Object.assign(annotations, { viewer, dispatch, overlays });
  viewer.addHandler('open', () => annotations.onOpen());
  viewer.addHandler('zoom', ({ zoom }) => annotations.dispatch({ type: 'ZOOM_UPDATE', zoom }));
  return annotations;
};

