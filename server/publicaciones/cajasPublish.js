Meteor.publish("cajas",function(params){
  	return Cajas.find(params);
});