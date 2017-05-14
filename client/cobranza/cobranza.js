angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	  
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  rc.buscar = {};
  rc.buscar.nombre = "";
  rc.credito_id = "";
  rc.cliente_id = "";
  rc.historial = [];
  
  var FI, FF;
  rc.cliente = {};
  rc.credito = {};
  rc.historialCrediticio = {};
  rc.cobranza = {};
  

  rc.avales = [];
  rc.referenciasPersonales = [];
  rc.ihistorialCrediticio = [];
  rc.clientes_id = [];
 
  rc.cobranza_id = "";
  rc.notaCobranza = {};
  
  rc.totalRecibos = 0;
  rc.totalMultas = 0;
  rc.seleccionadoRecibos = 0;
  rc.seleccionadoMultas = 0;
  rc.recibo = [];
	
  
  this.selected_credito = 0;
  this.ban = false;
  this.respuestaNotaCLiente = false;



  rc.colonia =""
  

  this.subscribe("tiposCredito", ()=>{
		return [{}]
	});
	this.subscribe("estadoCivil", ()=>{
		return [{}]
	});
	this.subscribe("nacionalidades", ()=>{
		return [{}]
	});
	this.subscribe("ocupaciones", ()=>{
		return [{}]
	});
	this.subscribe("paises", ()=>{
		return [{}]
	});
	this.subscribe("estados", ()=>{
		return [{}]
	});
	this.subscribe("municipios", ()=>{
		return [{}]
	});
	this.subscribe("ciudades", ()=>{
		return [{}]
	});
	this.subscribe("colonias", ()=>{
		return [{}]
	});
	this.subscribe("empresas", ()=>{
		return [{}]
	});	  

  	this.subscribe('notas',()=>{
		return [{cliente_id:this.getReactively("cliente_id"),}]
	});

	 this.subscribe("planPagos", ()=>{
		return [{ credito_id : this.getReactively("credito_id") }]
	});

  	this.subscribe('personas', () => {
		return [{ }];
	});
	// 	this.subscribe('clientes', () => {
	// 	return [{_id : {$in : this.getReactively("clientes_id")}}];
	// });
		this.subscribe('creditos', () => {
		return [{cliente_id : rc.getReactively("cliente_id")}];
	});

		this.subscribe('pagos', () => {
		return [{ }];
	});


	
	this.helpers({
		tiposCredito : () => {
			return TiposCredito.find();
		},
		notas : () => {
			return Notas.find().fetch();
		},
		usuario : () => {
			return Meteor.users.findOne();
		},
		creditos : () => {
			return Creditos.find().fetch();
		},

		planPagos : () => {
			var planes = PlanPagos.find({multada:1});
			var obj = planes.length

			return planes;
		},

		pagosVencidos : () => {
			_.each(rc.getReactively("planPagos"),function(plan){});
			return rc.planPagos.length

		},


		historialCredito : () => {
			var creditos = [];
			rc.clientes_id = _.pluck(rc.cobranza,"cliente._id")
			
				
		
		    return creditos
			
		},

	});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
	this.calcularSemana = function(w, y) 
	{
			var ini, fin;
		
	    var simple = new Date(y, 0, 1 + (w - 1) * 7);
	    FI = new Date(simple);
	    FF = new Date(moment(simple).add(7,"days"));
	    
	    FF.setHours(23,59,59,999);
	    
	}
	
	this.calcularMes = function(m, y) 
	{
	    var startDate = moment([y, m]);
			var endDate = moment(startDate).endOf('month');
	    FI = startDate.toDate();
	    FF = endDate.toDate();
	    FF.setHours(23,59,59,999);
	}
	
	this.AsignaFecha = function(op)
	{	
			this.selected_credito = 0;
			this.ban = false;
			
			if (op == 0) //Vencimiento Hoy
			{
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date(FI.getTime() - (1 * 24 * 3600 * 1000));
				  FF.setHours(23,59,59,999);
				  //console.log("FI:",FI);
					//console.log("FF:",FF);
				  
			}	
			else if (op == 1) //Día
			{
					this.fechaInicial.setHours(0,0,0,0);
				  this.fechaFinal = new Date(this.fechaInicial.getTime());
				  this.fechaFinal.setHours(23,59,59,999);
				  FI = this.fechaInicial;
				  FF = this.fechaFinal;
				  
				  //console.log("FI:", FI);
					//console.log("FF:", FF);
					
			}	
			else if (op == 2) //Semana
			{					
					
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date(FI.getTime());
				  FF.setHours(23,59,59,999);
					
					var semana = moment().isoWeek();
					var anio = FI.getFullYear();
					this.calcularSemana(semana, anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
				
			}
			else if (op == 3) //Mes
			{
				
					FI = new Date();
					FI.setHours(0,0,0,0);
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					//console.log(mes);
					this.calcularMes(mes,anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
				
			}
			else if (op == 4) //Siguiente Mes
			{
					FI = new Date();
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					if (mes == 11) 
					{
							mes = 0;
							anio = anio + 1; 
					}
					else
							mes = mes + 1;	
					
					this.calcularMes(mes,anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
			}
			
			Meteor.call('getCobranza', FI, FF, op, Meteor.user().profile.sucursal_id, function(error, result) {						
					if (result)
					{
							rc.cobranza = result;
							rc.totalRecibos = 0;
							rc.totalMultas = 0;
							_.each(rc.cobranza,function(c){
									rc.totalRecibos = rc.totalRecibos + c.importe;
									rc.totalMultas = rc.totalMultas + c.multas;
							});
							$scope.$apply();
					}
				
			});	
	}
	
  this.selCredito=function(objeto)
  {

  		rc.cliente_id = objeto.cliente._id
  		//console.log(rc.cliente_id)
  		Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()

  		objeto.historialCreditos = Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()

	  	this.ban = !this.ban;

	  	rc.credito_id = objeto.credito._id;
	  	console.log("Objeto: ",objeto)
	  	rc.historial = objeto


	  	_.each(rc.getReactively("planPagos"), function(item){
	  	//	console.log(item,"lewa")


	  	});

	  	
	  	//Información del Cliente
	  	rc.cliente = objeto.cliente;
	  	//console.log(rc.cliente);
	  	var ec = EstadoCivil.findOne(rc.cliente.profile.estadoCivil_id);
	  	if (ec != undefined) rc.cliente.profile.estadoCivil = ec.nombre; 
	  	var nac = Nacionalidades.findOne(rc.cliente.profile.nacionalidad_id);
	  	if (nac != undefined) rc.cliente.profile.nacionalidad = nac.nombre;
	  	var ocu = Ocupaciones.findOne(rc.cliente.profile.ocupacion_id);
	  	if (ocu != undefined) rc.cliente.profile.ocupacion = ocu.nombre;
	  	
	  	var pais = Paises.findOne(rc.cliente.profile.pais_id);
	  	if (pais != undefined) rc.cliente.profile.pais = pais.nombre; 
	  	var edo = Estados.findOne(rc.cliente.profile.estado_id);
	  	if (edo != undefined) rc.cliente.profile.estado = edo.nombre;
	  	var mun = Municipios.findOne(rc.cliente.profile.municipio_id);
	  	if (mun != undefined) rc.cliente.profile.municipio = mun.nombre;
	  	var ciu = Ciudades.findOne(rc.cliente.profile.ciudad_id);
	  	if (ciu != undefined) rc.cliente.profile.ciudad = ciu.nombre;
	  	var col = Colonias.findOne(rc.cliente.profile.colonia_id);
	  	if (col != undefined) rc.cliente.profile.colonia = col.nombre;
	  	
	  	var emp = Empresas.findOne(rc.cliente.profile.empresa_id);
	  	if (emp != undefined) rc.cliente.profile.empresa = emp;
	  	
	  	pais = Paises.findOne(rc.cliente.profile.empresa.pais_id);
	  	if (pais != undefined) rc.cliente.profile.empresa.pais = pais.nombre; 
	  	edo = Estados.findOne(rc.cliente.profile.empresa.estado_id);
	  	if (edo != undefined) rc.cliente.profile.empresa.estado = edo.nombre;
	  	mun = Municipios.findOne(rc.cliente.profile.empresa.municipio_id);
	  	if (mun != undefined) rc.cliente.profile.empresa.municipio = mun.nombre;
	  	ciu = Ciudades.findOne(rc.cliente.profile.empresa.ciudad_id);
	  	if (ciu != undefined) rc.cliente.profile.empresa.ciudad = ciu.nombre;
	  	
	  	rc.referenciasPersonales = [];
	  	
	  	_.each(rc.cliente.profile.referenciasPersonales_ids,function(referenciaPersonal_id){
						Meteor.call('getPersona', referenciaPersonal_id, objeto.cliente._id, function(error, result){						
									if (result)
									{
											//Recorrer las relaciones 
											//console.log("RP:",result);
											rc.referenciasPersonales.push({buscarPersona_id	: referenciaPersonal_id,
																										 nombre						: result.nombre,
																										 apellidoPaterno	: result.apellidoPaterno,
																										 apellidoMaterno	: result.apellidoMaterno,
																										 parentezco				: result.parentezco,
																										 direccion				: result.direccion,
																										 telefono					: result.telefono,
																										 tiempo						: result.tiempo,
																										 num							: result.num,
																										 cliente					: result.cliente,
																										 cliente_id				: result.cliente_id,
																										 tipoPersona			: result.tipoPersona,
																										 estatus					: result.estatus
											});
											$scope.$apply();
									}
						});	
	  	});
	  	
	  	//-----------------------------------------------------------------------------
	  	
	  	//Información del Crédito
	  
	  	rc.credito = objeto.credito;	
	  
	  	rc.avales = [];
	  	_.each(rc.credito.avales_ids,function(aval_id){
						Meteor.call('getPersona', aval_id, function(error, result){						
									if (result)
									{
											rc.avales.push(result);
											$scope.$apply();			
									}
						});	
	  	});
	  	//-----------------------------------------------------------------------------
	  	
	  	//Historial Crediticio
	  	Meteor.call('gethistorialPago', rc.credito._id, function(error, result) {
						if (result)
						{
								rc.historialCrediticio = result;
								$scope.$apply();
								//console.log(rc.historialCrediticio);
						}
			});
			
			
			//-----------------------------------------------------------------------------
	  	
	  	
      this.selected_credito=objeto.credito.folio;
  };

   this.selCredito2=function(objeto)
  {

        //objeto.fechaEntrega = new Date();
  		rc.cliente_id = objeto.cliente._id
  		console.log(rc.cliente_id)
  		Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()
  		objeto.historialCreditos = Creditos.find({cliente_id: rc.getReactively("cliente_id")}).fetch()

	  	rc.credito_id = objeto.credito._id;
	  	console.log("Objeto: ",objeto)
	  	rc.historial = objeto

	  }
  
  this.isSelected=function(objeto){
	  
	  	this.sumarSeleccionados();
      return this.selected_credito===objeto;

  };
  
  this.buscarNombre=function()
  {
      Meteor.call('getcobranzaNombre', rc.buscar.nombre, function(error, result) {
						if (result)
						{
								rc.cobranza = result;
								rc.totalRecibos = 0;
								rc.totalMultas = 0;
								_.each(rc.cobranza,function(c){
										rc.totalRecibos = rc.totalRecibos + c.importe;
										rc.totalMultas = rc.totalMultas + c.multas;
								});
								$scope.$apply();
						}
			});
  };	

	this.cambiar = function() 
  {

			var chkImprimir = document.getElementById('todos');
				
			_.each(rc.cobranza, function(cobranza){
				cobranza.imprimir = chkImprimir.checked;
				//rc.cobranza.estatus = !this.estatus.estatus;
			})
			
			this.sumarSeleccionados();
		//	console.log(rc.cobranza)
					
	};
	
	this.sumarSeleccionados = function(objeto)
	{		
		    //rc.cobranza.estatus = !rc.cobranza.estatus;
		    _.each(objeto, function(cobranza){});

			rc.seleccionadoRecibos = 0;
			rc.seleccionadoMultas = 0;
			_.each(rc.cobranza,function(c){	
					if (c.imprimir == true)
					{
							rc.seleccionadoRecibos += c.importe;
							rc.seleccionadoMultas += c.multas;
					}		
			});
			//console.log(rc.cobranza)

	};



	var fecha = moment();
	this.guardarNotaCobranza=function(nota){
			console.log(nota);			
			nota.estatus = true;
			nota.fecha = new Date()
			nota.hora = moment(nota.fecha).format("hh:mm:ss a")
			rc.notaCobranza.usuario = rc.usuario.profile.nombreCompleto
			rc.notaCobranza.tipo = "Cobranza"
			Notas.insert(nota);
			this.notaCobranza = {}
			$('#myModal').modal('hide');
			toastr.success('Guardado correctamente.');
	};
	this.mostrarNotaCobranza=function(objeto){
		console.log(objeto)
		rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto 
		rc.notaCobranza.folioCredito = objeto.credito.folio 
		rc.notaCobranza.recibo= objeto.planPagos[0].numeroPago
	    rc.notaCobranza.cliente_id = objeto.cliente._id
		rc.cobranza_id = objeto.credito._id
		console.log("rc.cobranza_id",rc.cobranza_id)
		$("#myModal").modal();


	}

	this.mostrarNotaCliente=function(objeto){
		console.log(objeto)
		rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto 
		rc.notaCobranza.folioCredito = objeto.credito.folio 
		rc.notaCobranza.recibo= objeto.planPagos[0].numeroPago
     	rc.cobranza_id = objeto.credito._id
     	rc.notaCobranza.cliente_id = objeto.cliente._id
		 console.log("rc.cobranza_id",rc.cobranza_id)
		 $("#modalCliente").modal();


	}
	this.guardarNotaCliente=function(nota){
			console.log(nota);			
			nota.estatus = true;
			nota.fecha = new Date()
			nota.hora = moment(nota.fecha).format("hh:mm:ss a")
			rc.notaCobranza.usuario = rc.usuario.profile.nombreCompleto
			rc.notaCobranza.tipo = "Cliente"
		    //rc.notaCobranza.cliente_id = objeto.cliente._id
			rc.notaCobranza.respuesta =  this.respuestaNotaCLiente			
			Notas.insert(nota);
			this.notaCobranza = {}
			$('#modalCliente').modal('hide');
			toastr.success('Guardado correctamente.');
	}
	this.cambioEstatusRespuesta=function(){
		this.respuestaNotaCLiente = !this.respuestaNotaCLiente;
					
	}

	this.mostrarNotaCuenta=function(objeto){
		console.log(objeto)
		rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto 
		rc.notaCobranza.folioCredito = objeto.credito.folio 
		rc.notaCobranza.recibo= objeto.planPagos[0].numeroPago
		 rc.cobranza_id = objeto.credito._id
		 rc.notaCobranza.cliente_id = objeto.cliente._id
		 console.log("rc.cobranza_id",rc.cobranza_id)
		 $("#modalCuenta").modal();

	}
	this.guardarNotaCuenta=function(nota){
			console.log(nota);			
			nota.estatus = true;
			nota.fecha = new Date()
			nota.hora = moment(nota.fecha).format("hh:mm:ss a")
			rc.notaCobranza.usuario = rc.usuario.profile.nombreCompleto
			rc.notaCobranza.tipo = "Cuenta"
			rc.notaCobranza.respuesta =  this.respuestaNotaCLiente	
		   // rc.notaCobranza.cliente_id = objeto.cliente._id
			Notas.insert(nota);
			this.notaCobranza = {}
			$('#modalCuenta').modal('hide');
			toastr.success('Guardado correctamente.');
	}
	



	this.download = function(objeto) 

  {
		console.log("entro:", objeto);
		objeto.credito.saldoActualizado = rc.historialCredito.saldo
		objeto.credito.avales = rc.avales;
		objeto.credito.pagosVencidos = rc.pagosVencidos;



		Meteor.call('getcartaRecordatorio', objeto, function(error, response) {
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

					    dlnk.download = "recordatorios.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
  
		   }
		});

		
	};



	this.downloadCartaUrgente = function(objeto) 

  {
	  	
		console.log("entro:", objeto);
		objeto.credito.saldoActualizado = rc.historialCredito.saldo
		objeto.credito.avales = rc.avales;
		objeto.credito.pagosVencidos = rc.pagosVencidos;


		Meteor.call('getcartaUrgente', objeto, function(error, response) {
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

					    dlnk.download = "URGENTE.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
  
		   }
		});

		
	};




	this.downloadCartaCertificado= function(objeto) 

  {
	  	
		console.log("entro:", objeto);
		objeto.credito.saldoActualizado = rc.historialCredito.saldo
		objeto.credito.avales = rc.avales;

		Meteor.call('getcartaCertificado', objeto, function(error, response) {

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

					    dlnk.download = "certificacionPatrimonial.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
		   }
		});

		
	};

	this.imprimirRecibos= function(objeto) 
  {
  	
	  	
	console.log("objeto:", objeto);
		 _.each(objeto,function(item){
		 	
		 	if (item.imprimir == true) {
		 		//console.log(item,"objetos")
		 		rc.recibo.push(item)
		 
		 		_.each(item.credito,function(credito){
		 	     console.log(credito,"credito_id")
		     		_.each(item.perfil,function(cliente){
		     			
		 				_.each(item.planPagos,function(plan){
		 				

		 				cliente.colonia = Colonias.findOne(cliente.colonia_id)
		 				plan.colonia = cliente.colonia.nombre
		 				plan.calle = cliente.calle
		 				cliente.estado = Estados.findOne(cliente.estado_id)
						plan.estado = cliente.estado.nombre
						cliente.municipio = Municipios.findOne(cliente.municipio_id)
						plan.municipio = cliente.municipio.nombre
		 				plan.nombreCompleto = cliente.nombreCompleto
						plan.planPagoNumero = plan.numeroPago
						plan.no = cliente.numero
						plan.nombreCompleto = cliente.nombreCompleto
						plan.telefono = cliente.telefono
						plan.celular = cliente.celular
						plan.telefonoOficina = cliente.telefonoOficina
						plan.cantidadPagos = item.planPagos.length

						
						//plan.saldo = saldoActual 
						

						//plan.credito.numero = credito.numeroPagos
		 			});

		 		});
		 	});
		  }else{
		  	item = undefined
		  }
		 
		});

		 var saldoActual = 0;
		 _.each(objeto,function(item){

		 	_.each(item.planPagos,function(plan){
		 		
		 		if (saldoActual == 0) {
				 saldoActual = item.saldo
				 console.log("entro")

				}else{
				saldoActual = saldoActual - plan.cargo
				 console.log("else")
			   }
			   plan.saldoAnterior = parseFloat(saldoActual.toFixed(2))
			   plan.saldoActualizado = parseFloat(saldoActual.toFixed(2) - plan.cargo.toFixed(2))

		 		   
				

				
				console.log(saldoActual)

		 });
		});
		 
	     
	
		console.log("2:",rc.recibo);



		Meteor.call('getRecibos', objeto, function(error, response) {		 
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
				  var dlnk = document.getElementById('dwnldLnk');

			      dlnk.download = "RECIBOS.docx"; 
					dlnk.href = url;
					dlnk.click();		    
				  window.URL.revokeObjectURL(url);
	 
			}
		
		});
		rc.recibo = [];
		
	};



	this.verPagos= function(credito) {
		console.log(credito,"el ob ")
		$("#modalpagos").modal();
		credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch()
		rc.mostrarModal = true

	};

	this.cerrarModal= function() {
		rc.mostrarModal = false

	};




	

};