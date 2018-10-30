Meteor.publish("colonias",function(params){
  	return Colonias.find(params);
});


Meteor.publish("buscarColonias",function(options){
	if (options != undefined)	
			if(options.where.nombre.length > 0){
				let selector = {
					$and : [
									{ciudad_id : options.where.ciudad_id},
							  	{nombre		: { '$regex' : '.*' + options.where.nombre || '' + '.*', '$options' : 'i' }},
							  	{estatus 	: true }
							   ]	
				}				
				return Colonias.find(selector, options.options);	
			}
});


