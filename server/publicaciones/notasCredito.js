Meteor.publish("notasCredito",function(params){
  	return NotasCredito.find(params);
});

Meteor.publish("notasCreditoCliente",function(params){
  	return NotasCredito.find(params, {limit: 10}, {sort:{createdAt:1}});
});

Meteor.publish("notasCreditoTop1",function(params){
  	return NotasCredito.find(params, {limit: 1}, {sort:{createdAt:-1}});
});

