/**
 * Seeder
 * 
 */
var nodepath = require('path');

function Seeder(models){
    if(false === (this instanceof Seeder)){
        return new Seeder();
    }
    this.models = models;
    this.seedInfo = null;
};

Seeder.prototype.hasSeedInfo = function(){
    var _self = this;
    var seedPath = nodepath.resolve(sails.config.paths.config, 'env', sails.config.environment, 'seed');
    try {
        _self.seedInfo = require(seedPath);
    } catch (e) {}
    return !_.isUndefined(_self.seedInfo) && !_.isNull(_self.seedInfo);
}

Seeder.prototype.seed = function(attributes, callback){
    var value = attributes.value;
    var key = attributes.key;
    var model = this[key];
    if (!_.isNull(model) && !_.isUndefined(model)) {
        model.count().exec(function(err, count) {
            if (!err && count === 0 && !_.isEmpty(value)) {
                sails.log.debug('Seeding ' + key + '...');
                model.createEach(value).exec(function(err, results) {
                    if (err) {
                        sails.log.debug(err);
                        callback(err);
                    } else {
                        sails.log.debug((key + ' seed planted').grey);
                        callback();
                    }
                });
            } else {
                sails.log.debug((key + ' had models, so no seed needed').grey);
                callback();
            }
        });
    } else{
        var err = new Error('Model is null');
        err.code = 'invalidModel';        
        callback(err);
    }
};

Seeder.prototype.process = function(callback){
    var _self = this;
    var attributes = [];
    for(key in _self.seedInfo){
        attributes.push({
            value: _self.seedInfo[key],
            key: key
        });
    }
    async.map(attributes,_self.seed, callback);
}

module.exports = Seeder;