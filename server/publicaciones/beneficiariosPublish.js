Meteor.publish("beneficiarios",function(params){
  	return Beneficiarios.find(params);
});


Meteor.publish("buscarBeneficiarios",function(options){

	if (options != undefined)	
			if(options.where.nombreCompleto.length > 0){
				let selector = {
			  	"nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' }
				}
				return Beneficiarios.find(selector, options.options);	
			}
});