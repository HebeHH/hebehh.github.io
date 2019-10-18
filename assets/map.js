// Arc generators
var arcGenerator = d3.arc();
var arcHeight = 20;
var arcPath = arcGenerator({
    startAngle: -0.1 * Math.PI,
    endAngle: 0.1 * Math.PI,
    innerRadius: 0,
    outerRadius: arcHeight
});


// textbox creation
var hovertxt = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
var clicktxt = d3.select("body").append("div")
    .attr("class", "clicktip")
    .style("opacity", 0);

// SVG, projection and creation
var countries = {}
var group, projection, path, areas, tmp
var width = window.innerWidth,
    height = window.innerHeight,
    scale = width / 6.7

var svg = d3.select(".map").append("svg")
    .attr('width', width)
    .attr('height', height)

projection = d3.geoMercator().scale(scale).translate([width / 2 - 10, height / 2 + 80]);
path = d3.geoPath().projection(projection);


// handle country json
country_areas = new Promise(function(resolve, reject) {
    resolve(countryJSON)
}).then(function(data) {
    data.features.forEach(function(x, i) {
        countries[x.properties.ISO_A3] = {
            'location': (path.centroid(x)),
            'fullname': x.properties.ADMIN,
            'conflicts': [],
            'disasters': []
        }
    })
    group = svg.selectAll('g')
        .data(data.features)
        .enter()
        .append('g')
        .on("mouseover", function(d) {
            getTooltip(this, d.properties.ADMIN, d3.event.pageX, d3.event.pageY)
        })
        .on("mouseout", function(d) {
            remTooltip(this)
        })
        .on('click', function(d) {
            writeEvents(d.properties.ISO_A3)
            var elmnt = document.getElementById("country_title");
            elmnt.scrollIntoView();
        });

    areas = group.append('path')
        .attr('d', path)
        .attr('class', 'area')
        .attr('stroke', 'darkgrey')
        .attr('stroke-width', 0.5)
        .attr('fill', 'lightgrey')
        .on('mouseover', function(d) {
            d3.select(this)
                .attr('stroke-width', 3);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr('stroke-width', 0.5);
        });
    $('.container').scrollTop(-50);
});



var disasterMethods = {
    'coords': ((d) => {
        return countries[d.fields.primary_country.iso3.toUpperCase()].location.map((x) =>
            x + Math.random() * scale / 30 - Math.random() * scale / 30)
    }),
    'link': ((d) => d.fields.url),
    'color': ((d) => getColour(d.fields.primary_type.name, disaster_color_map)),
    'text': ((d) =>
        "<strong>" + d.fields.primary_type.name + ":</strong></br>" + d.fields.name),
    'radius': ((d) => 7),
    'class': ((d) => shrink(d.fields.primary_type.name))
}

var earthquakeMethods = {
    'coords': ((d) => projection(d.geometry.coordinates.slice(0, 2))),
    'link': ((d) => d.properties.url),
    'color': ((d) => getColour('Earthquake', disaster_color_map)),
    'text': ((d) => "<strong>Earthquake:</strong><br>Magnitude: " + d.properties.mag),
    'radius': ((d) => d.properties.mag),
    'class': ((d) => 'Earthquake')
}

var make_icons_promises = []


make_disasters_data.forEach(function(p) {
    make_icons_promises.push(Promise.all([country_areas, p]).then(function(vals) {
        d = vals[1];
        d.data.forEach((x) => {
            countries[x.fields.primary_country.iso3.toUpperCase()].disasters.push(x)
        })
        makeCircles(d.data, disasterMethods)
    }))
})
make_earthquakes_data.forEach(function(p) {
    make_icons_promises.push(Promise.all([country_areas, p]).then(function(vals) {
        makeCircles(vals[1], earthquakeMethods)
    }))
})
make_conflicts_data.forEach(function(p) {
    make_icons_promises.push(Promise.all([country_areas, p]).then(function(vals) {
        handleConflicts(vals[1])
    }))
})


Promise.all(make_icons_promises).then(() => { makeSpecificCheckboxes() })

var cd = []

function handleConflicts(conflicts) {
    conflicts.data.forEach((x) => {
        if (countries[x.iso3]) {
            countries[x.iso3].conflicts.push(x)
        } else if (x.iso3 === "ROM") {
            countries["ROU"].conflicts.push(x)
        } else { console.log(x.iso3) }

    })

    cd = cd.concat(conflicts.data)

    svg.selectAll('conflicts')
        .data(cd)
        .enter()
        .append('path')
        .attr('d', arcPath)
        .attr('transform', function(d) {
            return 'translate(' + projection([d.longitude, d.latitude])[0] + ',' + projection([d.longitude, d.latitude])[1] + ')'
        })
        .attr('class', function(d) {
            // if (!subEvents.includes(d.sub_event_type)) { console.log(d.sub_event_type) }
            return shrink(d.sub_event_type) + ' conflict'
        })
        .attr('fatalities', function(d) { return d.fatalities })
        .style('display', function(d) {
            return d.fatalities != 0 ? 'initial' : 'none'
        })
        .attr('fill', function(d) { return getColour(d.event_type, conflicts_color_map) })
        .attr('fill-opacity', 0.5)
        .attr('stroke-width', 0)
        .attr('stroke', function(d) { return getColour(d.event_type, conflicts_color_map) })
        .on('mouseover', function(d) {
            text = "<strong>" + d.event_type + ":</strong><br>" + d.sub_event_type
            if (d.fatalities > 0) {
                text = text + "- " + d.fatalities + " killed."
            }
            getTooltip(this, text, d3.event.pageX, d3.event.pageY)
        })
        .on("mouseout", function(d) {
            remClicktip()
            remTooltip(this)
        })
        .on('click', function(d) {
            getClicktip(d.notes, d3.event.pageX, d3.event.pageY)
        });
}


var disaster_color_map = {
    'Cold Wave': 'powderblue',
    'Drought': 'orange',
    'Earthquake': 'sienna',
    'Flood': 'blue',
    'Flash Flood': 'blue',
    'Fire': 'red',
    'Epidemic': 'olivedrab',
    'Extratropical Cyclone': 'lightsteelblue',
    'Heat Wave': 'orange',
    'Land Slide': 'saddlebrown',
    'Mud Slide': 'saddlebrown',
    'Insect Infestation': 'yellow',
    'Severe Local Storm': 'slategrey',
    'Snow Avalanche': 'powderblue',
    'Storm Surge': 'slategrey',
    'Technological Disaster': 'maroon',
    'Tropical Cyclone': 'lightsteelblue',
    'Tsunami': 'mediumblue',
    'Volcano': 'darkred',
    'Wild Fire': 'red',
}

var conflicts_color_map = {
    'Explosions/Remote violence': 'orangered',
    'Battles': 'firebrick',
    'Riots': 'brown',
    'Violence against civilians': 'indigo',
    "Strategic developments": 'violet',
    "Other": 'khaki',
    "Protests": "yellow",
}

function onCheck(d) {
    if (this.checked) {
        $('.' + this.value).show();
    } else {
        $('.' + this.value).hide();
    }
}

function shrink(k) {
    return k.replace(' ', '').replace('/', '').replace(' ', '').replace('/', '')
        .replace(' ', '').replace('/', '').replace('-', '')
}

var subEvents = ["Non-state actor overtakes territory", "Other", "Peaceful protest", "Protest with intervention", "Change to group/activity", "Violent demonstration", "Disrupted weapons use", "Looting/property destruction", "Armed clash", "Shelling/artillery/missile attack", "Attack", "Mob violence", "Remote explosive/landmine/IED", "Arrests", "Sexual violence", "Air/drone strike", "Non-violent transfer of territory", "Government regains territory", "Grenade", "Abduction/forced disappearance", "Agreement"]
var hide = ["Non-state actor overtakes territory", "Other", "Peaceful protest", "Protest with intervention", "Change to group/activity", "Violent demonstration", "Disrupted weapons use", "Looting/property destruction", "Armed clash", "Shelling/artillery/missile attack", "Attack", "Mob violence", "Remote explosive/landmine/IED", "Arrests", "Sexual violence", "Air/drone strike", "Non-violent transfer of territory", "Government regains territory", "Grenade", "Abduction/forced disappearance", "Agreement"]

function makeSpecificCheckboxes() {
    Object.keys(disaster_color_map).forEach(function(k) {
        if ($('.' + shrink(k))[0]) {
            chk = $("<input>", { type: "checkbox", checked: true, name: 'test', value: shrink(k) });
            chk.appendTo("#disaster_selectables > .selectables");
            $("#disaster_selectables > .selectables").append(k + "<br>");
        }
    });

    subEvents.forEach(function(k) {
        if ($('.' + shrink(k))[0]) {
            chk = $("<input>", { type: "checkbox", checked: true, name: 'test', value: shrink(k) });
            chk.appendTo("#conflicts_selectables > .selectables");
            $("#conflicts_selectables > .selectables").append(k + "<br>");
        }
    })

    $(":checkbox").change(onCheck)
}

// $("#disaster_selectables > :checkbox").attr('checked', true)


function getColour(type, color_map) {
    if (color_map[type]) {
        return color_map[type]
    } else {
        console.log(type);
        return 'black'
    }
}

function makeCircles(data, methods) {
    var circs = svg.selectAll("circs")
        .data(data)
        .enter()
        .append("svg:a")
        .attr("xlink:href", function(d) { return methods.link(d) })
        .attr("target", "_blank")
        .append("circle")
        .attr('class', function(d) { return methods.class(d) + ' disaster' })
        .attr("cx", function(d) { return methods.coords(d)[0] })
        .attr("cy", function(d) { return methods.coords(d)[1] })
        .attr("r", function(d) { return methods.radius(d) })
        .style("fill", function(d) { return methods.color(d) })
        .attr("fill-opacity", .4)
        .style("stroke", function(d) { return methods.color(d) })
        .attr('stroke-width', 0)
        .on("mouseover", function(d) {
            text = methods.text(d);
            getTooltip(this, text, d3.event.pageX, d3.event.pageY)
        })
        .on("mouseout", function(d) {
            remTooltip(this)
        });
    return circs
}

function getTooltip(item, text, x, y) {
    d3.select(item)
        .attr('stroke-width', 2);
    hovertxt.transition()
        .duration(100)
        .style("opacity", 1);
    hovertxt.html(text)
        .style("left", x + "px")
        .style("top", y - 40 + "px")
}

function remTooltip(item) {
    d3.select(item).attr('stroke-width', 0);
    hovertxt.transition()
        .duration(100)
        .style("opacity", 0);
}

function getClicktip(text, x, y) {
    clicktxt.transition()
        .duration(100)
        .style("opacity", 1);
    clicktxt.html(text)
        .style("left", x + "px")
        .style("top", y + 40 + "px")
}

function remClicktip() {
    clicktxt.transition()
        .duration(100)
        .style("opacity", 0);
}

var html_formats = {
    "conflicts": ((d) => {
        text = ("<h3><strong>" + d.event_type + ": </strong>" + d.sub_event_type +
            "</h3>" + d.actor1 + " and " + d.actor2 + "<br>" + d.location + ": " +
            d.event_date + "<br>" + d.notes + "<br>Fatalities: " + d.fatalities + "<br>More information: see " + d.source)
        return text
    }),
    "disasters": ((d) => {
        text = ("<h3>" + d.fields.primary_type.name + ":</h3>" + d.fields.name + "<br><a href='" + d.fields.url + "'>More information.</a>")
        return text
    })
}

function writeItems(type, ds) {
    type_div = document.getElementById(type)
    type_div.style.display = 'block'
    items = type_div.getElementsByClassName("items")[0]
    items.innerHTML = ""
    ds.forEach((d) => {
        item = document.createElement("div")
        item.classname = 'item'
        item.innerHTML = html_formats[type](d)
        items.appendChild(item)
    })
}

function writeEvents(iso) {
    deets = countries[iso];
    document.getElementById("country_title").innerHTML = "<h1>" + deets.fullname + "</h1>"
    if (deets.conflicts.length > 0) { writeItems("conflicts", deets.conflicts) } else { document.getElementById("conflicts").style.display = 'none' }
    if (deets.disasters.length > 0) { writeItems("disasters", deets.disasters) } else { document.getElementById("disasters").style.display = 'none' }
}

jQuery(document).ready(function($) {
    // var c_up = true, d_up = false;
    $(".selectables").slideUp("fast", () => {
        let toggleSelectables = (divname) => {
            if (this.running) {
                console.log("Cancelled as duplicate.")
                return;
            }
            this.running = true;
            $("#" + divname + " .selectables").slideToggle("fast", () => {
                this.running = false;
            });
        };

        $('#conflicts_selectables span').on('click', function(d) { toggleSelectables('conflicts_selectables') });
        $('#disaster_selectables span').on('click', function(d) { toggleSelectables('disaster_selectables') });
    });

    $("input[name='show_disaster']").change(function() {
        display = this.checked ? 'initial' : 'none'
        $('.disaster').css('display', display);
        $('#disaster_selectables :checkbox').prop("checked", this.checked);
    })
    $("input[name='show_conflicts']").change(function() {
        display = this.checked ? 'initial' : 'none'
        $('.conflict').css('display', display);
        $('#conflicts_selectables :checkbox').prop("checked", this.checked);
    })
    $("input[name='hide_harmless']").change(function() {
        if (this.checked) {
            $(".conflict[fatalities='0']").css('display', 'none');
        } else {
            $('.conflict').css('display', 'initial');
            $('#conflicts_selectables :checkbox').prop("checked", true);
            $(this).prop("checked", false);
        }
    })
})




// function zoomed() {
//     var transform = d3.event.transform;
//     svg.attr('transform', transform.toString());
// }

// var zoom = d3.zoom()
//     .scaleExtent([0, 3])
//     .translateExtent([
//         [0, 0],
//         [width, height]
//     ])
//     .on("zoom", function() { zoomed() })