BitacoraCambioDistribuidor = new Mongo.Collection("bitacoraCambioDistribuidor");
BitacoraCambioDistribuidor.allow({
    insert: function () { return true; }//,
    // update: function () { return true; },
    // remove: function () { return true; }
});