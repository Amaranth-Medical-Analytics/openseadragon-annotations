export function createSvgFromPoints(points){
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
  
export function pointDistance(start,end){
    let distance = 0;
    const dx = (end.x - start.x);
    const dy = (end.y - start.y);
    distance = Math.sqrt((dx * dx) + (dy * dy)) * viewer.viewport.getZoom();
    return distance;
}
  
export function createCircleOverlay(x, y, threshold){
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