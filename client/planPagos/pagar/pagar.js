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


	this.helpers({

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

		_.each(rc.planPagosViejo, function(p){
			if(p.pagoSeleccionado != undefined){
				if(p.pagoSeleccionado == true){
					rc.pago.totalPago += p.importeRegular;	
				}	
			}
		});
	}

	this.guardarPago = function(pago,credito)
	{

		var seleccionadosId=[];
		_.each(rc.planPagosViejo,function(p){
			if(p.pagoSeleccionado)
				seleccionadosId.push(p._id)

		});
		console.log(seleccionadosId,pago.pagar,pago.totalPago,pago.tipoIngreso_id)
		Meteor.call("pagoParcialCredito",seleccionadosId,pago.pagar,pago.totalPago,pago.tipoIngreso_id,function(error,success){
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