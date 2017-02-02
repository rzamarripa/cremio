Meteor.methods({
  generarCredito : function(alumno_id, credito, planPagos) {
	  var credito_id = Creditos.insert(credito, function(error, result){
		  if(error){
			  return error.reason;
		  }else if(result){
			  console.log(result);
			  _.each(planPagos, function(pago){
				  delete pago.$$hashKey;
					pago.credito_id = result;
					PlanPagos.insert(pago)
				})
				return "hecho";
		  }
	  })		
	}
});