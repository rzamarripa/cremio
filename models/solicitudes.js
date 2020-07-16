SolicitudesClientes 						= new Mongo.Collection("solicitudesClientes");
SolicitudesClientes.allow({
  insert: function () { return true; }//,
//  update: function () { return true; },
//  remove: function () { return true; }
});

SolicitudesDistribuidores 			= new Mongo.Collection("solicitudesDistribuidores");
SolicitudesDistribuidores.allow({
  insert: function () { return true; }//,
//  update: function () { return true; },
//  remove: function () { return true; }
});