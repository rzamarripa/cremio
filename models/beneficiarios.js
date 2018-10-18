Beneficiarios 						= new Mongo.Collection("beneficiarios");
Beneficiarios.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});