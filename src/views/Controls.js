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

import textGroupHover from '../../img/text_grouphover.png';
import textHover from '../../img/text_hover.png';
import textPressed from '../../img/text_pressed.png';
import textRest from '../../img/text_rest.png';

import moveGroupHover from '../../img/move_grouphover.png';
import moveHover from '../../img/move_hover.png';
import movePressed from '../../img/move_pressed.png';
import moveRest from '../../img/move_rest.png';

export class Control {
  constructor(options) {
    this.dispatch = options.dispatch;
    this.model = options.model;
    this.viewer = options.viewer;
    this.mode = options.Tooltip.toUpperCase();
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

  onClick({ eventSource }) {
    if (eventSource.Tooltip) {
      const mode = eventSource.Tooltip.toUpperCase();
      this.dispatch({ type: 'MODE_UPDATE', mode });
    }
  }
}

export class DrawLineControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'LineDraw',
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
      Tooltip: 'PolyDraw',
      srcRest: drawlineRest,
      srcGroup: drawlineGroupHover,
      srcHover: drawlineHover,
      srcDown: drawlinePressed,
      ...options,
    });
  }
}

export class DrawRectControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Rectangle',
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
      Tooltip: 'FreeDraw',
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
      Tooltip: 'EditBrush',
      srcRest: drawlineRest,
      srcGroup: drawlineGroupHover,
      srcHover: drawlineHover,
      srcDown: drawlinePressed,
      ...options,
    });
  }
}

export class DeleteBinControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'DeleteBin',
      srcRest: drawlineRest,
      srcGroup: drawlineGroupHover,
      srcHover: drawlineHover,
      srcDown: drawlinePressed,
      ...options,
    });
  }
}

export class TextControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Text',
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
      Tooltip: 'Move',
      srcRest: moveRest,
      srcGroup: moveGroupHover,
      srcHover: moveHover,
      srcDown: movePressed,
      ...options,
    });
  }
}
