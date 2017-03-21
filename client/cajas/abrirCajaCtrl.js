angular.module("creditoMio")
.controller("AbrirCajaCtrl", AbrirCajaCtrl);
 function AbrirCajaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
	window.rc=rc
	
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
	


	this.helpers({

		tiposIngreso : () => {
			return TiposIngreso.find()
		},
		objeto : () => {
			return Cajas.findOne(Meteor.user().profile.caja_id);
		}
	});

	

	this.guardar = function(objeto,form)
	{
			if(form.$invalid){
						toastr.error('Error al actualizar los datos.');
						return;
			}
			Meteor.call ("abrirCaja",objeto,function(error,result){
		
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

	
	
	

	
};