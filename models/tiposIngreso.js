TiposIngreso	= new Mongo.Collection("tiposIngreso");
TiposIngreso.allow({
	insert: function () { return true; },
	update: function () { return true; },
	remove: function () { return true; }
});