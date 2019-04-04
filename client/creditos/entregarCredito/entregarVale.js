angular.module("creditoMio")
.controller("EntregarValeCtrl", EntregarValeCtrl);
 function EntregarValeCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
 	let rc = $reactive(this).attach($scope);
	window.rc = rc
	
	this.suma =0;
	this.verDiaPago = true;
	rc.seleccinadorContrato = false;
	rc.imprecion = true;
	this.objeto = {};
	this.credito = {};
	
	rc.cliente = {};
	rc.cliente._id = "" ;
	rc.datosCliente = ""
	
	rc.estatusFecha ;
	rc.tipoIngreso = {};
	
	this.subscribe('tiposIngreso',()=>{
		return [{
			estatus : true
		}] 
	});
	this.subscribe('tiposCredito',()=>{
		return [{
			estatus : true
		}]
	});
	this.subscribe('cajas',()=>{
		return [{_id: Meteor.user() != undefined ? Meteor.user().profile.caja_id : ""}]
	});
	this.subscribe('creditos',()=>{
		return [{_id : $stateParams.credito_id}]
	});
	this.subscribe('cuentas',()=>{
		return [{tipoCuenta: {$ne: "Documento"}, estatus : 1}]
	});

	this.validar={};

	this.helpers({
		tiposIngreso : () => {
			var tipos = TiposIngreso.find().fetch();
			var tiposIngresosValidos = [];
			
			_.each(tipos,(tipo)=>{
				var c = Cuentas.findOne({tipoIngreso_id: tipo._id});
				//Unicamente formas de pagos diferentes a documento
				if (c != undefined && c.tipoIngreso_id == tipo._id)
				{
						tiposIngresosValidos.push(tipo);
				}

			});
			
			return tiposIngresosValidos;
		},
		caja : () => {			
			var caj = Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile.caja_id : "");
			var ti = TiposIngreso.find().fetch();
			
			if (caj != undefined && ti != undefined)
			{
								
				_.each(ti,(tipo)=>{
					
					var c = Cuentas.findOne({tipoIngreso_id: tipo._id});
					
					if (c != undefined && c.tipoIngreso_id == tipo._id)
					{
						//console.log(tipo);					
						
/*
						rc.objeto.cuenta = rc.objeto.cuenta? rc.objeto.cuenta :{};
						rc.objeto.cuenta[c._id] 			 = rc.objeto.cuenta[c._id]? rc.objeto.cuenta[c._id] :{};
						rc.objeto.cuenta[c._id].saldo  = Number(parseFloat(c.saldo).toFixed(2));
*/
						
						
						rc.objeto.caja =rc.objeto.caja? rc.objeto.caja :{};
						rc.objeto.caja[tipo._id] = rc.objeto.caja[tipo._id]? rc.objeto.caja[tipo._id] :{};
						rc.objeto.caja[tipo._id].saldo = rc.objeto.caja[tipo._id].saldo? rc.objeto.caja[tipo._id].saldo :0;
						
/*
						rc.objeto.caja = rc.objeto.caja? rc.objeto.caja :{};
						rc.objeto.caja[tipo._id] = rc.objeto.caja[tipo._id]? rc.objeto.caja[tipo._id] :{};
						rc.objeto.caja[tipo._id].saldo = Number(parseFloat(caj.cuenta[tipo._id].saldo).toFixed(2));
*/
					}		
					
				});
			}
			
			return Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile.caja_id : "");
		},
		cuentas : () => {
			var cuentas = Cuentas.find().fetch();
			return cuentas;
		},
		credito : () => {
			var c = Creditos.findOne({_id:$stateParams.credito_id}); 
			//console.log(c,"credito")

			if (c != undefined)
			{		
					
					var usuario = Meteor.users.findOne(Meteor.userId());
		
					if (usuario.roles[0] == "Cajero")
							rc.estatusFecha = true;
					else	
							rc.estatusFecha = false;
					
					rc.cliente._id = c.cliente_id;
					if (c.folio)
						  this.verDiaPago = false;

					var fecha = new Date();
					var n = fecha.getDate();
										
					if (n >= 5 && n < 20)
					{
							rc.objeto.primerAbono = new Date(fecha.getFullYear(),fecha.getMonth()  + 1,1,0,0,0,0);
					}
					else 
					{
							
							if (n < 5 )
									rc.objeto.primerAbono = new Date(fecha.getFullYear(),fecha.getMonth(),16,0,0,0,0);
							else if (n >= 20)
							   	rc.objeto.primerAbono = new Date(fecha.getFullYear(),fecha.getMonth() + 1,16,0,0,0,0);								
					}
					
					
					Meteor.call('getBeneficiario', c.beneficiario_id, function(error, result) {           
				          if (result)
				          {
				          		c.beneficiario = result;
				          		$scope.$apply();
									}
				  });
				  
				  Meteor.call('getUsuarioId', c.cliente_id, function(error, result) {           
				          if (result)
				          {
				          		c.distribuidor = result;
				          		$scope.$apply();
									}
				  });
					
					
			}	
		
			return c
		}
	});

	this.calcular = function(){
				
		if(!this.objeto)
			return 0;
			
		rc.suma = 0;
	/*
	_.each(this.objeto.cuenta,function(cuenta){ 
			if(cuenta && cuenta.saldo && cuenta.saldo>0)
				rc.suma += cuenta.saldo;
		})
*/
		_.each(this.objeto.caja,function(caja){ 
			if(caja && caja.saldo && caja.saldo>0)
				rc.suma += caja.saldo;
		})

	}

	this.guardar = function (){
			
			$( "#entregar" ).prop( "disabled", true );
			
			/*
if(this.validar.contrato!=true || this.validar.ficha!=true || this.validar.pagare!=true || this.validar.tabla!=true)
			{
					toastr.error('Es obligatorio verificar los documentos.');
					return
			}
*/
			
			if (rc.tipoIngreso._id == undefined){
				toastr.error('Seleccione una forma de pago');
				$( "#entregar" ).prop( "disabled", false );
				return;
			}
			
			//Validar que no sea Nota de Credito ni refinanciamiento
			var ti = TiposIngreso.findOne(rc.tipoIngreso._id);
			if (ti.nombre == "Nota de Credito" || ti.nombre == "REFINANCIAMIENTO")
			{
					toastr.error('Error No se puede entregar un crédito con esta forma de pago.');
					return;
			}			
			
			if (rc.credito.esRefinanciado == undefined)
			{
					if(form.$invalid || rc.suma != rc.credito.capitalSolicitado){
						toastr.error('Error verifique la cantidad a entregar.');
						$( "#entregar" ).prop( "disabled", false );
						return;
					}	
			}
			else if (rc.credito.esRefinanciado == true)
			{
					if(form.$invalid || rc.suma != (rc.credito.capitalSolicitado - rc.credito.refinanciar)){
						toastr.error('Error verifique la cantidad a entregar.');
						$( "#entregar" ).prop( "disabled", false );
						return;
					}
			}


			
			//Validar que tenga dinero en el tipo de Ingreso	
			var validarSaldoCaja = rc.caja.cuenta[rc.tipoIngreso._id];
			
			if (validarSaldoCaja.saldo < rc.suma)
			{
					toastr.error('Error no tienes saldo en el Fondo asociado a ese tipo de ingreso.');
					rc.objeto.caja[rc.tipoIngreso._id].saldo = 0;
					rc.suma = 0;
					$( "#entregar" ).prop( "disabled", false );
					return;
			}	
			
			
			//Validar que el beneficiario no revase el limite de credito
			//validaLimiteSaldoBeneficiario
			Meteor.call ("validaLimiteSaldoBeneficiarioDistribuidor",rc.credito,function(error,result){
					if (!result.beneficiario)
					{
							toastr.error('El Beneficiario rebasa el límite de crédito.');
							$( "#entregar" ).prop( "disabled", false );
							return;		
					}
					else if (!result.distribuidor)
					{
							toastr.error('El Distribuidor rebasa el límite de crédito.');
							$( "#entregar" ).prop( "disabled", false );
							return;		
					}
					if (result)
					{
						 
						  Meteor.call ("entregarCredito",rc.objeto,$stateParams.credito_id, rc.tipoIngreso._id,function(error,result){
								if(error){
									console.log(error);
									toastr.error('Error al guardar los datos.');
									return
								}
								
								//Imprimir el ticket
								var url = $state.href("anon.ticketEntregaVale", { credito_id: rc.credito._id }, { newTab: true });
								window.open(url, '_blank');
								
								toastr.success('Operacion Realizada.');
								$state.go("root.distribuidoresDetalle",{objeto_id : rc.credito.cliente_id});
								rc.objeto = {}; 
				
								$( "#entregar" ).prop( "disabled", false );
								rc.nuevo = true;
							});
						
					}
					
			});		

			/*
			//Validar que no tenga Cargos Moratorios
Meteor.call ("validarCreditosSaldoEnMultas",rc.credito.cliente_id,function(error,result){
					//console.log("Resultado:", result);
					if (!result)
					{
							toastr.error('El cliente tiene Cargos Moratorios Activos no es posible Entregarle el vale.');
							$( "#entregar" ).prop( "disabled", false );
							return;		
					}
					else if (result)
					{
							//ELIMINAR AQUELLOS QUE NO TIENEN SALDO 0 EN rc.objeto
							
							Meteor.call ("entregarCredito",rc.objeto,$stateParams.credito_id, rc.tipoIngreso._id,function(error,result){
								if(error){
									console.log(error);
									toastr.error('Error al guardar los datos.');
									return
								}
								
								//Imprimir el ticket
								var url = $state.href("anon.ticketEntregaVale", { credito_id: rc.credito._id }, { newTab: true });
								window.open(url, '_blank');
								
								
								toastr.success('Operacion Realizada.');
								$state.go("root.distribuidoresDetalle",{objeto_id : rc.credito.cliente_id});
								rc.objeto = {}; 

								$( "#entregar" ).prop( "disabled", false );
								rc.nuevo = true;
							});	
						
					}
					
			});
*/
			

	}
	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/*
this.fechaPago = function(diaSeleccionado, periodoPago)
	{		
			
			//console.log(periodoPago);
			
			var date = moment();
			var diaActual = date.day();		
			var fecha = new Date();
			var dif = diaActual - diaSeleccionado;
			
			if (periodoPago == "Semanal")
			{
					if (diaActual > diaSeleccionado)
					{

							if (dif < 4)
							{
									if (dif == 1)
											fecha.setDate(fecha.getDate() + 6);
									else if (dif == 2)
											fecha.setDate(fecha.getDate() + 5);					
									else if (dif == 3)
											fecha.setDate(fecha.getDate() + 4);
							}
							else
							{
									if (dif == 4)
											fecha.setDate(fecha.getDate() + 10);
									else if (dif === 5)
											fecha.setDate(fecha.getDate() + 9);
							}
							
					} 
					else if (diaSeleccionado > diaActual)
					{
							if (Math.abs(dif) < 4)
							{
									if (dif == 1 || dif == -1)
											fecha.setDate(fecha.getDate() + 8);
									else if (dif == 2 || dif ==-2)
											fecha.setDate(fecha.getDate() + 9);					
									else if (dif == 3 || dif ==-3)
											fecha.setDate(fecha.getDate() + 10);
							}
							else 
									fecha.setDate(fecha.getDate() + Math.abs(dif));
						
					} else
							fecha.setDate(fecha.getDate() + 7);
					
					
					rc.objeto.primerAbono = fecha;

			}
	};
*/
	
	this.generarCredito = function(){
		
		
		/*
if (rc.folioVale == undefined || rc.folioVale == "")
		{
				toastr.warning("Debe proporcionar un numero de Folio");
				return;
		}
*/
		
		var credito = {

			tipoCredito_id 			: this.credito.tipoCredito_id,
			fechaSolicito 			: new Date(),
			duracionMeses 			: this.credito.duracionMeses,
			capitalSolicitado 	: this.credito.capitalSolicitado,
			adeudoInicial 			: this.credito.capitalSolicitado,
			saldoActual 				: this.credito.capitalSolicitado,
			periodoPago 				: this.credito.periodoPago,
			fechaPrimerAbono 		: this.objeto.primerAbono,
			multasPendientes 		: 0.00,
			saldoMultas 				: 0.00,
			saldoRecibo 				: 0.00,
			estatus 						: 1,
			requiereVerificacion: this.credito.requiereVerificacion,
			sucursal_id 				: Meteor.user().profile.sucursal_id,
			fechaVerificacion		: this.credito.fechaVerificacion,
			turno 							: this.credito.turno,
			tipoGarantia 				: this.credito.tipoGarantia,
			tasa								: this.credito.tasa,
			conSeguro 					: this.credito.conSeguro,
			seguro							: this.credito.seguro,
			tipo								:	this.credito.tipo,
			folio								: rc.folioVale
		};
				
		//console.log(this.credito);
		
		Meteor.apply('generarCredito', [credito, $stateParams.credito_id], function(error, result){
			if(result == "hecho"){
				this.avales = [];
				this.verDiaPago = false;
			}
			$scope.$apply();
		});
	}
	
	this.imprimirDocumento = function(credito){
		credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id)
    console.log(credito, "credito")
			// if (credito.tipoCredito.tipoInteres == "Simple") {
			
			Meteor.call('imprimirDocumentos', $stateParams.credito_id, function(error, response) {
				   if(error)
				   {
					    console.log('ERROR :', error);
					    return;
				   }
				   else
				   {
					   
			 				function b64toBlob(b64Data, contentType, sliceSize) {
								  contentType = contentType || '';
								  sliceSize = sliceSize || 512;
								
								  var byteCharacters = atob(b64Data);
								  var byteArrays = [];
								
								  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
								    var slice = byteCharacters.slice(offset, offset + sliceSize);
								
								    var byteNumbers = new Array(slice.length);
								    for (var i = 0; i < slice.length; i++) {
								      byteNumbers[i] = slice.charCodeAt(i);
								    }
								
								    var byteArray = new Uint8Array(byteNumbers);
								
								    byteArrays.push(byteArray);
								  }
								    
								  var blob = new Blob(byteArrays, {type: contentType});
								  return blob;
							}
							
							var blob = b64toBlob(response, "application/docx");
						  var url = window.URL.createObjectURL(blob);
						  
						  //console.log(url);
						  var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "Documentos.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
		  
				   }
				});	
	  };	

	this.imprimirContrato = function(contrato,cliente){
		
		
			contrato.tipoInteres = TiposCredito.findOne(contrato.tipoCredito_id)

		  rc.planPagos = [];
			this.tablaAmort = true;
				
			if(rc.credito.requiereVerificacion == true)
				rc.credito.estatus = 0;
			else
				rc.credito.estatus = 1;


			var _credito = {
				cliente: this.credito.nombre,
				//cliente_id : this.cliente._id,
				tipoCredito_id : this.credito.tipoCredito_id,
				fechaSolicito : new Date(),
				duracionMeses : this.credito.duracionMeses,
				capitalSolicitado : this.credito.capitalSolicitado,
				adeudoInicial : this.credito.capitalSolicitado,
				saldoActual : this.credito.capitalSolicitado,
				periodoPago : this.credito.periodoPago,
				fechaPrimerAbono : this.credito.primerAbono,
				multasPendientes : 0,
				saldoMultas : 0.00,
				saldoRecibo : 0.00,
				estatus : 1,
				requiereVerificacion: this.credito.requiereVerificacion,
				sucursal_id : Meteor.user().profile.sucursal_id,
				fechaVerificacion: this.credito.fechaVerificacion,
				turno: this.credito.turno,
				tasa: this.credito.tasa,
				conSeguro : this.credito.conSeguro,
				seguro: this.credito.seguro
			};

			Meteor.call("getPlanPagos",this.credito_id,function(error,result){
			
				if(error){
					console.log(error);
					toastr.error('Error al calcular el nuevo plan de pagos.');
				}
				else{
					console.log("Plan Pagos:", result);

					_.each(result,function (pago) {
												
						//console.log(pago,"pauisa")
						var pag = pago
						var pa = _.toArray(pag);
						var all = pa[pa.length - 1]
						rc.total = all
						//console.log(all,"all 12344")

						rc.planPagos.push(pago)
						$scope.$apply();
					});
					
					var total = rc.total;
					_.each(rc.planPagos,function (pago) {
						
						pago.liquidar = total;  						
						total -= pago.importeRegular;
					//	$scope.$apply();
					});
					//console.log("Prueba",rc.planPagos)
				}
					
	  
		    Meteor.call('getPeople',cliente._id, function(error, result){           					
					if (result)
					{
							
						rc.datosCliente = result.profile
									

								//console.log(rc.datosCliente,"el clientaso")
									
								//console.log("contrato",contrato)
								Meteor.call('contratos', contrato, $stateParams.credito_id,rc.datosCliente,rc.planPagos, function(error, response) {
				  
								   if(error)
								   {
									    console.log('ERROR :', error);
									    return;
								   }
								   else
								   {
									   
							 				function b64toBlob(b64Data, contentType, sliceSize) {
												  contentType = contentType || '';
												  sliceSize = sliceSize || 512;
												
												  var byteCharacters = atob(b64Data);
												  var byteArrays = [];
												
												  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
												    var slice = byteCharacters.slice(offset, offset + sliceSize);
												
												    var byteNumbers = new Array(slice.length);
												    for (var i = 0; i < slice.length; i++) {
												      byteNumbers[i] = slice.charCodeAt(i);
												    }
												
												    var byteArray = new Uint8Array(byteNumbers);
												
												    byteArrays.push(byteArray);
												  }
												    
												  var blob = new Blob(byteArrays, {type: contentType});
												  return blob;
											}
											
											var blob = b64toBlob(response, "application/docx");
										  var url = window.URL.createObjectURL(blob);
										  
										  //console.log(url);
										//  CONTRATO SIMPLE ////////////////////////////////////////////////////
										  if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) {
										  console.log("INTERES","INTERES:",contrato.tipoInteres.tipoInteres)
										   if (contrato.tipoInteres.tipoInteres == "Simple") {
										  var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOINTERES.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
											}
										  if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
										  var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOINTERESSSI.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
											}
											if (contrato.tipoInteres.tipoInteres == "Compuesto") {
										  var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOINTERESCOMPUESTO.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
											}
										}
										////////////////////////////////////////////////////////////////////////////////////////////////////
										///////CONTRATO SOLIDARIO//////////////////////////////////////////
				
										if (contrato.avales_ids.length > 0 && _.isEmpty(contrato.garantias)) {
											 console.log("OBLIGADO SOLIDARIO","INTERES:",contrato.tipoInteres.tipoInteres);
											 if (contrato.tipoInteres.tipoInteres == "Simple") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOOBLIGADOSOLIDARIO.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
										  }
										   if (contrato.tipoInteres.tipoInteres == "Compuesto") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOOBLIGADOSOLIDARIOCOMPUESTO.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
										  }
										   if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOOBLIGADOSOLIDARIOSSI.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
										  }
				
										}
											if (contrato.garantias && contrato.tipoGarantia == "general") {
												console.log("HIPOTECARIO","INTERES:",contrato.tipoInteres.tipoInteres)
												if (contrato.tipoInteres.tipoInteres == "Simple") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOHIPOTECARIO.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
										}
											if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOHIPOTECARIOSSI.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
										}
											if (contrato.tipoInteres.tipoInteres == "Compuesto") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOHIPOTECARIOCOMPUESTO.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
										}
				
										}
											if (contrato.garantias && contrato.tipoGarantia == "mobiliaria") {
												console.log("PRENDARIA","INTERES:",contrato.tipoInteres.tipoInteres)
												if (contrato.tipoInteres.tipoInteres == "Simple") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOGARANTIAPRENDARIA.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
											}
												if (contrato.tipoInteres.tipoInteres == "Compuesto") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOGARANTIAPRENDARIACOMPUESTO.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
											}
												if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
											var dlnk = document.getElementById('dwnldLnk');
									    dlnk.download = "CONTRATOGARANTIAPRENDARIASSI.docx"; 
											dlnk.href = url;
											dlnk.click();		    
										  window.URL.revokeObjectURL(url);
											}
										}
									}
								});
										
							}
            });

            $scope.$apply();	

	  		 });

			return rc.planPagos;
		
		};
	
	this.imprimirPagare = function(contrato,cliente){
		
			//Imprimir Pagare
			var url = $state.href("anon.ticketPagare", { credito_id: $stateParams.credito_id }, { newTab: true });
			window.open(url, '_blank');
		
	};
	
	this.imprimirAmortizacion = function(contrato,cliente){
		
			//Imprimir Pagare
			var url = $state.href("anon.ticketAmortizacion", { credito_id: $stateParams.credito_id }, { newTab: true });
			window.open(url, '_blank');
		
	};
	
	/////FINAL///
	
	
	this.mostrarModalActivarFecha = function()
	{
			rc.credentials = {};
			$("#modalActivarFecha").modal();
	}
	
	
	this.validaCredenciales = function(credenciales)
	{
			var usuario = Meteor.users.findOne(Meteor.userId());
	    Meteor.call('validarCredenciales', credenciales, usuario.profile.sucursal_id , function(err, result) {
	      if (result) {
		      
		      console.log("VER:", result);
	        rc.estatusFecha = false;
	        $scope.$apply();
	        $("#modalActivarFecha").modal('hide');
	      }
	      else if (result == false)
	      {
		      	console.log("FAL:", result);
		      	toastr.warning("No concide con la clave de desbloqueo")
	      }
	    });  
			
	}
	
};