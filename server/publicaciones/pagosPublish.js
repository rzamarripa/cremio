Meteor.publish("pagos",function(params){
  	return Pagos.find(params);
});