var request = require("request");
var Promise = require("bluebird");

class FetchStatePolys {
	constructor() {
    }

    fetch () {
        return new Promise( (resolve, reject) => {
            var qs = {
                'where': '1=1',
                'outFields': 'STATE_NAME',
                'f': 'json',
                'outSR': 4326,
                'returnCentroid': true,
                'spatialRel': 'esriSpatialRelIntersects'
            };
            request.get({url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0/query", 
                qs: qs},
                (error, response, body) => {
                    if(!error) {
                        body = JSON.parse(body);
                        resolve(body.features);

                        // var subset = [];
                        // subset.push(body.features[0]);
                        // subset.push(body.features[1]);
                        // resolve(subset);
                    } else {
                        reject(error);
                    }
            });
        });
    }
} // end class

module.exports = FetchStatePolys;
