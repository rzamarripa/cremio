Meteor.publish("buscarReferenciasPersonales",function(options){
	if (options != undefined)
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	nombreCompleto: { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return ReferenciasPersonales.find(selector, options.options);	
			}
});

/*
Meteor.publish("avales",function(options){
  return Avales.find(options);
});
*/

