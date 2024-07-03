//Import base maps
let osm = new ol.layer.Tile({
    title: 'OpenStreetMap',
    type: 'base',
    visible: true,
    source: new ol.source.OSM()
});

var BING_MAPS_KEY = "AhED8KH6g3F7xqt1Mg7XioFyYKEbQQgg0y2unrezvUNlKxo0GawtVP9QB1rgruFw";
var bingRoads = new ol.layer.Tile({
    title: 'Bing Maps—Roads',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: BING_MAPS_KEY,
        imagerySet: 'Road'
    })
});
var bingAerial = new ol.layer.Tile({
    title: 'Bing Maps—Aerial',
    type: 'base',
    visible: false,
    source: new ol.source.BingMaps({
        key: BING_MAPS_KEY,
        imagerySet: 'Aerial'
    })
});

var stamenWatercolor = new ol.layer.Tile({
    title: 'Stamen Watercolor',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'watercolor'
    })
});
var stamenToner = new ol.layer.Tile({
    title: 'Stamen Toner',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'toner'
    })
});

//Import administrative borders
var area = new ol.layer.Image({
    title: 'Study area',
    source: new ol.source.ImageWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: { 'LAYERS': 'cc24:confine_pastena' }
    }),
    visible: true
});

//Add the layers to layer groups

let basemapLayers = new ol.layer.Group({
    title: "Base Maps",
    layers: [osm, bingRoads, bingAerial, stamenToner, stamenWatercolor]
})

//Add the map
let map = new ol.Map({
    target: document.getElementById('map'),
    layers: [basemapLayers, area],
    view: new ol.View({
        center: ol.proj.fromLonLat([13.491461, 41.468256]),
        zoom: 14
    }),
});

// Add the map controls:
map.addControl(new ol.control.ScaleLine()); //Controls can be added using the addControl() map function
map.addControl(new ol.control.FullScreen());
map.addControl(new ol.control.OverviewMap());
map.addControl(
    new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        className: 'custom-control',
        placeholder: '0, 0'
    })
);

//Add the layer switcher control
var layerSwitcher = new ol.control.LayerSwitcher({
});
map.addControl(layerSwitcher);

//Add the code for the Pop-up
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var popup = new ol.Overlay({
    element: container
});
map.addOverlay(popup);

//This is the event listener for the map. It fires when a single click is made on the map.
map.on('singleclick', function (event) {
    //This iterates over all the features that are located on the pixel of the click (can be many)
    var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
        return feature;
    });

    //If there is a feature, open the popup by setting a position to it and put the data from the feature
    if (feature != null) {
        var pixel = event.pixel;
        var coord = map.getCoordinateFromPixel(pixel);
        popup.setPosition(coord);
        content.innerHTML =
            '<h5>Colombia Water Areas</h5><br><b>Name: </b>' +
            feature.get('NAME') +
            '</br><b>Description: </b>' +
            feature.get('HYC_DESCRI');
    } else {
        //Only if the test_1k layer is visible, do the GetFeatureInfo request
        if (dusaf.getVisible()) {
            var viewResolution = (map.getView().getResolution());
            var url = dusaf.getSource().getFeatureInfoUrl(event.coordinate, viewResolution, 'EPSG:32632', { 'INFO_FORMAT': 'text/html' });
            console.log(url)
            
            if (url) {
                var pixel = event.pixel;
                var coord = map.getCoordinateFromPixel(pixel);
                popup.setPosition(coord);
                //We do again the AJAX request to get the data from the GetFeatureInfo request
                $.ajax({ url: url })
                    .done((data) => {
                        console.log(data);
                        //Put the data of the GetFeatureInfo response inside the pop-up
                        //The data that arrives is in HTML
                        content.innerHTML = data;
                    });
            }
        }
    }

});
//This closes the pop-up when the X button is clicked
closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};


// Adding map event for pointermove
map.on('pointermove', function (event) {
    var pixel = map.getEventPixel(event.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});


<style>.embed-container {position: relative; padding-bottom: 80%; height: 0; max-width: 100%;} .embed-container iframe, .embed-container object, .embed-container iframe{position: absolute; top: 0; left: 0; width: 100%; height: 100%;} small{position: absolute; z-index: 40; bottom: 0; margin-bottom: -15px;}</style><div class="embed-container"><iframe width="500" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" title="CC24" src="//polimi.maps.arcgis.com/apps/Embed/index.html?webmap=2851d92ee05a4c11ba51b482e3a2f013&extent=13.3285,41.3873,13.7333,41.5468&zoom=true&previewImage=false&scale=true&details=true&legendlayers=true&active_panel=details&basemap_gallery=true&disable_scroll=true&theme=light"></iframe></div>
