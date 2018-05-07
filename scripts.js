var map = new L.Map("map", {center: [47.54, 7.59], zoom: 12});
var tiles = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
tiles.addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

svg.attr("pointer-events", "visible");


function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

d3.json("./basel.geojson", (basel) => {
    var transform = d3.geoTransform({point: projectPoint}),
        path = d3.geoPath().projection(transform);

    basel.features.map((el, ind) => {
        el.id = ind;
    });

    var feature = g.selectAll("path")
        .data(basel.features)
        .enter().append("path")
        .attr("fill", 'grey')
        .attr('d', d3.geoPath())
        .attr("id", (d) => {
            return 'path' + d.id;
        })
        .style("opacity", 0.5)
        .attr("stroke", "black")
        .attr('stroke-width', 3)
        .attr("pointer-events", "visible")
        .on("mouseover", (d) => {
            d3.select(`#path${d.id}`).attr("fill", 'blue');
        })
        .on("mouseout", (d) => {
            d3.select(`#path${d.id}`).attr("fill", 'grey');
        });




    map.on("zoom", reset);
    reset();

    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = path.bounds(basel),
            topLeft = bounds[0],
            bottomRight = bounds[1];
        console.log("reset");

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path);

        let totalLength = feature.node().getTotalLength() || 200;
        console.log(totalLength);
        feature.each(function(d) { d.totalLength = this.getTotalLength(); })
            .attr("stroke-dasharray", function(d) {return d.totalLength + " " + d.totalLength; })
            .attr("stroke-dashoffset", function(d) { return d.totalLength; })
            .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

    }
});
