angular.module("creditoMio")
.controller("PanelValesAcreditadosCtrl", PanelValesAcreditadosCtrl);
 function PanelValesAcreditadosCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  rc.totalVales = 0;

	this.objetoRechazar = "";
	this.motivo = "";

	this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
			}
		});
	
  this.subscribe('creditos', () => {
		return [{sucursal_id: Meteor.user().profile.sucursal_id ,tipo: 'vale', estatus : 2 }];
	})
	  
    
  this.helpers({
		arregloAcre : () => {

				var creditos = Creditos.find({sucursal_id: Meteor.user().profile.sucursal_id ,tipo: 'vale', estatus : 2 }, {sort: {fechaSolicito: -1}}).fetch();
				
				if (creditos != undefined)
				{
						rc.totalVales = 0;
						_.each(creditos, function(c)
						{
								Meteor.call("getUsuarioId", c.cliente_id, function(e,r){								
										if (r)
										{
												c.distribuidor = r;
												$scope.$apply();
										}
								});
								
								Meteor.call("getBeneficiarioNombre", c.beneficiario_id, function(e,r){								
										if (r)
										{
												c.beneficiario = r.nombreCompleto;
												$scope.$apply();
										}
								});
								rc.totalVales += c.capitalSolicitado;		
						})			
						return creditos;					
				}
				
		},
		
		
	});
	
	
	this.mostrarModalValidaBeneficiario = function()
	{			
			//console.log(credito);
			
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