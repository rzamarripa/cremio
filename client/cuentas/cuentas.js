
angular.module("creditoMio")
.controller("CuentasCtrl", CuentasCtrl);
 function CuentasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;	 
	this.objeto = {}; 
	
	this.subscribe('cuentas',()=>{
		return [{
			estatus : 1
		}]
	});

	this.subscribe('tiposIngreso',()=>{
		return [{
			estatus : true
		}]
	});

	this.helpers({
		cuentas : () => {
			return Cuentas.find();
		},
		tiposIngreso : () => {
			return TiposIngreso.find()
		}
	}); 
	
	this.Nuevo = function()
	{
		this.action = true;
		this.nuevo = !this.nuevo;
		this.objeto = {};		
	};

	this.guardar = function(objeto,form)
	{
		if(form.$invalid){
			toastr.error('Error al guardar los datos.');
			return;
		}
		console.log(objeto);
		Meteor.call ("crearCuenta",objeto,function(error,result){
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
		});
	};

	this.editar = function(id)
	{
		this.objeto = Cuentas.findOne({_id:id});
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
		Meteor.call ("actualizarCuenta",objeto,function(error,result){
		
			if(error){
				console.log(error);
				toastr.error('Error al guardar los datos.');
				return
			}
			toastr.success('Actualizado correctamente.');
			rc.objeto = {}; 
			$('.collapse').collapse('hide');
			rc.nuevo = true;
			form.$setPristine();
			form.$setUntouched();
		});
	};

	this.cambiarEstatus = function(id)
	{
		var objeto = Cuentas.findOne({_id:id});
		if(objeto.estatus == true)
			objeto.estatus = false;
		else
			objeto.estatus = true;
		
		Cuentas.update({_id: id},{$set :	{estatus : objeto.estatus}});
	};	
};
