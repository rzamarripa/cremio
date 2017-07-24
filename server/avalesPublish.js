Meteor.publish("buscarAvales",function(options){
	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return Avales.find(selector, options.options);	
			}
});

Meteor.publish("avales",function(options){
  return Avales.find(options);
});

