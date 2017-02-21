Meteor.methods({
  generarCredito : function(alumno_id, credito, planPagos) {
	  if(credito.requiereVerificacion == true){
		  credito.estatus = 0;
	  }else if(credito.requiereVerificacion == false){
		  credito.estatus = 1;
	  }
	  var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
  	credito.folio = sucursal.folio + 1;
  	Sucursales.update({_id : sucursal._id}, { $set : { folio : credito.folio}});
	  var credito_id = Creditos.insert(credito);
	  _.each(planPagos, function(pago){
		  delete pago.$$hashKey;
	    pago.multa = 0;
	    pago.abono = 0;
			pago.credito_id = credito_id;
			pago.descripcion = "Abono";
			PlanPagos.insert(pago)
		});
		return "hecho";
	}
});