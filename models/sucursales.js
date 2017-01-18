Sucursales 						= new Mongo.Collection("sucursales");
Sucursales.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});