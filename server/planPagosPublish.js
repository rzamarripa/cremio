Meteor.publish("planPagos",function(params){
  	return PlanPagos.find(params);
});