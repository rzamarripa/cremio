TiposNotasCredito 						= new Mongo.Collection("tiposNotasCredito");
TiposNotasCredito.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});