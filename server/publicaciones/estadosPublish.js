Meteor.publish("estados",function(params){
  	return Estados.find(params);
});