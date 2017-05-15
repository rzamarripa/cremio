Meteor.publish("cajas",function(params){
		console.log(params);
  	return Cajas.find(params);
});