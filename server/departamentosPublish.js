Meteor.publish("departamentos",function(params){
  	return Departamentos.find(params);
});