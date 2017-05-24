angular
.module("creditoMio")
.controller("PagarPlanPagosCtrl", PagarPlanPagosCtrl);
function PagarPlanPagosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.action = false;
	this.fechaActual = new Date();
	
	window.rc = rc;
	this.credito_id = "";
	

	this.credito = {};
	this.pago = {};
	this.pago.totalPago = 0;
	this.pago.totalito = 0
	this.creditos = [];
	this.creditos_id = []
	this.total = 0;
	rc.credit = $stateParams
	this.masInfo = true;
	this.masInfoCredito = true;
	rc.openModal = false
	
	console.log(rc.credito)	

 	this.subscribe('planPagos', () => {
		return [{
			cliente_id : $stateParams.objeto_id, credito_id : { $in : rc.getCollectionReactively("creditos_id")}
		}];
	});
	
	this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.subscribe('cliente', () => {
		return [{ _id : $stateParams.objeto_id }];
	});
	
	this.subscribe('creditos', () => {
		return [{ cliente_id : $stateParams.objeto_id , estatus:4}];
	});
	this.subscribe('pagos', () => {
		return [{estatus:1  }];
	});
	this.subscribe('ocupaciones', () => {
		return [{estatus:true  }];
	});
	this.subscribe('nacionalidades', () => {
		return [{estatus:true  }];
	});
	this.subscribe('estadoCivil', () => {
		return [{estatus:true  }];
	});
	this.subscribe('estados', () => {
		return [{estatus:true  }];
	});
	this.subscribe('paises', () => {
		return [{estatus:true  }];
	});
	this.subscribe('empresas', () => {
		return [{estatus:true  }];
	});

	this.subscribe('personas', () => {
		return [{ }];
	});
	this.subscribe('tiposIngreso',()=>{
		return [{
			estatus : true
		}]
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

		cliente : () => {
			var clientes = Meteor.users.findOne({roles : ["Cliente"]});
		  	if (clientes) {
		  		_.each(clientes, function(cliente){
		  			
		  			cliente.ocupacion = Ocupaciones.findOne(cliente.ocupacion_id)
		  			cliente.estadoCivil = EstadoCivil.findOne(cliente.estadoCivil_id)
		  			cliente.nacionalidad = Nacionalidades.findOne(cliente.nacionalidad_id)
		  			cliente.estado = Estados.findOne(cliente.estado_id)
		  			cliente.pais = Paises.findOne(cliente.pais_id)
		  			cliente.empresa = Empresas.findOne(cliente.empresa_id)
		  			
		  			
		  		})
	  		}
			return clientes;
		},
		tiposIngreso : () => {
			return TiposIngreso.find()
		},
		planPagos : () => {
			return PlanPagos.find({
					cliente_id : $stateParams.objeto_id, credito_id : { $in : this.getCollectionReactively("creditos_id")}
			},{sort : {fechaLimite : 1, numeroPago : 1,descripcion:-1}});
		},
		tiposCredito : () => {
			return TiposCredito.find();
		},
		planPagosViejo : () => {
			
			//rc.credito_id = $stateParams.credito_id;
			var fechaActual = moment();
			var pagos = PlanPagos.find({
					cliente_id : $stateParams.objeto_id, credito_id : { $in : this.getCollectionReactively("creditos_id")}
			},{sort : {fechaLimite : 1, numeroPago : 1,descripcion:-1}}).fetch();

			//var credito =Creditos.findOne({_id : $stateParams.credito_id});
			//console.log(credito)
		// 	if (rc.creditos != undefined) {
		// 	_.each(pagos, function(pago){
		// 		if (pago.estatus == 1) {
		// 			Meteor.call('cambiarEstatusCredito',credito, function(error, response) {
		// 				//console.log("entro")
						
		// 			})
		// 		}else{
					
		// 			rc.creditos.estatus = 4
		// 		}
		// 	});
		// }
			console.log("pp",this.getCollectionReactively("creditos_id"))
		

			return PlanPagos.find({},{sort : {fechaLimite : 1, numeroPago : 1,descripcion:-1}})
		},
		historialCreditos : () => {
			var creditos = Creditos.find().fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "cliente_id");
			}
			
			return creditos;
		},
		creditos : () => {
			var creditos = Creditos.find({}).fetch();
			if(creditos != undefined){
				rc.creditos_id = _.pluck(creditos, "_id");
				console.log("ids",rc.creditos_id)
				_.each(creditos, function(credito){
					credito.planPagos = PlanPagos.find({credito_id : credito._id},{sort : {numeroPago : -1}}).fetch();
			  		credito.nombreTipoCredito = TiposCredito.findOne(credito.tipoCredito_id)
				})
			}


			if (creditos) {
		  		_.each(creditos, function(credito){

		  			_.each(credito.avales_ids, function(aval){
		  			  credito.aval = Personas.findOne(aval)
					
					});		  			
		  			
		  		})
	  		}
			return creditos;
		},
		pagos : () =>{
			return Pagos.find().fetch()
		},
		pagosReporte : () =>{
			_.each(rc.planPagosViejo, function(pp){
				var pagos = pp.pagos


			});

			return Pagos.find().fetch()
		},
		notas : () => {
			return Notas.find().fetch();
		},
	});
	this.getFolio = function(credito_id){
		var credito = Creditos.findOne(credito_id);
		return credito? credito.folio:"";

	};
	this.getnumeroPagos= function(credito_id){
		var credito = Creditos.findOne(credito_id);
		return credito? credito.numeroPagos:"";

	};
	  
 
	
	this.editar = function(pago)
	{
	    this.pago = pago;
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.cambiarEstatus = function(pago, estatus, tipoMov){
		var res = confirm("Está seguro que quiere " + tipoMov + " el pago?");
		if(res == true){
			PlanPagos.update(pago._id, { $set : {estatus : estatus}});
			toastr.success('Cancelado correctamente.');
		}
	}
	
	
	
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
	

  


	this.seleccionarPago = function(pago)
	{ 
		console.log(pago);
 		pago.pagoSeleccionado = !pago.pagoSeleccionado;
		pago.estatus = 0;	
		rc.pago.totalPago = 0;
		if(!pago.pagoSeleccionado)
			pago.importepagado = 0;
		_.each(rc.planPagosViejo, function(p){
			if(!pago.pagoSeleccionado && pago.credito_id == p.credito_id && p.numeroPago>pago.numeroPago && p.estatus!=1){
				p.importepagado = 0;
				p.pagoSeleccionado = false;
			}
			if(pago.pagoSeleccionado && pago.credito_id == p.credito_id && p.numeroPago<=pago.numeroPago && p.estatus!=1){
				p.importepagado = p.importeRegular;
				p.pagoSeleccionado = true;
			}
			if(p.pagoSeleccionado != undefined){
				if(p.pagoSeleccionado == true){
					rc.pago.totalPago += p.importepagado;	
				}	
			}

		});
	}
	this.seleccionarMontoPago = function(pago)
	{ 
		
			
		rc.pago.totalPago = 0;
	
		var i = 0;

		_.each(rc.planPagosViejo, function(p){
			
			if(pago.credito_id == p.credito_id && p.numeroPago<pago.numeroPago && p.estatus!=1){
				p.importepagado = p.importeRegular;
				p.pagoSeleccionado = true;
				p.estatus = 0;
			}
			if(pago==p){
				p.estatus = 0;
				p.pagoSeleccionado = true;
				if(p.importepagado>p.importeRegular)
					p.importepagado=p.importeRegular
				if(p.importepagado<=0 || !p.importepagado || isNaN(p.importepagado)){
					p.importepagado=0
					p.pagoSeleccionado = false;
				}
					
			}
			if(p.pagoSeleccionado != undefined){
				if(p.pagoSeleccionado == true){
					console.log ("--",p.importepagado,rc.pago.totalPago)
					rc.pago.totalPago += p.importepagado;	
				}	
			}
			//console.log(rc)
			//if(!rc.pago.pagar || rc.pago.pagar<rc.pago.totalPago)
				//rc.pago.pagar = rc.pago.totalPago

		});
	}

	this.guardarPago = function(pago,credito)
	{

		var seleccionadosId=[];
		_.each(rc.planPagosViejo,function(p){
			if(p.pagoSeleccionado)
				seleccionadosId.push({id:p._id,importe:p.importepagado})

		});
		console.log(seleccionadosId,pago.pagar,pago.totalPago,pago.tipoIngreso_id)
		Meteor.call("pagoParcialCredito",seleccionadosId,pago.pagar,pago.totalPago,pago.tipoIngreso_id,$stateParams.objeto_id,function(error,success){
			if(!success){
				toastr.error('Error al guardar.');
				return;
			}
			toastr.success('Guardado correctamente.');
			rc.pago = {};
			rc.pago.totalPago = 0;
			rc.pago.totalito = 0
			rc.pago.fechaEntrega = pago.fechaEntrega
			var url = $state.href("anon.imprimirTicket",{pago_id : success},{newTab : true});
			window.open(url,'_blank');
		});

		this.pagosModal= function(credito) {
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

		/*_.each(rc.getReactively("planPagosViejo"), function(pago){
				if (pago.estatus == 1) {
					Meteor.call('cambiarEstatusCredito',credito, function(error, response) {
						//console.log("entro")
						
					})
				}else{
					
					rc.creditos.estatus = 4
				}
					
		});*/

			//console.log(credito)
		// 	if (rc.creditos != undefined) {
		// 	_.each(pagos, function(pago){
		// 		if (pago.estatus == 1) {
		// 			Meteor.call('cambiarEstatusCredito',credito, function(error, response) {
		// 				//console.log("entro")
						
		// 			})
		// 		}else{
					
		// 			rc.creditos.estatus = 4
		// 		}
		// 	});
		// }

	 // console.log(rc.creditos,"el credito") 
		
       
	};

	





};