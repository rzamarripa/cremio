EstadoCivil 						= new Mongo.Collection("estadoCivil");
EstadoCivil.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});