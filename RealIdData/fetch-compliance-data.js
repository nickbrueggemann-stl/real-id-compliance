var request = require("request");
var Promise = require("bluebird");
var HTMLParser = require('fast-html-parser');

/**
 * Reads the current compliance data from https://www.dhs.gov/real-id/<state-name>
 */
class FetchComplianceData {
	constructor() {
        this.complianceData = [];
    }

    fetch (stateNames) {
        return new Promise( (resolve, reject) => {

            var promises = [];
            var complianceData = [];

            var delayTime = 1000;
            stateNames.forEach( (state) => {
                delayTime = delayTime + 1000;
                var promise = this._requestStateDataFromDHS(state, delayTime).then ( (stateInfo) => {
                    var compliance = this._parseBodyForComplaince(stateInfo.html);
                    stateInfo.compliance = compliance;
                    complianceData.push(stateInfo);
                }, (error) => {
                    
                });
                promises.push(promise);
            });

            Promise.all(promises).then( () => {
                this.complianceData = complianceData;
                resolve(complianceData);
            });
        });
    }
    
    _requestStateDataFromDHS(stateInfo, delayMS) {
        return new Promise(function(resolve, reject){
            setTimeout( () => {
                var options = {
                    headers: {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'}
                }
    
                // Send a request to the page with the data for the state.
                request('https://www.dhs.gov/real-id/' + stateInfo.dhs, options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        stateInfo.html = body;
                        resolve(stateInfo);
                    } else {
                        reject(error);
                    }
                });
            }, delayMS);
        });
    }

    _parseBodyForComplaince(body) {
        var root = HTMLParser.parse(body);
        var complianceDiv = root.querySelector('.field-item')
        var compliance = complianceDiv.text.split("\n")[0];  
        return compliance;
    }
} // end class

module.exports = FetchComplianceData;
