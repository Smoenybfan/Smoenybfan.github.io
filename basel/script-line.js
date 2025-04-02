const streets  = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3Jpc3RpbmhlbnJ5IiwiYSI6ImNqMWdxMjd5aDAwM28zM2xtaGV2azYwcjYifQ.NTJiOqcnhP-_3etf4aZYmQ',
    { id: 'mapbox.streets',   attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' });

const map = L.map('map', {layers: [streets]}).setView([48.7792, 2.38], 14);

// we will be appending the SVG to the Leaflet map pane
// g (group) element will be inside the svg
const svg = d3.select(map.getPanes().overlayPane).append("svg");

// if you don't include the leaflet-zoom-hide when a
// user zooms in or out you will still see the phantom
// original SVG
const g = svg.append("g").attr("class", "leaflet-zoom-hide");

const transform = d3.geoTransform({ point: projectPoint });
const d3path = d3.geoPath().projection(transform);

d3.json("basel.geojson", function(collection) {
    const featuresdata = collection.features;


    // Here we're creating a FUNCTION to generate a line
    // from input points. Since input points will be in
    // Lat/Long they need to be converted to map units
    // with applyLatLngToLayer
    const toLine = d3.line()
        .curve(d3.curveLinear)
        .x((d) => applyLatLngToLayer(d).x)
        .y((d) => applyLatLngToLayer(d).y);

    // From now on we are essentially appending our features to the
    // group element. We're adding a class with the line name
    // and we're making them invisible

    // these are the points that make up the path
    // they are unnecessary so I've make them
    // transparent for now
    var ptFeatures = g.selectAll("circle")
        .data(featuresdata)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("class", "waypoints");

    // Here we will make the points into a single
    // line/path. Note that we surround the featuresdata
    // with [] to tell d3 to treat all the points as a
    // single line. For now these are basically points
    // but below we set the "d" attribute using the
    // line creator function from above.
    var linePath = g.selectAll(".lineConnect")
        .data([featuresdata])
        .enter()
        .append("path")
        .attr("class", "lineConnect");


    // when the user zooms in or out you need to reset
    // the view
    map.on("viewreset", reset);

    // this puts stuff on the map!
    reset();
    transition();

    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = d3path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];
        ptFeatures.attr("transform", d => "translate(" + applyLatLngToLayer(d).x + "," + applyLatLngToLayer(d).y + ")");

        // Setting the size and location of the overall SVG container
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
            .attr("height", bottomRight[1] - topLeft[1] + 120)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");

        linePath.attr("d", toLine)
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");

    } // end reset

    // the transition function could have been done above using
    // chaining but it's cleaner to have a separate function.
    // the transition. Dash array expects "500, 30" where
    // 500 is the length of the "dash" 30 is the length of the
    // gap. So if you had a line that is 500 long and you used
    // "500, 0" you would have a solid line. If you had "500,500"
    // you would have a 500px line followed by a 500px gap. This
    // can be manipulated by starting with a complete gap "0,500"
    // then a small line "1,500" then bigger line "2,500" and so
    // on. The values themselves ("0,500", "1,500" etc) are being
    // fed to the attrTween operator
    function transition() {
        linePath.transition()
            .duration(18500)
            .attrTween("stroke-dasharray", tweenDash)
            .on("end", transition); // Restart the transition at it's end
    } //end transition

    // this function feeds the attrTween operator above with the
    // stroke and dash lengths
    function tweenDash() {
        return function(t) {
            //total length of path (single value)
            var l = linePath.node().getTotalLength();

            // this is creating a function called interpolate which takes
            // as input a single value 0-1. The function will interpolate
            // between the numbers embedded in a string. An example might
            // be interpolatString("0,500", "500,500") in which case
            // the first number would interpolate through 0-500 and the
            // second number through 500-500 (always 500). So, then
            // if you used interpolate(0.5) you would get "250, 500"
            // when input into the attrTween above this means give me
            // a line of length 250 followed by a gap of 500. Since the
            // total line length, though is only 500 to begin with this
            // essentially says give me a line of 250px followed by a gap
            // of 250px.
            interpolate = d3.interpolateString("0," + l, l + "," + l);
            //t is fraction of time 0-1 since transition began

            // p is the point on the line (coordinates) at a given length
            // along the line. In this case if l=50 and we're midway through
            // the time then this would 25.
            var p = linePath.node().getPointAtLength(t * l);

            //Move the marker to that point
            marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
            return interpolate(t);
        }
    } //end tweenDash
});

function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

// similar to projectPoint this function converts lat/long to
// svg coordinates except that it accepts a point from our
// GeoJSON
function applyLatLngToLayer(d) {
    return map.latLngToLayerPoint(
        new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]));
}