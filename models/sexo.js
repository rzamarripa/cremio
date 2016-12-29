Sexo 						= new Mongo.Collection("sexo");
Sexo.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});