Meteor.publish("estadoCivil",function(params){
  	return EstadoCivil.find(params);
});