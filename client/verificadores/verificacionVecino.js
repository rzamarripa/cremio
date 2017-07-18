angular
.module("creditoMio")
.controller("VerificacionVecinoCtrl", VerificacionVecinoCtrl);
function VerificacionVecinoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
	this.action = true;
  rc.objeto = {};
  

	if ($stateParams.verificacion_id == "-1")
		 this.action = true;
	else
		 this.action = false;		 	

		
	this.subscribe('verificaciones',()=>{
			return [{_id : $stateParams.verificacion_id }]
	});
		
  this.helpers({
	  verificaciones : () => {
		  		rc.objeto = Verificaciones.findOne();
			return rc.objeto;	  
	  }, 
  });
  
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

			form.$setPristine();
	    form.$setUntouched();
	    $state.go('root.panelVerificador');
			
	}
	
	this.actualizar = function(obj, form)
	{	
			
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
		  
			var idTemp = obj._id;
			delete obj._id;		
			obj.usuarioActualizo = Meteor.userId(); 
			Verificaciones.update({_id:idTemp},{$set : obj});
														
			toastr.success('Actualizado correctamente.');
			this.obj = {}; 
			$('.collapse').collapse('hide');

			form.$setPristine();
	    form.$setUntouched();
	    $state.go('root.panelVerificador');
			
	}
	
    
};