$(document).ready(function () {
    trafType = ($('input[type=radio][name=type]:checked').val());
    lane = $('input[type=radio][name=lane]:checked').val();

    $('.tabs').tabs();
    document.getElementById("datePicked").innerHTML = `<i class="material-icons" style="margin-right: 5px">date_range</i> ${getDateFromYearDay(document.getElementById("dateSlider").value)}`;
    document.getElementById("dateSlider").oninput = function () {
        clearTextBoxes();
        document.getElementById("datePicked").innerHTML = `<i class="material-icons" style="margin-right: 5px">date_range</i>  ${getDateFromYearDay(this.value)}`;
        drawPathsWithTrafficData(selectedData, getDateFromYearDay(this.value), getHourFromSeconds(document.getElementById("timeSlider").value), trafType);
    };

    document.getElementById("timePicked").innerHTML = `<i class="material-icons" style="margin-right: 5px">access_time</i> ${getHourFromSeconds(document.getElementById("timeSlider").value)}`;
    document.getElementById("timeSlider").oninput = function () {
        clearTextBoxes();
        document.getElementById("timePicked").innerHTML = `<i class="material-icons" style="margin-right: 5px">access_time</i>  ${getHourFromSeconds(this.value)}`;
        drawPathsWithTrafficData(selectedData, getDateFromYearDay(document.getElementById('dateSlider').value), getHourFromSeconds(this.value), trafType);
    };

    $('input[type=radio][name=type]').change(function () {
        trafType = this.value;
        clearTextBoxes();
        startDrawingFromType();

    });

    $('input[type=radio][name=lane]').change(function () {
        lane = this.value;
        clearTextBoxes();
        startDrawingFromType();

    });

    readBusData(readPwData);
    // readPwData();


    // startDrawingFromType();

    initTempSlider();
    initRainSlider();

    document.getElementById('tempSlider').noUiSlider.on('change', () => startDrawingFromType());
    document.getElementById('rainSlider').noUiSlider.on('change', () => startDrawingFromType());

    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);

});

function clearTextBoxes(){
    div.transition()
        .duration(200)
        .style('opacity', 0);
    clearTimeout(divTimeoutHandle);

    clearStreetCard();
}

function tempCheckBoxClicked() {
    tempEnabled = !tempEnabled;
    clearTextBoxes();
    if (document.getElementById('tempSlider').getAttribute('disabled')) {
        document.getElementById('tempSlider').removeAttribute('disabled');
    } else {
        document.getElementById('tempSlider').setAttribute('disabled', 'true');
    }
    startDrawingFromType();

    if(!rainEnabled && !tempEnabled){
        document.getElementById('timeSlider').removeAttribute('disabled');
        document.getElementById('dateSlider').removeAttribute('disabled');
    } else {
        document.getElementById('timeSlider').disabled = true;
        document.getElementById('dateSlider').disabled = true;
    }
}

function rainCheckBoxClicked() {
    rainEnabled = !rainEnabled;
    clearTextBoxes();
    if (document.getElementById('rainSlider').getAttribute('disabled')) {
        document.getElementById('rainSlider').removeAttribute('disabled');
    } else {
        document.getElementById('rainSlider').setAttribute('disabled', 'true');
    }

    startDrawingFromType();

    if(!rainEnabled && !tempEnabled){
        document.getElementById('timeSlider').removeAttribute('disabled');
        document.getElementById('dateSlider').removeAttribute('disabled');
    } else {
        document.getElementById('timeSlider').disabled = true;
        document.getElementById('timeSlider').parentElement.disabled = true;
        document.getElementById('dateSlider').disabled = true;
    }
}

function initTempSlider() {
    let slider = document.getElementById('tempSlider');
    noUiSlider.create(slider, {
        start: [-10.0, 40.0],
        tooltips: [wNumb({decimals: 1, suffix: ' &deg;C'}), wNumb({decimals: 1, suffix: ' &deg;C'})],
        connect: true,
        step: 0.1,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
            'min': -10.0,
            'max': 40.0
        },
        format: wNumb({
            decimals: 0
        })
    });
}

function initRainSlider() {
    let slider = document.getElementById('rainSlider');
    noUiSlider.create(slider, {
        start: [0, 1],
        tooltips: [wNumb({suffix: ' mm'}), wNumb({suffix: ' mm'})],
        connect: true,
        step: 0.1,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
            'min': 0,
            'max': 1
        },
        format: wNumb({
            decimals: 0
        })
    });
}

function readVeloData(callback) {
    d3.csv('./VisualisierungVerkehrsdatenBasel/test.csv', (querriedVeloData) => {
        veloData = querriedVeloData;
        selectedData = veloData;
        // drawPaths('./streets.json', veloData, 'Velofahrer');
        //drawPathsWithTrafficData(veloData, getDateFromYearDay(document.getElementById('dateSlider').value), getHourFromSeconds(document.getElementById('timeSlider').value), 'Velofahrer');
        if (callback) {
            callback.call(null, startDrawingFromType);
        }

    });
}

function startDrawingFromType() {
    switch (trafType) {
        case 'Personenwagen':
            drawPaths('./basel_moto.geojson', pwData, trafType, "#4B0082");
            selectedData = pwData;
            //drawPathsWithTrafficData(pwData, date, hour, trafType);
            break;
        case 'Velofahrer':
            drawPaths('./streets.json', veloData, trafType, "#C71585");
            selectedData = veloData;
            //drawPathsWithTrafficData(veloData, date, hour, trafType);
            break;
        case 'Busse':
            drawPaths('./basel_moto.geojson', busData, trafType, "#800080");
            selectedData = busData;
            //drawPathsWithTrafficData(busData, date, hour, trafType);
            break;
        // case 'all': drawPathsWithAllTrafficData(date, hour, trafType); break;
    }
}

//accepts a number x between 1 and 365 and returns the date on the x-th day since the year 2017 began
function getDateFromYearDay(yearDay) {
    let firstOfJan = new Date(2017, 0, 1);
    let wantedDate = new Date(2017, 0, 1);
    wantedDate.setDate(yearDay);
    return `${formatDate(wantedDate.getDate())}.${formatDate(wantedDate.getMonth() + 1)}.2017`
}

function formatDate(date) {
    if (date > 9) {
        return date;
    } else {
        return `0${date}`;
    }
}

//accepts a number x between 0 and 86'400 and returns the time rounded to the next smaller full hour
function getHourFromSeconds(seconds) {
    let firstOfJan = new Date(2017, 0, 1);
    let wantedDate = new Date(2017, 0, 1);
    wantedDate.setSeconds(seconds);
    return `${formatHours(wantedDate.getHours())}:00 - ${formatHours(wantedDate.getHours() + 1)}:00`
}

function formatHours(hour) {
    if (hour < 10) {
        return `0${hour}`;
    }
    else if (hour > 23) {
        return '00';
    } else {
        return hour;
    }
}

// /Create map and its layer
var map = new L.Map("map", {center: [47.55, 7.59], zoom: 13});
var tiles = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
tiles.addTo(map);

let animationInterval;
let data;
let veloData;
let busData;
let pwData;
let selectedData;
let trafType;
let lane;
let tempEnabled = false;
let rainEnabled = false;

//this is the hover path tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//this is the handle for the divTimeout
//the usage of this is to cancel the timeout of the disappearing of the div
let divTimeoutHandle;

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
function drawPaths(streetsFilePath, drawData, verkehrsart, color) {
    d3.json(streetsFilePath, (basel) => {
        data = basel;

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
        g.remove();
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

        var paths = g.selectAll("path")
            .data(basel.features)
            .enter().append("path")
            .attr("fill", 'none')
            .attr('d', pathGenerator)
            .attr("id", (d) => {
                return 'path-' + d.properties.Strassenname;
            })
            .style("opacity", 0.5)
            .attr("stroke", color)
            .attr("class", 'flowline')
            // .attr('stroke-width', 4.5)
            .attr("pointer-events", "visible");

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
            });

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
            g.selectAll('path').data(data.features).attr("fill", 'none')
                .attr('d', pathGenerator)
                .attr("id", (d) => {
                    return 'path-' + d.properties.Strassenname;
                })
                .style("opacity", 0.5)
                .attr("stroke", color)
                .attr("class", `flowline${lane}`)
                // .attr('stroke-width', 4.5)
                .attr("pointer-events", "visible");

            let transitionTime = 3000;
            // animationInterval = setInterval(() => {
            //     startAnimation(paths, transitionTime)
            // }, transitionTime + 500); //this should be solved via callback, this is just ugly

        }

        if (tempEnabled || rainEnabled) {

            drawPathsWithWeatherData(drawData, verkehrsart);
        } else {

            drawPathsWithTrafficData(drawData, getDateFromYearDay(document.getElementById('dateSlider').value), getHourFromSeconds(document.getElementById('timeSlider').value), verkehrsart)
        }

    });
}

function sumAndFilterDrawDataFaster(drawDate, alloweDateTimes) {
    let summedObj = {};

    for(let j = 0; j < drawDate.length; j++){
        summedObj[drawDate[j].Strassenname] = 0;
    }
    if(alloweDateTimes.length === 0){
        return summedObj;
    }

    for(let i = 0; i < alloweDateTimes.length; i++ ){
        for(let j = 0; j < drawDate.length; j++) {
            if(!isNaN(drawDate[j][alloweDateTimes[i]])){
                summedObj[drawDate[j].Strassenname] += +(drawDate[j][alloweDateTimes[i]]);
            }
        }
    }

    for(let j = 0; j < drawDate.length; j++){
        summedObj[drawDate[j].Strassenname] /= alloweDateTimes.length;
    }

    return summedObj;
}

function updateStreetWeatherCard(amount, type, streetname, rainVals, tempVals) {
    let realStreetname = streetname.slice(0, streetname.length - 5);
    let lane = `${streetname.slice(streetname.length - 5, streetname.length -1)} ${streetname.slice(streetname.length-1, streetname.length)}`;

     let datetimeText = `Zwischen `;
     if(tempEnabled){
         datetimeText += `${tempVals[0]}&deg;C und ${tempVals[1]}&deg;C `;
         if(rainEnabled){
             datetimeText += 'und zwischen ';
         }
     }

    if(rainEnabled){
        datetimeText += `${rainVals[0]}mm und ${rainVals[1]}mm`;
    }

    document.getElementById('datetime').innerHTML = datetimeText;
    document.getElementById('strassenname').innerHTML = `${realStreetname} ${lane}`;
    document.getElementById('menge').innerHTML = Math.round(amount) + ' ' + type;
}

function drawPathsWithWeatherData(drawData, name) {
    let tempVals = document.getElementById('tempSlider').noUiSlider.get();
    let rainVals = document.getElementById('rainSlider').noUiSlider.get();

    let weatherData = drawData.slice(drawData.length - 2, drawData.length);
    let rainData = weatherData[1];
    let tempData = weatherData[0];

    let allowedDateTimes = Object.keys(drawData[0]);
    allowedDateTimes = allowedDateTimes.slice(0, allowedDateTimes.length);


    let street = drawData[0];
    if (rainEnabled) {
        Object.keys(street).forEach(dateTime => {
            if (+rainData[dateTime] / 10.0 < +rainVals[0] || +rainData[dateTime] /10.0 > +rainVals[1]) {
                allowedDateTimes.splice(allowedDateTimes.findIndex(el => el === dateTime), 1);

            } else {
            }
        });
    }
    if (tempEnabled) {
        Object.keys(street).forEach(dateTime => {
            if (+tempData[dateTime] < +tempVals[0] || +tempData[dateTime] > +tempVals[1]) {
                allowedDateTimes.splice(allowedDateTimes.findIndex(el => el === dateTime), 1);
            } else {
            }
        });
    }


    let summedObj = sumAndFilterDrawDataFaster(drawData, allowedDateTimes);


    let maxCount = 0;
    drawData.forEach(el => {
        Object.values(el).forEach(value => {
            if (!isNaN(value) && +value > maxCount) {
                maxCount = +value;
            }
        })
    });


    let scale = d3.scaleLog().base(2).domain([1, maxCount / 10]).range([0, 15]);

    drawData.forEach((el) => {

        if (el.Strassenname.substring(el.Strassenname.length - 5, el.Strassenname.length) != lane) {
            return;
        }

        domEl = d3.select(`#path-${el.Strassenname.slice(0, el.Strassenname.length - 5)}`);
        if (domEl) {
            domEl.style('stroke-width', scale(summedObj[el.Strassenname]));

            domEl
                .on("mouseover", (d) => {
                    clearTimeout(divTimeoutHandle);
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(Math.round(summedObj[el.Strassenname]) + ' ' + name)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    updateStreetWeatherCard(summedObj[el.Strassenname], name, el.Strassenname, rainVals, tempVals);
                })
                .on("mouseout", (d) => {
                    divTimeoutHandle = setTimeout(() => {
                        div.transition()
                            .duration(200)
                            .style('opacity', 0);
                    }, 3000)
                });
        }
    })
}


//this is the start data, therefore display it


function updateStreetCard(amount, type, streetname, date, time) {
    let realStreetname = streetname.slice(0, streetname.length - 5);
    let lane = `${streetname.slice(streetname.length - 5, streetname.length -1)} ${streetname.slice(streetname.length-1, streetname.length)}`;
    document.getElementById('datetime').innerHTML = `Am ${date} von ${time} Uhr.`;
    document.getElementById('strassenname').innerHTML = `${realStreetname} ${lane}`;
    document.getElementById('menge').innerHTML = amount + ' ' + type;
    switch(type){
        case 'Velofahrer':
            if(pwData.find(el => el.Strassenname === streetname)){
                document.getElementById('type2').innerHTML = pwData.find(el => el.Strassenname === streetname)[`${date} ${time}`] + ' Personenwagen';
            }
            if(busData.find(el => el.Strassenname === streetname)){
                document.getElementById('type3').innerHTML = busData.find(el => el.Strassenname === streetname)[`${date} ${time}`] + ' Busse';
            }
            break;
        case 'Busse':
            if(veloData.find(el => el.Strassenname === streetname)){
                document.getElementById('type2').innerHTML = veloData.find(el => el.Strassenname === streetname)[`${date} ${time}`] + ' Velofahrer';
            }
            if(pwData.find(el => el.Strassenname === streetname)){
                document.getElementById('type3').innerHTML = pwData.find(el => el.Strassenname === streetname)[`${date} ${time}`] + ' Personenwagen';
            }
            break;
        case 'Personenwagen':
            if(veloData.find(el => el.Strassenname === streetname)){
                document.getElementById('type2').innerHTML = veloData.find(el => el.Strassenname === streetname)[`${date} ${time}`] + ' Velofahrer';
            }
            if(busData.find(el => el.Strassenname === streetname)){
                document.getElementById('type3').innerHTML = busData.find(el => el.Strassenname === streetname)[`${date} ${time}`] + ' Busse';
            }
            break;
    }
}

function clearStreetCard() {
    document.getElementById('strassenname').innerHTML = 'Keine Strasse ausgwählt';
    document.getElementById('menge').innerHTML = '';
    document.getElementById('type2').innerHTML = '';
    document.getElementById('type3').innerHTML = '';
    document.getElementById('datetime').innerHTML = '';
}

function drawPathsWithTrafficData(drawData, date, time, name) {
    let maxCount = 0;

    drawData.forEach(el => {
        Object.values(el).forEach(value => {
            if (!isNaN(value) && +value > maxCount) {
                maxCount = +value;
            }
        })
    });
    let scale = d3.scaleLog().base(2).domain([1, maxCount / 10]).range([0, 15]);
     scale = d3.scaleLinear().domain([1, 250]).range([4, 10]);

    drawData.forEach((el) => {
        if (el.Strassenname.substring(el.Strassenname.length - 5, el.Strassenname.length) != lane) {
            return;
        }
        domEl = d3.select(`#path-${el.Strassenname.slice(0, el.Strassenname.length - 5)}`);
        if (domEl) {
            if (+el[`${date} ${time}`] <= 0) {
                domEl.style('stroke-width', 0);
            } else {
                domEl.style('stroke-width', scale(+el[`${date} ${time}`]));
            }
            domEl
                .on("mouseover", (d) => {
                    clearTimeout(divTimeoutHandle);
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(el[`${date} ${time}`] + ' ' + name)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    updateStreetCard(el[`${date} ${time}`], name, el.Strassenname, date, time);
                })
                .on("mouseout", (d) => {
                    divTimeoutHandle = setTimeout(() => {
                        div.transition()
                            .duration(200)
                            .style('opacity', 0);
                        clearStreetCard();
                    }, 3000);

                });
        }
    })
}


function readBusData(callback) {
    d3.csv('./VisualisierungVerkehrsdatenBasel/bus.csv', (readData) => {
        busData = readData;
        if (callback) {
            callback.call(undefined, readVeloData);
        }
    });


}

function readPwData(callback) {
    d3.csv('./VisualisierungVerkehrsdatenBasel/pw.csv', (readData) => {
        pwData = readData;
        if (callback) {
            callback.call(undefined, startDrawingFromType);
        }
    })
}



