Traspasos 						= new Mongo.Collection("traspasos");
Traspasos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});