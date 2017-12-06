angular
	.module('creditoMio')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.fechaActual = new Date();
	this.creditos = [];
	rc.creditos_id = [];
	rc.empresaCliente = ""
	rc.credito_id = ""
	rc.credito = "";
	rc.notaCuenta = []
	rc.empresaArray
	this.notaCobranza = {}
	this.masInfo = false;
	this.masInfoCredito = false;
	this.creditoAc = true;
	this.solicitudesCre = false;
	this.notasCre = false;
	rc.cancelacion = {};
	rc.nota = {};
	rc.pagos = ""
	window.rc = rc;
	this.imagenes = []
	rc.openModal = false
	rc.empresa = {}
	rc.creActivos =false;
	rc.creditoApro = false;
	this.creditosRechazados = false;
	this.respuestaNotaCLiente = false;
	rc.objeto = {};
	rc.objeto.profile = {};
	rc.objeto.profile.empresa = {};
	rc.creditoSeleccionado = {};
	this.estadoCivilSeleccionado = "";
	rc.recibo = {};
	rc.recibos = [];
	rc.empresaSeleccionada = ""
	rc.datosCliente = ""
	rc.btnCerrarRespuesta = true;
	
	rc.editMode = false;
	rc.puedeSolicitar = true;
	
	rc.estatusCaja = "";
	
	rc.parametrizacion = {};
	
	this.subscribe('cajas',()=>{
		return [{}];
	});
	
	this.subscribe('cliente', () => {
		return [{_id : $stateParams.objeto_id}];
	});
	this.subscribe('parametrizacion', () => {
		return [{cliente_id : $stateParams.objeto_id}];
	});
	this.subscribe('creditos', () => {
		return [{cliente_id : $stateParams.objeto_id}];
	});
	this.subscribe('notasCredito', () => {
		return [{cliente_id : $stateParams.objeto_id}];
	});
	this.subscribe('planPagos', () => {
		return [{
			cliente_id : $stateParams.objeto_id, credito_id : { $in : rc.getReactively("creditos_id")}
		}];
	});
	this.subscribe('notas',()=>{
		return [{cliente_id:this.getReactively("cliente_id")}]
	});

	this.subscribe('tiposNotasCredito',()=>{
		return [{}]
	});
	
	this.subscribe('tiposCreditos',()=>{
		return [{}]
	});
	
	this.subscribe('estadoCivil',()=>{
		return [{}]
	});
	
	this.subscribe('pagos',()=>{
		return [{}];
	});
	
	this.subscribe('personas',()=>{
		return [{rol:"Cliente"}];
	});

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

		creditos : () => {
			var creditos = Creditos.find({estatus:4}, {sort:{fechaSolicito:1}}).fetch();
			
			_.each(creditos, function(credito){
				if (credito.saldoMultas == 0) {
					rc.puedeSolicitar = true
				}else{
					rc.puedeSolicitar = false
				}
				if (creditos == "") {
					rc.puedeSolicitar = false
				}
				
				
				credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
								
				credito.tieneAvales = false;
				_.each(credito.avales_ids, function(aval){
						credito.tieneAvales = true;
						Meteor.apply('getAval', [aval.aval_id], function(error, result){
							if(result){

								aval.nombreCompleto = result.nombreCompleto;
								aval.celular = result.celular;
							}
							if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
					    		$scope.$apply();
							}
							
						});
					
				})
				
			});

			return creditos;
		},
		
		parametrizacion : () => {
			rc.parametrizacion = Parametrizacion.findOne({});
			if (rc.parametrizacion)
			{
				return rc.parametrizacion;
			}	
		},
		
		
		creditosAprobados : () =>{
			var creditos = Creditos.find({estatus:2}, {sort:{fechaSolicito:1}}).fetch();			
			if(creditos != undefined){
				_.each(creditos, function(credito){	
					 credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
					 if (credito.avales_ids.length > 0)
					 		credito.tieneAval = "SI";
					 else
					 		credito.tieneAval = "NO";		
					 				
				})
			}
			return creditos;
		},
		creditosCancelados : () =>{
			return Creditos.find({estatus:3});
		},
		creditosPendientes : () =>{
			var creditos = Creditos.find({estatus:{$in:[0,1]} }, {sort:{fechaSolicito:1}}).fetch();
			
			if(creditos != undefined){
				_.each(creditos, function(credito){				
					 credito.estatusClase = obtenerClaseEstatus(credito.requiereVerificacion);
					 credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
					 if (credito.avales_ids.length > 0)
					 		credito.tieneAval = "SI";
					 else
					 		credito.tieneAval = "NO";		
				})
			}
			
			return creditos;
		},
		notasCredito : () =>{
			var notas = NotasCredito.find({},{sort:{fecha:1}});
			return notas

		},
		notaPerfil: () => {
			var nota = Notas.find({perfil : "perfil",estatus:true}).fetch()

			_.each(rc.getReactively("notasCredito"), function(nota){
				//console.log("notas de credito compilla",nota)
				if (nota.tieneVigencia == true ) {
					nota.tieneVigencia = "Si"
				}else{
					nota.tieneVigencia = "No"
				}

			});

			return nota[nota.length - 1];
		
		},
		notaCuenta1: () => {
			var nota = Notas.find({tipo : "Cuenta"}).fetch()
			_.each(nota, function(notita){
				if (notita.estatus == true && notita.cliente_id == rc.objeto._id) {
					$("#myModal").modal(); 
				}
			 });
			return nota[nota.length - 1];
			
			
		},
		
		objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});
			
			_.each(rc.getReactively("notaPerfil"), function(nota){

				if (cli._id == rc.notaPerfil.cliente_id) {

					if (rc.notaPerfil.tipo == "Cuenta") {

						$("#notaPerfil").modal("hide");

					}else{
						//console.log("modal abrir")
						$("#notaPerfil").modal();
					}
				}
			});


			if (cli != undefined)
			{
					//console.log("Cliente:", cli);
					/*
var empresa = Empresas.findOne(cli.profile.empresa_id);

					if (empresa != undefined)
					{
						var pais = Paises.findOne(empresa.pais_id);
						
			      if (pais != undefined) empresa.pais = pais.nombre;
			      var edo = Estados.findOne(empresa.estado_id);
			      if (edo != undefined) empresa.estado = edo.nombre;
			      var mun = Municipios.findOne(empresa.municipio_id);
			      if (mun != undefined) empresa.municipio = mun.nombre;
			      var ciu = Ciudades.findOne(empresa.ciudad_id);
			      if (ciu != undefined) empresa.ciudad = ciu.nombre;
			      var col = Colonias.findOne(empresa.colonia_id);
			      if (col != undefined) empresa.colonia = col.nombre;
	
						cli.profile.empresa = empresa;				
					}	
*/
					/*
rc.referenciasPersonales = [];
					
					//console.log(cli.profile.referenciasPersonales_ids);
		      _.each(cli.profile.referenciasPersonales_ids,function(referenciaPersonal){
			      		//console.log("RP ARRay:",referenciaPersonal);
		            Meteor.call('getReferenciaPersonal', referenciaPersonal.referenciaPersonal_id, function(error, result){           
		                  if (result)
		                  {
			                  //console.log("RP:",result);
		                  	if (result.apellidoMaterno == null) {
		                  		result.apellidoMaterno = ""
		                  	}
		                      //Recorrer las relaciones 
		                      
		                      rc.referenciasPersonales.push({//buscarPersona_id : referenciaPersonal.referenciaPersonal_id,
		                                                     nombre           : result.nombre,
		                                                     apellidoPaterno  : result.apellidoPaterno,
		                                                     apellidoMaterno  : result.apellidoMaterno,
		                                                     parentesco       : referenciaPersonal.parentesco,
		                                                     direccion        : result.direccion,
		                                                     telefono         : result.telefono,
		                                                     tiempo           : referenciaPersonal.tiempoConocerlo,
		                                                     num              : referenciaPersonal.num,
		                                                     nombreCompleto		:	result.nombreCompleto
		                                                     //cliente          : result.cliente,
		                                                     //cliente_id       : result.cliente_id,
		                                                     //tipoPersona      : result.tipoPersona,
		                                                     //estatus          : result.estatus
		                      });
													if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
											    		$scope.$apply();
													}
		                  }
		            }); 
		      });
*/
				/*
	this.ocupacion_id = cli.profile.ocupacion_id;
				
					var ec = EstadoCivil.findOne(cli.profile.estadoCivil_id);
					if (ec != undefined)
							this.estadoCivilSeleccionado = 	ec.nombre;
*/
				/*
	
					
					_.each(cli, function(objeto){

						objeto.documento = Documentos.findOne(objeto.documento_id);
						objeto.pais = Paises.findOne(objeto.pais_id);
						objeto.estado = Estados.findOne(objeto.estado_id);
						objeto.municipio = Municipios.findOne(objeto.municipio_id);
						objeto.ciudad = Ciudades.findOne(objeto.ciudad_id);
						objeto.colonia = Colonias.findOne(objeto.colonia_id);
						objeto.ocupacion = Ocupaciones.findOne(objeto.ocupacion_id);
						objeto.nacionalidad = Nacionalidades.findOne(objeto.nacionalidad_id);
						objeto.estadoCivil = EstadoCivil.findOne(objeto.estadoCivil_id);
						
					});
*/
					
					
			}
			
			return cli;	
		},	
		
		planPagos : () => {
			var planPagos = PlanPagos.find({},{sort : {numeroPago : 1, descripcion:-1}}).fetch();
			
			if(rc.getReactively("creditos") && rc.creditos.length > 0 && planPagos.length > 0){	
				_.each(rc.getReactively("creditos"), function(credito){
					credito.planPagos = [];
					
					credito.numeroPagosCargoMoratorios = 0;
					credito.pagados = 0;
					credito.pagadosCargoM = 0;
					credito.sumaPagosRecibos = 0;
					credito.sumaCargoMoratorios = 0;
					credito.sumaPendientesCargoM = 0;
					credito.tieneCargoMoratorio = false;
					
					credito.pagos = 0;

					_.each(planPagos, function(pago){

						pago.credito = Creditos.findOne(credito._id);

						if(pago.descripcion=="Recibo"){
							credito.pagos +=pago.pago;
						}
						
						if(credito._id == pago.credito_id){
							
							
							pago.numeroPagos = credito.numeroPagos;
							pago.numeroPagosCargoMoratorios = 0;
							
							credito.planPagos.push(pago);
							if (pago.descripcion == "Recibo")
							{
								if (pago.importeRegular == 0)
								{
									  credito.pagados++;
									  credito.sumaPagosRecibos += pago.cargo;
								}
							}
							
							if (pago.descripcion == "Cargo Moratorio")
							{
								credito.tieneCargoMoratorio = true;	
								
								if (pago.importeRegular == 0)
								{
									  credito.pagadosCargoM++;
									  credito.sumaPendientesCargoM += pago.cargo;
								}
								credito.numeroPagosCargoMoratorios += 1;
								credito.sumaCargoMoratorios += pago.cargo;
							}
								
						}
						
					})
				})
			}

			_.each(rc.empresas, function(empresa){

					empresa.ciudad = Ciudades.findOne(empresa.ciudad_id)
					empresa.colonia = Colonias.findOne(empresa.colonia_id)
					empresa.estado = Estados.findOne(empresa.estado_id)
					empresa.municipio = Municipios.findOne(empresa.municipio_id)
					empresa.pais = Paises.findOne(empresa.pais_id)


			});
			return planPagos
		},
	
		usuario: () => {
			return Meteor.users.findOne()
		},
		planPagosHistorial  : () => {
			
			var planes = PlanPagos.find({credito_id : rc.getReactively("credito_id")}, {sort:{numeroPago:1}} ).fetch()
			//rc.creditos_id = _.pluck(planes, "cliente_id");

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
				
				if(planPago.descripcion == "Recibo")
					rc.saldo+=planPago.cargo;
				if(planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas+=planPago.importeRegular;
			});
			
			_.each(rc.getReactively("planPagosHistorial"), function(planPago, index){
				
				//console.log("entro al segundo")
				///console.log("credito",credito)

				
				if(planPago.descripcion=="Cargo Moratorio")
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
							cantidad : credito.numeroPagos,
							fechaSolicito : rc.credito.fechaSolicito,
							fecha : pago.fechaPago,
							pago : pago.totalPago, 
							cargo : 0,
							movimiento : planPago.descripcion=="Cargo Moratorio"? "Abono de Cargo Moratorio":"Abono",
							planPago_id : planPago._id,
							credito_id : planPago.credito_id,
							descripcion : planPago.descripcion=="Cargo Moratorio"? "Abono de Cargo Moratorio":"Abono",
							importe : planPago.importeRegular,
							pagos : planPago.pagos
					  	});
					})
				//console.log(rc.saldo)
			});
		if(this.getReactively("credito_id")){
        var filtrado = [];
        var flags = {
          abonoKey: undefined,
          multaKey:undefined
        };
        _.each(arreglo, function(pago,key){
          if(pago.descripcion == "Cargo Moratorio"){
            flags.multaKey = key;
          }
          if(pago.descripcion == "Recibo"){
            flags.abonoKey = key;
          }
          if(pago.descripcion == "Abono de Multa"){
            //console.log(flags);
            //console.log(arreglo[flags.multaKey].saldoActualizado);
            if(arreglo[flags.multaKey].saldoActualizado){
              arreglo[flags.multaKey].saldoActualizado -= pago.pago;
            }else{
              arreglo[flags.multaKey].saldoActualizado = arreglo[flags.multaKey].cargo - pago.pago;
            }
          }
          if(pago.descripcion == "Abono"){
            if(arreglo[flags.abonoKey].saldoActualizado){
              arreglo[flags.abonoKey].saldoActualizado -= pago.pago;
            }else{
              arreglo[flags.abonoKey].saldoActualizado = arreglo[flags.abonoKey].cargo - pago.pago;
            }
          }
          if(pago.credito_id == rc.credito_id){
            filtrado.push(pago);
          }
          if(pago.numeroPago % 2 == 0)
            {
              
              pago.tipoPar = "par"
            }
            else
            {
              pago.tipoPar = "impar"
            }

        })

        //console.log(filtrado,"filtrado")
        return filtrado;
      }

			//console.log("el ARREGLO del helper historial",arreglo)
			return arreglo;
		},
		historialCreditos : () => {
			var creditos = Creditos.find({estatus: {$in: [4,5]}}).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "_id");
			}	
			return creditos;
		},

		cajero: () => {
			var c = Meteor.users.findOne({roles: "Cajero"});
			
			if (c != undefined)
			{
					var caja = Cajas.findOne({usuario_id: c._id});
					//console.log(caja);
					if (caja != undefined)
					{
							if (caja.estadoCaja == "Cerrada")
									rc.estatusCaja = false;
							else if (caja.estadoCaja == "Abierta")
									rc.estatusCaja = true;
					}
					else
							rc.estatusCaja = false;
			}			
			//console.log(rc.estatusCaja);
			return c;
		},
		
    imagenesDocs : () => {
   	var imagen = rc.imagenes
   	_.each(rc.getReactively("imagenes"),function(imagen){
   		imagen.archivo = rc.objeto.profile.foto

   	});


  		return imagen
		},
				
	});

//////////////////////////////////////////////////////////////////////////////////////////

  this.mostrarCheckCuenta = function(nota){
  	//console.log(nota,"mostrarCheckCuenta")
  	if (nota.tipo == "Cuenta") {
  		//console.log("entra")
			 document.getElementById("cuentaNota").style.visibility = "visible";
		}else{
			document.getElementById("cuentaNota").style.visibility = "hidden";
		}

  };

	//console.log("nota ",rc.notaCuenta1)
	this.actualizar = function(cliente,form){

		//console.log(cliente);
		var clienteTemp = Meteor.users.findOne({_id : cliente._id});
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;
		//console.log(this.cliente.password)
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

	
	this.masInformacion = function(cliente){
		this.masInfo = !this.masInfo;
		this.solicitudesCre = false;
		this.creditoAc = false;
		this.notasCre=false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;

	  Meteor.call('getEmpresaInfo',rc.objeto.profile.empresa_id, function(error, result) {           
        if (result)
        {
        	rc.empresaCliente = result;
		       
					 Meteor.call('getClienteInformacion',cliente, function(error, result) {           
			          if (result)
			          {
			          	rc.objeto = result;
			    				$scope.$apply();      	
								}
					});
				}
		});
		
		rc.referenciasPersonales = [];
					
		//console.log(cli.profile.referenciasPersonales_ids);
    _.each(cliente.profile.referenciasPersonales_ids,function(referenciaPersonal){
      		//console.log("RP ARRay:",referenciaPersonal);
          Meteor.call('getReferenciaPersonal', referenciaPersonal.referenciaPersonal_id, function(error, result){           
                if (result)
                {
                  //console.log("RP:",result);
                	if (result.apellidoMaterno == null) {
                		result.apellidoMaterno = ""
                	}
                    //Recorrer las relaciones 
                    
                    rc.referenciasPersonales.push({//buscarPersona_id : referenciaPersonal.referenciaPersonal_id,
                                                   nombre           : result.nombre,
                                                   apellidoPaterno  : result.apellidoPaterno,
                                                   apellidoMaterno  : result.apellidoMaterno,
                                                   parentesco       : referenciaPersonal.parentesco,
                                                   direccion        : result.direccion,
                                                   telefono         : result.telefono,
                                                   tiempo           : referenciaPersonal.tiempoConocerlo,
                                                   num              : referenciaPersonal.num,
                                                   nombreCompleto		:	result.nombreCompleto
                                                   //cliente          : result.cliente,
                                                   //cliente_id       : result.cliente_id,
                                                   //tipoPersona      : result.tipoPersona,
                                                   //estatus          : result.estatus
                    });
										if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
								    		$scope.$apply();
										}
                }
          }); 
    });



	};
	
	this.creditosActivos = function(){
		this.creditoAc = !this.creditoAc;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}
	this.solicitudesCreditos = function(){
		this.solicitudesCre= !this.solicitudesCre;
		this.creditoAc = false;
		this.masInfo = false;
		this.notasCre=false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}
	this.notasCreditos = function(){
		this.notasCre= !this.notasCre;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}
	this.masInformacionCrdito = function(){
		this.masInfoCredito = !this.masInfoCredito;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.creditoApro = false;
		this.creditosRechazados = false;

	}
	this.creAprobados = function(){
		this.creditoApro = !this.creditoApro;
		this.masInfoCredito = false;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.creditosRechazados = false

	}
	this.creRechazados = function(){
		this.creditoApro = false;
		this.masInfoCredito = false;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.creditosRechazados = !this.creditosRechazados;


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

	this.contestarNota = function(id){

		this.nota = Notas.findOne({_id:id});

		//console.log(this.nota)
		
		if (rc.notaCuenta1.respuestaNota != undefined) {
			//console.log("entro")
			this.nota.respuestaNota = rc.notaCuenta1.respuestaNota
			var idTemp = this.nota._id;
			delete this.nota._id;
			this.nota.respuesta = false
			this.nota.estatus = false
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
			var cre = Creditos.findOne({_id : rc.cancelacion._id});
			Creditos.update({_id : cre._id}, { $set : {estatus : 6, motivo: motivo}});
			toastr.success("El crédito se ha cancelado.")
			$("#cancelaCredito").modal('hide');
	};
	
	
	this.cancelarSeleccion = function(aprobado){
			 rc.cancelacion = aprobado;
			 rc.motivo = "";
	};
	

	this.mostrarNotaCliente = function(){
		$("#modalCliente").modal();
		rc.nota = {};
		document.getElementById("cuentaNota").style.visibility = "hidden";
		
	};

	this.guardarNota = function(objeto){
		//console.log(objeto,"nota")
		objeto.perfil = "perfil"
		objeto.cliente_id = rc.objeto._id
		objeto.nombreCliente = rc.objeto.profile.nombreCompleto
		//objeto.respuesta = true;
		objeto.usuario = rc.objeto.profile.nombreCompleto
		objeto.respuesta =  this.respuestaNotaCLiente	
		objeto.fecha = new Date()
	    objeto.hora = moment(objeto.fecha).format("hh:mm:ss a")
		objeto.estatus = true;
		Notas.insert(objeto);
		toastr.success('Nota guardada.');
		rc.nota = {};
		$("#modalCliente").modal('hide');
	};

	this.verPagos= function(credito) {

		rc.credito = credito;
		rc.credito_id = credito._id;
		$("#modalpagos").modal();
		credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch()
		rc.pagos = credito.pagos
		rc.openModal = true
		////console.log(rc.pagos,"pagos")
		//console.log(rc.historial,"historial act")
		/*
	_.each(rc.getReactively("historial"),function (pago) {

			});
*/

	};

	this.modalDoc= function(img)
	{

		var imagen = '<img class="img-responsive" src="'+img+'" style="margin:auto;">';
		$('#imagenDiv').empty().append(imagen);
		$("#modaldoc").modal('show');
	};
	
	this.imprimirDoc= function(img)
	{
		 Meteor.call('imprimirImagenDocumento', img, function(error, response) {
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

              dlnk.download = "imagenDocumento.docx"; 
              dlnk.href = url;
              dlnk.click();       
              window.URL.revokeObjectURL(url);
  
       }
    });
		/*
var html  = "<html><head>" +
        "</head>" +
        "<body  style ='-webkit-print-color-adjust:exact;'>"+
        "<img src=\"" + img + "\" onload=\"javascript:window.print();\"/>" +
        "</body>";
    var win = window.open("about:blank","_blank");
    win.document.write(html);
*/
	};


	this.cerrarModal= function() {
		rc.openModal = false

	};


  this.generarFicha= function(objeto) 
  {
	   Meteor.call('getPeople',objeto._id,objeto.profile.referenciasPersonales_ids.referenciaPersonal_id, function(error, result){           					
				if (result)
				{
	
					loading(true);
					rc.datosCliente = result.profile;
					
					Meteor.call('getFicha', rc.datosCliente, rc.referenciasPersonales, 'pdf', function(error, response) {

						   if(error)
						   {
						    console.log('ERROR :', error);
						    return;
						   }
						   else
						   {
							   	//console.log(response);
							 		downloadFile(response);
							 		loading(false);
							 }
					});
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
		    //console.log(this.imagenes)

						
	}

	this.quitarNota = function(id)
	{

		//console.log(nota,"seraaaaaaaaaa")
		var nota = Notas.findOne({_id:id});
			if(nota.estatus == true)
				nota.estatus = false;
			else
				nota.estatus = true;
			
			Notas.update({_id: id},{$set :  {estatus : nota.estatus}});
			if (nota.tipo == "Cuenta") {
				$("#myModal").modal('hide');

			}else{$("#notaPerfil").modal('hide');}
			
	}

	function obtenerClaseEstatus(valor){
		
		//console.log(valor);
		if (valor )
			 return "warning";
		else
			 return "info";  	
		
		
		/*
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
*/
	};
	
	this.mostrarReestructuracion= function(objeto)
	{
			rc.creditoSeleccionado = objeto;	
			_.each(rc.creditoSeleccionado.planPagos,function(planPago){
					planPago.editar = false;
					//planPago.numeroPagos = rc.creditoSeleccionado.numeroPagos;
			});
			
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
	    		$scope.$apply();
			}
			$("#modalReestructuracion").modal('show');
	};
	
	this.agregarPago= function()
	{		
			var fecha = moment(new Date()); 
			
		
	    var nuevoPago = {
		    semana							: fecha.isoWeek(),
				fechaLimite					: new Date(new Date(fecha.toDate().getTime()).setHours(23,59,59)),
				diaSemana						: fecha.weekday(),
				tipoPlan						: rc.creditoSeleccionado.periodoPago,
				numeroPago					: rc.creditoSeleccionado.planPagos.length + 1,
				tipoCredito					: rc.credito.tipo, //si es vale o CP
				importeRegular			: 0,
				iva									: 0,
				interes 						: 0,
				seguro							: 0,
				cliente_id					: rc.creditoSeleccionado.cliente_id,
				capital 						: 0,
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
				credito_id 					: rc.creditoSeleccionado._id,
				mes									: fecha.get('month') + 1,
				anio								: fecha.get('year'),
				cargo								: 0,
				movimiento					: "Recibo",
				multa								:0,
				abono								:0,
				numeroPagos					: rc.creditoSeleccionado.planPagos.length + 1
	    };
	    rc.creditoSeleccionado.planPagos.push(nuevoPago);

	};
	
	this.guardarplanPagos= function()
	{		
			
	    _.each(rc.creditoSeleccionado.planPagos,function(planPago){
					
					
					if (planPago._id == undefined)
					{
						
							var suma = planPago.capital + planPago.iva + planPago.interes + planPago.seguro;
							
							planPago.importeRegular = suma;
							planPago.cargo = suma;
							
							PlanPagos.insert(planPago);		
														
							rc.creditoSeleccionado.saldoActual += suma;
							rc.creditoSeleccionado.numeroPagos = planPago.numeroPagos;
							Creditos.update({_id:rc.creditoSeleccionado._id},
															{$set:{saldoActual : rc.creditoSeleccionado.saldoActual, 
																		 numeroPagos : rc.creditoSeleccionado.numeroPagos}
															})
							
					}	
					else
					{
											
							//Actualizar numero de pagos de Credito, asi como el saldo del credito??
							var recibo = PlanPagos.findOne({_id : planPago._id});
							
							planPago.numeroPagos = rc.creditoSeleccionado.planPagos.length;
							
							var valor = 0;
							if (recibo.capital != planPago.capital || recibo.interes != planPago.interes || recibo.iva != planPago.iva || recibo.seguro != planPago.seguro)
							{
									//console.log("Recibo:",recibo);
									var suma = planPago.capital + planPago.iva + planPago.interes + planPago.seguro;
							
									
									planPago.importeRegular = suma;
									planPago.cargo = suma;
									
									//----------------------------------------------------------------------
									if (recibo.capital > planPago.capital) //Sumar al saldoActual
									{
											valor = recibo.capital - planPago.capital;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.capital < planPago.capital) //restar al saldoActual
									{
											valor = planPago.capital - recibo.capital
											rc.creditoSeleccionado.saldoActual += valor;
									}		
									//----------------------------------------------------------------------
									if (recibo.interes > planPago.interes) //Sumar al saldoActual
									{
											valor = recibo.interes - planPago.interes;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.interes < planPago.interes) //restar al saldoActual
									{
											valor = planPago.interes - recibo.interes
											rc.creditoSeleccionado.saldoActual += valor;
									}	
									//----------------------------------------------------------------------
									if (recibo.iva > planPago.iva) //Sumar al saldoActual
									{
											valor = recibo.iva - planPago.iva;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.iva < planPago.iva) //restar al saldoActual
									{
											valor = planPago.iva - recibo.iva
											rc.creditoSeleccionado.saldoActual += valor;
									}	
									//----------------------------------------------------------------------
									if (recibo.seguro > planPago.seguro) //Sumar al saldoActual
									{
											valor = recibo.seguro - planPago.seguro;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.seguro < planPago.seguro) //restar al saldoActual
									{
											valor = planPago.seguro - recibo.seguro
											rc.creditoSeleccionado.saldoActual += valor;
									}	
									//----------------------------------------------------------------------
									rc.creditoSeleccionado.numeroPagos = planPago.numeroPagos;
									Creditos.update({_id : rc.creditoSeleccionado._id},
																	{$set:{saldoActual : rc.creditoSeleccionado.saldoActual, 
																				 numeroPagos : rc.creditoSeleccionado.numeroPagos}
																	})
											
							}
							
							
							var tempId = planPago._id;
							delete planPago._id;
							planPago.credito = {};
							delete planPago.credito;
							
							PlanPagos.update({_id:tempId}, {$set:planPago});		

					}
					
			});	
			toastr.success('Actualizado correctamente.');		

			
	};
	
	//--------------------------------------------------------------------
	this.getRecibos = function(credito_id)
	{
			rc.recibos = PlanPagos.find({credito_id: credito_id, descripcion: "Recibo"}).fetch();
					
	};
	
	this.crearCargoMoratorio = function()
	{
			rc.recibo._id= "";		
			rc.recibo.importe = 0.00;
			$("#modalCargosMoratorios").modal('show');
	};
	
	this.guardarCargoMoratorio = function(objeto)
	{	
			if (rc.recibo._id == "")
			{
					toastr.error('Debe de seleccionar un recibo.');	
					return;	
				
			}
			
			var c = Creditos.findOne({ob})
			
			var mfecha = moment(new Date());
			var pago = PlanPagos.findOne(rc.recibo._id);
			var multas = Number(rc.recibo.importe); 
			var iva = 0;
			var interes = 0;
			
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
				planPago_id					: rc.recibo._id,
				tiempoPago					: 0,
				modificada					: false,
				pagos 							: [],
				descripcion					: "Cargo Moratorio",
				ultimaModificacion	: new Date(),
				credito_id 					: objeto.credito_id,
				mes									: mfecha.get('month') + 1,
				anio								: mfecha.get('year'),
				cargo								: multas,
				movimiento					: "Cargo Moratorio",
				tipoCargoMoratorio	: 2,	//Manual,
				tipoCredito					: objeto.tipo //Si es Vale o CP
			};
			
			var creditoSeleccionado = Creditos.findOne(objeto.credito_id);
			//console.log(creditoSeleccionado);
						

			var multa_id = PlanPagos.insert(multa);
			PlanPagos.update({_id:rc.recibo._id},{$set:{multada : 1, multa_id : multa_id}})
			var suma = multas + iva + interes;
			creditoSeleccionado.saldoMultas += suma;
			creditoSeleccionado.saldoMultas = Math.round(creditoSeleccionado.saldoMultas * 100) / 100;
			Creditos.update({_id:objeto.credito_id},{$set:{saldoMultas:creditoSeleccionado.saldoMultas, estatus: 4}})

			$("#modalCargosMoratorios").modal('hide');
			toastr.success('Actualizado correctamente.');	
	};
	
	//--------------------------------------------------------------------
	
	this.modificar= function(pago)
	{		
	    pago.editar = true;
	};
	this.actualizar= function(pago)
	{		
	    pago.editar = false;
	};
	
	this.sumarPago = function(pago)
	{
			
			_.each(rc.creditoSeleccionado.planPagos,function(planPago){
					if(planPago.numeroPago == pago.numeroPago)
					{
							planPago.importeRegular = pago.capital + pago.interes + pago.iva + pago.seguro;
							planPago.cargo = pago.capital + pago.interes + pago.iva + pago.seguro;
					}		
			});	
	}
	
	this.cerrar = function()
	{
		
			var planPagos = PlanPagos.find({},{sort : {numeroPago : 1, descripcion:-1}}).fetch();
			if(rc.creditos && rc.creditos.length > 0 && planPagos.length > 0){	
				_.each(rc.creditos, function(credito){
					credito.planPagos = [];
					credito.pagados = 0;
					credito.abonados = 0;
					credito.condonado = 0;
					credito.tiempoPago = 0;
					credito.pagos = 0;

					_.each(planPagos, function(pago){

						pago.credito = Creditos.findOne(credito._id);

						if(pago.descripcion=="Recibo"){
							credito.pagos +=pago.pago;
						}
						if(credito._id == pago.credito_id){
							pago.numeroPagos = credito.numeroPagos;
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
			
			rc.modalReestructuracion = false;

		
	}

	this.cambioEstatusRespuesta=function(){
		this.respuestaNotaCLiente = !this.respuestaNotaCLiente;
					
	}
	this.seleccionContrato=function(contrato){
		//console.log( contrato)
					
	}
	this.trance= function(credito)
	{
		    Meteor.call('numeroALetras',credito.capitalSolicitado, function(error, result){           					
					if (result)
					{
							rc.cantidad = result
					}			
			});
		};
	this.getAvales= function(credito)
	{
				
	};

	this.imprimirContratos = function(contrato,cliente){
			
			var avales = [];
	 		if (contrato.avales_ids.length > 0) {
					rc.avalpapu = contrato.avales_ids[0].aval_id
	        Meteor.call('obAvales',rc.avalpapu, function(error, result){           					
						if (result)
						{
								rc.avalesCliente = result.profile
								avales = rc.avalesCliente
					    }
					});
		  }	
			contrato.tipoInteres = TiposCredito.findOne(contrato.tipoCredito_id)
			
			
	    Meteor.call('getPeople',cliente,contrato._id, function(error, result){           					
				if (result)
				{
					rc.datosCliente = result.profile;
					
					var _credito = {
						cliente									: contrato.nombre,
						tipoCredito_id 					: contrato.tipoCredito_id,
						fechaSolicito 					: new Date(),
						duracionMeses 					: contrato.duracionMeses,
						capitalSolicitado 			: contrato.capitalSolicitado,
						adeudoInicial 					: 0,
						saldoActual 						: 0,
						periodoPago 						: contrato.periodoPago,
						fechaPrimerAbono 				: contrato.fechaPrimerAbono,
						multasPendientes 				: 0,
						saldoMultas 						: 0.00,
						saldoRecibo 						: 0.00,
						estatus 								: 1,
						requiereVerificacion		: contrato.requiereVerificacion,
						sucursal_id 						: Meteor.user().profile.sucursal_id,
						fechaVerificacion				: contrato.fechaVerificacion,
						turno										: contrato.turno,
						tasa										: contrato.tasa,
						conSeguro 							: contrato.conSeguro,
						seguro									: contrato.seguro
					};
					
					Meteor.call("generarPlanPagos",_credito,rc.cliente,function(error,result){

						if (result)
						{
								//console.log("Plan Pagos", result);
								Meteor.call('contratos', contrato, contrato._id,rc.datosCliente,result, avales, function(error, response) {
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
										  

											//CONTRATO SIMPLE ////////////////////////////////////////////////////
										  if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) {

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
												//console.log("HIPOTECARIO","INTERES:",contrato.tipoInteres.tipoInteres)
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
												//console.log("PRENDARIA","INTERES:",contrato.tipoInteres.tipoInteres)
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
										}//else
								});//meteorcontratos							
						}
					});	
				}
			});
	};

	this.recuperarCredito= function(id)
	{
	
	    var r = confirm("Selecciona una opción");
	    if (r == true) {
	        var objeto = Creditos.findOne({_id:id});
				if(objeto.estatus == 3)
					objeto.estatus = 1;
				else
					objeto.estatus = 3;
				
				Creditos.update({_id: id},{$set :  {estatus : objeto.estatus}});

				toastr.success('Crédito Recuperado');
	    } else {
       
	   	}		
	};
	this.CreditoSolicitar= function(id)
	{
			
			//console.log(id);
    	$state.go("root.generadorPlan",{objeto_id : id});
	  
	    // ui-sref="root.generadorPlan({objeto_id : cd.objeto._id})"
	};
	this.btnCerrar= function()
	{

    	rc.btnCerrarRespuesta = false
	  
	    // ui-sref="root.generadorPlan({objeto_id : cd.objeto._id})"
	};

	this.imprimirHistorial= function(objeto,cliente,credito) 
  {
  	//console.log(objeto,"pp")

    cliente = rc.datosCliente
    //console.log("toshtta japon",cliente)

    var sumaCargos = 0
    var sumaAbonos = 0
    var popo = 0
    objeto.objetoFinal = objeto[objeto.length - 1];
     _.each(objeto,function(item){

        if (item.movimiento == "Cargo Moratorio") {
          sumaCargos += item.importe
          sumaAbonos += item.pago

        }
        if (item.movimiento == "Abono") {
          sumaAbonos += item.pago

        }
      
        //suma += item.capitalSolicitado
        //sumaSol += item.adeudoInicial
        popo = objeto.objetoFinal.saldo
        item.ultimoSaldo =  popo
     
      });

       _.each(objeto,function(item){
       item.sumaCargos = sumaCargos
       item.sumaAbonos = sumaAbonos
        
    });
    
         

    Meteor.call('imprimirHistorial', objeto, cliente,credito, function(error, response) {     
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

           dlnk.download = "HISTORIALCREDITICIO.docx"; 
          dlnk.href = url;
          dlnk.click();       
          window.URL.revokeObjectURL(url);
      }
    });
  };  

  this.obtenerGente= function(objeto)
	{		
		//console.log(objeto,"Cliente")
		    Meteor.call('getPeople',objeto._id, function(error, result){           					
				if (result)
				{

					rc.datosCliente = result.profile

					   //console.log("cliente",rc.datosCliente)
	 
			   }
		});
	    
	};

/*
	$(document).ready(function() {

	  $('.po-markup').popover({
	    trigger: 'hover',
	    html: true,  
	    
	    title: function() {
	      return $(this).parent().find('.po-title').html();
	    },
	    content: function() {
	      return $(this).parent().find('.po-body').html();
	    },
	
	    container: 'body',
	    placement: 'right'
	  });
	
	});
*/
	
	  	
	
}