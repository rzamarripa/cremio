angular.module("creditoMio")
.controller("PanelProspectosDistribuidoresCtrl", PanelProspectosDistribuidoresCtrl);
 function PanelProspectosDistribuidoresCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
	rc.buscar = {};
	rc.buscar.nombreBeneficiado = ""; 
	this.objetoRechazar = "";
	this.motivo = "";

	
  this.subscribe('prospectos', () => {
		return [{	sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							estatus : 1 }];
	});
	
	this.subscribe('prospectosDistribuidor', () => {
		return [{	"profile.sucursal_id" 			:	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							"profile.estatusProspecto" 	: 1 }];
	});
	
	  
    
  this.helpers({
		arreglo : () => {
				var prospectos = [];
				
				var prospectosVales = Prospectos.find({}).fetch();
				
				_.each(prospectosVales, function(p){
						Meteor.call("getUsuarioId", p.distribuidor_id, function(e,r){								
								if (r)
								{
										p.distribuidor = r;
										prospectos.push(p);
										$scope.$apply();
								}
						});
				});			
				
				var prospectosDistribuidor = ProspectosDistribuidor.find({}).fetch();
				_.each(prospectosDistribuidor, function(p){
						Meteor.call("getUsuarioId", p.profile.promotora_id, function(e,r){								
								if (r)
								{
										p.distribuidor = r;
										prospectos.push(p);
										$scope.$apply();
								}
						});
				});
				
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
				
				objeto.usuarioAutorizo = Meteor.userId();
				delete objeto.$$hashKey;				
				Beneficiarios.insert(objeto);
				
				var idTemp = objeto._id;
				delete objeto._id;
				Prospectos.update({_id: idTemp},{$set: {usuarioAutorizo : Meteor.userId(),estatus: 2}});
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