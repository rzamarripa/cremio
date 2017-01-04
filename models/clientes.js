Clientes 						= new Mongo.Collection("clientes");
Clientes.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});