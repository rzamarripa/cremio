ReferenciasPersonales 						= new Mongo.Collection("referenciasPersonales");
ReferenciasPersonales.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});