Verificaciones 						= new Mongo.Collection("verificaciones");
Verificaciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});