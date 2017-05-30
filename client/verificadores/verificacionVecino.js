angular
.module("creditoMio")
.controller("VerificacionVecinoCtrl", VerificacionVecinoCtrl);
function VerificacionVecinoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
	this.action = true;
  rc.objeto = {};
	
/*
	
	this.subscribe('verificaciones',()=>{
			return [{credito_id : $stateParams.id }]
	});
	
	
	this.subscribe('creditos',()=>{
			return [{_id : $stateParams.id }]
	});
	
  this.helpers({
	  verificaciones : () => {
		  
		  rc.objeto = Verificaciones.findOne();
		  if (rc.objeto != undefined)
		  {
				  if (rc.objeto.tipoGarantia == "general")
				  	 this.garantiasGeneral = angular.copy(rc.objeto.garantias);
				  else if (rc.objeto.tipoGarantia == "mobiliario")	 
				  	 this.garantias = angular.copy(rc.objeto.garantias); 
		  }
	  }, 
	  creditos : () => {
			return Creditos.find().fetch();
		},
  });
*/

  
  this.guardar = function(obj, form)
	{	
			
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
		  
			obj.estatus = true;
			obj.usuarioVerifico = Meteor.userId();
			obj.credito_id = $stateParams.id;
			obj.tipoVerificacion = "vecino";
			obj.fechaVerificacion = new Date();
														
			Verificaciones.insert(obj);
						
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	    $state.go('root.panelVerificador');
			
	}
    
};