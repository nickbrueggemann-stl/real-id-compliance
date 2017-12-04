var request = require("request");
var Promise = require("bluebird");
var schedule = require('node-schedule');

var FetchStatePolys = require("./fetch-state-polys");
var FetchComplianceData = require("./fetch-compliance-data");

class RealIDController {
	constructor() {
        this.fetchStatePolys = new FetchStatePolys();
        this.fetchComplianceData = new FetchComplianceData();

        this.complianceData = [];
        this._updateComplianceData();

        schedule.scheduleJob('0 0 * * *', () => { 
            this._updateComplianceData();
        }); // run everyday at midnight
    }

    getComplianceData() {
        return this.complianceData;
    }

    _updateComplianceData() {
        this._gatherComplicanceData().then( (complianceData) => {
            this.complianceData = complianceData;
        }, (error) => {
            console.log(error);
        });
    }

    _gatherComplicanceData() {
        return new Promise( (resolve, reject) => {
            this.fetchStatePolys.fetch().then( (statePolys) => {
                
                var stateNames = this._translateStateNames(statePolys);
                this.fetchComplianceData.fetch(stateNames).then( (complianceData) => {
                    this._mergeComplianceWithFeatures(complianceData, statePolys);
                    resolve(statePolys);
                }, (error) => {
                    reject(error);
                });
            }, (error) => {
                reject(error);
            });
        });
    }

    _translateStateNames(statePolys) {
        var stateNames = [];
        statePolys.forEach(function(item) {
          var name = {};
          name.orig = item.attributes["STATE_NAME"];
      
          var dhsName = name.orig.toLowerCase();
          dhsName = dhsName.split(" ").join("-");
          name.dhs = dhsName;
      
          stateNames.push(name);
        });
        return stateNames;
      }
      
      _mergeComplianceWithFeatures (complianceData, features) {
        for(var i = 0; i < features.length; i++) {
          var compliance = this._getCompianceDataForState(features[i].attributes["STATE_NAME"], complianceData);
          features[i].attributes["COMPLAINCE"] = compliance.compliance;
        }
      }
      
      _getCompianceDataForState(stateName, complianceData) {
        var stateInfo = null;
        for(var i = 0; i < complianceData.length; i++) {
          if(complianceData[i].orig === stateName) {
            stateInfo = complianceData[i];
          }
        }
      
        return stateInfo;
      }
      
} // end class

module.exports = RealIDController;
