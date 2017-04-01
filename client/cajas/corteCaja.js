angular.module("creditoMio")
.controller("CorteCajeCtrl", CorteCajeCtrl);
 function CorteCajeCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
	

	

	this.subscribe('cajas',()=>{
		return [{_id: Meteor.user() != undefined ? Meteor.user().profile.caja_id : ""}]
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
	this.subscribe('cajaMovimientosTurno',()=>{
		return [{}]
	});
	


	this.helpers({
		caja : () => {
			var caja = Cajas.findOne({_id: Meteor.user() != undefined ? Meteor.user().profile.caja_id : ""});
			rc.objeto=caja;
			return caja;
		},
		movimientos : ()=>{
			return MovimientosCajas.find({},{sort:{cuenta_id:1,createAt:1}});
		},
		tiposIngreso : () => {
			return TiposIngreso.find()
		},

	});

	
	this.cuentaNombre = (cuentaid)=>{
		console.log("Par",cuentaid);
		try{
			var cuenta_id = this.caja.cuenta[cuentaid].cuenta_id;
			console.log("local:",cuentaid);
			var cuenta  = Cuentas.findOne(cuenta_id);
			//console.log(cuenta)
			return cuenta.nombre
		}
		catch(ex){
			return ""
		}

	}

	this.guardar = function(objeto,form)
	{
			if(form.$invalid){
						toastr.error('Error al guardar los datos.');
						return;
			}
			

			Meteor.call ("corteCaja",objeto.cuenta,function(error,result){
		
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
				$state.go('root.abrirCaja');
			});
			
		
	};
};