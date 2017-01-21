TiposCredito 						= new Mongo.Collection("tiposCredito");
TiposCredito.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});