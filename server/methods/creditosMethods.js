Meteor.methods({
  generarCredito : function(alumno_id, credito, planPagos) {
	  if(credito.requiereVerificacion == true){
		  credito.estatus = 0;
	  }else if(credito.requiereVerificacion == false){
		  credito.estatus = 1;
	  }
	  
	  var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
  	credito.folio = sucursal.folio + 1;
  	credito.avales_ids = [];
  	//Insertar los Avales en La colección de Personas
  	//console.log("Avales:", credito.avales);
  	_.each(credito.avales, function(aval){
				if (!aval._id)
				{	  	
						aval.creditosPersonas = [];
			  		aval.creditosPersonas.push({credito: credito.folio, tipoPersona: "Aval"});
			  		aval.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
			  		Personas.insert(aval, function(error, result){
								if (result)
								{
										credito.avales_ids.push(result);
								}		  		
				  	});
		  	}
		  	else
		  	{
			  		console.log("Actualizar sus folios:", aval._id);
			  		var p = Personas.findOne({_id:aval._id});
			  		console.log(p);
			  		p.creditosPersonas.push({credito: credito.folio, tipoPersona: "Aval"});
			  		Personas.update({_id: aval._id},{$set:p});
		  	}
  	});
  	delete credito['avales'];
  	//console.log(credito);
  	//-----------------------------------------------
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
	},
});