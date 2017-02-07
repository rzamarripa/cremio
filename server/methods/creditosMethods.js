Meteor.methods({
  generarCredito : function(alumno_id, credito, planPagos) {
	  if(credito.requiereVerificacion == true){
		  credito.estatus = 0;
	  }else if(credito.requiereVerificacion == false){
		  credito.estatus = 1;
	  }
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