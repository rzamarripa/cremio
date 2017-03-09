Meteor.methods({
 	generarCredito : function(cliente, credito ) {
		if(credito.requiereVerificacion == true){
			credito.estatus = 0;
		}else if(credito.requiereVerificacion == false){
			credito.estatus = 1;
		}

		var planPagos = Meteor.call("generarPlanPagos",credito,cliente);
		//console.log (planPagos)
		credito.numeroPagos = planPagos.length;
		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		credito.folio = sucursal.folio + 1;
		credito.avales_ids = [];

		_.each(credito.avales, function(aval){
			if (!aval.persona_id){	  	
					aval.relaciones = [];
					aval.relaciones.push({credito: credito.folio, tipoPersona: "Aval", estatus: 0});
					aval.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
					Personas.insert(aval, function(error, result){
						if (result){
							credito.avales_ids.push(result);
						}		  		
					});
			}
			else{
					var p = Personas.findOne({_id:aval.persona_id});
					p.relaciones.push({credito: credito.folio, tipoPersona: "Aval", estatus: 0});
					Personas.update({_id: aval.persona_id},{$set:p});
			}
		});

		delete credito['avales'];
	  	
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
		Meteor.call("generarMultas");
		return "hecho";
	},
});