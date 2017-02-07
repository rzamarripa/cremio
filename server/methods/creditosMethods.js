Meteor.methods({
  generarCredito : function(alumno_id, credito, planPagos) {
	  var credito_id = Creditos.insert(credito);
	  console.log(planPagos.length);
	  _.each(planPagos, function(pago){
		  delete pago.$$hashKey;
	    pago.multa = 0;
	    pago.abono = 0;
			pago.credito_id = credito_id;
			PlanPagos.insert(pago)
		});
		return "hecho";
	}
});