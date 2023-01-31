import { EventSource } from 'OpenSeadragon';

export default () =>
  Object.assign(Object.create(EventSource.prototype), {
    events: {},
    mode: 'MOVE',
    zoom: 1,
    width: 0,
    height: 0,
    clicks: 0,
    activityInProgress: false,
    annotations: [],
    selection : null,
    annotationcolor: 'green',
    annotationlinewidth: 3,
    annotationname: '',
    annotationtext: 'test',
    annotationfontsize: 100.0,
    controlsactive: true,
    
    getAnnotationsIdxByName(annotationname) {
      let i = 0;
      while (i < this.annotations.length) {
        const currentname = this.annotations[i].slice(-1)[0]
        if (annotationname === currentname) {
          return (i);
        }
        i += 1;
      }
      return (-1);
    },

    getAnnotationByName(annotationname) {
      const i = this.getAnnotationsIdxByName(annotationname);
      if (i >= 0) {
        return (this.annotations[i]);
      }
      return (null);
    },

    getCurrentFontsize() {
      return (this.annotationfontsize / this.zoom + '%');
    },

    zoomUpdate() {
      const newfontsize = this.getCurrentFontsize();
      for (let index = 0; index < this.annotations.length; index += 1) {
        if (this.annotations[index][0] === 'text') {
          this.annotations[index][1]['font-size'] = newfontsize
        }
      }
    },
  });
