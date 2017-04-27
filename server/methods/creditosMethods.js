Meteor.methods({
 	generarCredito : function(credito, idCredito) {
		
/*
		if(credito.requiereVerificacion == true){
			credito.estatus = 0;
		}else if(credito.requiereVerificacion == false){
			credito.estatus = 1;
		}
*/
	
		//console.log(idCredito);
				
		var c = Creditos.findOne({_id: idCredito});
		
		c.fechaSolicito = credito.fechaSolicito;
		c.fechaPrimerAbono = credito.fechaPrimerAbono;
		
		
		var cliente = {};
		cliente._id = c.cliente_id;
		
		var planPagos = Meteor.call("generarPlanPagos", c, cliente);
		
		//console.log (planPagos)
		
		//-----------------------------------------------------------//
		
		
		var saldoActual = 0;
		_.each(planPagos,function(pago){
			saldoActual += pago.cargo;
		});
		c.numeroPagos = planPagos.length;
		c.saldoActual = saldoActual;
		c.adeudoInicial = saldoActual;

		var sucursal = Sucursales.findOne({_id : c.sucursal_id});
		c.folio = sucursal.folio + 1;		
		c.avales_ids = [];
		
		//console.log(credito.avales);
		
		_.each(credito.avales, function(aval){
			if (!aval.persona_id){	  	
					aval.relaciones = [];
					aval.relaciones.push({credito: c.folio, tipoPersona: "Aval", estatus: 0});
					aval.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
					Personas.insert(aval, function(error, result){
						if (result){
							c.avales_ids.push(result);
						}		  		
					});
			}
			else{
					var p = Personas.findOne({_id:aval.persona_id});
					p.relaciones.push({credito: c.folio, tipoPersona: "Aval", estatus: 0});
					Personas.update({_id: aval.persona_id},{$set:p});
					c.avales_ids.push(aval.persona_id);
			}
		});

		//delete credito['avales'];
	  	
		Sucursales.update({_id : sucursal._id}, { $set : { folio : c.folio}});
		
		
/*
		c.fechaSolicito = credito.fechaSolicito;
		c.fechaPrimerAbono = credito.primerAbono;
*/
		
		var idTemp = c._id;
		delete c._id;		
		Creditos.update({_id:idTemp},{$set : c});
		
		
		//var credito_id = Creditos.insert(credito);
		
		//-----------------------------------------------------------//
		_.each(planPagos, function(pago){
			delete pago.$$hashKey;
			pago.multa = 0;
			pago.abono = 0;
			pago.credito_id = idTemp;
			pago.descripcion = "Recibo";
			PlanPagos.insert(pago)
		});
		Meteor.call("generarMultas");
		return "hecho";
	},
	generarCreditoPeticion : function(cliente, credito ) {
		if(credito.requiereVerificacion == true){
			credito.estatus = 0;
		}else if(credito.requiereVerificacion == false){
			credito.estatus = 1;
		}

		//var planPagos = Meteor.call("generarPlanPagos",credito,cliente);
		//console.log (planPagos)
/*
		var saldoActual=0;
		_.each(planPagos,function(pago){
			saldoActual += pago.cargo;
		});
		credito.numeroPagos = planPagos.length;
		credito.saldoActual = saldoActual;
		credito.adeudoInicial = saldoActual;
*/

		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		
		//credito.folio = sucursal.folio + 1;
		
		credito.avales_ids = [];
		
		//console.log(credito.avales);
		
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
					credito.avales_ids.push(aval.persona_id);
			}
		});

		delete credito['avales'];
	  	
		//Sucursales.update({_id : sucursal._id}, { $set : { folio : credito.folio}});
		

		var credito_id = Creditos.insert(credito);
/*		
		_.each(planPagos, function(pago){
			delete pago.$$hashKey;
			pago.multa = 0;
			pago.abono = 0;
			pago.credito_id = credito_id;
			pago.descripcion = "Recibo";
			PlanPagos.insert(pago)
		});
*/
		
		//Meteor.call("generarMultas");
		
		return "hecho";
	},
	actualizarCredito : function(cliente, credito, idCredito ) {
		
		
		if(credito.requiereVerificacion == true){
			credito.estatus = 0;
		}else if(credito.requiereVerificacion == false){
			credito.estatus = 1;
		}

		//var planPagos = Meteor.call("generarPlanPagos",credito,cliente);
		//console.log (planPagos)
/*
		var saldoActual=0;
		_.each(planPagos,function(pago){
			saldoActual += pago.cargo;
		});
		credito.numeroPagos = planPagos.length;
		credito.saldoActual = saldoActual;
		credito.adeudoInicial = saldoActual;
*/

		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		//credito.folio = sucursal.folio + 1;
		credito.avales_ids = [];
		
		//console.log(credito.avales);
		
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
					credito.avales_ids.push(aval.persona_id);
			}
		});

		delete credito['avales'];
	  	
		//Sucursales.update({_id : sucursal._id}, { $set : { folio : credito.folio}});
		
/*
		var credito_idTemp = credito._id;
		delete credito._id;
*/
		Creditos.update({_id:idCredito},{$set:credito});
/*
		PlanPagos.remove({credito_id:credito_id});

		_.each(planPagos, function(pago){
			delete pago.$$hashKey;
			pago.multa = 0;
			pago.abono = 0;
			pago.credito_id = credito_id;
			pago.descripcion = "Recibo";
			PlanPagos.insert(pago)
		});
		Meteor.call("generarMultas");
*/
		return "hecho";
	},
	entregarCredito : (montos,creditoid)=>{
		var cajaid = Meteor.user().profile.caja_id;
		var user = Meteor.user();
		var caja = Cajas.findOne(cajaid);
		var credito = Creditos.findOne(creditoid);
		var fechaNueva = new Date();

		if(!credito || credito.estatus!=2)
			throw new Meteor.Error(500, 'Error 500: Conflicto', 'Credito Invalido');
		if(!caja)
			throw new Meteor.Error(500, 'Error 500: Conflicto', 'Usuario Sin Caja Asignada');

		credito.entrega={movimientosCaja:[],movimientosCuentas:[]};

		_.each(montos.caja,(monto,index)=>{
			var movimiento = {
				tipoMovimiento : "Retiro",
				origen : "Entrega de Credito",
				origen_id :creditoid,
				caja_id : cajaid,
				cuenta_id :index,
				monto : monto.saldo * -1,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
			caja.cuenta[index].saldo -= monto.saldo;

			var movimientoid = MovimientosCajas.insert(movimiento);
			credito.entrega.movimientosCaja.push(movimientoid);
			credito.fechaEntrega = fechaNueva

		});

		delete caja._id
		caja.updated = true;
		caja.updatedAt = new Date();
		caja.updatedBy = user._id;
		Cajas.update({_id:cajaid},{$set:caja});

		_.each(montos.cuenta,(monto,index)=>{
			var movimiento = {
				tipoMovimiento : "Retiro",
				origen : "Entrega de Credito",
				origen_id : creditoid,
				monto : monto.saldo * -1,
				cuenta_id : index,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
			var cuenta = Cuentas.findOne(index);

			var movimientoid = MovimientosCuenta.insert(movimiento);
			credito.entrega.movimientosCuentas.push(movimientoid);
			//console.log(cuenta);
			Cuentas.update({_id:cuenta._id},{$set:{saldo:cuenta.saldo-monto.saldo}});
		})

		//credito.entregado = true;
		credito.estatus = 4;

		delete credito._id ;
		Creditos.update({_id:creditoid},{$set:credito});

		return "200";
	},

	cambiarEstatusCredito : function(credito){
		//console.log(credito,"mi crdito")
		// var empleado = Empleados.findOne({_id:id});
		if(credito.estatus == 4)
			credito.estatus = 5;
		else
			credito.estatus = 4;
		
		// Empleados.update({_id: id},{$set :  {estatus : empleado.estatus}});
		// var fechaNueva = new Date();
		// credito.fechaEntrega = fechaNueva;

		Creditos.update({_id:credito._id},{$set :  {estatus : credito.estatus}});

		

	},
		
	
});