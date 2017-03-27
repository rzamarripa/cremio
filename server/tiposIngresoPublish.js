Meteor.publish("tiposIngreso",function(params){
  	return TiposIngreso.find(params);
});