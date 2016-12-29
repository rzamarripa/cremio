Roles 						= new Mongo.Collection("roles");
Roles.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});