angular
	.module('creditoMio')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.fechaActual = new Date();
	this.creditos = [];
	this.creditos_id = [];
	rc.credito_id = ""
	rc.credito = "";
	rc.notaCuenta = []
	rc.empresaArray
	this.notaCobranza = {}
	this.masInfo = true;
	this.masInfoCredito = true;
	this.creditoAc = false;
	this.solicitudesCre = true;
	this.notasCre = true;
	rc.cancelacion = {};
	rc.nota = {};
	rc.pagos = ""
	window.rc = rc;
	this.imagenes = []
	rc.openModal = false
	rc.empresa = {}

	
	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			_id : $stateParams.objeto_id
		}];
	});
	
	this.subscribe('creditos', () => {
		return [{
			cliente_id : $stateParams.objeto_id
		}];
	});
	this.subscribe('notasCredito', () => {
		return [{
			cliente_id : $stateParams.objeto_id
		}];
	});
	
	this.subscribe('planPagos', () => {
		return [{
			cliente_id : $stateParams.objeto_id, credito_id : { $in : this.getCollectionReactively("creditos_id")}
		}];
	});
	// this.subscribe('planPagos', () => {
	// 	return [{
	// 		cliente_id : $stateParams.objeto_id, credito_id : this.getCollectionReactively("credito_id")
	// 	}];
	// });
		 this.subscribe('notas',()=>{
		return [{cliente_id:this.getReactively("cliente_id"),respuesta:true}]
	});

	this.subscribe('tiposNotasCredito',()=>{
		return [{}]
	});
	this.subscribe('pagos',()=>{
		return [{}];
	});
	this.subscribe('documentos',()=>{
		return [{}];
	});
	this.subscribe('personas',()=>{
		return [{}];
	});

	this.subscribe('ciudades',()=>{
		return [{}];
	});
	this.subscribe('municipios',()=>{
		return [{}];
	});
	this.subscribe('colonias',()=>{
		return [{}];
	});
	this.subscribe('estadoCivil',()=>{
		return [{}]
	 });
	this.subscribe('paises',()=>{
		return [{}];
	});
	this.subscribe('sucursales',()=>{
		return [{}];
	});
	this.subscribe('empresas',()=>{
		return [{}];
	});
	this.subscribe('estados',()=>{
		return [{}];
	});
	this.subscribe('nacionalidades',()=>{
		return [{}];
	});
			
	this.helpers({
		ciudades : () => {
			var ciudades = {};
			_.each(Ciudades.find().fetch(), function(ciudad){
				ciudades[ciudad._id] = ciudad;
			});
			return ciudades
		},
		municipios : () => {
			var municipios = {};
			_.each(Municipios.find().fetch(), function(municipio){
				municipios[municipio._id] = municipio;
			});
			return municipios
		},
		paises : () => {
			var paises = {};
			_.each(Paises.find().fetch(), function(pais){
				paises[pais._id] = pais;
			});
			return paises
		},
		estados : () => {
			var estados = {};
			_.each(Estados.find().fetch(), function(estado){
				estados[estado._id] = estado;
			});
			return estados
		},
		colonias : () => {
			var colonias = {};
			_.each(Colonias.find().fetch(), function(colonia){
				colonias[colonia._id] = colonia;
			});
			return colonias
		},
		
		// referencias : () => {
		// 	var referencias = {};
		// 	_.each(Personas.find().fetch(), function(referencia){
		// 		referencias[referencia._id] = referencia;
		// 	});
		// 	return referencias
		// },
		creditos : () => {
			var creditos = Creditos.find({estatus:4}).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
			}
			
			return creditos;
		},

		historialCreditos : () => {
			var creditos = Creditos.find().fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
			}
			
			return creditos;
		},

		creditosAprobados : () =>{
			return Creditos.find({estatus:2});
		},
		creditosPendientes : () =>{
			var creditos = Creditos.find({estatus:{$in:[0,1]}}).fetch();
			if(creditos.length > 0){
				_.each(creditos, function(credito){
					credito.estatusClase = obtenerClaseEstatus(credito.estatus);
				})
			}
			
			
			return creditos;
		},
		notasCredito : () =>{
			return NotasCredito.find({},{sort:{fecha:1}});
		},
		notaPerfil: () => {
			var nota = Notas.find({perfil : "perfil",respuesta:true}).fetch()
			return nota[nota.length - 1];
		},
		objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});
			
			_.each(rc.getReactively("notaPerfil"), function(nota){
				//console.log(rc.notaPerfil.cliente_id,"nota a l avga")
				if (cli._id == rc.notaPerfil.cliente_id) {
					//console.log("entro aqui compilla")
					$("#notaPerfil").modal();
					
				}

			});

			
			_.each(cli, function(objeto){
				 //console.log(objeto,"objeto")
				 rc.referencias = [];
				 //rc.empresas = [];
				
				objeto.empresa = Empresas.findOne(objeto.empresa_id)
				// objeto.documento = Documentos.findOne(objeto.docuemnto_id)
				objeto.documento = Documentos.findOne(objeto.documento_id)
				objeto.pais = Paises.findOne(objeto.pais_id)
				objeto.estado = Estados.findOne(objeto.estado_id)
				objeto.municipio = Municipios.findOne(objeto.municipio_id)
				objeto.ciudad = Ciudades.findOne(objeto.ciudad_id)
				objeto.colonia = Colonias.findOne(objeto.colonia_id)
				objeto.ocupacion = Ocupaciones.findOne(objeto.ocupacion_id)
				objeto.nacionalidad = Nacionalidades.findOne(objeto.nacionalidad_id)
				objeto.estadoCivil = EstadoCivil.findOne(objeto.estadoCivil_id)
				
				_.each(objeto.referenciasPersonales_ids, function(referencia){
						Meteor.call('getReferencias', referencia, function(error, result){	
					//console.log("entra aqui",referencia)					
						if (result)
							//console.log(result,"caraculo")
						{
							//console.log("entra aqui");
							//console.log("result",result);
							rc.referencias.push(result);
							$scope.$apply();			
						}
					});	
				});

				Meteor.call('getEmpresas', objeto.empresa_id, function(error, result){	
					//console.log("entra aqui",referencia)					
						if (result)
							//console.log(result,"caraculo")
						{
							//console.log("entra aqui");
							//console.log("result",result);
							rc.empresa = result
							$scope.$apply();			
						}
					});	
				
			    });

			if(cli){
				this.ocupacion_id = cli.profile.ocupacion_id;


				return cli;
			}		
		},
		
		ocupaciones : () => {
			if(this.getReactively("creditos")){
				this.creditos_id = _.pluck(rc.creditos, "_id");
			}
			return Ocupaciones.find();
		},
		planPagos : () => {
			var planPagos = PlanPagos.find({},{sort : {numeroPago : 1, descripcion:-1}}).fetch();
			if(rc.getReactively("creditos") && rc.creditos.length > 0 && planPagos.length > 0){
				
				_.each(rc.getReactively("creditos"), function(credito){
					credito.planPagos = [];
					credito.pagados = 0;
					credito.abonados = 0;
					credito.condonado = 0;
					credito.tiempoPago = 0;
					credito.pagos = 0;

					_.each(planPagos, function(pago){
						if(pago.descripcion=="Recibo"){
							credito.pagos +=pago.pago;
						}
						if(credito._id == pago.credito_id){
							credito.planPagos.push(pago);
							if(pago.estatus == 0){
								credito.pendientes++;
							}else if(pago.estatus == 1){
								credito.pagados++;
							}else if(pago.estatus == 2){
								credito.abonado++;
							}else if(pago.estatus == 3){
								credito.condonado++;
							}
							
							if(pago.multada == 1){
								credito.tiempoPago++;
							}
						}
					})
				})
			}

			_.each(rc.empresas, function(empresa){
				console.log("akakakakkakkakkaakakaak")
					empresa.ciudad = Ciudades.findOne(empresa.ciudad_id)
					empresa.colonia = Colonias.findOne(empresa.colonia_id)
					empresa.estado = Estados.findOne(empresa.estado_id)
					empresa.municipio = Municipios.findOne(empresa.municipio_id)
					empresa.pais = Paises.findOne(empresa.pais_id)

					console.log(empresa,"empresaaaaaaaaaa")


				});
			return planPagos
		},
		notaCuenta1: () => {
			var nota = Notas.find({tipo : "Cuenta"}).fetch()
		

				return nota[nota.length - 1];
			
			
		},
		usuario: () => {
			return Meteor.users.findOne()
		},
		planPagosHistorial  : () => {
			
			var planes = PlanPagos.find({credito_id : rc.getReactively("credito_id")}).fetch()
			//rc.creditos_id = _.pluck(planes, "cliente_id");
			console.log("kaka",planes)


			return planes

		},
		historial : () => {
			arreglo = [];
			var saldoPago = 0;
			var saldoActual = 0; 
			rc.saldo =0;	
			var credito = rc.credito
			rc.saldoMultas=0;
			

			_.each(rc.getReactively("planPagosHistorial"), function(planPago){
				
				if(planPago.descripcion=="Recibo")
					rc.saldo+=planPago.cargo;
				if(planPago.descripcion=="Multa")
					rc.saldoMultas+=planPago.importeRegular;
			});
			
			_.each(rc.getReactively("planPagosHistorial"), function(planPago, index){
				
				console.log("entro al segundo")
				console.log("credito",credito)

				
				if(planPago.descripcion=="Multa")
					rc.saldo+=planPago.cargo
				
				fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite
				//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
				arreglo.push({saldo:rc.saldo,
					numeroPago : planPago.numeroPago,
					cantidad : rc.credito.numeroPagos,
					fechaSolicito : rc.credito.fechaSolicito,
					fecha : fechaini,
					pago : 0, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos
			  	});				
				if(planPago.pagos.length>0)
					_.each(planPago.pagos,function (pago) {
						rc.saldo-=pago.totalPago
						arreglo.push({saldo:rc.saldo,
							numeroPago : planPago.numeroPago,
							//cantidad : credito.numeroPagos,
							fechaSolicito : rc.credito.fechaSolicito,
							fecha : pago.fechaPago,
							pago : pago.totalPago, 
							cargo : 0,
							movimiento : planPago.descripcion=="Multa"? "Abono de Multa":"Abono",
							planPago_id : planPago._id,
							credito_id : planPago.credito_id,
							descripcion : planPago.descripcion=="Multa"? "Abono de Multa":"Abono",
							importe : planPago.importeRegular,
							pagos : planPago.pagos
					  	});
					})
				//console.log(rc.saldo)
			});

			console.log("el ARREGLO del helper historial",arreglo)
			return arreglo;
		},

		   imagenesDocs : () => {
		   	var imagen = rc.imagenes
		   	_.each(rc.getReactively("imagenes"),function(imagen){
		   		imagen.archivo = rc.objeto.profile.foto

		   	});


		  		return imagen
	  		},
				
	});



	$(document).ready(function() {
    if (rc.getReactively("notaCuenta1") != undefined) {
    	//console.log("entro al modal ",rc.notaCuenta1)

    	if (rc.notaCuenta1 != undefined) {
    		//console.log("mostrara el modal ")
    		_.each(rc.getReactively("notaCuenta1"), function(nota){
    			_.each(rc.getReactively("objeto"), function(item){
    			//console.log("entra")
    			if (nota.cliente_id == item._id ) {
    				//console.log("each del modal")
    				$("#myModal").modal(); 
    			}
    		});
    	});

    	
    }

    }else{
    	console.log("no hay nota")
    }
	});


	//console.log("nota ",rc.notaCuenta1)
	this.actualizar = function(cliente,form){

		//console.log(cliente);
		var clienteTemp = Meteor.users.findOne({_id : cliente._id});
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;
		console.log(this.cliente.password)
		//document.getElementById("contra").value = this.cliente.password;

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete cliente.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.cliente, "cliente");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
		//$state.go('root.clientes');
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){
			rc.cliente.profile.fotografia = data;
		});
	};
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "Masculino")
				return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
		}else{
			return foto;
		}
	}
	
	this.masInformacion = function(){
		this.masInfo = !this.masInfo;
	}
	this.creditosActivos = function(){
		this.creditoAc = !this.creditoAc;
	}
	this.solicitudesCreditos = function(){
		this.solicitudesCre= !this.solicitudesCre;
	}
	this.notasCreditos = function(){
		this.notasCre= !this.notasCre;
	}
	this.masInformacionCrdito = function(){
		this.masInfoCredito = !this.masInfoCredito;
	}
	this.getNombreTipoNotaCredito = function (tipo_id) {
		var tipo = TiposNotasCredito.findOne(tipo_id);
		return tipo? tipo.nombre:"";
	}
	this.obtenerEstatus = function(cobro){
		if(cobro.estatus == 1)
			return "bg-color-green txt-color-white";
	 	if(cobro.estatus == 5 || cobro.tmpestatus==5)
		 	return "bg-color-blue txt-color-white";
	 	else if(cobro.estatus == 3)
	 		return "bg-color-blueDark txt-color-white";
	 	else if(cobro.estatus == 2)
	 		return "bg-color-red txt-color-white";
	 	else if(cobro.estatus == 6)
	 		return "bg-color-greenLight txt-color-white";
	 	else if(cobro.tiempoPago == 1)
	 		return "bg-color-orange txt-color-white";
		
		return "";
		
	}


	// $(document).ready(function() {
	// 	if (rc.getReactively("nota") != undefined) {
	// 	    	//console.log("entro al modal ")
	// 	   if (rc.notaCuenta1.perfil != undefined) {
	// 	    		//console.log("mostrara el modal ")
	// 	    	$("#myModal").modal(); 
	// 	   	}
	// 	   	else
	// 	   	{
	// 	    	$("#myModal").modal('hide'); 
	// 			}
 //    }
	// });



	this.contestarNota = function(id){

		this.nota = Notas.findOne({_id:id});

		console.log(this.nota)
		
		if (rc.notaCobranza.respuestaNota != undefined) {
			console.log("entro")
			this.nota.respuestaNota = rc.notaCobranza.respuestaNota
			var idTemp = this.nota._id;
			delete this.nota._id;
			this.nota.respuesta = false
			Notas.update({_id:idTemp},{$set:this.nota});
			toastr.success('Comentario guardado.');
			$("#myModal").modal('hide');
		}else{
			toastr.error('Comentario vacio.');
		}


	};
	

/*
	this.imprimirDocumento = function(aprobado){
			Meteor.call('imprimirDocumentos', aprobado, function(error, response) {
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
*/

	
	this.cancelarCredito = function(motivo){
			
			var cre = Creditos.findOne({folio : rc.cancelacion.folio});
			Creditos.update({_id : cre._id}, { $set : {estatus : 6, motivo: motivo}});
			toastr.success("El crédito se ha cancelado.")
			$("[data-dismiss=modal]").trigger({ type: "click" });			
		
	};
	
	
	this.cancelarSeleccion = function(aprobado){
			 rc.cancelacion.folio = aprobado.folio;
	};
	

	this.mostrarNotaCliente = function(){
		$("#modalCliente").modal();
		rc.nota = {};
		
	};

	this.guardarNota = function(objeto){
		console.log(objeto,"nota")
		objeto.perfil = "perfil"
		objeto.cliente_id = rc.objeto._id
		objeto.nombreCliente = rc.objeto.profile.nombreCompleto
		objeto.respuesta = true;
		Notas.insert(objeto);
		toastr.success('Nota guardada.');
		rc.nota = {};
		$("#modalCliente").modal('hide');
	};

	this.verPagos= function(credito) {
		console.log(credito,"el ob ")
		rc.credito = credito;
		rc.credito_id = credito._id;
		$("#modalpagos").modal();
		credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch()
		rc.pagos = credito.pagos
		rc.openModal = true
		////console.log(rc.pagos,"pagos")
		console.log(rc.historial,"historial act")
			_.each(rc.getReactively("historial"),function (pago) {

			});

	};

	this.modalDoc= function(img)
	{
		var imagen = '<img class="img-responsive" src="'+img+'" style="margin:auto;">';
		$('#imagenDiv').empty().append(imagen);
		$("#modaldoc").modal('show');
	};

	this.cerrarModal= function() {
		rc.openModal = false

	};

	this.tieneFoto = function(foto, sexo){
		
	  if(foto === undefined){
		  if(sexo === "Masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
	  }else{
		  return foto;
	  }
  };



  this.generarFicha= function(objeto) 
  {
		console.log("entro:", objeto);	 

		objeto.nombreCompleto = objeto.profile.nombreCompleto
		objeto.lugarNacimiento = objeto.profile.lugarNacimiento;
		console.log("entro2:", objeto);


		_.each(objeto, function(cliente){	
	  			// var empresa = Empresas.findOne(cliente.empresa_id);
	  			// cliente.empresaCiudad = empresa.ciudad;
	  			// cliente. = empresa.;
			 	cliente.ocupacion = Ocupaciones.findOne(cliente.ocupacion_id)
				cliente.estadoCivil = EstadoCivil.findOne(cliente.estadoCivil_id)
				cliente.nacionalidad = Nacionalidades.findOne(cliente.nacionalidad_id)
				cliente.estado = Estados.findOne(cliente.estado_id)
				cliente.pais = Paises.findOne(cliente.pais_id)
				cliente.empresa = Empresas.findOne(cliente.empresa_id);
				cliente.colonia = Colonias.findOne(cliente.colonia_id)
				cliente.ciudad = Ciudades.findOne(cliente.ciudad_id)
				cliente.sucursal = Sucursales.findOne(cliente.sucursal_id)
				cliente.municipio = Municipios.findOne(cliente.municipio_id)
		});

		  		
		objeto.ocupacion = objeto.profile.ocupacion
		objeto.estadoCivil = objeto.profile.estadoCivil 
		objeto.nacionalidad = objeto.profile.nacionalidad
		objeto.estado = objeto.profile.estado
		objeto.pais = objeto.profile.pais
		objeto.colonia = objeto.profile.colonia
			objeto.ocupacion = objeto.profile.ocupacion
			objeto.estadoCivil = objeto.profile.estadoCivil
			objeto.nacionalidad = objeto.profile.nacionalidad
			objeto.estado = objeto.profile.estado
			objeto.pais = objeto.profile.pais
			objeto.colonia = objeto.profile.colonia
	    objeto.ciudad = objeto.profile.ciudad
	    objeto.sucursal = objeto.profile.ciudad
	    objeto.municipio = objeto.profile.nombre
	    objeto.empresa = objeto.profile.empresa
	    //console.log('-----------------------', objeto.profile.empresa);
	    objeto.ciudadEmpresa = rc.ciudades[objeto.profile.empresa.ciudad_id].nombre;
	    objeto.municipioEmpresa = rc.municipios[objeto.profile.empresa.municipio_id].nombre;
	    objeto.paisEmpresa = rc.paises[objeto.profile.empresa.pais_id].nombre;
	    objeto.coloniaEmpresa = rc.colonias[objeto.profile.empresa.colonia_id].nombre;
	   
	    console.log("cliente",objeto)
	  
	   
	    //objeto.documento = objeto.profile.documento


		Meteor.call('getFicha', objeto, rc.referencias, function(error, response) {

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

				    dlnk.download = "FICHASOCIO.docx"; 
						dlnk.href = url;
						dlnk.click();		    
					  window.URL.revokeObjectURL(url);

  
		   }
		});

		
	}; 

	this.diarioCobranza= function(objeto) {

		//console.log(objeto,"objetillo")
		objeto.fechaInicial = objeto[0].fechaSolicito
		objeto.objetoFinal = objeto[objeto.length - 1];
		objeto.fechaFinal = objeto.objetoFinal.fechaSolicito
		//console.log(objeto,"actualizado")

	}
	this.mostrarModal= function()
	{
		$("#modalDocumento").modal();
	};

	 this.almacenaImagen = function(imagen)
	{
		if (this.objeto)
			this.objeto.profile.foto = imagen;
		    this.imagenes.push({archivo:imagen})
		    console.log(this.imagenes)

						
	}


  // $(document).ready( function() {
		

		// 	$(".Mselect2").select2();
					
		// 	var fileInput1 = document.getElementById('fileInput1');
		// 	var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
			
			
		// 	//JavaScript para agregar la Foto
		// 	fileInput1.addEventListener('change', function(e) {
		// 		var file = fileInput1.files[0];
		// 		var imageType = /image.*/;
	
		// 		if (file.type.match(imageType)) {
					
		// 			if (file.size <= 512000)
		// 			{
						
		// 				var reader = new FileReader();
		
		// 				reader.onload = function(e) {
		// 					fileDisplayArea1.innerHTML = "";
		
		// 					var img = new Image();
							
							
		// 					img.src = reader.result;
		// 					img.width =200;
		// 					img.height=200;
		
		// 					rc.objeto.profile.documento.archivo(reader.result);
		// 					//this.folio.imagen1 = reader.result;
							
		// 					fileDisplayArea1.appendChild(img);
		// 					//console.log(fileDisplayArea1);
		// 				}
		// 				reader.readAsDataURL(file);			
		// 			}else {
		// 				toastr.error("Error la Imagen supera los 512 KB");
		// 				return;
		// 			}
					
		// 		} else {
		// 			fileDisplayArea1.innerHTML = "File not supported!";
		// 		}
		// 	});		
	 //  });


	  this.quitarNota = function(id)
	{

		console.log(nota,"seraaaaaaaaaa")
		var nota = Notas.findOne({_id:id});
			if(nota.respuesta == true)
				nota.respuesta = false;
			else
				nota.respuesta = true;
			
			Notas.update({_id: id},{$set :  {respuesta : nota.respuesta}});
			$("#notaPerfil").modal('hide');
	}

	this.modalDoc= function(img)
	{
		var imagen = '<img class="img-responsive" src="'+img+'" style="margin:auto;">';
		$('#imagenDiv').empty().append(imagen);
		$("#modaldoc").modal('show');
	};

	function obtenerClaseEstatus(estatus){
		console.log("hola", estatus);
		if(estatus == 0){
			return "danger";
		}else if(estatus == 1){
			return "warning";
		}else if(estatus == 2){
			return "primary";
		}else if(estatus == 3){
			return "danger";
		}else if(estatus == 4){
			return "info";
		}else if(estatus == 5){
			return "success";
		}else if(estatus == 6){
			return "danger";
		}
	}

	
}