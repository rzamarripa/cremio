Meteor.publish("notasCredito",function(params){
  	return NotasCredito.find(params);
});