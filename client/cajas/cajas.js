angular.module("creditoMio")
.controller("CajasCtrl", CajasCtrl);
 function CajasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window = rc;
 	
	
	this.action = true;
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
	this.subscribe('cuentas',()=>{
		return [{
			estatus : 1
		}]
	});
	this.subscribe('allCajeros',()=>{
		return [{"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
						 "profile.estatus" 		: true,
						 roles 								: ["Cajero"]	
		}]
	});

	this.helpers({
		cajas : () => {
			var c = Cajas.find().fetch();
			if (c != undefined){
				_.each(c, function(caja){
						var cajero = Meteor.users.findOne({_id: caja.usuario_id});
						if (cajero != undefined)
							 caja.cajero = cajero.profile.nombreCompleto;
				})
			}	
			return c;
		},
		tiposIngreso : () => {
			return TiposIngreso.find()
		},
		cajeros : () =>{
			return Meteor.users.find({roles : ["Cajero"]});
		},
		cuentas : () =>{
			var cuentasInterno  = Cuentas.find({}).fetch();
			var retorno = {};
			if (cuentasInterno != undefined)
			{
				_.each(cuentasInterno,function(cuenta){
					if(!retorno[cuenta.tipoIngreso_id])
						retorno[cuenta.tipoIngreso_id]=[]
					retorno[cuenta.tipoIngreso_id].push(cuenta);
				});
			}
			return retorno;
		}
	});

	
	this.Nuevo = function()
	{
		this.action = true;
		this.nuevo = !this.nuevo;
		this.objeto = {cuenta:{}};	
		_.each(this.tiposIngreso,function(tipo){
			rc.objeto.cuenta[tipo._id]={saldo: 0};
		});	
	};

	this.guardar = function(objeto,form)
	{
			if(form.$invalid){
						toastr.error('Error al guardar los datos.');
						return;
			}
			
			var cajaAbierta = Cajas.findOne({usuario_id: objeto.usuario_id});
			if (cajaAbierta != undefined) {
				if (cajaAbierta.estadoCaja == "Abierta")
				{
						toastr.warning('Ya tinen una caja abierta');
						return;
				}
			}
			
			
			objeto.estatus = true;

			_.each(this.tiposIngreso,function(tipo){
				objeto.cuenta[tipo._id].saldo = 0;
			});

			Meteor.call ("crearCaja",objeto,function(error,result){
		
				if(error){
					console.log(error);
					toastr.waring('Error al guardar los datos. ' + error.details);
					return
				}
				toastr.success('Guardado correctamente.');
				rc.objeto = {}; 
				$('.collapse').collapse('hide');
				rc.nuevo = true;
				$state.go('root.cajas');
			});
			
		
	};

	this.editar = function(id)
	{
			this.objeto = Cajas.findOne({_id:id});
			this.action = false;
			$('.collapse').collapse('show');
			this.nuevo = false;
	};
	
	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
						toastr.error('Error al actualizar los datos.');
						return;
			}
			
			if (objeto.usuario_id == "")
			{
					toastr.warning('Asigne un Cajero');
					return;
			}
			
			if (objeto.estadoCaja == "Abierta")
			{
					toastr.warning('La ventanilla abierta, no es posible editarla');
					return;
			}
			
			//Arreglar 
			
			//var cuentasTemp = [];
			
			_.each(objeto.cuenta, function(cuenta){

				//console.log(cuenta);
				cuenta.saldo = 0;
				
				cuenta.cuenta = Cuentas.findOne(cuenta.cuenta_id);
				cuenta.tipoIngreso = TiposIngreso.findOne(cuenta.cuenta.tipoIngreso_id);
				
			});
			
			var cajaAbierta = Cajas.findOne({usuario_id: objeto.usuario_id});
			if (cajaAbierta != undefined  && cajaAbierta.estadoCaja == "Abierta")
			{
					toastr.warning('El cajero seleccionado ya tine una ventanilla abierta');
					return;
			}
			
			//console.log(objeto.cuenta);
			
			Meteor.call ("actualizarCaja",objeto,function(error,result){
		
				if(error){
					console.log(error);
					toastr.error('Error al guardar los datos.: ', error.details);
					return
				}
				else if(result)
				{
					toastr.success('Actualizado correctamente.');
					rc.objeto = {}; 
					$('.collapse').collapse('hide');
					rc.nuevo = true;
					form.$setPristine();
					form.$setUntouched();
				}
			});

	};

	this.cambiarEstatus = function(id, estatus)
	{
			if (estatus == "Abierta")
			{
					toastr.error('Error no se puede desactivar si la ventanilla está abierta.');
					return;	
			}
			var objeto = Cajas.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Cajas.update({_id: id},{$set :	{estatus : objeto.estatus}});
	};	
};