angular.module("creditoMio")
.controller("EntregarCreditoCtrl", EntregarCreditoCtrl);
 function EntregarCreditoCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
 	let rc = $reactive(this).attach($scope);
	window.rc=rc
	
	this.suma =0;
	this.verDiaPago = true;
	rc.seleccinadorContrato = false;
	rc.imprecion = true;
	
	this.objeto = {};
	
	this.credito = {};
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
			return Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile.caja_id : "")
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
			

			// _.each(c, function(credito){
			// 	credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id)
				
			// });		
			
			if (c != undefined)
			{		
					if (c.folio)
						  this.verDiaPago = false;
					
					if (c.periodoPago == "Quincenal")
					{
							var fecha = new Date();
							
							//Hacer los calculos
							var semana = moment().isoWeek();
							var anio = fecha.getFullYear();
							//this.calcularSemana(semana, anio);
							
							var ini, fin;
				
					    var simple = new Date(anio, 0, 1 + (semana) * 7);
					    fecha = new Date(simple);
					    //FF = new Date(moment(simple).add(7,"days"));
					    
					    //console.log(fecha);
					    //FF.setHours(23,59,59,999);
							this.objeto.primerAbono = fecha;
							
					}
					else if (c.periodoPago == "Mensual")
					{
							var fecha = new Date();
						
							var anio = fecha.getFullYear();
							var mes = fecha.getMonth();
							
							var startDate = moment([anio, mes]);
							var endDate = moment(startDate).endOf('month');
					    fecha = endDate.toDate();
					    //FF = endDate.toDate();
					    fecha.setHours(0,0,0,0);					    
					    
					    //console.log(fecha);
					    
					    this.objeto.primerAbono = fecha;
					    //this.getReactively("objeto.primerAbono");
/*
							if(!$scope.$$phase) {
						 		//$digest or $apply
						 		rc.credito.primerAbono = fecha;
						 		$scope.$apply();		
							}
*/
							
							//console.log("Control:",this.objeto.primerAbono);
							
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
			if(form.$invalid || rc.suma != rc.credito.capitalSolicitado){
						toastr.error('Error al actualizar los datos.');
						return;
			}
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
/*
			else if (periodoPago == "Quincenal")
			{
					//Hacer los calculos
					var semana = moment().isoWeek();
					var anio = FI.getFullYear();
					//this.calcularSemana(semana, anio);
					
					var ini, fin;
		
			    var simple = new Date(anio, 0, 1 + (semana - 1) * 7);
			    FI = new Date(simple);
			    //FF = new Date(moment(simple).add(7,"days"));
			    
			    console.log(FI);
			    //FF.setHours(23,59,59,999);
					
					
			}
*/
/*
			else if (periodoPago == "Mensual")
			{
					var FI = new Date();
				
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					
					var startDate = moment([anio, mes]);
					var endDate = moment(startDate).endOf('month');
			    FI = endDate.toDate();
			    //FF = endDate.toDate();
			    FI.setHours(0,0,0,0);
			    //console.log(FI);

					
			}	
*/
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
			fechaPrimerAbono : this.credito.primerAbono,
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
		
		//Duda se guardan los dos???
		
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
			if (credito.tipoCredito.tipoInteres == "Simple") {
			
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
		  }else{
		  	rc.seleccinadorContrato = true;
		  	rc.imprecion = false;
		  }
	  };	

	  this.imprimirContrato = function(contrato){
	  	console.log("contrato",contrato)

	  		Meteor.call('contratos', contrato, $stateParams.credito_id, function(error, response) {
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
						  if (contrato == "CONTRATO DE MUTUO CON INTERÉS") {

						  var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOINTERES.doc"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
						}
						if (contrato=="CONTRATO DE MUTUO CON INTERÉS (OBLIGADO SOLIDARIO) VFINAL") {
							var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOOBLIGADOSOLIDARIO.doc"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

						}
							if (contrato=="CONTRATO DE MUTUO CON INTERES CON GARANTIA HIPOTECARIO VFINAL") {
							var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOHIPOTECARIO.doc"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

						}
							if (contrato=="CONTRATO DE MUTUO CON INTERÉS CON GARANTÍA PRENDARIA VF") {
							var dlnk = document.getElementById('dwnldLnk');
					    dlnk.download = "CONTRATOGARANTIAPRENDARIA.doc"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

						}
		  
				   }
				});




		
		}
	
	
};