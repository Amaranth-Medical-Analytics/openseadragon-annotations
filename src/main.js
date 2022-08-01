import { Rect } from 'OpenSeadragon';
import { h, render } from 'preact';
import Overlay from './views/Overlay';
import { DeleteBinControl, DrawFreeControl, DrawPolyControl, DrawRectControl, EditBrushControl, MoveControl } from './views/Controls';
import createDispatcher from './model/createDispatcher';
import generalActions from './model/generalActions';
import createModel from './model/createModel';

const annotationsPrototype = {
  onOpen(layer='default') {
    const homeBounds = this.viewer.world.getHomeBounds();
    const zoom = this.viewer.viewport.getZoom();
    this.activeLayer = layer;
    //this.overlay = render(h(Overlay, { dispatch: this.dispatch, model: this.model }));
    this.viewer.addOverlay(this.overlays[layer].svg, new Rect(0, 0, homeBounds.width, homeBounds.height));
    const { width, height } = this.overlays[layer].svg.getBoundingClientRect();
    this.dispatch({ type: 'INITIALIZE', zoom, width, height });
    if (!this.controls) {
      this.controls = [
        new MoveControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
        new DrawPolyControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
        new DrawFreeControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
        new DrawRectControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
        new EditBrushControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
        new DeleteBinControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer })
      ];
    }
    this.cleanAnnotations();
  },

  onClose() {
    // TODO
  },

  getAnnotations() {
    return this.model.getAll();
  },

  setAnnotations(annotations) {
    this.dispatch({ type: 'ANNOTATIONS_RESET', annotations });
  },

  cleanAnnotations() {
    this.dispatch({ type: 'ANNOTATIONS_RESET' });
  },

  getMode() {
    return this.model.mode;
  },

  setMode(mode) {
    this.controls[0].dispatch({ type: 'MODE_UPDATE', mode });
  },

  setAnnotationColor(color) {
    this.model.annotationcolor = color;
  },

  setAnnotationLineWidth(linewidth) {
    this.model.annotationlinewidth = linewidth;
  },

  setAnnotationName(name) {
    this.model.annotationname = name;
  },

  setAnnotationText(text) {
    this.model.annotationtext = text;
  },

  setAnnotationFontsize(fontsize) {
    this.model.annotationfontsize = parseFloat(fontsize);
    this.model.zoomUpdate()
  },

  getStatus() {
    return { active: !!this.overlay };
  },

  EnableControls(active) {
    this.model.controlsactive = !!active;
    if (this.controls) {
      for (let index = 0; index < this.controls.length; index += 1) {
        if (this.model.controlsactive) {
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
  const dispatch = createDispatcher(model, generalActions);
  const overlays = {
    'default': {
      model: model,
      svg: render(h(Overlay, { dispatch: dispatch, model: model }))
    }
  };
  Object.assign(annotations, { viewer, dispatch, overlays });
  viewer.addHandler('open', () => annotations.onOpen());
  viewer.addHandler('zoom', ({ zoom }) => annotations.dispatch({ type: 'ZOOM_UPDATE', zoom }));
  if (viewer.isOpen()) { annotations.onOpen(); }
  return annotations;
};

