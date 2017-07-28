angular.module("creditoMio")
.controller("EntregarCreditoCtrl", EntregarCreditoCtrl);
 function EntregarCreditoCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
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
	//this.credito.primerAbono = new Date();
	
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
		return [{estatus : 1}]
	});
	this.subscribe('personas',()=>{
		return [{rol : "Cliente"}]
	});
	this.validar={};

	this.helpers({
		tiposIngreso : () => {
			var tipos = TiposIngreso.find().fetch();
			_.each(tipos,(tipo)=>{
				rc.objeto.caja =rc.objeto.caja? rc.objeto.caja :{};
				rc.objeto.caja[tipo._id] = rc.objeto.caja[tipo._id]? rc.objeto.caja[tipo._id] :{};
				rc.objeto.caja[tipo._id].saldo = rc.objeto.caja[tipo._id].saldo? rc.objeto.caja[tipo._id].saldo :0;
			});
			return tipos;
		},
		caja : () => {			
			return Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile.caja_id : "");
		},
		cuentas : () => {
			var cuentas = Cuentas.find().fetch();
			_.each(cuentas,(cuenta)=>{
				rc.objeto.cuenta =rc.objeto.cuenta? rc.objeto.cuenta :{};
				rc.objeto.cuenta[cuenta._id] = rc.objeto.cuenta[cuenta._id]? rc.objeto.cuenta[cuenta._id] :{};
				rc.objeto.cuenta[cuenta._id].saldo = rc.objeto.cuenta[cuenta._id].saldo? rc.objeto.cuenta[cuenta._id].saldo :0;
			});
			return cuentas;
		},
		credito : () => {
			var c = Creditos.findOne({_id:$stateParams.credito_id}); 
			console.log(c,"credito")
			
			if (c != undefined)
			{		

					rc.cliente._id = c.cliente_id;
					if (c.folio)
						  this.verDiaPago = false;
					
					if (c.periodoPago == "Quincenal")
					{
							var fecha;
							var date = new Date();
							var check = moment(date, 'YYYY/MM/DD');
							var numeroDia   = check.format('D');
							var numeroMes   = check.format('MM');
							var numeroAnio   = check.format('YYYY');
							
							if (numeroDia <=15)
							{
									var f = numeroMes + "/15/" + numeroAnio;							
									fecha = new Date(f);
							}
							else
							{
									var ultimoDiaMes = moment().daysInMonth();
									var f = numeroMes + "/"+ultimoDiaMes+"/" + numeroAnio;							
									fecha = new Date(f);
							}							
							this.objeto.primerAbono = fecha;						
					}
					else if (c.periodoPago == "Mensual")
					{
							var ultimoDiaMes = moment().daysInMonth();
							var f = numeroMes + "/"+ultimoDiaMes+"/" + numeroAnio;							
							fecha = new Date(f);	    					    
					    this.objeto.primerAbono = fecha;
					}		
	
			}			
			return c
		}

	});

	this.calcular = function(){
				
		if(!this.objeto)
			return 0;
			
		rc.suma = 0;
		_.each(this.objeto.cuenta,function(cuenta){ 
			if(cuenta && cuenta.saldo && cuenta.saldo>0)
				rc.suma+= cuenta.saldo;
		})
		_.each(this.objeto.caja,function(caja){ 
			if(caja && caja.saldo && caja.saldo>0)
				rc.suma+= caja.saldo;
		})

	}

	this.guardar = function (){
			//console.log(rc.objeto)
			
			if(this.validar.contrato!=true || this.validar.ficha!=true || this.validar.pagare!=true || this.validar.tabla!=true)
			{
				toastr.error('Es obligatorio verificar los documentos.');
				return
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
						return;
					}	
			}
			else if (rc.credito.esRefinanciado == true)
			{
					if(form.$invalid || rc.suma != (rc.credito.capitalSolicitado - rc.credito.refinanciar)){
						toastr.error('Error verifique la cantidad a entregar.');
						return;
					}
			}
			
			//Validar que tenga dinero en el tipo de Ingreso	
			var validarSaldoCaja = rc.caja.cuenta[rc.tipoIngreso._id];
			if (validarSaldoCaja.saldo < rc.suma)
			{
					toastr.error('Error no tienes saldo en la ventanilla en ese tipo de ingreso.');
					return;
			}			
			
			//Validar que no tenga Cargos Moratorios
			console.log(rc.credito.cliente_id);
			Meteor.call ("validarCreditosSaldoEnMultas",rc.credito.cliente_id,function(error,result){
					
					console.log(result);
					if (!result)
					{
							toastr.error('El cliente tiene Cargos Moratorios Activos no es posible Entregarle el crédito.');
							return;		
					}
			});
			
			
			Meteor.call ("entregarCredito",rc.objeto,$stateParams.credito_id,function(error,result){
		
				if(error){
					console.log(error);
					toastr.error('Error al guardar los datos.');
					return
				}
				toastr.success('Operacion Realizada.');
				$state.go("root.clienteDetalle",{objeto_id : rc.credito.cliente_id});
				rc.objeto = {}; 
				$('.collapse').collapse('hide');
				rc.nuevo = true;
				form.$setPristine();
				form.$setUntouched();
			});	

	}
	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
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
	
	this.generarCredito = function(){
		
		
		var credito = {
			//cliente_id : this.cliente._id,
			tipoCredito_id : this.credito.tipoCredito_id,
			fechaSolicito : new Date(),
			duracionMeses : this.credito.duracionMeses,
			capitalSolicitado : this.credito.capitalSolicitado,
			adeudoInicial : this.credito.capitalSolicitado,
			saldoActual : this.credito.capitalSolicitado,
			periodoPago : this.credito.periodoPago,
			fechaPrimerAbono : this.objeto.primerAbono,
			multasPendientes : 0,
			saldoMultas : 0.00,
			saldoRecibo : 0.00,
			estatus : 1,
			requiereVerificacion: this.credito.requiereVerificacion,
			sucursal_id : Meteor.user().profile.sucursal_id,
			fechaVerificacion: this.credito.fechaVerificacion,
			turno : this.credito.turno,
			tipoGarantia : this.credito.tipoGarantia,
			tasa: this.credito.tasa,
			conSeguro : this.credito.conSeguro,
			seguro: this.credito.seguro
		};
				
		credito.avales = angular.copy(this.avales);
				
		if (this.credito.tipoGarantia == "mobiliaria")
				credito.garantias = angular.copy(this.garantias);
		else
				credito.garantias = angular.copy(this.garantiasGeneral);
				
		
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
		  // }else{
		  // 	rc.seleccinadorContrato = true;
		  // 	// rc.imprecion = false;
		  // }
	  };	

	


		  this.imprimirContrato = function(contrato,cliente){


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

			Meteor.call("generarPlanPagos",_credito,rc.cliente,function(error,result){
			
				if(error){
					console.log(error);
					toastr.error('Error al calcular el nuevo plan de pagos.');
				}
				else{
					console.log(result);
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
					
		

			

	  	console.log("contrato",contrato)
	  		    Meteor.call('getPeople',cliente._id, function(error, result){           					
							if (result)
							{
									
								rc.datosCliente = result.profile
									

								console.log(rc.datosCliente,"el clientaso")
								console.lo
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

						  if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) {
						  console.log("INTERES")
						  var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOINTERES.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
						}
						if (contrato.avales_ids.length > 0 && _.isEmpty(contrato.garantias)) {
							 console.log("OBLIGADO SOLIDARIO");
							var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOOBLIGADOSOLIDARIO.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

						}
							if (contrato.garantias && contrato.tipoGarantia == "general") {
								console.log("HIPOTECARIO")
							var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOHIPOTECARIO.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

						}
							if (contrato.garantias && contrato.tipoGarantia == "mobiliaria") {
								console.log("PRENDARIA")
							var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOGARANTIAPRENDARIA.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

						}
		  
				   }
				});
										
							}
            });

            $scope.$apply();	

	  		 });

			return rc.planPagos;
	  		   // console.log("contr",contrato)
	  	
		
		};
	
	/////FINAL///
};