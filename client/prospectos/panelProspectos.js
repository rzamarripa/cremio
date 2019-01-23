angular.module("creditoMio")
.controller("PanelProspectosCtrl", PanelProspectosCtrl);
 function PanelProspectosCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
	rc.buscar = {};
	rc.buscar.nombreBeneficiado = ""; 
	this.objetoRechazar = "";
	this.motivo = "";

	
  this.subscribe('prospectos', () => {
		return [{	sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							estatus : 1 }];
	})
	  
    
  this.helpers({
		arreglo : () => {

				var prospectos = Prospectos.find({}).fetch();
				
				_.each(prospectos, function(p){
						Meteor.call("getUsuarioId", p.distribuidor_id, function(e,r){								
								if (r)
								{
										p.distribuidor = r;
										$scope.$apply();
								}
						});
				})			
				return prospectos;
		},
		
		
	});
	
	
	this.mostrarModalValidaBeneficiario = function(nombre)
	{			

			rc.buscar.nombreBeneficiado	= nombre;
			rc.BeneficiadosDeudas = [];
			$("#modalvalidaBeneficiario").modal();
			
	};
	
	this.validarBeneficiado = function()
	{			
			Meteor.call('getPersonasDeudas',rc.buscar.nombreBeneficiado, function(error, result) {           
	          if (result)
	          {
		          	if (result.length == 0)
		          	{
										toastr.success("Sin Deudas puede autorizar")          	
						          	
		          	}
		          	else
		          		rc.BeneficiadosDeudas = result;	

		          	$scope.$apply();
		        }  
			});
			
	};
	
  
  this.autorizar = function(objeto){

		customConfirm('¿Estás seguro de Autorizar a ' + objeto.nombreCompleto +'?', function() {
				
				delete objeto.$$hashKey;				
				Beneficiarios.insert(objeto);
				
				var idTemp = objeto._id;
				delete objeto._id;
				Prospectos.update({_id: idTemp},{$set: {estatus: 2}});
				toastr.success("Se autorizó correctamente.")		
		});	
		
	  
  }
  

  this.rechazar = function(motivo, form){
	  
	  if(form.$invalid){
		        toastr.error('Error al rechazar.');
		        return;
		}
	  
	  
	  Prospectos.update({_id: this.objetoRechazar}, {$set: {motivo: motivo, estatus: 3}});
	 
	  toastr.error("Prospecto rechazado.")
	  
	  this.motivo = "";
	  this.objetoRechazar = "";

	  $('#modalRechazo').modal('hide');
	  
  }
  
  
  this.mostrarRechazoCredito = function(id){
	  
	  this.objetoRechazar = id;
		$("#modalRechazo").modal();
		
		
	};
  
  
};