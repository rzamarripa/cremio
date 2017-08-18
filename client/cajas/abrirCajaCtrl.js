angular.module("creditoMio")
.controller("AbrirCajaCtrl", AbrirCajaCtrl);
 function AbrirCajaCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
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
			var caja = Cajas.findOne($stateParams.caja_id);
			return caja;
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
					toastr.error('Error al guardar los datos: ' + error);
					return
				}
				if (result)
				{
					toastr.success('Actualizado correctamente.');
					rc.objeto = {}; 
					$state.go('root.cajas');
				}
			});	

	};

	
	
	

	
};