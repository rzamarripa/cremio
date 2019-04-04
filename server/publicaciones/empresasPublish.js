Meteor.publish("empresas",function(params){
  	return Empresas.find(params);
});


Meteor.publish("buscarEmpresas",function(options){
	if (options != undefined)	
			if(options.where.nombre.length > 0){
				let selector = {
					$and : [
							  	{nombre		: { '$regex' : '.*' + options.where.nombre || '' + '.*', '$options' : 'i' }},
							  	{estatus 	: true }
							   ]	
				}				
				return Empresas.find(selector, options.options);	
			}
});