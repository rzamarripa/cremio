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


Meteor.publishComposite("creditosPromotoraComposite", function (options) {
	var selector = {
		promotora_id: options.where.promotora_id,
		estaPagadoComision: options.where.estaPagadoComision
	}

	return {
		find() {
			return Creditos.find(selector, { sort: { fechaEntrega: -1 }, skip: options.options.skip, limit: options.options.limit });
		},
		children: [{
			find(credito) {
				return Meteor.users.find({ _id: credito.cliente_id });
			}
		},
		{
			find(credito) {
				return Meteor.users.find({ _id: credito.usuario_id });
			}
		},
		{
			find(credito) {
				return Sucursales.find({ _id: credito.sucursal_id });
			}
		},
		]
	}
});