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
		 
	this.actualizarNo = false;
	if ($stateParams.persona == -1)
		 this.actualizarNo = true;	 
	 
		
	this.subscribe('verificaciones',()=>{
			return [{_id : $stateParams.verificacion_id }]
	});
	
	//console.log($stateParams.tipo);
	if ($stateParams.tipo == "CP")
	{	
		this.subscribe('creditos',()=>{
				return [{_id : $stateParams.id }]
		});	
	}
	else if($stateParams.tipo == "V")
	{
		this.subscribe('cliente',()=>{
				return [{_id : $stateParams.id }]
		});
	}
			
  this.helpers({
	  verificaciones : () => {
		  		rc.objeto = Verificaciones.findOne();
			return rc.objeto;	  
	  }, 
	  credito : () => {
			return Creditos.findOne();
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
			obj.tipoVerificacion = "vecino";
			obj.fechaVerificacion = new Date();
			obj.sucursal_id = Meteor.user().profile.sucursal_id;
			obj.verificacionPersona = $stateParams.persona;
			
			if ($stateParams.tipo == "CP")
			{
				obj.cliente_id = rc.credito.cliente_id;
				obj.credito_id = $stateParams.id;
				obj.tipo 			= "Crédito Personal";
			}
			else if ($stateParams.tipo == "V")	
			{
				obj.cliente_id = $stateParams.id;
				obj.tipo 			= "Distribuidor";
			}
																	
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