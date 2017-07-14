angular.module("creditoMio")
.controller("HomeCtrl", HomeCtrl);
 function HomeCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	
 	rc.estaCerrada = false;
 	
 	this.subscribe('cajas',()=>{
		return [{estatus : true}]
	}); 
	
	this.helpers({
		cajas : () => {
			var caja = Cajas.find({usuario_id :   Meteor.user() != undefined ? Meteor.user()._id : ""  }).fetch();
			if (caja != undefined)
			{
		
					if (caja.estadoCaja == "Cerrada")
							rc.estaCerrada = true;
			}
			
			return caja;
		},
	}); 
 	
 	
};