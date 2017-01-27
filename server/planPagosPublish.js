Meteor.publish("planPagos",function(params){
		console.log(params);
  	return PlanPagos.find(params);
});