Meteor.methods({
	generarPlanPagos: function(credito,cliente){

		function clonar( original )  {		    
		    var clone = {} ;
		    for (var key in original )
		        clone[ key ] = original[ key ] ;
		    return clone ;
		}
		var sucursal = Sucursales.findOne({_id : credito.sucursal_id});
		
	
		//console.log(fecha);
		var mfecha = moment(credito.fechaPrimerAbono);
		var inicio = mfecha.toDate();
		//console.log(credito);
		var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
		//console.log(tipoCredito);
		
		var totalPagos = 0;
		
		var seguro;
		
		if (credito.conSeguro)
				seguro = credito.seguro;
		else 
				seguro = 0;		
				
		var numeroPagosCompuesto = 0;
		var tasaInteres = 0;
		
		
		if(credito.periodoPago == "Semanal")
		{
			totalPagos = credito.duracionMeses * 4;
			numeroPagosCompuesto = 4;	
			tasaInteres = (credito.tasa / 4) / 100;
		}	
		else if (credito.periodoPago == "Quincenal")
		{
			totalPagos = credito.duracionMeses * 2;
			numeroPagosCompuesto = 2;
			tasaInteres = (credito.tasa / 2) / 100;
		}	
		else if(credito.periodoPago == "Mensual")
		{
			totalPagos = credito.duracionMeses;
			numeroPagosCompuesto = 1;
			tasaInteres = credito.tasa / 100;
		}	
				
		
		var plan = [];
		
		if (tipoCredito.tipoInteres == "Compuesto" || tipoCredito.tipoInteres == "Simple")
		{
				var importeParcial = 0;
				if (tipoCredito.tipoInteres == "Simple")
				{
						
						//  (((3000*.10)*1.16)*3+3000)/12
						
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
												
				}
				else if(tipoCredito.tipoInteres == "Compuesto")
				{
						
						var FV = 0;
						var pagoFijo = 0;
						var suma = 0;						
						FV = 	parseFloat(credito.capitalSolicitado * Math.pow(1 + tasaInteres, totalPagos)).toFixed(2);
						pagoFijo = parseFloat(FV / totalPagos).toFixed(2);
						var interes = parseFloat(pagoFijo * tasaInteres).toFixed(2);
						var capital = parseFloat((pagoFijo - interes) / 1.16).toFixed(2);
						var iva = parseFloat(capital * 0.16).toFixed(2);
						
/*
						console.log("pagoFijo:", pagoFijo);
						console.log("FV:", FV);
						console.log("Cap:", capital);
						console.log("int:", interes);
						console.log("IVA:", iva);
*/
												
						if (credito.conSeguro)
								importeParcial = parseFloat(capital) + parseFloat(interes) + parseFloat(iva) + parseFloat(seguro);
						else
								importeParcial = parseFloat(capital) + parseFloat(interes) + parseFloat(iva);
						
						importeParcial = Math.round(importeParcial * 100) / 100;
						
//						console.log("importeParcial:", importeParcial);
						
						
				}
			
				if (cliente == undefined){
					 cliente = {}; 
					 cliente._id = "Prospecto";
				}	 
		
				for (var i = 0; i < totalPagos; i++) {
					var pago = {
						semana							: mfecha.isoWeek(),
						fechaLimite					: new Date(new Date(mfecha.toDate().getTime()).setHours(23,59,59)),
						diaSemana						: mfecha.weekday(),
						tipoPlan						: credito.periodoPago,
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
						estatus							: 0,
						multada							: 0,
						multa_id						: undefined,
						planPago_id					: undefined,
						tiempoPago					: 0,
						modificada					: false,
						pagos 							: [],
						descripcion					: "Recibo",
						ultimaModificacion	: new Date(),
						credito_id 					: credito._id,
						mes									: mfecha.get('month') + 1,
						anio								: mfecha.get('year'),
						cargo								: importeParcial,	
						movimiento					: "Recibo",
						//folio 						:  sucursal.folio + 1,
					}

					//Sucursales.update({_id : sucursal._id}, { $set : { folio : credito.folio}});
					
					plan.push(clonar(pago));
					if(credito.periodoPago == "Semanal"){
						mfecha = mfecha.add(7, 'days');
					}
					else if(credito.periodoPago == "Quincenal"){
						mfecha = mfecha.add(15, 'days');	
					}
					else if(credito.periodoPago == "Mensual"){
						var siguienteMes = moment(mfecha).add(1, 'M');
						var finalSiguienteMes = moment(siguienteMes).endOf('month');
						
						if(mfecha.date() != siguienteMes.date() && siguienteMes.isSame(finalSiguienteMes.format('YYYY-MM-DD'))) 
							siguienteMes = siguienteMes.add(1, 'd');
						
						mfecha = siguienteMes;
					}	
				}

				var suma = 0;

				_.each(plan, function(pago){
					//console.log("entra")
					suma += pago.cargo;
					pago.sumatoria  = suma
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

				pagoFijo = parseFloat(((credito.capitalSolicitado * tasaInteres) * Math.pow(1 + tasaInteres, totalPagos) / (Math.pow(1 + tasaInteres, totalPagos) - 1)).toFixed(2));
				var saldoInicial = parseFloat(credito.capitalSolicitado).toFixed(2);
				
				var saldo = 0;
				
				for (var i = 0; i < totalPagos; i++) {
					
					var interes = saldoInicial * tasaInteres;
					interes = parseFloat(interes.toFixed(2));
					
					var iva = interes * 0.16;
					iva = parseFloat(iva.toFixed(2))
					
					var capital = pagoFijo - interes;
					
					if (credito.conSeguro)
								var importeParcial = parseFloat(pagoFijo) + parseFloat(iva.toFixed(2)) + parseFloat(seguro.toFixed(2));
						else
								var importeParcial = parseFloat(pagoFijo) + parseFloat(iva.toFixed(2));
															
					if (cliente == undefined){
					 cliente = {}; 
					 cliente._id = "Prospecto";
					}	 
					
					var pago = {
						semana							: mfecha.isoWeek(),
						fechaLimite					: new Date(new Date(mfecha.toDate().getTime()).setHours(23,59,59)),
						diaSemana						: mfecha.weekday(),
						tipoPlan						: credito.periodoPago,
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
						estatus							: 0,
						multada							: 0,
						multa_id						: undefined,
						planPago_id					: undefined,
						tiempoPago					: 0,
						modificada					: false,
						pagos 							: [],
						descripcion					: "Recibo",
						ultimaModificacion	: new Date(),
						credito_id 					: credito._id,
						mes									: mfecha.get('month') + 1,
						anio								: mfecha.get('year'),
						cargo								: importeParcial,
						movimiento					: "Recibo",
					}
					
					plan.push(clonar(pago));
					if(credito.periodoPago == "Semanal"){
						mfecha = mfecha.add(7, 'days');
					}
					else if(credito.periodoPago == "Quincenal"){
						mfecha = mfecha.add(15, 'days');	
					}
					else if(credito.periodoPago == "Mensual"){
						var siguienteMes = moment(mfecha).add(1, 'M');
						var finalSiguienteMes = moment(siguienteMes).endOf('month');
						
						if(mfecha.date() != siguienteMes.date() && siguienteMes.isSame(finalSiguienteMes.format('YYYY-MM-DD'))) 
							siguienteMes = siguienteMes.add(1, 'd');
						
						mfecha = siguienteMes;
					}	
					
					var capitalPagado = pagoFijo - interes; 
					saldoInicial = saldoInicial - capitalPagado;
					
				}
				var suma = 0;

				_.each(plan, function(pago){
					//console.log("entra")
					suma += pago.cargo;
					pago.sumatoria  = suma
					var array = pago;
					pago.total = val
				});
		
				var val = plan[plan.length - 1].sumatoria;
					_.each(plan, function(pago){
					pago.total = val
				});	
			
		}
		
		
		return plan;
	},
	actualizarMultas: function(){
		Meteor.call("generarMultas");
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
									
				//Define la Multa
				var multas = 0;
				var credito = Creditos.findOne(pago.credito_id);
				var tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
				//console.log("TC :",tipoCredito);
					
				if (tipoCredito.calculo == "importeSolicitado")
				{
						multas = Number(parseFloat(credito.capitalSolicitado * (tipoCredito.importe / 100)).toFixed(2)); 
						multas = Math.round(multas * 100) / 100;
				}
				else if (tipoCredito.calculo == "importereciboVencido")
				{
						var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});
						
						var porcentaje;
						if (credito.periodoPago == "Semanal")
								porcentaje = 2;
						else if (credito.periodoPago == "Quincenal")
								porcentaje = 4;
						else if (credito.periodoPago == "Mensual")				
								porcentaje = 8;
								
						multas = parseFloat(reciboVencido.cargo * (porcentaje / 100)).toFixed(2); 
						multas= Math.round(multas * 100) / 100;
											
				}	
				else if (tipoCredito.calculo == "saldoreciboVencido")
				{	
						
						var reciboVencido = PlanPagos.findOne({_id : pago.planPago_id});						
						
						var porcentaje;
						if (credito.periodoPago == "Semanal")
								porcentaje = 2;
						else if (credito.periodoPago == "Quincenal")
								porcentaje = 4;
						else if (credito.periodoPago == "Mensual")				
								porcentaje = 8;
								
						multas = parseFloat(reciboVencido.importeRegular * (porcentaje / 100)).toFixed(2); 
						multas = Math.round(multas * 100) / 100;
						
				}	
								
				//console.log("Act Multas:", multas);
				//console.log("Antes", pago.importeRegular);
				
				pago.importeRegular = parseFloat(pago.importeRegular) + parseFloat(multas);
				pago.cargo = parseFloat(pago.cargo) + parseFloat(multas);
				
				credito.saldoMultas = parseFloat(credito.saldoMultas) + parseFloat(multas);;
				//credito.saldoMultas = Math.round(credito.saldoMultas * 100) / 100;
				Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})
				
												
				var idTemp = pago._id;
				delete pago._id;	
				PlanPagos.update({_id:idTemp},{$set : pago});	
								
			}catch(e){
				console.log(e)
			}
		});
		
	},
	generarMultas:function(){
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		//ahora.setHours(23,59,59,999);
		//console.log("Fecha:",ahora);
		var pagos = PlanPagos.find({$and:[
											{
												$or:[
														{estatus:0},
														{estatus:2}
													]
											},
											{
												multada		: 0,
												descripcion : "Recibo",
												importeRegular : {$gte : 0 },
												fechaLimite : { $lt : ahora }												
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
								multas = parseFloat(credito.capitalSolicitado * (tipoCredito.importe / 100)).toFixed(2); 
								multas = Math.round(multas * 100) / 100;
										
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
										
								multas = parseFloat(reciboVencido.cargo * (porcentaje / 100)).toFixed(2); 
								multas=Math.round(multas * 100) / 100;
							
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
										
								multas = parseFloat(reciboVencido.importeRegular * (porcentaje / 100)).toFixed(2); 
								multas = Math.round(multas * 100) / 100;
								
						}
						
												
						var multa = {
							semana							: mfecha.isoWeek(),
							fechaLimite					: pago.fechaLimite,
							diaSemana						: mfecha.weekday(),
							tipoPlan						: pago.tipoPlan,
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
						
						credito.saldoMultas = parseFloat(credito.saldoMultas).toFixed(2);
						credito.saldoMultas = Math.round(credito.saldoMultas * 100) / 100;
						Creditos.update({_id:credito._id},{$set:{saldoMultas:credito.saldoMultas}})

				}

			}catch(e){
				console.log(e);
				console.log(e.stack);
			}
		});

	},
	pagoParcialCredito:function(pagos, abono, totalPago, tipoIngresoId, pusuario_id){
		
		var ahora = new Date();
		ahora = new Date (ahora.getFullYear(),ahora.getMonth(),ahora.getDate());
		var puser = Meteor.users.findOne(pusuario_id);
		var tingreso = TiposIngreso.findOne(tipoIngresoId);
		if(!tingreso || !puser || !puser.profile || (tingreso.nombre =="Nota de Credito" && puser.profile.notasCredito.saldo<totalPago))
			throw new Meteor.Error(403, 'Error 500: Error', 'Datos no validos');
				
		if (tingreso.nombre == "Nota de Credito"){
			//console.log (1)
			var resmc = Meteor.call("actualizarNotaDeCredito",pusuario_id, totalPago);
			//console.log(resmc)
			//console.log (2)
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
		pago.cambio = pago.cambio<0? 0:pago.cambio;
		pago.diaPago = ffecha.weekday();
		pago.semanaPago = ffecha.isoWeek();
		pago.semanaPago = ahora.getMonth();
		pago.estatus = 1;
		//pago.credito_id = credito_id;
		pago.planPagos=[];
	
		var pago_id = undefined;
		pago_id = Pagos.insert(pago);

		var idCreditos = [];
		var idpagos = [];
		var pagosId = {};
		
		_.each(pagos,function (p) {
				idpagos.push(p.id);
				pagosId[p.id]=p.importe;
		})
		
		var pagos = PlanPagos.find({_id:{$in:idpagos}},{sort:{descripcion:1}}).fetch();
		
		var mfecha = moment(ahora);
		
		_.each(pagos,function(p){
			p.tipoIngreso_id = tipoIngresoId;
			

			// pago.tipoIngreso = TiposIngreso.findOne(p.tipoIngreso_id)
			// pago.formaPagopago.tipoIngreso.nombre
			
			if(p.estatus != 1)
			{
				var ttpago = 0;
				//console.log(p.importeRegular,abono)
				var residuos 	= {pagoSeguro:0,pagoInteres:0,pagoIva:0,pagoCapital:0};
				p.pagoInteres = p.pagoInteres? p.pagoInteres:0;
				p.pagoIva 		= p.pagoIva? p.pagoIva:0;
				p.pagoCapital = p.pagoCapital? p.pagoCapital:0;
				p.pagoSeguro 	= p.pagoSeguro? p.pagoSeguro:0; 
				
				if(p.importeRegular <= pagosId[p._id])
				{
					//console.log("Total",p._id,p.descripcion, p.importeRegular)
					if(p.descripcion=="Cargo Moratorio" && p.multa == 1)
						 p.estatus = 1;
					else if(p.multada == 1)
					{
						var multa = PlanPagos.findOne(p.multa_id);
						//console.log(multa);
						residuos.pagoInteres = p.interes - p.pagoInteres
						residuos.pagoIva = p.pagoIva -p.pagoIva
						multa.multa = 1;
						p.estatus = 1;
						if(multa.importeRegular == 0)
							multa.estatus = 1;
		
						delete multa._id;
						PlanPagos.update({_id:p.multa_id},{$set:multa});
						
					}
					
					if(p.descripcion=="Recibo"){
						p.estatus=1
						residuos.pagoSeguro 	= p.seguro - p.pagoSeguro;
						residuos.pagoInteres 	= p.interes - p.pagoInteres;
						residuos.pagoIva 			= p.pagoIva - p.pagoIva;
						residuos.pagoCapital 	= p.capital - p.pagoCapital;
						p.pagoInteres 				= p.interes;
						p.pagoIva 						= p.iva;
						p.pagoCapital 				= p.capital;
						p.pagoSeguro 					= p.seguro;
					}
					
					abono -= p.importeRegular;
					abono = parseFloat(abono).toFixed(2);
					abono = Math.round(abono * 100) / 100;

					//Decrementar el pago en el Saldo Actual Pago total
					if (p.descripcion == "Recibo")
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoActual -= p.importeRegular;
							credito.saldoActual = parseFloat(credito.saldoActual).toFixed(2);
							credito.saldoActual=Math.round(credito.saldoActual * 100) / 100;
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

					ttpago = p.importeRegular;
					p.pago += p.importeRegular;
					p.pago=Math.round(p.pago * 100) / 100;
					p.importeRegular = 0;
					
				}	
				else
				{
					
					//console.log("Parcial",p._id,p.descripcion, p.importeRegular)
					ttpago = pagosId[p._id];
					abono = pagosId[p._id]

					
					p.importeRegular = p.importeRegular - abono;
					p.importeRegular =parseFloat(p.importeRegular).toFixed(2);
					p.importeRegular=Math.round(p.importeRegular * 100) / 100;

					p.pago += abono
					p.pago = Math.round(p.pago * 100) / 100;
					
					//Decrementar el pago en el Saldo Actual Pago Parcial
					if (p.descripcion == "Recibo")
					{
							var credito = Creditos.findOne(p.credito_id);
							credito.saldoActual -= abono;
							credito.saldoActual = parseFloat(credito.saldoActual).toFixed(2);
							credito.saldoActual=Math.round(credito.saldoActual * 100) / 100;
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

					if(p.seguro-p.pagoSeguro>abono){
						residuos.pagoSeguro = abono
						p.pagoSeguro+=abono
						abono=0;
					}
					else if(p.seguro-p.pagoSeguro>0){
						abono -= (p.seguro-p.pagoSeguro)
						residuos.pagoSeguro= (p.seguro-p.pagoSeguro)
						p.pagoSeguro = p.seguro
					}
					if(((p.interes-p.pagoInteres) + (p.iva-p.pagoIva))>abono){
						p.pagoInteres += abono / 1.16;
						p.pagoIva += abono - (abono / 1.16)
						residuos.pagoInteres = abono / 1.16;
						residuos.pagoIva = abono - (abono / 1.16)
						abono=0
					}
					else if( ((p.interes-p.pagoInteres) + (p.iva-p.pagoIva))>0){
						abono -= ((p.interes-p.pagoInteres) + (p.iva-p.pagoIva))
						residuos.pagoInteres= (p.interes-p.pagoInteres)
						residuos.pagoIva= (p.iva-p.pagoIva)
						p.pagoInteres = p.interes
						p.iva = p.iva
					}

					if(p.capital-p.pagoCapital>abono){
						residuos.pagoCapital= abono
						p.pagoCapital+=abono
						abono=0;
					}
					else if(p.capital-p.pagoCapital>0){
						abono -= (p.capital-p.pagoCapital)
						residuos.pagoCapital= (p.seguro-p.pagoCapital)
						p.pagoCapital = p.capital
					}

					
					abono=0;
					
				}
				
				pago.credito_id =p.credito_id;
				p.modificada = 1;
				p.ultimaModificacion = ahora;
				p.fechaPago = ahora;
				semanaPago = mfecha.isoWeek();
				diaPago	= mfecha.weekday();

				var npp={pago_id:pago_id,totalPago:ttpago,estatus:p.estatus,fechaPago:pago.fechaPago, 
						 numeroPago : p.numeroPago,movimiento:p.movimiento,cargo:p.importe,planPago_id:p._id,
						 pagoCapital : p.pagoCapital, pagoInteres: p.pagoInteres,
						 pagoIva : p.pagoIva, pagoSeguro : p.pagoSeguro, usuario_id:pusuario_id};

				p.pagos.push(npp);
				credit = Creditos.findOne(pago.credito_id);
				var npago={planPago_id:p._id,totalPago:ttpago,estatus:p.estatus, descripcion:p.descripcion,
						 fechaPago:pago.fechaPago, numeroPago : p.numeroPago,folioCredito:credit.folio,
						 pagoCapital : p.pagoCapital, pagoInteres: p.pagoInteres,
						 pagoIva : p.pagoIva, pagoSeguro : p.pagoSeguro,usuario_id:pusuario_id};
				pago.planPagos.push(npago);

				var pid = p._id;
				delete p._id;
				
				PlanPagos.update({_id:pid},{$set:p})
				
			}
			idCreditos.push(pago.credito_id);
		});
		
		//Actualizar el Credito SaldoActual
		
		//console.log("idCreditos:",idCreditos);
		//Revisar que se hayan pagado todos lo pagos para cambiar el estatus del credito
		_.each(idCreditos,function(c){
				var pp = PlanPagos.find({credito_id: c}).fetch();
				//console.log("pp:", pp);
				var ban = true;
				_.each(pp,function(p){
						if (p.importeRegular > 0)
								ban = false;
				});			
				
				if (ban)
				{
						//console.log("Acualizar Credito");
						Creditos.update({_id : c},{$set : {estatus : 5 }})
				}
				/*
				else
						console.log("Todavia no Acualizar Credito");
				*/
				
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
});