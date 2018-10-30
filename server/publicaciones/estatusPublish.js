Meteor.publish("estatus",function(params){
  	return Estatus.find(params);
});