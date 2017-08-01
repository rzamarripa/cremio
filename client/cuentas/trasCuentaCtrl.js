angular.module("creditoMio")
.controller("TraspasoCuentaCtrl", TraspasoCuentaCtrl);
 function TraspasoCuentaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
	
	this.action = false;
	this.nuevo = true;	 
	this.objeto = {}; 
	this.buscar = {};
	

	this.subscribe('cajas',()=>{
		return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""}]
	});

	this.subscribe('tiposIngreso',()=>{
		return [{
			estatus : true
		}]
	});

	this.subscribe('traspasos',()=>{
		return[{
			estatus : 1,
			tipo : "CuentaCuenta",
			sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
		}];
	});

	this.subscribe('cuentas',()=>{
		return [{
			estatus : 1
		}]
	});


	this.helpers({
		cajas : () => {
			return Cajas.find();
		},
		cuentas : () => {
			return Cuentas.find();
		},
	
		traspasos : () => {
			var traspasos = Traspasos.find({},{order: {createdAt: -1}}).fetch();
			_.each(traspasos,function(traspaso){
				var cajaOrigen = Cuentas.findOne(traspaso.origen_id);
				var cajaDestino =  Cuentas.findOne(traspaso.destino_id);

				traspaso.origen = cajaOrigen;
				traspaso.destino = cajaDestino;

			})
			return traspasos
		}

	});

	
	this.nuevo = function()
	{
		this.action = !this.action;
		console.log(this.action)
		//this.nuevo = !this.nuevo;
		this.objeto = {};	
	
	};

	this.guardar = function(objeto,form)
	{
			if(form.$invalid){
						toastr.error('Error al guardar los datos.');
						return;
			}
			objeto.estatus = true;

			//objeto.usuarioResponsable = "";
			//var cuenta = Cuentas.findOne(objeto.origen_id);
			Meteor.call ("traspasoCuentaCuenta",objeto.origen_id,objeto.destino_id,objeto.importe,function(error,result){
		
				if(error){
					console.log(error);
					toastr.error('Error al guardar los datos.');
					return
				}
				toastr.success('Guardado correctamente.');
				rc.objeto = {}; 
				$('.collapse').collapse('hide');
				rc.nuevo = true;
				form.$setPristine();
				form.$setUntouched();
				//$state.go('root.cajerosLista');
			});
			
		
	};

};