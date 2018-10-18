 Meteor.methods({
	generarPlanPagos: function(credito,cliente){
		

		function clonar( original )  {		    
		    var clone = {} ;
		    for (var key in original )
		        clone[ key ] = original[ key ] ;
		    return clone ;
		}
		
		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		
		var mfecha = moment(credito.fechaPrimerAbono);
		//console.log("Primera Fecha:", mfecha);
		
		mfecha.set({hour:0,minute:0,second:0,millisecond:0});
		
		var fechaLimite;// = mfecha;
		
		var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);

		var totalPagos = 0;
		
		var seguro;
		
		if (credito.conSeguro)
				seguro = credito.seguro;
		else 
				seguro = 0;		
				
		var numeroPagosCompuesto = 0;
		var tasaInteres = 0;
		var semanaQuincena = 0;
		
		/*
var configuracion = Configuraciones.findOne();
	
		_.each(configuracion.arregloTasa, function(elemento){
				
				if (credito.duracionMeses == elemento.mes){
						credito.tasa = elemento.tasa;												
				}	
				
		});
*/
				
		if(credito.periodoPago == "Semanal")
		{
			totalPagos = credito.duracionMeses * 4;
			numeroPagosCompuesto = 4;	
			tasaInteres = Number(parseFloat((credito.tasa / 4) / 100).toFixed(3));
								
		}	
		else if (credito.periodoPago == "Quincenal")
		{
			totalPagos = credito.duracionMeses * 2;
			numeroPagosCompuesto = 2;
			tasaInteres = Number(parseFloat((credito.tasa / 2) / 100).toFixed(3));
			
			var fechaMes = new Date(moment(credito.fechaPrimerAbono));
			var diaMes = fechaMes.getDate();
			
			//console.log("dia Mes:", diaMes);
			
			if (diaMes == 1)
			{
					semanaQuincena = 1;
			}
		  else if (diaMes == 16)
			{
					semanaQuincena = 2;
			}
			else if (diaMes >= 2 && diaMes <= 16)
			{
		 	 	 		mfecha = mfecha.date(16);	 
		 	 	 		semanaQuincena	= 2;
		 	} 	 
		  else 
		  {
				 mfecha = moment(mfecha).add(1, 'M');
				 mfecha = mfecha.date(1);
				 semanaQuincena = 1;
		  }
	  
		}	
		else if(credito.periodoPago == "Mensual")
		{
			totalPagos = credito.duracionMeses;
			numeroPagosCompuesto = 1;
			tasaInteres = Number(parseFloat(credito.tasa / 100).toFixed(3));
		  
		  //var diaMes = moment(credito.fechaPrimerAbono).daysInMonth();
		  //mfecha = mfecha.date(diaMes);
		}
		
		////////////////////////////////////////////////////////////////////////////////
		verificarDiaInhabil = function(fecha){
				var diaFecha = fecha.isoWeekday();
				var diaInhabiles = DiasInhabiles.find({tipo: "DIA", estatus: true}).fetch();
				var ban = false;
				_.each(diaInhabiles, function(dia){

						if (Number(dia.dia) === diaFecha)
						{
							 ban = true;	
							 return ban;							 
						}	 
				})
				var fechaBuscar = new Date(fecha);
				
				var fechaInhabil = DiasInhabiles.findOne({tipo: "FECHA", fecha: fechaBuscar, estatus: true});
				if (fechaInhabil != undefined)
				{
					 ban = true;
					 return ban;	
				}
				return ban;
		};
		
		////////////////////////////////////////////////////////////////////////////////
		//Evaluar la validación de dia inhabil
	  var validaFecha = true;
	  fechaLimite = moment(mfecha);
	  //console.log(mfecha);
	  while(validaFecha)
	  {		
				validaFecha = verificarDiaInhabil(fechaLimite);
				if (validaFecha == true)
							fechaLimite = fechaLimite.add(1, 'days');					 
	  }	
	  
	  //console.log("Segunda Fecha:", fechaLimite);
		
		var plan = [];

		if (tipoCredito.tipoInteres == "Compuesto" || tipoCredito.tipoInteres == "Simple")
		{
				var importeParcial = 0;
				if (tipoCredito.tipoInteres == "Simple")
				{
						var suma = 0;
						if (credito.conSeguro)
								var importeParcial = (((credito.capitalSolicitado * (credito.tasa  / 100)*1.16)*credito.duracionMeses+credito.capitalSolicitado)/totalPagos)+seguro;
						else
								var importeParcial = (((credito.capitalSolicitado * (credito.tasa  / 100)*1.16)*credito.duracionMeses+credito.capitalSolicitado)/totalPagos);
						
						var iva = ((credito.capitalSolicitado * (credito.tasa  / 100)*0.16)*credito.duracionMeses)/totalPagos;
						iva = parseFloat(iva.toFixed(2));
						var interes = (credito.capitalSolicitado * (credito.tasa  / 100) *credito.duracionMeses)/totalPagos;
						interes = parseFloat(interes.toFixed(2));
						var capital = parseFloat((credito.capitalSolicitado / totalPagos).toFixed(2));
						importeParcial=Math.round(importeParcial * 100) / 100;
						suma += importeParcial;
						suma = Math.round(suma * 100) / 100;
						
				}
				else if(tipoCredito.tipoInteres == "Compuesto")
				{
						
						var FV 				= 0;
						var pagoFijo 	= 0;
						var suma 			= 0;
								
						FV = 	Number(parseFloat(credito.capitalSolicitado * Math.pow(1 + tasaInteres, totalPagos)).toFixed(2));

						
						pagoFijo = Number(parseFloat(FV / totalPagos).toFixed(2));

						
						var capital = Number(parseFloat(credito.capitalSolicitado / totalPagos).toFixed(2));
						var interes = Number(parseFloat(pagoFijo - capital).toFixed(2));
						var iva 		= Number(parseFloat(interes * 0.16).toFixed(2));
												
						if (credito.conSeguro)
								importeParcial = Number(parseFloat(capital + interes+ iva + seguro).toFixed(2));
						else
								importeParcial = Number(parseFloat(capital + interes + iva).toFixed(2));						 
						
				}

				if (cliente == undefined){
					 cliente = {}; 
					 cliente._id = "Prospecto";
				}	 
		
				for (var i = 0; i < totalPagos; i++) {					
					//console.log(fechaLimite);
					var pago = {
						semana							: fechaLimite.isoWeek(),
						fechaLimite					: new Date(new Date(fechaLimite.toDate().getTime()).setHours(13,0,0,0)),
						diaSemana						: fechaLimite.weekday(),
						tipoPlan						: credito.periodoPago,
						tipoCredito					: credito.tipo, //si es vale o CP
						numeroPago					: i + 1,
						importeRegular			: importeParcial,
						iva									: iva,
						interes 						: interes,
						seguro							: (credito.conSeguro?seguro:0),
						cliente_id					: cliente._id,
						capital 						: capital,
						fechaPago						: undefined,
						semanaPago					: undefined,
						diaPago							: undefined,
						pago								: 0,
						estatus							: 3,								//Estatus 0 es creado, 1 Pagado, 2-pago parcial, 3.sinEntregar
						multada							: 0,
						multa_id						: undefined,
						planPago_id					: undefined,
						tiempoPago					: 0,
						modificada					: false,
						pagos 							: [],
						descripcion					: "Recibo",
						ultimaModificacion	: new Date(),
						credito_id 					: credito._id,
						mes									: fechaLimite.get('month') + 1,
						anio								: fechaLimite.get('year'),
						cargo								: importeParcial,	
						movimiento					: "Recibo"
					}
					
					plan.push(clonar(pago));
					if (credito.periodoPago == "Semanal"){
						mfecha = mfecha.add(7, 'days');
						
					}
					else if(credito.periodoPago == "Quincenal"){
						
						if (semanaQuincena == 1)
						{
					 	 	 mfecha = mfecha.date(16);					 	 	 
					 	 	 semanaQuincena	= 2;
					 	} 	 
					  else if (semanaQuincena == 2)
					  {  
						   mfecha = moment(mfecha).add(1, 'M');
							 mfecha = mfecha.date(1);
							 semanaQuincena = 1;	 
					  }
					}
					else if(credito.periodoPago == "Mensual"){
						var siguienteFecha = moment(mfecha).add(1, 'M');
						mfecha = siguienteFecha;
					}	
					
					validaFecha = true;
					fechaLimite = moment(mfecha);
				  while(validaFecha)
				  {							
							validaFecha = verificarDiaInhabil(fechaLimite);
							if (validaFecha == true)
									fechaLimite = fechaLimite.add(1, 'days');	
				  }					
				}

				var suma = 0;

				_.each(plan, function(pago){
					suma += pago.cargo;
					pago.sumatoria  = Number(parseFloat(suma).toFixed(2));
					var array = pago;
					pago.total = val
				});
		
				var val = plan[plan.length - 1].sumatoria;
					_.each(plan, function(pago){
					pago.total = val
				});
				
			
		}
		else if (tipoCredito.tipoInteres == "Saldos Insolutos")
		{
				var suma = 0;
				var pagoFijo = 0;
				var tasaInteres = 0;
				
				if(credito.periodoPago == "Semanal"){						
						tasaInteres = (credito.tasa / 4) / 100;
				}
				else if(credito.periodoPago == "Quincenal"){
						tasaInteres = (credito.tasa / 2) / 100;
				}
				else if(credito.periodoPago == "Mensual"){
						tasaInteres = credito.tasa / 100;
				}

				pagoFijo = Number(parseFloat(((credito.capitalSolicitado * tasaInteres) * Math.pow(1 + tasaInteres, totalPagos) / (Math.pow(1 + tasaInteres, totalPagos) - 1)).toFixed(2)));
				var saldoInicial = Number(parseFloat(credito.capitalSolicitado).toFixed(2));

				var saldo = 0;
				
				for (var i = 0; i < totalPagos; i++) {
					
					var interes = saldoInicial * tasaInteres;
					interes = Number(parseFloat(interes.toFixed(2)));
					
					var iva = interes * 0.16;
					iva = Number(parseFloat(iva.toFixed(2)));
					
					var capital = Number(parseFloat(pagoFijo - interes).toFixed(2));
					
					//var importeParcial = 0;
					
					if (credito.conSeguro)
								var importeParcial = Number(parseFloat(pagoFijo + iva + seguro).toFixed(2));
					else
								var importeParcial = Number(parseFloat(pagoFijo + iva).toFixed(2));
										
					if (cliente == undefined){
					 cliente = {}; 
					 cliente._id = "Prospecto";
					}	 
					
					var pago = {
						semana							: fechaLimite.isoWeek(),
						fechaLimite					: new Date(new Date(fechaLimite.toDate().getTime()).setHours(13,0,0,0)),
						diaSemana						: mfecha.weekday(),
						tipoPlan						: credito.periodoPago,
						tipoCredito					: credito.tipo,
						numeroPago					: i + 1,
						importeRegular			: importeParcial,
						iva									: iva,
						interes 						: interes,
						seguro							: (credito.conSeguro?seguro:0),
						cliente_id					: cliente._id,
						capital 						: capital,
						fechaPago						: undefined,
						semanaPago					: undefined,
						diaPago							: undefined,
						pago								: 0,
						estatus							: 3,
						multada							: 0,
						multa_id						: undefined,
						planPago_id					: undefined,
						tiempoPago					: 0,
						modificada					: false,
						pagos 							: [],
						descripcion					: "Recibo",
						ultimaModificacion	: new Date(),
						credito_id 					: credito._id,
						mes									: fechaLimite.get('month') + 1,
						anio								: fechaLimite.get('year'),
						cargo								: importeParcial,
						movimiento					: "Recibo",
					}
					
					plan.push(clonar(pago));
					if (credito.periodoPago == "Semanal"){
						mfecha = mfecha.add(7, 'days');
						
					}
					else if(credito.periodoPago == "Quincenal"){
						
						if (semanaQuincena == 1)
						{
					 	 	 mfecha = mfecha.date(16);					 	 	 
					 	 	 semanaQuincena	= 2;
					 	} 	 
					  else if (semanaQuincena == 2)
					  {  
						   mfecha = moment(mfecha).add(1, 'M');
							 mfecha = mfecha.date(1);
							 semanaQuincena = 1;	 
					  }
					}
					else if(credito.periodoPago == "Mensual"){
						var siguienteFecha = moment(mfecha).add(1, 'M');
						mfecha = siguienteFecha;
					}	
					
					validaFecha = true;
					fechaLimite = moment(mfecha);
				  while(validaFecha)
				  {							

							validaFecha = verificarDiaInhabil(fechaLimite);
							if (validaFecha == true)
									fechaLimite = fechaLimite.add(1, 'days');	
				  }	
					
					var capitalPagado = pagoFijo - interes; 
					saldoInicial = saldoInicial - capitalPagado;
					
				}
				var suma = 0;

				_.each(plan, function(pago){

					suma += pago.cargo;
					pago.sumatoria = Number(parseFloat(suma).toFixed(2));
					var array = pago;
					pago.total = val;
				});
		
				var val = plan[plan.length - 1].sumatoria;
					_.each(plan, function(pago){
						pago.total = val;
				});	
			
		}
		
		return plan;
	},
	actualizarMultas: function(){

		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var mfecha = moment(ahora);

		//console.log(ahora);
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{multa:0},
														{multa:2}
													]
											},
											{
												tipoCredito			: "creditoP",
												importeRegular : {$gte : 0 },	
												descripcion : "Cargo Moratorio"
											},
											{
												fechaLimite : { $lt : ahora }
											}
										]}).fetch();
										
		//console.log("Actualizar Multas: ",pagos);
		
		_.each(pagos, function(pago){
			try{
				//Preguntar si el planPago original ya Liquido el recibo
				var recibo = PlanPagos.findOne(pago.planPago_id);
				
				if (recibo.importeRegular > 0)
				{
						//Define la Multa
						var multas = 0;
						var credito = Creditos.findOne(pago.credito_id);
						var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
						//console.log("TC :",tipoCredito);
							
						if (tipoCredito.calculo == "importeSolicitado")
						{
								multas = Number(parseFloat(credito.capitalSolicitado * (tipoCredito.importe / 100)).toFixed(2));
						}
						else if (tipoCredito.calculo == "importereciboVencido")
						{
								var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});				
								multas = Number(parseFloat(reciboVencido.cargo * (tipoCredito.importe / 100)).toFixed(2)); 
						}	
						else if (tipoCredito.calculo == "saldoreciboVencido")
						{	
								var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});
								multas = Number(parseFloat(reciboVencido.importeRegular * (tipoCredito.importe / 100)).toFixed(2)); 
						}	
						
						pago.importeRegular = Number(parseFloat(pago.importeRegular + multas).toFixed(2));
						pago.cargo = Number(parseFloat(pago.cargo + multas).toFixed(2));
						
						credito.saldoMultas = Number(parseFloat(credito.saldoMultas + multas).toFixed(2));
						Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
														
						var idTemp = pago._id;
						delete pago._id;	
						PlanPagos.update({_id:idTemp},{$set : pago});	
				}
			}catch(e){
				console.log(e)
			}
		});
		
	},
	actualizarMultasVales: function(){

		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var mfecha = moment(ahora);

		//console.log(ahora);
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{multa:0},
														{multa:2}
													]
											},
											{
												tipoCredito			: "vale",
												importeRegular : {$gte : 0 },	
												descripcion : "Cargo Moratorio"
											},
											{
												fechaLimite : { $lt : ahora }
											}
										]}).fetch();
										
		//console.log("Actualizar Multas: ",pagos);
		
		_.each(pagos, function(pago){
			try{
				//Preguntar si el planPago original ya Liquido el recibo
				var recibo = PlanPagos.findOne(pago.planPago_id);
				
				if (recibo.importeRegular > 0)
				{
						//Define la Multa
						var multas = 0;
						var credito = Creditos.findOne(pago.credito_id);
						var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
						//console.log("TC :",tipoCredito);
						
						//saldoreciboVencido	
						var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});
						multas = Number(parseFloat(reciboVencido.importeRegular * (tipoCredito.importe / 100)).toFixed(2)); 
						
						pago.importeRegular = Number(parseFloat(pago.importeRegular + multas).toFixed(2));
						pago.cargo = Number(parseFloat(pago.cargo + multas).toFixed(2));
						
						credito.saldoMultas = Number(parseFloat(credito.saldoMultas + multas).toFixed(2));
						Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
														
						var idTemp = pago._id;
						delete pago._id;	
						PlanPagos.update({_id:idTemp},{$set : pago});	
				}
			}catch(e){
				console.log(e)
			}
		});
		
	},
	
	actualizarMultasRestarUnDia: function(){

		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var mfecha = moment(ahora);

		//console.log(ahora);
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{multa:0},
														{multa:2}
													]
											},
											{
												tipoCredito			: "creditoP",
												importeRegular : {$gte : 0 },	
												descripcion : "Cargo Moratorio"
											},
											{
												fechaLimite : { $lt : ahora }
											}
										]}).fetch();
										
		//console.log("Actualizar Multas: ",pagos);
		
		_.each(pagos, function(pago){
			try{
				//Preguntar si el planPago original ya Liquido el recibo
				var recibo = PlanPagos.findOne(pago.planPago_id);
				
				if (recibo.importeRegular > 0)
				{
						//Define la Multa
						var multas = 0;
						var credito = Creditos.findOne(pago.credito_id);
						var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
						//console.log("TC :",tipoCredito);
							
						if (tipoCredito.calculo == "importeSolicitado")
						{
								multas = Number(parseFloat(credito.capitalSolicitado * (tipoCredito.importe / 100)).toFixed(2));
						}
						else if (tipoCredito.calculo == "importereciboVencido")
						{
								var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});				
								multas = Number(parseFloat(reciboVencido.cargo * (tipoCredito.importe / 100)).toFixed(2)); 
						}	
						else if (tipoCredito.calculo == "saldoreciboVencido")
						{	
								var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});
								multas = Number(parseFloat(reciboVencido.importeRegular * (tipoCredito.importe / 100)).toFixed(2)); 
						}	
						
						pago.importeRegular = Number(parseFloat(pago.importeRegular - multas).toFixed(2));
						pago.cargo = Number(parseFloat(pago.cargo - multas).toFixed(2));
						
						credito.saldoMultas = Number(parseFloat(credito.saldoMultas - multas).toFixed(2));
						Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
														
						var idTemp = pago._id;
						delete pago._id;	
						PlanPagos.update({_id:idTemp},{$set : pago});	
				}
				
				
			}catch(e){
				console.log(e)
				return false;
			}
			
			
		});
		
		return true;
	},
	
	generarMultas:function(){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());

		//ahora.setHours(13,0,0,0);
		
		//console.log(ahora);
		
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{estatus:0},
														{estatus:2}
													]
											},
											{
												multada					: 0,
												descripcion 		: "Recibo",
												tipoCredito			: "creditoP",
												importeRegular 	: {$gte : 0 },
												fechaLimite 		: { $lt : ahora }												
											}
										]}).fetch();
		
		//console.log("PGO GM: ",pagos);
		_.each(pagos, function(pago){
			try{

				var credito = Creditos.findOne(pago.credito_id);
								
				if (pago.descripcion == "Recibo" && pago.multada != 1)
				{
						
						var mfecha = moment(ahora);
						limite = new Date (pago.fechaLimite.getFullYear(),pago.fechaLimite.getMonth(),pago.fechaLimite.getDate());
						var dias = mfecha.diff(limite, "days");
	
						var multas = 0;
	
						//Define la Multa
						var credito = Creditos.findOne(pago.credito_id);
						var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
							
						if (tipoCredito.calculo == "importeSolicitado")
						{
								multas = Number(parseFloat(credito.capitalSolicitado * (tipoCredito.importe / 100)).toFixed(2)); 
						}
						else if (tipoCredito.calculo == "importereciboVencido")
						{
								multas = Number(parseFloat(pago.cargo * (tipoCredito.importe / 100)).toFixed(2));
						}	
						else if (tipoCredito.calculo == "saldoreciboVencido")
						{	
								multas = Number(parseFloat(pago.importeRegular * (tipoCredito.importe / 100)).toFixed(2)); 
						}
						
												
						var multa = {
							semana							: mfecha.isoWeek(),
							fechaLimite					: pago.fechaLimite,
							diaSemana						: mfecha.weekday(),
							tipoPlan						: pago.tipoPlan,
							tipoCredito					: "creditoP",
							numeroPago					: pago.numeroPago,
							importeRegular			: multas,
							cliente_id					: pago.cliente_id,
							fechaPago						: undefined,
							semanaPago					: undefined,
							diaPago							: undefined,
							iva					  			: 0,
							interes 						: 0,
							seguro							: 0,
							capital 						: 0,
							pago				  			: 0,
							estatus							: 0,
							multada							: 0,
							multa 							: 0,
							multa_id						: undefined,
							planPago_id					: pago._id,
							tiempoPago					: 0,
							modificada					: false,
							pagos 							: [],
							descripcion					: "Cargo Moratorio",
							ultimaModificacion	: ahora,
							credito_id 					: credito._id,
							mes									: mfecha.get('month') + 1,
							anio								: mfecha.get('year'),
							cargo								: multas,
							movimiento					: "Cargo Moratorio",
							tipoCargoMoratorio	: 1 //Automatica
						};
						
						var multa_id = PlanPagos.insert(multa);
						PlanPagos.update({_id:pago._id},{$set:{multada:1,multa_id:multa_id}})
						
						
						credito.saldoMultas += multas;
						credito.saldoMultas = Number(parseFloat(credito.saldoMultas).toFixed(2));
						//credito.saldoMultas = Math.round(credito.saldoMultas * 100) / 100;
						Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}});
				}

			}catch(e){
				console.log(e);
				console.log(e.stack);
			}
		});

	},
	
	generarMultasVales:function(){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		
		//Revisar cuales son las fechas a Consultar
		
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{estatus:0},
														{estatus:2}
													]
											},
											{
												multada					: 0,
												descripcion 		: "Recibo",
												tipoCredito			: "vale",
												importeRegular 	: {$gte : 0 },
												fechaLimite 		: { $lt : ahora }												
											}
										]}).fetch();
		
		//console.log("PGO Vales: ",pagos);
											
		_.each(pagos, function(pago){
			try{
				
				var fecha1 = moment(ahora);
				var fecha2 = moment(pago.fechaLimite);

				//console.log(fecha1.diff(fecha2, 'days'), ' dias de diferencia');
				
				var dias = fecha1.diff(fecha2, 'days');
				//console.log(dias);

				if (dias > 8)
				{
					
						var credito = Creditos.findOne(pago.credito_id);
						if (pago.descripcion == "Recibo" && pago.multada != 1)
						{															
								var mfecha = moment(ahora);
								limite = new Date (pago.fechaLimite.getFullYear(),pago.fechaLimite.getMonth(),pago.fechaLimite.getDate());
								var dias = mfecha.diff(limite, "days");
			
								var multas = 0;
			
								//Define la Multa
								var credito = Creditos.findOne(pago.credito_id);
								var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
								
								//saldoreciboVencido
								var reciboVencido = PlanPagos.findOne({_id : pago._id});
								porcentaje = 1;
								multas = Number(parseFloat(reciboVencido.importeRegular * (porcentaje / 100)).toFixed(2)); 
																	
								/*
if (tipoCredito.calculo == "importeSolicitado")
								{
										multas = Number(parseFloat(credito.capitalSolicitado * (tipoCredito.importe / 100)).toFixed(2)); 
										//multas = Math.round(multas * 100) / 100;
												
								}
								else if (tipoCredito.calculo == "importereciboVencido")
								{
										var reciboVencido = PlanPagos.findOne({_id : pago._id});
										
										var porcentaje;
										if (credito.periodoPago == "Semanal")
												porcentaje = 2;
										else if (credito.periodoPago == "Quincenal")
												porcentaje = 4;
										else if (credito.periodoPago == "Mensual")				
												porcentaje = 8;
												
										multas = Number(parseFloat(reciboVencido.cargo * (porcentaje / 100)).toFixed(2)); 
										//multas = Math.round(multas * 100) / 100;
									
								}	
								else if (tipoCredito.calculo == "saldoreciboVencido")
								{	
													
										var reciboVencido = PlanPagos.findOne({_id : pago._id});
								
										var porcentaje;
										if (credito.periodoPago == "Semanal")
												porcentaje = 2;
										else if (credito.periodoPago == "Quincenal")
												porcentaje = 4;
										else if (credito.periodoPago == "Mensual")				
												porcentaje = 8;
												
										multas = Number(parseFloat(reciboVencido.importeRegular * (porcentaje / 100)).toFixed(2)); 
										//multas = Math.round(multas * 100) / 100;
										
								}
*/
														
								var multa = {
									semana							: mfecha.isoWeek(),
									fechaLimite					: pago.fechaLimite,
									diaSemana						: mfecha.weekday(),
									tipoPlan						: pago.tipoPlan,
									tipoCredito					: "vale",
									numeroPago					: pago.numeroPago,
									importeRegular			: multas,
									cliente_id					: pago.cliente_id,
									fechaPago						: undefined,
									semanaPago					: undefined,
									diaPago							: undefined,
									iva					  			: 0,
									interes 						: 0,
									seguro							: 0,
									capital 						: 0,
									pago				  			: 0,
									estatus							: 0,
									multada							: 0,
									multa 							: 0,
									multa_id						: undefined,
									planPago_id					: pago._id,
									tiempoPago					: 0,
									modificada					: false,
									pagos 							: [],
									descripcion					: "Cargo Moratorio",
									ultimaModificacion	: ahora,
									credito_id 					: credito._id,
									mes									: mfecha.get('month') + 1,
									anio								: mfecha.get('year'),
									cargo								: multas,
									movimiento					: "Cargo Moratorio",
									tipoCargoMoratorio	: 1, //Automatica,
									beneficiario_id			: pago.beneficiario_id
								};
								
								var multa_id = PlanPagos.insert(multa);
								PlanPagos.update({_id:pago._id},{$set:{multada:1,multa_id:multa_id}})
								
								
								credito.saldoMultas += multas;
								
								credito.saldoMultas = Number(parseFloat(credito.saldoMultas).toFixed(2));
								//credito.saldoMultas = Math.round(credito.saldoMultas * 100) / 100;
								Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
		
						}
						
				
				}

			}catch(e){
				console.log(e);
				console.log(e.stack);
			}
		});

	},
	
	
	actualizarMultasManual : function(){
			Meteor.call("actualizarMultas");
			//Meteor.call("actualizarMultasVales");
			return true;
	},
	deprecarNotasDeCreditoManual : function(){
			Meteor.call("deprecarNotasDeCredito");
			return true;
	},
	generaMultasManual : function(){
      Meteor.call("generarMultas");
      //Meteor.call("generarMultasVales");    				
			return true;	
	},	
	
	pagoParcialCredito:function(pagos, abono, totalPago, tipoIngresoId, pusuario_id, ocultaMulta, subtotal, cargosMoratorios, total, fechaProximoPago, fechaDeposito, cantidadEntregar)
	{
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var puser = Meteor.users.findOne(pusuario_id);
		var tingreso = TiposIngreso.findOne(tipoIngresoId);
		
		if(!tingreso || !puser || !puser.profile)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		
		if (tingreso.nombre == "Nota de Credito"){
			var resmc = Meteor.call("actualizarNotaDeCredito",pusuario_id, totalPago);
		}
		
		var cajaid = Meteor.user().profile.caja_id;
		var user = Meteor.user();
		var caja = Cajas.findOne(cajaid);

		var sucursal = Sucursales.findOne({_id : Meteor.user().profile.sucursal_id});
		sucursal.folioPago = sucursal.folioPago? sucursal.folioPago+1:1;	
		var folioPago = sucursal.folioPago;

		Sucursales.update({_id:sucursal._id},{$set:{folioPago:sucursal.folioPago}})  

		var ffecha = moment(new Date());
		var pago = {};
		pago.fechaPago = new Date();
		pago.folioPago =folioPago;
		pago.usuario_id = pusuario_id;
		pago.sucursalPago_id = Meteor.user().profile.sucursal_id;
		pago.usuarioCobro_id = Meteor.userId();
		pago.tipoIngreso_id = tipoIngresoId;
		pago.pago = abono;
		pago.totalPago = totalPago;
		pago.cambio = abono - totalPago;
		pago.cambio = pago.cambio < 0 ? 0: Number(parseFloat(pago.cambio).toFixed(2));
		pago.diaPago = ffecha.weekday();
		pago.semanaPago = ffecha.isoWeek();
		pago.mesPago = ahora.getMonth();
		pago.estatus = 1;
		pago.fechaDeposito = fechaDeposito;
		pago.cantidadEntregar = cantidadEntregar;
				
		
		pago.saldoAnterior = Number(parseFloat(total).toFixed(2));
		pago.saldoActual	 = Number(parseFloat(total - totalPago).toFixed(2));
		if (ocultaMulta)
			 pago.saldoCargoMoratorio = 0;
		else
			 pago.saldoCargoMoratorio = Number(parseFloat(cargosMoratorios).toFixed(2));	 
		
		pago.liquidacion = Number(parseFloat(total).toFixed(2));;
		
		pago.proximoPago = fechaProximoPago;	 
		
		
		//pago.credito_id = credito_id;
		pago.planPagos=[];
	
		var pago_id = undefined;
		pago_id = Pagos.insert(pago);

		var idCreditos = [];
		var idpagos = [];
		var pagosId = {};
		
		_.each(pagos,function (p) {
				idpagos.push(p.id);
				pagosId[p.id] = p.importe;
		})
		
		var pagos = PlanPagos.find({_id:{$in:idpagos}},{sort:{descripcion:1}}).fetch();
		
		var mfecha = moment(ahora);
		
		_.each(pagos,function(p){
			p.tipoIngreso_id = tipoIngresoId;
						
			if(p.estatus != 1)
			{
				var ttpago = 0;
				//console.log(p.importeRegular,abono)
				var residuos 	= {pagoSeguro	:0,
												 pagoInteres:0,
												 pagoIva		:0,
												 pagoCapital:0};
												 
				var abonos	 	= {pagoSeguro	:0,
												 pagoInteres:0,
												 pagoIva		:0,
												 pagoCapital:0};								 
				
				//el pago que se ha hecho
				p.pagoInteres = p.pagoInteres? 	p.pagoInteres	:0;
				p.pagoIva 		= p.pagoIva? 		 	p.pagoIva			:0;
				p.pagoCapital = p.pagoCapital? 	p.pagoCapital	:0;
				p.pagoSeguro 	= p.pagoSeguro? 	p.pagoSeguro	:0; 
								
				if(p.importeRegular <= pagosId[p._id])
				{
					
					//console.log("Total",p._id,p.descripcion, p.importeRegular)
					
					residuos.pagoSeguro 	= Number((parseFloat(p.seguro).toFixed(2) - parseFloat(p.pagoSeguro).toFixed(2)).toFixed(2));
				  residuos.pagoInteres  = Number((parseFloat(p.interes).toFixed(2) -parseFloat(p.pagoInteres).toFixed(2)).toFixed(2));
				  residuos.pagoIva 		  = Number((parseFloat(p.iva).toFixed(2) - parseFloat(p.pagoIva).toFixed(2)).toFixed(2));
				  residuos.pagoCapital  = Number((parseFloat(p.capital).toFixed(2) - parseFloat(p.pagoCapital).toFixed(2)).toFixed(2));
					
					if (p.descripcion == "Cargo Moratorio" && p.multa == 1)
						 p.estatus = 1;
					else if(p.multada == 1)
					{
						var multa = PlanPagos.findOne(p.multa_id);

						multa.multa = 1;
						p.estatus = 1;
						if (multa.importeRegular == 0)
							 multa.estatus = 1;
		
						delete multa._id;
						PlanPagos.update({_id:p.multa_id},{$set:multa});
						
					}					
					
					if (p.descripcion == "Recibo"){
						 p.estatus 					  = 1;
						 abonos.pagoSeguro 	  = residuos.pagoSeguro;
						 abonos.pagoInteres 	= residuos.pagoInteres;
						 abonos.pagoIva 			= residuos.pagoIva;
						 abonos.pagoCapital 	= residuos.pagoCapital;
						 
						 p.pagoSeguro 				= p.seguro;
						 p.pagoInteres 				= p.interes;
						 p.pagoIva 						= p.iva;
						 p.pagoCapital 				= p.capital;
						 	 
					}
					
					abono -= p.importeRegular;
					abono = Number(parseFloat(abono).toFixed(2));
					//abono = Math.round(abono * 100) / 100;

					//Decrementar el pago en el Saldo Actual Pago total
					if (p.descripcion == "Recibo")
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoActual -= Number(parseFloat(p.importeRegular).toFixed(2));
							Creditos.update({_id:credito._id},{$set:{saldoActual:credito.saldoActual}})
					}
					else //Cargo Moratorio
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoMultas -= Number(parseFloat(p.importeRegular).toFixed(2));
							Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
					}

					ttpago = p.importeRegular;
					p.pago += Number(parseFloat(p.importeRegular).toFixed(2));
					//p.pago = Math.round(p.pago * 100) / 100;
					p.importeRegular = 0;
					
				}	
				else
				{
					//console.log("parcial",p._id,p.descripcion, p.importeRegular)
					
				  residuos.pagoSeguro 	= Number((parseFloat(p.seguro).toFixed(2) - parseFloat(p.pagoSeguro).toFixed(2)).toFixed(2));
				  residuos.pagoInteres  = Number((parseFloat(p.interes).toFixed(2) -parseFloat(p.pagoInteres).toFixed(2)).toFixed(2));
				  residuos.pagoIva 		  = Number((parseFloat(p.iva).toFixed(2) - parseFloat(p.pagoIva).toFixed(2)).toFixed(2));
				  residuos.pagoCapital  = Number((parseFloat(p.capital).toFixed(2) - parseFloat(p.pagoCapital).toFixed(2)).toFixed(2));
						
										
					ttpago = pagosId[p._id];
					abono  = pagosId[p._id];
															
					p.importeRegular = p.importeRegular - abono;
					p.importeRegular = Number(parseFloat(p.importeRegular).toFixed(2));
					//p.importeRegular = Math.round(p.importeRegular * 100) / 100;
	
					p.pago += abono;
					p.pago = Number(parseFloat(p.pago).toFixed(2));
					//p.pago = Math.round(p.pago * 100) / 100;
					
					//Decrementar el pago en el Saldo Actual Pago Parcial
					if (p.descripcion == "Recibo")
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoActual -= abono;
							credito.saldoActual = parseFloat(credito.saldoActual).toFixed(2);
							credito.saldoActual = Math.round(credito.saldoActual * 100) / 100;
							Creditos.update({_id:credito._id},{$set:{saldoActual:credito.saldoActual}})
					}
					else //Cargo Moratorio
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoMultas -= p.importeRegular;
							credito.saldoMultas = parseFloat(credito.saldoMultas).toFixed(2);
							credito.saldoMultas = Math.round(credito.saldoMultas * 100) / 100;
							Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
					}
					
					p.estatus = 2;
					
					//Seguro					
					if (abono > 0 && residuos.pagoSeguro > abono){
						p.pagoSeguro += Number(abono);
					  p.pagoSeguro = Number(parseFloat(p.pagoSeguro).toFixed(2));
					  abonos.pagoSeguro = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if(abono > 0 && residuos.pagoSeguro > 0){
						p.pagoSeguro = Number(parseFloat(p.seguro).toFixed(2));
						abonos.pagoSeguro = Number(parseFloat(residuos.pagoSeguro).toFixed(2));
						abono -= Number(abono.pagoSeguro);
						abono = Number(parseFloat(abono).toFixed(2));	
					}
					
					//IVA					
					if(abono > 0 && residuos.pagoIva > abono){
						p.pagoIva += Number(abono);
						p.pagoIva = Number(parseFloat(p.pagoIva).toFixed(2));
						abonos.pagoIva = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if(abono > 0 && residuos.pagoIva > 0){
						p.pagoIva = Number(parseFloat(p.iva).toFixed(2));
						abonos.pagoIva = Number(parseFloat(residuos.pagoIva).toFixed(2));
						abono -= Number(residuos.pagoIva);
						abono = Number(parseFloat(abono).toFixed(2));
					}
					
					//Interes
					/*
if(((p.interes - p.pagoInteres) + (p.iva - p.pagoIva)) > abono){
						console.log("tres");
						p.pagoInteres += abono / 1.16;
						p.pagoInteres = parseFloat(p.pagoInteres).toFixed(2);
						p.pagoIva += abono - (abono / 1.16);
						p.pagoIva = parseFloat(p.pagoIva).toFixed(2);
						residuos.pagoInteres = abono / 1.16;
						residuos.pagoInteres = parseFloat(residuos.pagoInteres).toFixed(2);
						residuos.pagoIva = abono - (abono / 1.16);
						residuos.pagoIva = parseFloat(residuos.pagoIva).toFixed(2);
						abono = 0;
					}
					else if( ((p.interes - p.pagoInteres) + (p.iva - p.pagoIva)) > 0){
						console.log("cuatro");
						abono = abono - ((p.interes - p.pagoInteres) + (p.iva - p.pagoIva));
						abono = parseFloat(abono).toFixed(2);
						residuos.pagoInteres = (p.interes - p.pagoInteres);
						residuos.pagoInteres = parseFloat(residuos.pagoInteres).toFixed(2);						
						residuos.pagoIva = (p.iva - p.pagoIva);
						residuos.pagoIva = parseFloat(residuos.pagoIva).toFixed(2);
						p.pagoInteres = p.interes;
						p.iva = p.iva;
					}
*/ //Como estaba
					if(abono > 0 && residuos.pagoInteres > abono){
						p.pagoInteres += Number(abono);
						p.pagoInteres = Number(parseFloat(p.pagoInteres).toFixed(2));
						abonos.pagoInteres = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if(abono > 0 && residuos.pagoInteres > 0){
						p.pagoInteres = Number(parseFloat(p.interes).toFixed(2));
						abonos.pagoInteres = Number(parseFloat(residuos.pagoInteres).toFixed(2));
						abono -= Number(residuos.pagoInteres);
						abono = Number(parseFloat(abono).toFixed(2));
					}
					//Capital
					if (abono > 0 && residuos.pagoCapital > abono){
						p.pagoCapital += Number(abono);
						p.pagoCapital = Number(parseFloat(p.pagoCapital).toFixed(2));
						abonos.pagoCapital = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if (abono > 0 && residuos.pagoCapital > 0){
						p.pagoCapital = Number(parseFloat(p.capital).toFixed(2));
						abonos.pagoCapital = Number(parseFloat(residuos.pagoCapital).toFixed(2));
						abono -= Number(residuos.pagoCapital);
						abono = Number(parseFloat(abono).toFixed(2));
					}
										
					abono = 0;
					
				}
				
				pago.credito_id 			= p.credito_id;
				p.modificada 					= 1;
				p.ultimaModificacion 	= ahora;
				p.fechaPago 					= ahora;
				semanaPago 						= mfecha.isoWeek();
				diaPago								= mfecha.weekday();
				
				credit = Creditos.findOne(pago.credito_id);

				var npp = { pago_id		 		: pago_id,
										totalPago	 		: ttpago,
										estatus		 		: p.estatus,
										fechaPago  		: pago.fechaPago, 
										fechaDeposito : fechaDeposito,
										numeroPago 		: p.numeroPago,
										numeroPagos		: credit.numeroPagos,
										movimiento		: p.movimiento,
										cargo					: p.importe,
										planPago_id		: p._id,
										pagoCapital 	: abonos.pagoCapital, 
										pagoInteres		: abonos.pagoInteres,
										pagoIva 			: abonos.pagoIva, 
										pagoSeguro 		: abonos.pagoSeguro, 
										usuario_id		: pusuario_id};

				p.pagos.push(npp);
				
				
				var npago= { planPago_id	: p._id,
										 totalPago		: ttpago,
										 estatus			: p.estatus, 
										 descripcion	: p.descripcion,
										 fechaPago		: pago.fechaPago, 
										 fechaDeposito: fechaDeposito,
										 numeroPago 	: p.numeroPago,
										 numeroPagos	: credit.numeroPagos,
										 folioCredito	: credit.folio,
										 pagoCapital 	: abonos.pagoCapital, 
										 pagoInteres	: abonos.pagoInteres,
										 pagoIva 		  : abonos.pagoIva, 
										 pagoSeguro 	: abonos.pagoSeguro,
										 usuario_id		: pusuario_id};
				
				pago.planPagos.push(npago); 


				var pid = p._id;
				delete p._id;
				
				PlanPagos.update({_id:pid},{$set:p})
				
			}
			idCreditos.push(pago.credito_id);
		});
		
		//Actualizar el Credito SaldoActual
		
		idCreditos = _.uniq(idCreditos);
		
		//Revisar que se hayan pagado todos lo pagos para cambiar el estatus del credito
		_.each(idCreditos,function(c){
			
				var pp = PlanPagos.find({credito_id: c}).fetch();
				//console.log("pp:", pp);
				
				var ban = true;
				var banR = true;
				var banCM = true;
				var numeroCargosMoratorios = 0;
				_.each(pp,function(p){
						if (p.importeRegular > 0)
								ban = false;							
					
						if (p.importeRegular > 0 && p.descripcion == "Recibo")
								banR = false;							
						
						if (p.importeRegular > 0 && p.descripcion == "Cargo Moratorio")
								banCM = false;
								
						if (p.descripcion == "Cargo Moratorio")
								numeroCargosMoratorios += 1;
				});			
				
				
				if (ban)
				{
						var fecha = new Date();
						Creditos.update({_id : c},{$set : {estatus : 5 , fechaLiquidacion : fecha, saldoActual: 0, saldoMultas: 0}});
						
						if (numeroCargosMoratorios == 0)
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "TIENE UN INCREMENTO DE 500 A 1500 PESOS",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios >= 1 && numeroCargosMoratorios <= 2 )
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "TIENE UN INCREMENTO DE 500 HASTA DE 1000 PESOS",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios == 3)
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "TIENE UN INCREMENTO DE 500 PESOS",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios >= 4 && numeroCargosMoratorios <= 5 )
						{ 
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "PERMANECE LA MISMA LINEA DE CRÉDITO",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios >= 6)
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "SE LE REDUCE LA LINEA DE CREDITO EN UN 10%",
								 											 estatus					: 1
							 												})
						}
				}
				if (banR)
				{
						var fecha = new Date();
						Creditos.update({_id : c},{$set : {saldoActual: 0}})
				}
				if (banCM)
				{
						var fecha = new Date();
						Creditos.update({_id : c},{$set : {saldoMultas: 0}})
				}
				
		});
				

		var movimiento = {
				tipoMovimiento : "Pago",
				origen : "Pago de Cliente",
				origen_id : pago_id,
				monto : pago.totalPago,
				cuenta_id : tipoIngresoId,
				caja_id : caja._id,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
		var movimientoid = MovimientosCajas.insert(movimiento);
		delete pago._id;
		pago.caja_id =caja._id;
		pago.movimientoCaja_id = movimientoid;
		Pagos.update({_id:pago_id},{$set:pago})
		caja.cuenta[movimiento.cuenta_id].saldo = caja.cuenta[movimiento.cuenta_id].saldo? caja.cuenta[movimiento.cuenta_id].saldo+movimiento.monto:movimiento.monto;
		Cajas.update({_id:caja._id},{$set:{cuenta:caja.cuenta}}); 
		return pago_id;

	},
	pagoParcialVale:function(pagos, abono, bonificacion, seguro, totalPago, tipoIngresoId, pusuario_id, ocultaMulta, subtotal, cargosMoratorios, total, fechaProximoPago, fechaDeposito)
	{
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var puser = Meteor.users.findOne(pusuario_id);
		var tingreso = TiposIngreso.findOne(tipoIngresoId);
		
		if(!tingreso || !puser || !puser.profile)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		
		if (tingreso.nombre == "Nota de Credito"){
			var resmc = Meteor.call("actualizarNotaDeCredito",pusuario_id, totalPago);
		}
		
		var cajaid = Meteor.user().profile.caja_id;
		var user = Meteor.user();
		var caja = Cajas.findOne(cajaid);

		var sucursal = Sucursales.findOne({_id : Meteor.user().profile.sucursal_id});
		sucursal.folioPago = sucursal.folioPago? sucursal.folioPago+1:1;	
		var folioPago = sucursal.folioPago;

		Sucursales.update({_id:sucursal._id},{$set:{folioPago:sucursal.folioPago}})  

		var ffecha = moment(new Date());
		var pago = {};
		pago.fechaPago = new Date();
		pago.folioPago =folioPago;
		pago.usuario_id = pusuario_id;
		pago.sucursalPago_id = Meteor.user().profile.sucursal_id;
		pago.usuarioCobro_id = Meteor.userId();
		pago.tipoIngreso_id = tipoIngresoId;
		pago.pago = abono;
		pago.total = Number(parseFloat(totalPago).toFixed(2));
		pago.totalPago = Number(parseFloat(totalPago - bonificacion + cargosMoratorios + seguro).toFixed(2));
		pago.bonificacion = bonificacion;
		pago.seguro = seguro;
		pago.cambio = abono - (totalPago - bonificacion);
		pago.cambio = pago.cambio < 0 ? 0: Number(parseFloat(pago.cambio).toFixed(2));
		pago.diaPago = ffecha.weekday();
		pago.semanaPago = ffecha.isoWeek();
		pago.mesPago = ahora.getMonth();
		pago.estatus = 1;
		pago.fechaDeposito = fechaDeposito;
		
		//Guardar Pago de Seguro 
		
		if (seguro > 0)
		{
				var fecha = new Date();
		
				var mes 	= fecha.getMonth() + 1;
				var dia 	= fecha.getDate();
				var anio 	= fecha.getFullYear();
				var quincena = 0;
				
				if (dia <= 15)
						quincena = mes * 2 - 1;
				else
						quincena = mes * 2;		
						
				PagosSeguro.insert({distribuidor_id: pusuario_id, anio: anio, quincena: quincena, seguro: seguro});
		}
		
		//----------------------
				
		//corregir---*********
		pago.saldoAnterior = Number(parseFloat(total).toFixed(2));
		pago.saldoActual	 = Number(parseFloat(total - totalPago).toFixed(2));
		
		if (ocultaMulta)
			 pago.saldoCargoMoratorio = 0;
		else
			 pago.saldoCargoMoratorio = Number(parseFloat(cargosMoratorios).toFixed(2));	 
		
		pago.liquidacion = Number(parseFloat(total).toFixed(2));;
		
		//Corregir---*********
		pago.proximoPago = fechaProximoPago;	 
		
		//pago.credito_id = credito_id;
		pago.planPagos=[];
	
		//insercción del Pago
		var pago_id = undefined;
		pago_id = Pagos.insert(pago);
		
		var idCreditos 				= [];
		var idpagos 					= [];
		var bonificacionesId 	= {};
		var pagosId 					= {};
		var sumaCapital 			= 0;
		
		_.each(pagos,function (p) {
				idpagos.push(p.id);
				pagosId[p.id] 					= p.importe;
				bonificacionesId[p.id] 	= p.bonificacion;
		})
		
		var pagos = PlanPagos.find({_id:{$in:idpagos}},{sort:{descripcion:1}}).fetch();
		
		var mfecha = moment(ahora);
		
		_.each(pagos,function(p){
			
			p.tipoIngreso_id = tipoIngresoId;
			
			if(p.estatus != 1)
			{
				var ttpago = 0;

				var residuos 	= {pagoSeguro	:0,
												 pagoInteres:0,
												 pagoIva		:0,
												 pagoCapital:0};
												 
				var abonos	 	= {pagoSeguro	:0,
												 pagoInteres:0,
												 pagoIva		:0,
												 pagoCapital:0};								 
				
				//el pago que se ha hecho
				p.pagoInteres = p.pagoInteres? 	p.pagoInteres	:0;
				p.pagoIva 		= p.pagoIva? 		 	p.pagoIva			:0;
				p.pagoCapital = p.pagoCapital? 	p.pagoCapital	:0;
				p.pagoSeguro 	= p.pagoSeguro? 	p.pagoSeguro	:0; 
								
				if(p.importeRegular <= pagosId[p._id])
				{
					
					residuos.pagoSeguro 	= Number((parseFloat(p.seguro).toFixed(2) - parseFloat(p.pagoSeguro).toFixed(2)).toFixed(2));
				  residuos.pagoInteres  = Number((parseFloat(p.interes).toFixed(2) -parseFloat(p.pagoInteres).toFixed(2)).toFixed(2));
				  residuos.pagoIva 		  = Number((parseFloat(p.iva).toFixed(2) - parseFloat(p.pagoIva).toFixed(2)).toFixed(2));
				  residuos.pagoCapital  = Number((parseFloat(p.capital).toFixed(2) - parseFloat(p.pagoCapital).toFixed(2)).toFixed(2));
					
					if (p.descripcion == "Cargo Moratorio" && p.multa == 1)
						 p.estatus = 1;
					else if(p.multada == 1)
					{
						var multa = PlanPagos.findOne(p.multa_id);
						multa.multa = 1;
						p.estatus = 1;
						if (multa.importeRegular == 0)
							 multa.estatus = 1;
		
						delete multa._id;
						PlanPagos.update({_id:p.multa_id},{$set:multa});
					}					
					
					if (p.descripcion == "Recibo"){
						 p.estatus 					  = 1;
						 abonos.pagoSeguro 	  = residuos.pagoSeguro;
						 abonos.pagoInteres 	= residuos.pagoInteres;
						 abonos.pagoIva 			= residuos.pagoIva;
						 abonos.pagoCapital 	= residuos.pagoCapital;
						 
						 p.pagoSeguro 				= p.seguro;
						 p.pagoInteres 				= p.interes;
						 p.pagoIva 						= p.iva;
						 p.pagoCapital 				= p.capital;
						 
						 p.bonificacion				= bonificacionesId[p._id];
						 	 
					}
					
					abono -= p.importeRegular;
					abono = Number(parseFloat(abono).toFixed(2));

					//Decrementar el pago en el Saldo Actual Pago total
					if (p.descripcion == "Recibo")
					{
							var credito 				= Creditos.findOne(p.credito_id);
							credito.saldoActual -= Number(parseFloat(p.importeRegular).toFixed(2));
							Creditos.update({_id:credito._id},{$set:{saldoActual:credito.saldoActual}})
							
							
							//Actualizar saldo Beneficiario--------
					
							var beneficiario 					= Beneficiarios.findOne(credito.beneficiario_id);		
							saldoBeneficiario 				= beneficiario.saldoActual;
							saldoBeneficiarioVale 		= beneficiario.saldoActualVales;
							
							saldoBeneficiario 				-= Number(parseFloat(p.capital).toFixed(2));
							saldoBeneficiarioVale 		-= Number(parseFloat(p.capital + p.interes + p.iva + p.seguro).toFixed(2));							
							
						  Beneficiarios.update({_id: credito.beneficiario_id}, {$set: {saldoActual : saldoBeneficiario, saldoActualVales: saldoBeneficiarioVale}})
							//--------------------------------------
							
							
							
					}
					else //Cargo Moratorio
					{
							var credito 				= Creditos.findOne(p.credito_id);
							credito.saldoMultas -= Number(parseFloat(p.importeRegular).toFixed(2));
							
							credito.saldoMultas = Number(parseFloat(credito.saldoMultas).toFixed(2));
							Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
							
					}

					ttpago = p.importeRegular;
					p.pago += Number(parseFloat(p.importeRegular).toFixed(2));
					p.importeRegular = 0;
					
					//console.log("Pago Total:", p.capital);
					//console.log("Residuos pcapital:", residuos.pagoCapital);
					sumaCapital += Number(parseFloat(residuos.pagoCapital).toFixed(2));

				}	
				else
				{
					console.log("parcial",p._id,p.descripcion, p.importeRegular)
					
				  residuos.pagoSeguro 	= Number((parseFloat(p.seguro).toFixed(2) - parseFloat(p.pagoSeguro).toFixed(2)).toFixed(2));
				  residuos.pagoInteres  = Number((parseFloat(p.interes).toFixed(2) -parseFloat(p.pagoInteres).toFixed(2)).toFixed(2));
				  residuos.pagoIva 		  = Number((parseFloat(p.iva).toFixed(2) - parseFloat(p.pagoIva).toFixed(2)).toFixed(2));
				  residuos.pagoCapital  = Number((parseFloat(p.capital).toFixed(2) - parseFloat(p.pagoCapital).toFixed(2)).toFixed(2));

					ttpago = pagosId[p._id];
					abono  = pagosId[p._id];
															
					p.importeRegular = p.importeRegular - abono;
					p.importeRegular = Number(parseFloat(p.importeRegular).toFixed(2));
	
					p.pago += abono;
					p.pago = Number(parseFloat(p.pago).toFixed(2));
					
					//Decrementar el pago en el Saldo Actual Pago Parcial
					if (p.descripcion == "Recibo")
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoActual -= abono;
							credito.saldoActual = Number(parseFloat(credito.saldoActual).toFixed(2));
							//credito.saldoActual = Math.round(credito.saldoActual * 100) / 100;
							Creditos.update({_id:credito._id},{$set:{saldoActual:credito.saldoActual}});
							//Actualizar saldo Beneficiario--------
							var beneficiario 					= Beneficiarios.findOne(credito.beneficiario_id);		
							saldoBeneficiario 				= beneficiario.saldoActual;
							saldoBeneficiarioVale 		= beneficiario.saldoActualVales;
							saldoBeneficiarioVale 		-= Number(parseFloat(abono).toFixed(2));
						  //-------------------------------------							
					}
					else //Cargo Moratorio
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoMultas -= p.importeRegular;
							credito.saldoMultas = Number(parseFloat(credito.saldoMultas).toFixed(2));
							//credito.saldoMultas = Math.round(credito.saldoMultas * 100) / 100;
							Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
					}
					
					p.estatus = 2;
					
					//Seguro					
					if (abono > 0 && residuos.pagoSeguro > abono){
						p.pagoSeguro += Number(abono);
					  p.pagoSeguro = Number(parseFloat(p.pagoSeguro).toFixed(2));
					  abonos.pagoSeguro = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if(abono > 0 && residuos.pagoSeguro > 0){
						p.pagoSeguro = Number(parseFloat(p.seguro).toFixed(2));
						abonos.pagoSeguro = Number(parseFloat(residuos.pagoSeguro).toFixed(2));
						abono -= Number(abono.pagoSeguro);
						abono = Number(parseFloat(abono).toFixed(2));	
					}
					
					//IVA					
					if(abono > 0 && residuos.pagoIva > abono){
						p.pagoIva += Number(abono);
						p.pagoIva = Number(parseFloat(p.pagoIva).toFixed(2));
						abonos.pagoIva = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if(abono > 0 && residuos.pagoIva > 0){
						p.pagoIva = Number(parseFloat(p.iva).toFixed(2));
						abonos.pagoIva = Number(parseFloat(residuos.pagoIva).toFixed(2));
						abono -= Number(residuos.pagoIva);
						abono = Number(parseFloat(abono).toFixed(2));
					}
					
					//Interes					
					if(abono > 0 && residuos.pagoInteres > abono){
						p.pagoInteres += Number(abono);
						p.pagoInteres = Number(parseFloat(p.pagoInteres).toFixed(2));
						abonos.pagoInteres = Number(parseFloat(abono).toFixed(2));
						abono = 0;
					}
					else if(abono > 0 && residuos.pagoInteres > 0){
						p.pagoInteres = Number(parseFloat(p.interes).toFixed(2));
						abonos.pagoInteres = Number(parseFloat(residuos.pagoInteres).toFixed(2));
						abono -= Number(residuos.pagoInteres);
						abono = Number(parseFloat(abono).toFixed(2));
					}
					
					//Capital
					if (abono > 0 && residuos.pagoCapital > abono){
						p.pagoCapital += Number(abono);
						p.pagoCapital = Number(parseFloat(p.pagoCapital).toFixed(2));
						abonos.pagoCapital = Number(parseFloat(abono).toFixed(2));
						if (p.descripcion == "Recibo")
						{
								console.log("parcial:" ,p.pagoCapital);
								console.log("Abono:" ,abono);
								saldoBeneficiario 				-= Number(parseFloat(abono).toFixed(2));
								Beneficiarios.update({_id: credito.beneficiario_id}, {$set: {saldoActual : saldoBeneficiario, saldoActualVales: saldoBeneficiarioVale}})
								//Descontar Distribuidor
						}
						sumaCapital = abono;
					}
					else if (abono > 0 && residuos.pagoCapital > 0){
						p.pagoCapital = Number(parseFloat(p.capital).toFixed(2));
						abonos.pagoCapital = Number(parseFloat(residuos.pagoCapital).toFixed(2));
						abono -= Number(residuos.pagoCapital);
						abono = Number(parseFloat(abono).toFixed(2));
						sumaCapital = abono;
						if (p.descripcion == "Recibo")
						{
								console.log("total:", p.pagoCapital);
								console.log("Abono:" ,abono);
								saldoBeneficiario 				-= Number(parseFloat(abono).toFixed(2));
								Beneficiarios.update({_id: credito.beneficiario_id}, {$set: {saldoActual : saldoBeneficiario, saldoActualVales: saldoBeneficiarioVale}})
								//Descontar Distribuidor
								
						}
						
					}
										
					abono = 0;
					
				}
				
				pago.credito_id 			= p.credito_id;
				p.modificada 					= 1;
				p.ultimaModificacion 	= ahora;
				p.fechaPago 					= ahora;
				semanaPago 						= mfecha.isoWeek();
				diaPago								= mfecha.weekday();
				
				credit = Creditos.findOne(pago.credito_id);
					
				var npp = { pago_id		 		: pago_id,
										totalPago	 		: ttpago,
										bonificacion	: bonificacionesId[p._id],
										fechaLimite		: p.fechaLimite,
										beneficiado		: credit.beneficiario_id,
										estatus		 		: p.estatus,
										fechaPago  		: pago.fechaPago, 
										fechaDeposito : fechaDeposito,
										numeroPago 		: p.numeroPago,
										numeroPagos		: credit.numeroPagos,
										movimiento		: p.movimiento,
										cargo					: p.importe,
										planPago_id		: p._id,
										pagoCapital 	: abonos.pagoCapital, 
										pagoInteres		: abonos.pagoInteres,
										pagoIva 			: abonos.pagoIva, 
										pagoSeguro 		: abonos.pagoSeguro, 
										usuario_id		: pusuario_id};

				p.pagos.push(npp);
				
				
				var npago= { planPago_id	: p._id,
										 totalPago		: ttpago,
										 bonificacion	: bonificacionesId[p._id],
										 fechaLimite	: p.fechaLimite,
										 beneficiado	: credit.beneficiario_id,
										 estatus			: p.estatus, 
										 descripcion	: p.descripcion,
										 fechaPago		: pago.fechaPago, 
										 fechaDeposito: fechaDeposito,
										 numeroPago 	: p.numeroPago,
										 numeroPagos	: credit.numeroPagos,
										 folioCredito	: credit.folio,
										 pagoCapital 	: abonos.pagoCapital, 
										 pagoInteres	: abonos.pagoInteres,
										 pagoIva 		  : abonos.pagoIva, 
										 pagoSeguro 	: abonos.pagoSeguro,
										 usuario_id		: pusuario_id};
				
				pago.planPagos.push(npago); 

				var pid = p._id;
				delete p._id;
				
				PlanPagos.update({_id:pid},{$set:p})
				
			}
			idCreditos.push(pago.credito_id);
		});
		
		//Actualizar el Credito SaldoActual--------------------------------------------------
		idCreditos = _.uniq(idCreditos);
		//Revisar que se hayan pagado todos lo pagos para cambiar el estatus del credito
		_.each(idCreditos,function(c){
				var pp = PlanPagos.find({credito_id: c}).fetch();
				
				var ban = true;
				var banR = true;
				var banCM = true;
				var numeroCargosMoratorios = 0;
				_.each(pp,function(p){
						if (p.importeRegular > 0)
								ban = false;							
					
						if (p.importeRegular > 0 && p.descripcion == "Recibo")
								banR = false;							
						
						if (p.importeRegular > 0 && p.descripcion == "Cargo Moratorio")
								banCM = false;
								
						if (p.descripcion == "Cargo Moratorio")
								numeroCargosMoratorios += 1;

				});			
				
				
				if (ban)
				{
						var fecha = new Date();
						Creditos.update({_id : c},{$set : {estatus : 5 , fechaLiquidacion : fecha, saldoActual: 0, saldoMultas: 0}});
						/*
	
						//Parametrización------------------------------------------------------------------------------------------------
						if (numeroCargosMoratorios == 0)
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "TIENE UN INCREMENTO DE 500 A 1500 PESOS",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios >= 1 && numeroCargosMoratorios <= 2 )
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "TIENE UN INCREMENTO DE 500 HASTA DE 1000 PESOS",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios == 3)
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "TIENE UN INCREMENTO DE 500 PESOS",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios >= 4 && numeroCargosMoratorios <= 5 )
						{ 
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "PERMANECE LA MISMA LINEA DE CRÉDITO",
								 											 estatus					: 1
							 												})
						}
						else if (numeroCargosMoratorios > 6)
						{
							 Parametrizacion.insert({cliente_id 			: pusuario_id,
								 											 credito_id 			: c,
								 											 fechaLiquidacion	: new Date(),
								 											 mensaje					: "SE LE REDUCE LA LINEA DE CREDITO EN UN 10%",
								 											 estatus					: 1
							 												})
						}
						
*/
						//---------------------------------------------------------------------------------------------------------------
				}
				if (banR)
				{
						var fecha = new Date();
						Creditos.update({_id : c},{$set : {saldoActual: 0}})
				}
				if (banCM)
				{
						var fecha = new Date();
						Creditos.update({_id : c},{$set : {saldoMultas: 0}})
				}
				
		});
		//-----------------------------------------------------------------------------------	
		
		//Actualizar Saldo Credito Distribuidor
		//console.log("Suma capital:", sumaCapital);
		
		var dis = Meteor.users.findOne(pusuario_id);
		dis.profile.saldoCredito += Number(parseFloat(sumaCapital).toFixed(2));
		Meteor.users.update({_id: pusuario_id}, {$set: {"profile.saldoCredito": dis.profile.saldoCredito}});
		//-------------------------------------		
		
		var movimiento = {
				tipoMovimiento : "Pago",
				origen : "Pago de Distribuidor",
				origen_id : pago_id,
				monto : pago.totalPago,
				cuenta_id : tipoIngresoId,
				caja_id : caja._id,
				sucursal_id : user.profile.sucursal_id,
				createdAt : new Date(),
				createdBy : user._id,
				updated : false,
				estatus : 1
			}
		var movimientoid = MovimientosCajas.insert(movimiento);
		delete pago._id;
		pago.caja_id =caja._id;
		pago.movimientoCaja_id = movimientoid;
		Pagos.update({_id:pago_id},{$set:pago})
		caja.cuenta[movimiento.cuenta_id].saldo = caja.cuenta[movimiento.cuenta_id].saldo? caja.cuenta[movimiento.cuenta_id].saldo+movimiento.monto:movimiento.monto;
		Cajas.update({_id:caja._id},{$set:{cuenta:caja.cuenta}}); 
		return pago_id;

	},
	pagoOtroSistema :function(pagos, abono, totalPago, tipoIngresoId, pusuario_id, subtotal, cargosMoratorios, total, fechaDeposito)
	{
		
		
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		//var puser = Meteor.users.findOne(pusuario_id);
		var tingreso = TiposIngreso.findOne(tipoIngresoId);
		
		if(!tingreso)
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
		
		
		var cajaid = Meteor.user().profile.caja_id;
		var user = Meteor.user();
		var caja = Cajas.findOne(cajaid);

	  var sucursal = Sucursales.findOne({_id : Meteor.user().profile.sucursal_id});
		sucursal.folioPago = sucursal.folioPago? sucursal.folioPago+1:1;	
		var folioPago = sucursal.folioPago;

		Sucursales.update({_id:sucursal._id},{$set:{folioPago:sucursal.folioPago}})  

		var ffecha = moment(new Date());
		var pago = {};
		pago.fechaPago 						= new Date();
		pago.folioPago 						= folioPago;
		pago.usuario_id 					= pusuario_id;
		pago.sucursalPago_id 			= Meteor.user().profile.sucursal_id;
		pago.usuarioCobro_id 			= Meteor.userId();
		pago.tipoIngreso_id 			= tipoIngresoId;
		pago.pago 								= abono;
		pago.totalPago 						= totalPago;
		pago.cambio 							= abono - totalPago;
		pago.cambio 							= pago.cambio < 0 ? 0: Number(parseFloat(pago.cambio).toFixed(2));
		pago.diaPago 							= ffecha.weekday();
		pago.semanaPago 					= ffecha.isoWeek();
		pago.mesPago 							= ahora.getMonth();
		pago.estatus 							= 1;
		pago.fechaDeposito 				= fechaDeposito;
		pago.cantidadEntregar 		= 0;
				
		
		pago.saldoAnterior 				= 0;
		pago.saldoActual	 				= 0;
		pago.saldoCargoMoratorio 	= 0;
		pago.liquidacion 				 	= 0;
		
		
		var pago_id = "";		
		pago_id = Pagos.insert(pago);		

		pago.planPagos=[];
		
		//Inserto el pago en la colección Pagos
		
		var npago= { planPago_id	: 0,
								 totalPago		: totalPago,
								 estatus			: 1, 
								 descripcion	: "Pago de Sistema",
								 fechaPago		: new Date(), 
								 fechaDeposito: fechaDeposito,
								 numeroPago 	: 0,
								 numeroPagos	: 0,
								 folioCredito	: 0,
								 pagoCapital 	: 0, 
								 pagoInteres	: 0,
								 pagoIva 		  : 0, 
								 pagoSeguro 	: 0,
								 usuario_id		: pusuario_id};

		pago.planPagos.push(npago); 
		
		
		var movimiento = {
				tipoMovimiento 	: "Pago",
				origen 					: "Pago de Sistema",
				origen_id 			: pago_id,
				monto 					: totalPago,
				cuenta_id 			: tipoIngresoId,
				caja_id 				: caja._id,
				sucursal_id 		: user.profile.sucursal_id,
				createdAt 			: new Date(),
				createdBy 			: user._id,
				updated 				: false,
				estatus 				: 1
		}

		var movimientoid = MovimientosCajas.insert(movimiento);
		
		pago.caja_id 						= caja._id;
		pago.movimientoCaja_id 	= movimientoid;
		
	
		delete pago._id;
		pago.caja_id = caja._id;
		pago.movimientoCaja_id = movimientoid;
		Pagos.update({_id:pago_id},{$set: pago})
		
		
		caja.cuenta[movimiento.cuenta_id].saldo = caja.cuenta[movimiento.cuenta_id].saldo? caja.cuenta[movimiento.cuenta_id].saldo+movimiento.monto:movimiento.monto;
		Cajas.update({_id:caja._id},{$set:{cuenta:caja.cuenta}}); 


		return true;

	},
	
	getPago:function(pago_id){
			return Pagos.findOne(pago_id);		
	},
	getPagosByCliente:function(cliente_id){
			return Pagos.findOne(pago_id);		
	},
	getPagosDistribuidor: function(distribuidor_id){
			var pagos = Pagos.find({usuario_id: distribuidor_id}, {sort:{fechaPago:-1}}).fetch();
			_.each(pagos, function(pago){						
					_.each(pago.planPagos, function(pp){
							pp.beneficiario = pp.beneficiado != undefined ? Beneficiarios.findOne(pp.beneficiado).nombreCompleto : "";
					});
			});			
			return pagos;
	},
	cancelarPlanPago : function(credito_id){
    	
    	var planPagos = PlanPagos.find({credito_id: credito_id}).fetch();
    	
    	_.each(planPagos, function(pp){
	    		PlanPagos.update(pp._id, {$set: {estatus: 3}});	
    	})
			
			return true;	
				
	},	
	
	getPlanPagos:function(credito_id){
			return PlanPagos.find({credito_id: credito_id}, {sort:{ numeroPago	: 1, 
																															fechaLimite	: 1, 
																															descripcion	: -1}} ).fetch();		
	},
	
}); 