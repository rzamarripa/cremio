Paises 						= new Mongo.Collection("paises");
Paises.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});