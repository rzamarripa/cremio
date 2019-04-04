angular.module("creditoMio")
.controller("BeneficiariosFormCtrl", BeneficiariosFormCtrl);
 function BeneficiariosFormCtrl($scope, $meteor, $reactive, $state, $stateParams,toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window = rc;
 
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
	
	if ($stateParams.objeto_id != "")
	{
			this.action = false;
	    this.nuevo = false;
	    
			this.subscribe("beneficiarios", ()=>{
				return [{_id: $stateParams.objeto_id}]
			});
			 
			this.helpers({
			  objeto : () => {
				  return Beneficiarios.findOne({_id: $stateParams.objeto_id});
			  },
			  
		  });
	}
	else
	{
			this.action = true;
			this.nuevo = !this.nuevo;
			this.objeto = {};
	}
	
  
/*
  this.Nuevo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.objeto = {};		
  };
*/

 /*
 this.guardar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			
			objeto.estatus = 1;	//1.- Solicitado, 2.- Aceptado, 3.- Rechazado
			objeto.usuarioInserto = Meteor.userId();
			objeto.saldo 		= 0;
			
			objeto.distribuidor_id = Meteor.userId();
			objeto.sucursal_id		 = Meteor.user().profile.sucursal_id;
			
			var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
      var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
      var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
      objeto.nombreCompleto = nombre + apPaterno + apMaterno;
      
      objeto.saldoActualVales	= 0;	//Saldo con Capital, Intereses, IVA y Seguro
      objeto.saldoActual			= 0;  //Saldo solo Capital
      
      objeto.fecha = new Date();
      			
			Beneficiarios.insert(objeto);
			toastr.success('Guardado correctamente.');
			
			if (Meteor.user().roles == "Distribuidor" )
					$state.go("root.prospectos");
			else
					$state.go("root.prospectosLista");
			
			this.objeto = {}; 
			this.nuevo = true;
		
	};
*/

	/*
this.editar = function(id)
	{
	    this.objeto = Beneficiarios.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
*/
	
	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		  
		  var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
      var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
      var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
      objeto.nombreCompleto = nombre + apPaterno + apMaterno;
		  
			var idTemp = objeto._id;
			delete objeto._id;		
			objeto.usuarioActualizo = Meteor.userId(); 
			Beneficiarios.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$state.go("root.beneficiariosLista");
			
			//this.nuevo = true;
	};

};