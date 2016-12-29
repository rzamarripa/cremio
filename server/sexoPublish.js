Meteor.publish("sexo",function(params){
  	return Sexo.find(params);
});