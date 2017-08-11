Meteor.methods({
 	generarCredito : function(credito, idCredito) {

		var c = Creditos.findOne({_id: idCredito});
				
		c.fechaSolicito = credito.fechaSolicito;
		c.fechaPrimerAbono = credito.fechaPrimerAbono;
		
		var cliente = {};
		cliente._id = c.cliente_id;
		
		var planPagos = Meteor.call("generarPlanPagos", c, cliente);
				
		
		var saldoActual = 0;
		_.each(planPagos,function(pago){
			saldoActual += pago.cargo;
		});
		c.numeroPagos = planPagos.length;
		c.saldoActual = saldoActual;
		c.adeudoInicial = saldoActual;


		var sucursal = Sucursales.findOne({_id : c.sucursal_id});
		
		if (sucursal.folioCredito != undefined)				
				sucursal.folioCredito = sucursal.folioCredito + 1;
		else	
		{
				sucursal.folioCredito = 0;
				sucursal.folioCredito = sucursal.folioCredito + 1;
		}
					
		c.folio = sucursal.folioCredito;
		Sucursales.update({_id : sucursal._id}, { $set : { folioCredito : sucursal.folioCredito}});
				
		var idTemp = c._id;
		delete c._id;		
		Creditos.update({_id:idTemp},{$set : c});
		
		
		//-----------------------------------------------------------//
		_.each(planPagos, function(pago){
			delete pago.$$hashKey;
			pago.multa = 0;
			pago.abono = 0;
			pago.credito_id = idTemp;
			pago.descripcion = "Recibo";
			
			PlanPagos.insert(pago);
		});

		Meteor.call("generarMultas");
		return "hecho";
	},
	generarCreditoPeticion : function(cliente, credito){

		if(credito.requiereVerificacion == true){
			credito.estatus = 0;
		}else if(credito.requiereVerificacion == false){
			credito.estatus = 1;
		}

		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		credito.avales_ids = [];
		
		
		_.each(credito.avales, function(aval){		
			if (aval.estatus == "N") aval.estatus = "G";
				 credito.avales_ids.push({num							: aval.num, 
					 												aval_id					: aval._id, 
					 												nombreCompleto	: aval.nombreCompleto,
					 												parentesco			: aval.parentesco, 
					 												tiempoConocerlo	: aval.tiempoConocerlo, 
					 												estatus					: aval.estatus});
		});
		
		/*
	
			if (aval.buscarPersona_id)
			{
							//console.log("Condicion de buscarPersona");
							//console.log(referenciaPersonal.buscarPersona_id);
							var p = Personas.findOne({_id:aval.buscarPersona_id});
							
							//console.log("P:",p)	
							
							p.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
							p.nombre 					= aval.nombre;
							p.apellidoPaterno = aval.apellidoPaterno;
							p.apellidoMaterno = aval.apellidoMaterno;
														
							_.each(p.relaciones, function(relacion){
									if (relacion.cliente_id == cliente._id){

											relacion.credito_id	     = credito._id;
											relacion.cliente_id 		 = cliente._id;
											relacion.estadoCivil		 = aval.estadoCivil,
											relacion.ocupacion			 = aval.ocupacion,
											relacion.direccion			 = aval.direccion, 
											relacion.empresa				 = aval.empresa, 
											relacion.puesto					 = aval.puesto, 
											relacion.antiguedad			 = aval.antiguedad, 
											relacion.direccionEmpresa= aval.direccionEmpresa, 
											relacion.parentesco			 = aval.parentesco;
											relacion.tiempoConocerlo = aval.tiempoConocerlo;
											relacion.num						 = aval.num;
											relacion.tipoPersona		 = "Aval"; 
											relacion.estatus				 = 0;
									}
							});
							
							Personas.update({_id: aval.buscarPersona_id},{$set:p});

			}
			else if (!aval.persona_id)
			{	  	
					//console.log("Condicion de nueva PersonaId");
					aval.relaciones = [];
					aval.relaciones.push({credito_id				: credito._id, 
																cliente_id 				: cliente._id,
																estadoCivil				:	aval.estadoCivil,
																ocupacion					: aval.ocupacion,
																direccion					:	aval.direccion, 
																empresa						: aval.empresa, 
																puesto						: aval.puesto, 
																antiguedad				: aval.antiguedad, 
																direccionEmpresa	: aval.direccionEmpresa, 
																parentesco				: aval.parentesco, 
																tiempoConocerlo		:	aval.tiempoConocerlo, 
																num				 				: aval.num,
															  tipoPersona				: "Aval", 
															  estatus						: 0});
					var per = {};
					per.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
					per.nombre = aval.nombre;
					per.apellidoPaterno = aval.apellidoPaterno;
					per.apellidoMaterno = aval.apellidoMaterno;
					
					per.relaciones = [];
					per.relaciones = aval.relaciones;
					
					var result = Personas.insert(per);
					credito.avales_ids.push(result);
			}
			else
			{
					//console.log("Condicion de persona existente");
					var p = Personas.findOne({_id:aval.persona_id});
					p.relaciones.push({		credito_id				: credito._id, 
																cliente_id 				: cliente._id,
																estadoCivil				:	aval.estadoCivil,
																ocupacion					: aval.ocupacion,
																direccion					:	aval.direccion, 
																empresa						: aval.empresa, 
																puesto						: aval.puesto, 
																antiguedad				: aval.antiguedad, 
																direccionEmpresa	: aval.direccionEmpresa, 
																parentesco				: aval.parentesco, 
																tiempoConocerlo		:	aval.tiempoConocerlo, 
																num				 				: aval.num,
															  tipoPersona				: "Aval", 
															  estatus						: 0});
															  
															  
					Personas.update({_id: aval.persona_id},{$set:p});
					credito.avales_ids.push(aval.persona_id);
			}
*/
		
		delete credito['avales'];
		var credito_id = Creditos.insert(credito);
		_.each(credito.avales_ids, function(aval){
				var a = Avales.findOne(aval.aval_id);
				a.profile.creditos = [];
				a.profile.creditos.push({credito_id				: credito_id,
																 folio						: credito.folio,
																 parentesco				: aval.parentesco, 
																 tiempoConocerlo	: aval.tiempoConocerlo});	
				var idTemp = a._id;
				delete a._id;
				Avales.update({_id: idTemp}, {$set:{profile: a.profile}})	
		});

		return "hecho";
	},//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	actualizarCredito : function(cliente, credito, idCredito ) {
		
		if (credito.estatus != 4){		
				if(credito.requiereVerificacion == true){
					credito.estatus = 0;
				}else if(credito.requiereVerificacion == false){
					credito.estatus = 1;
				}
		}
		
		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		var c = Creditos.findOne(idCredito);
		
		c = {
				tipoCredito_id 				: credito.tipoCredito_id,
				duracionMeses 				: credito.duracionMeses,
				capitalSolicitado 		: credito.capitalSolicitado,
				adeudoInicial 				: credito.capitalSolicitado,
				saldoActual 					: credito.capitalSolicitado,
				periodoPago 					: credito.periodoPago,
				fechaPrimerAbono 			: credito.primerAbono,
				estatus 							: credito.estatus,
				requiereVerificacion	: credito.requiereVerificacion,
				turno 								: credito.turno,
				fechaVerificacion			: credito.fechaVerificacion,
				tipoGarantia 					: credito.tipoGarantia,
				tasa									: credito.tasa,
				conSeguro 						: credito.conSeguro,
				seguro								: credito.seguro
		};
	
		
		//credito.avales_ids = c.avales_ids; Con lo anterior de personas
				
		_.each(credito.avales, function(aval){
				if (aval.estatus == "N"){					
						aval.estatus = "G";
						c.avales_ids.push({num							: aval.num, 
															 aval_id					: aval._id, 
															 nombreCompleto		: aval.nombreCompleto,
															 parentesco				: aval.parentesco, 
															 tiempoConocerlo	: aval.tiempoConocerlo, 
															 estatus					: aval.estatus});
						
						var a = Avales.findOne(aval.aval_id);
						a.profile.creditos = [];
						a.profile.creditos.push({credito_id				: idCredito, 
																		 folio						: c.folio,
																		 parentesco				: aval.parentesco, 
																		 tiempoConocerlo	: aval.tiempoConocerlo});	
						var idTemp = a._id;
						delete a._id;
						Avales.update({_id: idTemp}, {$set:{profile: a.profile}});
						
				} 
				else if (aval.estatus == "A"){
						//Buscar el avales_ids y actualizarlo						
						_.each(c.avales_ids, function(aval_ids){
								//console.log(aval_ids);
								if (aval_ids.num == aval.num)
								{		
										aval_ids.parentesco = aval.parentesco;
										aval_ids.tiempoConocerlo = aval.tiempoConocerlo;
										aval_ids.estatus = "G";
										
										var a = Avales.findOne(aval.aval_id);
										_.each(a.profile.creditos, function(credito){
												if (credito.credito_id == idCredito)
												{
														credito.parentesco = 	aval.parentesco;
														credito.tiempoConocerlo = aval.tiempoConocerlo						
												}
										});
										var idTemp = a._id;
										delete a._id;
										Avales.update({_id: idTemp}, {$set:{profile: a.profile}});
								}
						});				
				}
				
			/*
if (aval.buscarPersona_id)
			{
							//console.log("Condicion de buscarPersona");
							//console.log(referenciaPersonal.buscarPersona_id);
							var p = Personas.findOne({_id:aval.buscarPersona_id});
							
							//console.log("P:",p)	
							
							p.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
							p.nombre 					= aval.nombre;
							p.apellidoPaterno = aval.apellidoPaterno;
							p.apellidoMaterno = aval.apellidoMaterno;
														
							_.each(p.relaciones, function(relacion){
									if (relacion.cliente_id == cliente._id){

											relacion.credito_id	     = idCredito;
											relacion.cliente_id 		 = cliente._id;
											relacion.estadoCivil		 = aval.estadoCivil,
											relacion.ocupacion			 = aval.ocupacion,
											relacion.direccion			 = aval.direccion, 
											relacion.empresa				 = aval.empresa, 
											relacion.puesto					 = aval.puesto, 
											relacion.antiguedad			 = aval.antiguedad, 
											relacion.direccionEmpresa= aval.direccionEmpresa, 
											relacion.parentesco			 = aval.parentesco;
											relacion.tiempoConocerlo = aval.tiempoConocerlo;
											relacion.num						 = aval.num;
											relacion.tipoPersona		 = "Aval"; 
											relacion.estatus				 = 0;
									}
							});
							
							Personas.update({_id: aval.buscarPersona_id},{$set:p});

			}
			else if (!aval.persona_id)
			{	  	
					//console.log("Condicion de nueva PersonaId");
					aval.relaciones = [];
					aval.relaciones.push({credito_id				: idCredito, 
																cliente_id 				: cliente._id,
																estadoCivil				:	aval.estadoCivil,
																ocupacion					: aval.ocupacion,
																direccion					:	aval.direccion, 
																empresa						: aval.empresa, 
																puesto						: aval.puesto, 
																antiguedad				: aval.antiguedad, 
																direccionEmpresa	: aval.direccionEmpresa, 
																parentesco				: aval.parentesco, 
																tiempoConocerlo		:	aval.tiempoConocerlo, 
																num				 				: aval.num,
															  tipoPersona				: "Aval", 
															  estatus						: 0});
					
					var per = {};
					per.nombreCompleto = aval.nombre + " " + aval.apellidoPaterno + " " + aval.apellidoMaterno;
					per.nombre = aval.nombre;
					per.apellidoPaterno = aval.apellidoPaterno;
					per.apellidoMaterno = aval.apellidoMaterno;
					
					per.relaciones = [];
					per.relaciones = aval.relaciones;
					
					var result = Personas.insert(per);
					credito.avales_ids.push(result);
					
			}
			else
			{
					//console.log("Condicion de persona existente");
					var p = Personas.findOne({_id:aval.persona_id});
					p.relaciones.push({		credito_id				: idCredito, 
																cliente_id 				: cliente._id,
																estadoCivil				:	aval.estadoCivil,
																ocupacion					: aval.ocupacion,
																direccion					:	aval.direccion, 
																empresa						: aval.empresa, 
																puesto						: aval.puesto, 
																antiguedad				: aval.antiguedad, 
																direccionEmpresa	: aval.direccionEmpresa, 
																parentesco				: aval.parentesco, 
																tiempoConocerlo		:	aval.tiempoConocerlo, 
																num				 				: aval.num,
															  tipoPersona				: "Aval", 
															  estatus						: 0});
															  
					if (credito.avales_ids == undefined)
						 credito.avales_ids = [];
																  
					Personas.update({_id: aval.persona_id},{$set:p});
					credito.avales_ids.push(aval.persona_id);
			}
*/
		});
		//console.log(c.avales_ids);
		

		delete credito['avales'];
		delete credito._id;	
		Creditos.update({_id:idCredito},{$set:c});
		
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

		credito.entrega = {movimientosCaja:[],movimientosCuentas:[]};		
		
		_.each(montos.caja,(monto,index)=>{
			
			if (Number(monto.saldo) > 0)
			{
			
					var movimiento = {
						tipoMovimiento : "Retiro",
						origen : "Entrega de Credito",
						origen_id :creditoid,
						caja_id : cajaid,
						cuenta_id :index,
						monto : monto.saldo,
						sucursal_id : user.profile.sucursal_id,
						createdAt : new Date(),
						createdBy : user._id,
						updated : false,
						estatus : 1
					}
					caja.cuenta[index].saldo -= Number(parseFloat(monto.saldo).toFixed(2));
		
					var movimientoid = MovimientosCajas.insert(movimiento);
					credito.entrega.movimientosCaja.push(movimientoid);
					credito.fechaEntrega = fechaNueva;

			}	
		});

		delete caja._id
		caja.updated = true;
		caja.updatedAt = new Date();
		caja.updatedBy = user._id;
		Cajas.update({_id:cajaid},{$set:caja});

		/*
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
*/

		//credito.entregado = true;
		credito.estatus = 4;

		delete credito._id ;
		Creditos.update({_id:creditoid},{$set:credito});

		return "200";
	},
	getCredito: function (credito_id) {	
	  var credito = Creditos.findOne({"_id" : credito_id});
		return credito;
	},
	validarCreditosSaldoEnMultas: function (cliente_id) {	
	  var creditos = Creditos.find({cliente_id : cliente_id}).fetch();
	  var ban = true;
	  _.each(creditos, function(c){
		  	if (c.saldoMultas > 0)
		  			ban = false;
	  });	  
		return ban;
	},
});