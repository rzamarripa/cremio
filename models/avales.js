Avales 						= new Mongo.Collection("avales");
Avales.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});