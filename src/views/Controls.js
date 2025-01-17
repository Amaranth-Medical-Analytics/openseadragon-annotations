import { extend, Button, ControlAnchor } from 'OpenSeadragon';

import drawlineGroupHover from '../../img/draw_grouphover.png';
import drawlineHover from '../../img/draw_hover.png';
import drawlinePressed from '../../img/draw_pressed.png';
import drawlineRest from '../../img/draw_rest.png';

import drawfreeGroupHover from '../../img/path_grouphover.png';
import drawfreeHover from '../../img/path_hover.png';
import drawfreePressed from '../../img/path_pressed.png';
import drawfreeRest from '../../img/path_rest.png';

import drawRectGroupHover from '../../img/rect_grouphover.png';
import drawRectHover from '../../img/rect_hover.png';
import drawRectPressed from '../../img/rect_pressed.png';
import drawRectRest from '../../img/rect_rest.png';

import drawPolyGroupHover from '../../img/polygon_grouphover.png';
import drawPolyHover from '../../img/polygon_hover.png';
import drawPolyPressed from '../../img/polygon_pressed.png';
import drawPolyRest from '../../img/polygon_rest.png';

import editBrushGroupHover from '../../img/brush_grouphover.png';
import editBrushHover from '../../img/brush_hover.png';
import editBrushPressed from '../../img/brush_pressed.png';
import editBrushRest from '../../img/brush_rest.png';

import deleteBinGroupHover from '../../img/bin_grouphover.png';
import deleteBinHover from '../../img/bin_hover.png';
import deleteBinPressed from '../../img/bin_pressed.png';
import deleteBinRest from '../../img/bin_rest.png';

import textGroupHover from '../../img/text_grouphover.png';
import textHover from '../../img/text_hover.png';
import textPressed from '../../img/text_pressed.png';
import textRest from '../../img/text_rest.png';

import moveGroupHover from '../../img/move_grouphover.png';
import moveHover from '../../img/move_hover.png';
import movePressed from '../../img/move_pressed.png';
import moveRest from '../../img/move_rest.png';

import selectGroupHover from '../../img/select_grouphover.png';
import selectHover from '../../img/select_hover.png';
import selectPressed from '../../img/select_pressed.png';
import selectRest from '../../img/select_rest.png';

export class Control {
  constructor(options) {
    this.dispatch = options.dispatch;
    this.model = options.model;
    this.viewer = options.viewer;
    this.mode = options.tooltip.toUpperCase();
    this.btn = new Button(extend({
      onClick: (e) => { this.onClick(e); },
    }, options));
    this.viewer.addControl(this.btn.element, {
      anchor: ControlAnchor.TOP_LEFT,
    });
    if (this.model.mode === this.mode) {
      this.activate();
    }
    if (this.model.controlsactive) {
      this.btn.enable();
    } else {
      this.btn.disable();
    }
    this.model.addHandler('CHANGE_EVENT', () => {
      if (this.model.mode === this.mode) {
        this.activate();
      } else {
        this.deactivate();
      }
    });
  }

  activate() {
    this.btn.imgDown.style.visibility = 'visible';
  }

  deactivate() {
    this.btn.imgDown.style.visibility = 'hidden';
  }

  destroy() {
    this.viewer.removeControl(this.btn.element);
  }

  onClick({ eventSource }) {
    if (eventSource.tooltip) {
      const mode = eventSource.tooltip.toUpperCase();
      
      if (this.btn.element.disabled === true) {
        return;
      }
      this.dispatch({ type: 'MODE_UPDATE', mode });
      // Make available to 3rd party
      this.model.raiseEvent('MODE_UPDATE', mode);
    }
  }
}

export class DrawLineControl extends Control {
  constructor(options) {
    super({
      tooltip: 'LineDraw',
      srcRest: drawlineRest,
      srcGroup: drawlineGroupHover,
      srcHover: drawlineHover,
      srcDown: drawlinePressed,
      ...options,
    });
  }
}

export class DrawPolyControl extends Control {
  constructor(options) {
    super({
      tooltip: 'PolyDraw',
      srcRest: drawPolyRest,
      srcGroup: drawPolyGroupHover,
      srcHover: drawPolyHover,
      srcDown: drawPolyPressed,
      ...options,
    });
  }
}

export class DrawRectControl extends Control {
  constructor(options) {
    super({
      tooltip: 'Rectangle',
      srcRest: drawRectRest,
      srcGroup: drawRectGroupHover,
      srcHover: drawRectHover,
      srcDown: drawRectPressed,
      ...options,
    });
  }
}

export class DrawFreeControl extends Control {
  constructor(options) {
    super({
      tooltip: 'FreeDraw',
      srcRest: drawfreeRest,
      srcGroup: drawfreeGroupHover,
      srcHover: drawfreeHover,
      srcDown: drawfreePressed,
      ...options,
    });
  }
}

export class EditBrushControl extends Control {
  constructor(options) {
    super({
      tooltip: 'EditBrush',
      srcRest: editBrushRest,
      srcGroup: editBrushGroupHover,
      srcHover: editBrushHover,
      srcDown: editBrushPressed,
      ...options,
    });
  }
}

export class DeleteBinControl extends Control {
  constructor(options) {
    super({
      tooltip: 'DeleteBin',
      srcRest: deleteBinRest,
      srcGroup: deleteBinGroupHover,
      srcHover: deleteBinHover,
      srcDown: deleteBinPressed,
      ...options,
    });
  }
}

export class TextControl extends Control {
  constructor(options) {
    super({
      tooltip: 'Text',
      srcRest: textRest,
      srcGroup: textGroupHover,
      srcHover: textHover,
      srcDown: textPressed,
      ...options,
    });
  }
}

export class MoveControl extends Control {
  constructor(options) {
    super({
      tooltip: 'Move',
      srcRest: moveRest,
      srcGroup: moveGroupHover,
      srcHover: moveHover,
      srcDown: movePressed,
      ...options,
    });
  }
}

export class SelectControl extends Control {
  constructor(options) {
    super({
      tooltip: 'Select',
      srcRest: selectRest,
      srcGroup: selectGroupHover,
      srcHover: selectHover,
      srcDown: selectPressed,
      ...options,
    });
  }
}