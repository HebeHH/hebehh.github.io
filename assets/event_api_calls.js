
// Date creators
let today = new Date()
let d = new Date()
d.setDate(today.getDate() - 7)
let starttime = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()

let dis_curr_url = "https://api.reliefweb.int/v1/disasters?appname=apido&preset=latest&filter[field]=status&filter[value]=current&fields[include][]=primary_country.iso3&fields[include][]=primary_type.name&fields[include][]=url&limit=200"
let dis_alert_url = "https://api.reliefweb.int/v1/disasters?appname=apido&preset=latest&filter[field]=status&filter[value]=alert&fields[include][]=primary_country.iso3&fields[include][]=primary_type.name&fields[include][]=url&limit=200"
let eqk_url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=6&starttime=' + starttime;
let conflicts_world_url = 'https://api.acleddata.com/acled/read?terms=accept&timestamp=' + starttime
let conflicts_euro_url = 'https://api.acleddata.com/acled/read?terms=accept&region=12&timestamp=' + starttime


var make_disasters_data = [$.get(dis_curr_url), $.get(dis_alert_url)]
var make_earthquakes_data = [$.get(eqk_url).then(function(v) {return v.features})]
var make_conflicts_data = [$.get(conflicts_world_url), $.get(conflicts_euro_url)]