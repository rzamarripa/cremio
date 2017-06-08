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
		c.folio = sucursal.folio + 1;		
			
		Sucursales.update({_id : sucursal._id}, { $set : { folio : c.folio}});
				
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
			PlanPagos.insert(pago);
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

		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		
		credito.avales_ids = [];
		
		
		_.each(credito.avales, function(aval){
			
			if (aval.buscarPersona_id)
			{
							console.log("Condicion de buscarPersona");
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
											relacion.parentezco			 = aval.parentezco;
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
					console.log("Condicion de nueva PersonaId");
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
																parentezco				: aval.parentezco, 
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
					console.log("Condicion de persona existente");
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
																parentezco				: aval.parentezco, 
																tiempoConocerlo		:	aval.tiempoConocerlo, 
																num				 				: aval.num,
															  tipoPersona				: "Aval", 
															  estatus						: 0});
															  
															  
					Personas.update({_id: aval.persona_id},{$set:p});
					credito.avales_ids.push(aval.persona_id);
			}
		});
		

		delete credito['avales'];
		var credito_id = Creditos.insert(credito);
		
		return "hecho";
	},
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
		credito.avales_ids = c.avales_ids;
		
		
		//console.log(credito.avales);		
		_.each(credito.avales, function(aval){
			
			if (aval.buscarPersona_id)
			{
							console.log("Condicion de buscarPersona");
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
											relacion.parentezco			 = aval.parentezco;
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
					console.log("Condicion de nueva PersonaId");
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
																parentezco				: aval.parentezco, 
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
					console.log("Condicion de persona existente");
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
																parentezco				: aval.parentezco, 
																tiempoConocerlo		:	aval.tiempoConocerlo, 
																num				 				: aval.num,
															  tipoPersona				: "Aval", 
															  estatus						: 0});
															  
					if (credito.avales_ids == undefined)
						 credito.avales_ids = [];
																  
					Personas.update({_id: aval.persona_id},{$set:p});
					credito.avales_ids.push(aval.persona_id);
			}
		});
		
		
		delete credito['avales'];
		delete credito._id;	
		Creditos.update({_id:idCredito},{$set:credito});
		
		
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

	// cambiarEstatusCredito : function(credito){
	// 	//console.log(credito,"mi crdito")
	// 	// var empleado = Empleados.findOne({_id:id});
	// 	if(credito.estatus == 4)
	// 		credito.estatus = 5;
	// 	else
	// 		credito.estatus = 4;
		
	// 	// Empleados.update({_id: id},{$set :  {estatus : empleado.estatus}});
	// 	// var fechaNueva = new Date();
	// 	// credito.fechaEntrega = fechaNueva;

	// 	Creditos.update({_id:credito._id},{$set :  {estatus : credito.estatus}});

	// },
		
	
});