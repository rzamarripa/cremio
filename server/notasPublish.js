Meteor.publish("notas",function(params){
  	return Notas.find(params);
});