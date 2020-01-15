Meteor.publish("creditos",function(options){
  return Creditos.find(options);
});


Meteor.publish("creditosActivosCliente",function(options){
  if (options != undefined)
	{
			return Creditos.find({cliente_id	: options.cliente_id,
												  	estatus			: {$in: [0,1,2,3,4,6] } });
	}	
});

Meteor.publish("creditosLiquidadosCliente",function(options){
  if (options != undefined)
	{
			let selector = {
		  	cliente_id	: options.where.cliente_id,
		  	estatus			: 5	
			}
			return Creditos.find(selector, {	sort	: {fechaLiquidacion: -1},
																		 		skip	: options.options.skip,
																		 		limit	: options.options.limit																								  
																	   }
																	);
	}	
});

	

Meteor.publish("creditosActivos",function(options){
  return Creditos.find(options);
});

Meteor.publish("creditosCancelados",function(options){
  return Creditos.find(options);
});

Meteor.publish("creditosAprobados",function(options){
  return Creditos.find(options);
});

Meteor.publish("creditosPendientes",function(options){
  return Creditos.find(options);
});