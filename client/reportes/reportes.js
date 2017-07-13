angular.module("creditoMio")
.controller("ReportesCtrl", ReportesCtrl);
 function ReportesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	  
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  rc.buscar = {};
  rc.buscar.nombre = "";
  rc.credito_id = "";
  this.clientes_id = [];
  rc.sumaCapital = "";
	rc.sumaInteres = "";
	rc.sumaIva = "";
	rc.totalCobranza ="";
	rc.totalSolicitado="";
	rc.totalPagar ="";
  
  var FI, FF;
  rc.cliente = {};
  rc.credito = {};
  rc.historialCrediticio = {};
  rc.reportesPago = {};
  rc.cobranza = {};
  
  rc.avales = [];
  rc.referenciasPersonales = [];
  rc.ihistorialCrediticio = [];
 
  rc.cobranza_id = "";
  rc.notaCobranza = {};
  
  rc.totalRecibos = 0;
  rc.totalMultas = 0;
  rc.seleccionadoRecibos = 0;
  rc.seleccionadoMultas = 0;
	
  
  this.selected_credito = 0;
  this.ban = false;
  this.respuestaNotaCLiente = false;
  this.diarioCobranza = false
  this.movimientoCuenta = false
  this.diarioCreditos = false
  this.caja = { _id: 0 };
  this.pagos_id = [];

  //console.log($stateParams)
 
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
		return [{cliente_id:this.getReactively("cliente_id")}]
	});

	this.subscribe("planPagos", ()=>{
	    return [{fechaPago : { $gte : this.getReactively("fechaInicial"), $lt : this.getReactively("fechaFinal")}}]
	});

    this.subscribe('movimientosCaja', () => {
       return [{ createdAt:  { $gte : this.getReactively("fechaInicial"), $lt : this.getReactively("fechaFinal")}}]
    });

  	this.subscribe('personas', () => {
		return [{ }];
	});
		this.subscribe('creditos', () => {
		return [{fechaSolicito : { $gte : rc.getReactively("fechaInicial"), $lt : rc.getReactively("fechaFinal")}}];
	});
		this.subscribe('clientes', () => {
		return [{}];
	});
		this.subscribe('pagos', () => {
		return [{estatus:1},{ fechaPago:  { $gte : this.getReactively("fechaInicial"), $lt : this.getReactively("fechaFinal")}}];
	});

		this.subscribe('cajas',()=>{
		return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""}]
	});
this.subscribe('cuentas',()=>{
		return [{estatus : 1}]});

  this.subscribe('cajas', () => {
    return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
  });
  this.subscribe('tiposIngreso', () => {
    return [{}]
  });
  this.subscribe('allCajeros', () => {
    return [{}]
  });
  this.subscribe('cuentas', () => {
    return [{}]
  });
  this.subscribe('movimientosCaja', () => {
    return [{caja_id: this.getReactively('caja._id'), createdAt: {$gte: this.getReactively('caja.ultimaApertura')} }]
  });
	
	this.helpers({
		bancos: () => {
      var ret = [];
      var pagos = {};
      var pays = Pagos.find({fechaPago : { $gte : rc.getReactively("fechaInicial"), $lt : rc.getReactively("fechaFinal")}}).fetch();
      var caja = Cajas.find().fetch();
       //_.each(caja, function(c) {
       	var suma = 0;
       	_.each(pays, function(pago) {
       //	console.log(pays,"pagos")
       	pago.cliente = Meteor.users.findOne(pago.usuario_id);
       	pago.nombreCompleto = pago.cliente.profile.nombreCompleto;
       	pago.quienCobro = Meteor.users.findOne(pago.usuarioCobro_id);
       	pago.nombreCajero = pago.quienCobro.profile.nombreCompleto;
       	pago.numeroCliente = pago.cliente.profile.numeroCliente
       	pago.fechaPago = moment(pago.fechaPago).format("DD-MM-YYYY")
       	suma += pago.pago
       	pago.acumulado = suma
        });
        //});
        ret.push(pays)
        console.log(ret,"dosthaa")
      
      return ret
    },

		tiposCredito : () => {
			return TiposCredito.find();
		},
		notas : () => {
			return Notas.find().fetch();
		},
		usuario : () => {
			return Meteor.users.find();
		},
		planPagos : () => {
			var creditos = Creditos.find().fetch();
	        var planes = PlanPagos.find({fechaPago : { $gte : rc.getReactively("fechaInicial"), $lt : rc.getReactively("fechaFinal")}}).fetch();
	        this.clientes_id = _.pluck(planes, "cliente_id");
	        //console.log(this.clientes_id,"clientes")
	        
	        var client = ""
	        var suma = 0
		      var sumaInter = 0
		      var sumaIva = 0
			if(planes){
				_.each(creditos,function(credit){
				_.each(planes,function(plan){
					plan.cliente = Meteor.users.findOne(plan.cliente_id);
					client = plan.cliente.profile
					//console.log("variable",client)
					plan.nombreCompleto = client.nombreCompleto
					plan.credito = Creditos.findOne(plan.credito_id)
					if (plan.garantias == undefined) {
						plan.garantias = "no"
					}else{
						plan.garantias = "si"
					}
				});
			 });

				_.each(planes,function(plan){
				// plan.numerosPagos= plan.credito.folio
	    	plan.numeroCliente = plan.cliente.profile.numeroCliente
	    	suma += plan.pago
	    	sumaInter += plan.interes
	    	sumaIva += plan.iva 
				});

				_.each(planes,function(plan){
	     plan.sumaCapital = suma 
	     plan.sumaInteres = sumaInter
	     plan.sumaIva = sumaIva  
	     plan.sumaCapital = parseFloat(plan.sumaCapital.toFixed(2))
	     plan.sumaInteres = parseFloat(plan.sumaInteres.toFixed(2))
	     plan.sumaIva = parseFloat(plan.sumaIva.toFixed(2))
	     rc.sumaCapital = plan.sumaCapital
	     rc.sumaInteres = plan.sumaInteres
	     rc.sumaIva = plan.sumaIva
	     rc.totalCobranza = plan.sumaCapital + plan.sumaInteres +sumaIva

	     plan.tipoIngreso = TiposIngreso.findOne(plan.tipoIngreso_id);
	     //rc.sumaCapital = plan.sumaCapital
	 	});
			}

			 console.log(planes,"planes")
			return planes
		
		},
		pagosVencidos : () => {
			_.each(rc.getReactively("planPagos"),function(plan){});
			return rc.planPagos.length
		},
		historialCredito : () => {
				_.each(rc.getReactively("historialCrediticio"),function(historial){
			});
				return rc.historialCrediticio[rc.historialCrediticio.length - 1];	
		},
		pagos : () =>{
			return Pagos.find().fetch()
		},
		creditos : () => {
				var creditos = Creditos.find({fechaSolicito : { $gte : rc.getReactively("fechaInicial"), $lt : rc.getReactively("fechaFinal")},estatus:4}).fetch();
				_.each(creditos,function(credito){
					//console.log(credito.cliente_id);
					credito.cliente = Meteor.users.findOne(credito.cliente_id)
				//	console.log("hola", credito.cliente)
					if(credito.cliente){
						credito.nombreCompleto = credito.cliente.profile.nombreCompleto;
					}
					if (credito.garantias != "") {
						credito.estatusGarantia = "Si"
					}else{
						credito.estatusGarantia = "No"
					}
					credito.numeroCliente = credito.cliente.profile.numeroCliente
				});
				var suma = 0
        var sumaSol = 0
	    _.each(creditos,function(credito){
	 	   	suma += credito.capitalSolicitado
	    	sumaSol += credito.adeudoInicial
	    });

	     _.each(creditos,function(credito){
	     credito.sumaCapital = suma 
	     credito.sumaAPagar = sumaSol
	     rc.totalPagar = parseFloat(credito.sumaAPagar.toFixed(2))
	     rc.totalSolicitado = parseFloat(credito.sumaCapital.toFixed(2))
	  	});

				//console.log("creditos",creditos)
				return creditos
			},
			creditosLiquidados : () => {
				var creditos = Creditos.find({fechaSolicito : { $gte : rc.getReactively("fechaInicial"), $lt : rc.getReactively("fechaFinal")},estatus:5}).fetch();
				_.each(creditos,function(credito){
					//console.log(credito.cliente_id);
					credito.cliente = Meteor.users.findOne(credito.cliente_id)
				//	console.log("hola", credito.cliente)
					if(credito.cliente){
						credito.nombreCompleto = credito.cliente.profile.nombreCompleto;
					}
					if (credito.garantias != "") {
						credito.estatusGarantia = "Si"
					}else{
						credito.estatusGarantia = "No"
					}
					credito.numeroCliente = credito.cliente.profile.numeroCliente
				});
				var suma = 0
        var sumaSol = 0
	    _.each(creditos,function(credito){
	 	   	suma += credito.capitalSolicitado
	    	sumaSol += credito.adeudoInicial
	    });

	     _.each(creditos,function(credito){
	     credito.sumaCapital = suma 
	     credito.sumaAPagar = sumaSol
	     rc.totalPagar = parseFloat(credito.sumaAPagar.toFixed(2))
	     rc.totalSolicitado = parseFloat(credito.sumaCapital.toFixed(2))
	  	});

				//console.log("creditos",creditos)
				return creditos
			},
			
				creditoPlanes : () => {
				var creditos = Creditos.find({}).fetch();
				_.each(creditos,function(credito){
				});
				return creditos
		
			},
			
			// cartera : () => {
			// 	var personas = Creditos.find({}).fetch();
			// 	_.each(creditos,function(credito){
			// 	});
			// 	return creditos
		
			// } 
		});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
  this.selCredito=function(objeto)
  {

	  	this.ban = !this.ban;

	  	rc.credito_id = objeto.credito._id;
	  	console.log("el id del credito ",rc.credito_id)
	  	console.log("mi objeto:",objeto)

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
						Meteor.call('getPersona', referenciaPersonal_id, function(error, result){						
									if (result)
									{
											console.log(result);
											rc.referenciasPersonales.push(result);
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
											console.log(result);
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
			//console.log(rc.historialCrediticio);
			
			
			
			//-----------------------------------------------------------------------------

				Meteor.call('getreportesPagos', rc.credito._id, function(error, result) {
						if (result)
						{
								rc.reportesPago = result;
								$scope.$apply();
								
						}
			});
				//console.log(rc.reportesPago,"kaka");
	  	
	  	
      this.selected_credito=objeto.credito.folio;
  };
  
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
			})
			
			this.sumarSeleccionados();
					
	};
	
	this.sumarSeleccionados = function()
	{
			rc.seleccionadoRecibos = 0;
			rc.seleccionadoMultas = 0;
			_.each(rc.cobranza,function(c){	
					if (c.imprimir == true)
					{
							rc.seleccionadoRecibos += c.importe;
							rc.seleccionadoMultas += c.multas;
					}		
			});

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

	this.mostrarDiarioCobranza = function(){
		this.diarioCobranza = true
		this.movimientoCuenta = false
		this.diarioCreditos = false
	}
	this.mostarMovimientoCuenta = function(){
		this.diarioCobranza = false
		this.diarioCreditos = false
		this.movimientoCuenta = true
	}
	this.mostarDiarioCreditos = function(){
		this.diarioCobranza = false
		this.movimientoCuenta = false
		this.diarioCreditos = true
	}
	this.imprimirReporteCobranza = function(objeto){
		
		var suma = 0
		var sumaInter = 0
		var sumaIva = 0
		_.each(objeto,function(item){
			
	    	item.numerosPagos= item.credito.folio
	    	item.numeroCliente = item.cliente.profile.numeroCliente
	    	suma += item.pago
	    	sumaInter += item.interes
	    	sumaIva += item.iva 
	    	});
   

	    _.each(objeto,function(item){
	     item.sumaCapital = suma 
	     item.sumaInteres = sumaInter
	     item.sumaIva = sumaIva  
	     item.sumaCapital = parseFloat(item.sumaCapital.toFixed(2))
	     item.sumaInteres = parseFloat(item.sumaInteres.toFixed(2))
	     item.sumaIva = parseFloat(item.sumaIva.toFixed(2))
	 	});

	    console.log("objetoooooooooooooooo",objeto)

		   Meteor.call('ReporteCobranza', objeto,rc.fechaInicial,rc.fechaFinal,  function(error, response) {


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

					    dlnk.download = "reporteDiarioCobranza.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);
  
		   }
		});
		
	}

	this.imprimirReporteCreditos = function(objeto){

	    console.log("objeto",objeto)
	     var suma = 0
       var sumaSol = 0
	    _.each(objeto,function(item){
	    	console.log("item",item)
			var fecha = ""
	    	//item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
	    	suma += item.capitalSolicitado
	    	sumaSol += item.adeudoInicial
	   
	    });

	     _.each(objeto,function(item){
	     item.sumaCapital = suma 
	     item.sumaAPagar = sumaSol
	  	});
	    
		   Meteor.call('ReporteCreditos', objeto,rc.fechaInicial,rc.fechaFinal,  function(error, response) {

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

				    dlnk.download = "ReporteDiarioCreditos.docx"; 
						dlnk.href = url;
						dlnk.click();		    
					  window.URL.revokeObjectURL(url);
		   }
		});
		
	}


	this.imprimirReporteMovimiento = function(objeto){

	   
	    _.each(objeto,function(item){
	    	console.log("item")
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
			
	    	item.folio = item.credito.folio
	    	item.numeroPagos = item.credito.numeroPagos
	   
	    });
	     console.log("objeto",objeto)
	    
		   Meteor.call('ReporteMovimientoCuenta', objeto,rc.fechaInicial,rc.fechaFinal,  function(error, response) {

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

					    dlnk.download = "ReporteMovimientoCuentas.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

  
		   }
		});
		
	};

		this.imprimirReporteBancos = function(objeto){

	    console.log("objeto",objeto)
		   Meteor.call('ReportesBanco', objeto,rc.fechaInicial,rc.fechaFinal,  function(error, response) {

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

				    dlnk.download = "ReporteBancos.docx"; 
						dlnk.href = url;
						dlnk.click();		    
					  window.URL.revokeObjectURL(url);
		   }
		});
	};
};