var map = new L.Map("map", {center: [47.54, 7.59], zoom: 12});
var tiles = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
tiles.addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

// var basels = [];
// var baselOverlay = L.d3SvgOverlay((sel, proj) => {
//     sel.selectAll('path').data(basels)
//         .enter()
//         .append('path')
//         .attr('d', proj.pathFromGeojson)
//         .attr('stroke', 'black')
//         .attr('fill-opacity', '0.5')
//         .attr('style', 'pointer-events:visiblePainted;')
//         .attr('stroke-width', 1 / proj.scale)
//         .on("click", (d) => {
//             console.log("enter");
//             console.log(d);
//             console.log(d3.select(d));
//             d3.select(this).style("opacity", 0.5);
//         })
//         .on("mouseleave", () => {
//         d3.select(this).attr("opacity", 0.5)
//     });
//
//
//
//
// });
//
//
// // L.control.layers({"Geo Tiles": tiles}, {"Countries": baselOverlay}).addTo(map);
//
//
// d3.json("./basel.json", (basel) => {
//     basels = basel.features;
//     baselOverlay.addTo(map);
// });
//
//
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

d3.json("./basel.json", (basel) => {
    var transform = d3.geoTransform({point: projectPoint}),
        path = d3.geoPath().projection(transform);

    var feature = g.selectAll("path")
        .data(basel.features)
        .enter().append("path")
        .attr("fill", 'grey')
        .style("opacity", 0.5)
        .attr("stroke", "black");

    map.on("zoom", reset);
    reset();

    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = path.bounds(basel),
            topLeft = bounds[0],
            bottomRight = bounds[1];
        console.log("reset");

        svg .attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path);
    }
});
