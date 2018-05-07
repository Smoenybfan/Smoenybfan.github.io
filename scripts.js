//Create map and its layer
var map = new L.Map("map", {center: [47.55, 7.59], zoom: 13});
var tiles = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
tiles.addTo(map);

let animationInterval;

//create an svg and add it to the leaflet overlay pane
var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

//leaflet sets this per default to none so we have to set it
svg.attr("pointer-events", "visible");

//this return a transform function which translates an input point form world coordinates to leaflet pane coordinates
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

//we start our magic. d3.json is asynchronous, therefore everything that depends on the json data should be
//inside here or be called from inside here.
d3.json("./basel-streets.json", (basel) => {

    //we create a d3 geoTransform to map points into the correct space.
    var transform = d3.geoTransform({point: projectPoint}),
        //this returns a path generator which we will use later
        pathGenerator = d3.geoPath().projection(transform);

    //we add an id to each feature from our dataset to make sure we can easily access it later.
    basel.features.map((el, ind) => {
        el.id = ind;
    });

    // here starts our d3 magic. we add our data from the json file as paths to the group on the svg overlay.
    // d3 fills all paths per default so we have to turn it off via fill: none
    // we then add our path generator
    // the id is to make sure we can access it from everywhere. D3 seems to have troubles with the 'this' keyword when
    //used with leaflet.
    // We add some width and a color for our paths and make sure the mouse events are triggered.

    var paths = g.selectAll("path")
        .data(basel.features)
        .enter().append("path")
        .attr("fill", 'none')
        .attr('d', pathGenerator)
        .attr("id", (d) => {
            return 'path' + d.id;
        })
        .style("opacity", 0.5)
        .attr("stroke", "black")
        .attr('stroke-width', 4.5)
        .attr("pointer-events", "visible");

    // this line makes sure that the reset function is called to redraw our d3 elements
    map.on("zoom", reset);
    //this makes sure it is called on instantiation
    reset();

    // Reposition the SVG to cover the features.
    function reset() {
        //get the boundary box of the path group

        var bounds = pathGenerator.bounds(basel),
            topLeft = bounds[0],
            bottomRight = bounds[1];


        //adjust the svg
        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        //move it to the correct place
        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        let transitionTime = 3000;
        animationInterval = setInterval(() => {startAnimation(paths, transitionTime)}, transitionTime+500); //this should be solved via callback, this is just ugly

    }
});


//this method accepts an array of paths as an argument and creates a "filling" animation from start to end
function startAnimation(paths, transitionTime) {
    console.log(paths[0][0].attributes.getNamedItem('stroke-dasharray'));
    console.log(paths[0][0].attributes.getNamedItem('stroke-dashoffset'));
    //this part is the animation magic.
    //first, we add the total length of each path to itself as an attribute
    paths.each(function (d) {
        d.totalLength = this.getTotalLength();
    })
    //then we add a stroke-dasharray attribute with value (totalLength of path, total length of path
    //this will create a line of total length, followed by a gap with the same length
    //note that this is a pattern that will be executed along the whole line
        .attr("stroke-dasharray", function (d) {
            return d.totalLength + " " + d.totalLength;
        })
        //now we add a stroke-dashoffset with value of whole length. this moves the whole stroke ("the visible path")
        //the whole length along the path and the pattern. This means that the path now starts at the gap.
        //It means the same thing as moving the path pattern.
        .attr("stroke-dashoffset", function (d) {
            return d.totalLength;
        })
        //this is the moving part. The transition sets the stroke-dashoffset to 0 according to the duration
        // You can see this as the pattern being moved along the line until the first part of the patttern (the
        // visible dash with the whole path as length) starts at the start of the path
        .transition()
        .duration(transitionTime)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

}
