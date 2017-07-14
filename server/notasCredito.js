Meteor.publish("notasCredito",function(params){
  	return NotasCredito.find(params);
});


Meteor.publish("notasCreditoTop1",function(params){
  	return NotasCredito.find(params,{limit: 1},{sort:{createdAt:-1}});
});