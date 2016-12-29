Meteor.publish("divisas",function(params){
  	return Divisas.find(params);
});