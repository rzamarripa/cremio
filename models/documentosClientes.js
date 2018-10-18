DocumentosClientes 						= new Mongo.Collection("documentosClientes");
DocumentosClientes.allow({
  insert: function () { return true; },
  update: function () { return true; }
});