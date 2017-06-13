angular
.module("creditoMio")
.controller("calculadoraCtrl", calculadoraCtrl);
function calculadoraCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	if($stateParams.pago){
		this.planPagos = $stateParams.pago;
	}else{
		this.tablaAmort = false;
		this.nuevoBotonPago = true;
		this.action = false;
		this.actionAval = true;
		this.actionGarantia = true;
		this.fechaActual = new Date();
		this.nuevoBotonReestructuracion = true;
		this.nuevoBotonCredito = true;
		
		this.cliente_id = "";
		this.planPagos = [];
		this.credito = {};
		//this.credito.primerAbono = new Date(moment().add(1, "weeks"));
		this.pago = {};

		this.con = 0;
		this.num = 0;
		this.avales = [];
		this.aval = {};
		this.conG = 0;
		this.numG = 0;
		this.conGen = 0;
		this.numGen = 0;
		
		this.garantias = [];
		this.garantiasGeneral = [];
		this.garantia = {};
		rc.total = ""
	  
	  this.cliente = {};
		this.buscar = {};
		this.buscar.nombre = "";
		this.buscando = false;
		this.personasTipos = [];
		this.personas_ids = [];
		
		
		this.subscribe('buscarPersonas', () => {
			if(this.getReactively("buscar.nombre").length > 3){
				this.buscando = true;
				return [{
			    options : { limit: 20 },
			    where : { 
						nombreCompleto : this.getReactively('buscar.nombre')
					} 		   
		    }];
			}
			else if (this.getReactively("buscar.nombre").length  == 0 )
				this.buscando = false;
	  });
		

		this.subscribe("planPagos", ()=>{
			return [{ cliente_id : $stateParams.objeto_id }]
		});

		
		this.subscribe("tiposCredito", ()=>{
			return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
		});
		
		this.subscribe('cliente', () => {
			return [{ _id : $stateParams.objeto_id }];
		});
		
		this.subscribe('pagos', () => {
			return [{ estatus:true}];
		});

		
		this.helpers({
			personasTipos : () => {
				var personas = Personas.find({
			  	"nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' }
				}, { sort : {"nombreCompleto" : 1 }}).fetch();
				/*
				if(personas){
					this.personas_ids = _.pluck(personas, "_id");
				
					_.each(personas, function(persona){
						cliente.creditos = Personas.find({cliente_id : cliente._id, estatus : 2}).fetch();
					})
				}
				*/	
					
				return personas;
			},
			cliente : () => {
				return Meteor.users.findOne({roles : ["Cliente"]});
			},
			tiposCredito : () => {
				return TiposCredito.find();
			},

			pagos : () => {
				return Pagos.find();
			},
			
		});
		
		this.nuevoPago = function()
		{
			this.nuevoBotonPago = !this.nuevoBotonPago;
			this.nuevoBotonReestructuracion = true;
			this.nuevoBotonCredito = true;
			this.action = !this.action;
			this.pago = {};
			$('#collapseReestructuracion').collapse('hide');
			$('#collapseNuevoCredito').collapse('hide');
		};
	  
		this.nuevaReestructuracion = function()
		{
			this.nuevoBotonPago = true;
			this.nuevoBotonReestructuracion = !this.nuevoBotonReestructuracion;
			this.nuevoBotonCredito = true;
			this.modificacion = {};		
			this.action = false;
			$('#collapseNuevoPago').collapse('hide');
			$('#collapseNuevoCredito').collapse('hide');
		};
	  
		this.nuevoCredito = function()
		{
			this.nuevoBotonPago = true;
			this.nuevoBotonReestructuracion = true;
			this.nuevoBotonCredito = !this.nuevoBotonCredito;
			this.modificacion = {};
			this.action = false;
			$('#collapseNuevoPago').collapse('hide');
			$('#collapseReestructuracion').collapse('hide');
		};
	 	
		  
	  this.generarPlanPagos = function(credito, form){
/*
	  	var tipoCredito = TiposCredito.findOne(this.credito.tipoCredito_id);
	  	if(!tipoCredito || credito.capitalSolicitado>tipoCredito.montoMaximon){
	  			toastr.error("El monto solicitado es mayor al permitido.");
	  			return;
	  	}
*/
			if(form.$invalid){
				toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
				return;
			}
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
					
					_.each(result,function (pago) {
					
						console.log(pago,"pauisa")
						var pag = pago
						var pa = _.toArray(pag);
						var all = pa[pa.length - 1]
						rc.total = all
						console.log(all,"all 12344")

						rc.planPagos.push(pago)
						$scope.$apply();
					});
					//console.log("Prueba",rc.planPagos)
				}
					
			})

			
			return rc.planPagos;
		}
		
		
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		this.insertarAval = function()
		{
	// 			this.con = this.con + 1;
				this.aval.num = this.avales.length + 1;
				
				this.avales.push(this.aval);	
				this.aval={};
		};
		
		this.actualizarAval = function(a)
		{
			a.num = this.num;
			_.each(this.avales, function(av){
				if (av.num == a.num)
				{
					av.nombre = a.nombre;
					av.estadoCivil = a.estadoCivil;
					av.ocupacion = a.ocupacion;			
					av.direccion = a.direccion;
					av.empresa = a.empresa;
					av.puesto = a.puesto;
					av.antiguedad = a.antiguedad;
					av.direccionEmpresa = a.direccionEmpresa;
					av.parentezco = a.parentezco;
					av.tiempoConocerlo = a.tiempoConocerlo;
				}
			})
			this.aval={};
			this.num=0;
			this.actionAval = true;
		};
		
		this.cancelarAval = function()
		{
			this.aval={};
			this.num = -1;
			this.actionAval = true;
		};
		
		this.quitarAval = function(numero)
		{
			pos = functiontofindIndexByKeyValue(this.avales, "num", numero);
			this.avales.splice(pos, 1);
			if (this.avales.length == 0)
				this.con = 0;
	 
		    functiontoOrginiceNum(this.avales, "num");
		};
		
		this.editarAval = function(a)
		{
			this.aval.nombre = a.nombre;
			this.aval.estadoCivil = a.estadoCivil;
			this.aval.ocupacion = a.ocupacion;			
			this.aval.direccion = a.direccion;
			this.aval.empresa = a.empresa;
			this.aval.antiguedad = a.antiguedad;
			this.aval.direccionEmpresa = a.direccionEmpresa;
			this.aval.parentezco = a.parentezco;
			this.aval.tiempoConocerlo = a.tiempoConocerlo;
			
			this.num = a.num;
		    this.actionAval = false;
		};
		
		this.borrarReferencia = function()
		{
				this.aval.nombre = "";
				this.aval.apellidoPaterno = "";
				this.aval.apellidoMaterno = "";
				this.aval.estadoCivil = "";
				this.aval.ocupacion = "";
				this.aval.direccion = "";
				this.aval.parentezco = "";
				this.aval.tiempoConocerlo = "";
				this.aval.empresa = "";
				this.aval.puesto = "";
				this.aval.antiguedad = "";
				this.aval.direccionEmpresa = "";
				this.aval.parentezco = "";
				this.aval.tiempoConocerlo = "";
				delete this.aval["persona_id"];

		};
		
		this.AgregarAval = function(a){
			this.aval.nombre = a.nombre;
			this.aval.apellidoPaterno = a.apellidoPaterno;
			this.aval.apellidoMaterno = a.apellidoMaterno;
			this.aval.estadoCivil = a.estadoCivil;
			this.aval.ocupacion = a.ocupacion;
			this.aval.direccion = a.direccion;
			this.aval.empresa = a.empresa;
			this.aval.puesto = a.puesto;
			this.aval.antiguedad = a.antiguedad;
			this.aval.direccionEmpresa = a.direccionEmpresa;
			this.aval.parentezco = a.parentezco;
			this.aval.tiempoConocerlo = a.tiempoConocerlo;
			this.aval.persona_id = a._id;
			this.buscar.nombre = "";
		};
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		
		this.insertarGarantia = function(tipo)
		{
				if (tipo == "mobiliaria")
				{				
						this.conG = this.conG + 1;
						this.garantia.num = this.conG;
						
						this.garantias.push(this.garantia);	
						this.garantia={};
				}
				else
				{
						this.conGen = this.conGen + 1;
						this.garantia.num = this.conGen;
						
						this.garantiasGeneral.push(this.garantia);	
						this.garantia={};
				}
					
		};
		
		this.actualizarGarantia = function(tipo, a)
		{
				if (tipo == "mobiliaria")
				{
						a.num = this.numG;
				
						_.each(this.garantias, function(av){
							if (av.num == a.num)
							{
								av.tipo = a.tipo;
								av.marca = a.marca;
								av.modelo = a.modelo;			
								av.serie = a.serie;
								av.color = a.color;
								av.estadoActual = a.estadoActual;
							}
						})
					
						this.garantia = {};
						this.numG = 0;
						this.actionGarantia = true;
				}
				else
				{
						a.num = this.numGen;
				
						_.each(this.garantiasGeneral, function(av){
							if (av.num == a.num)
							{
								av.descripcion = a.descripcion;
								av.valorEstimado = a.valorEstimado;
							}
						})
					
						this.garantia = {};
						this.numGen = 0;
						this.actionGarantia = true;		
				}
						
		};
		
		this.cancelarGarantia = function(tipo)
		{
				if (tipo == "mobiliaria")
				{
						this.garantia={};
						this.numG = -1;
						this.actionGarantia = true;
				}
				else
				{
						this.garantia={};
						this.numGen = -1;
						this.actionGarantia = true;
				}		
		};
		
		this.quitarGarantia = function(tipo, numero)
		{
				if (tipo == "mobiliaria")
				{
						pos = functiontofindIndexByKeyValue(this.garantias, "num", numero);
						this.garantias.splice(pos, 1);
						if (this.garantias.length == 0) 
							this.con = 0;
				 
						functiontoOrginiceNum(this.garantias, "num");
				}
				else
				{
						pos = functiontofindIndexByKeyValue(this.garantiasGeneral, "num", numero);
						this.garantiasGeneral.splice(pos, 1);
						if (this.garantiasGeneral.length == 0) 
							this.con = 0;
				 
						functiontoOrginiceNum(this.garantiasGeneral, "num");		
					
				}
						
		};
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		
		this.fechaPago = function(diaSeleccionado, periodoPago)
		{		
				
				var date = moment();
				var diaActual = date.day();		
				var fecha = new Date();
				var dif = diaActual - diaSeleccionado;
				
				console.log("Actual:", diaActual);
				console.log("Seleccionado:",diaSeleccionado);
				console.log("dif:",dif);
				
				
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
										else if (dif == 5)
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
								
						rc.credito.primerAbono = fecha;
				}
				else if (periodoPago == "Quincenal")
				{
							//Hacer los calculos
				}
				else if (periodoPago == "Mensual")
				{
						//Hacer los calculos
				}	
		};
		
		
		
		
		this.editarGarantia = function(tipo, a)
		{
				if (tipo == "mobiliaria")
				{
						this.garantia.tipo = a.tipo;
						this.garantia.marca = a.marca;
						this.garantia.modelo = a.modelo;			
						this.garantia.serie = a.serie;
						this.garantia.color = a.color;
						this.garantia.estadoActual = a.estadoActual;
						
						this.numG = a.num;
						this.actionGarantia = false;
				}
				else
				{
						this.garantia.descripcion = a.descripcion;
						this.garantia.valorEstimado = a.valorEstimado;
						
						this.numGen = a.num;
						this.actionGarantia = false;
				}		
		};
		
		//busca un elemento en el arreglo
		function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
		    for (var i = 0; i < arraytosearch.length; i++) {
		    	if (arraytosearch[i][key] == valuetosearch) {
					return i;
				}
		    
		  }
		    return null;
	  };
	    
	    //Obtener el mayor
		function functiontoOrginiceNum(arraytosearch, key) {
			var mayor = 0;
		    for (var i = 0; i < arraytosearch.length; i++) {
		    	arraytosearch[i][key] = i + 1;	
		    }
	  };

	  this.borrarBotonImprimir= function()
		{
			var printButton = document.getElementById("printpagebutton");
			 printButton.style.visibility = 'hidden';
			 window.print()
			 printButton.style.visibility = 'visible';
			
		};

		this.imprecion = function(print){

			  var printContents = document.getElementById(print).innerHTML;
			  var popupWin = window.open('', '_blank', 'width=300,height=300');
			  popupWin.document.open();
			  popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
			  popupWin.document.close();
			 // setTimeout(function(){popupWin.print();},1000);

	    };

	    this.imprimirCredito = function(objeto,credito,avales,garantias){

	    	
	    	console.log(objeto,"objeto")
	    	console.log(credito,"credito")


						var pag = objeto
						var pa = _.toArray(pag);
						var all = pa[pa.length - 1]
						console.log(all,"all")
						rc.total = all

			  Meteor.call('getCreditoReporte', objeto,credito,avales,all, function(error, response) {



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

					    dlnk.download = "ReporteCredito.docx"; 
							dlnk.href = url;
							dlnk.click();		    
						  window.URL.revokeObjectURL(url);

  
		   }
		});

	    };
		
	}

};