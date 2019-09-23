angular.module("creditoMio")
.controller("ClientesListaCtrl", ClientesListaCtrl);
 function ClientesListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  window.rc = rc;
  rc.clientes = [];
    
  this.subscribe('buscarClientes', () => {
	  
		if(this.getReactively("buscar.nombre").length > 4){
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
  });
  
  this.helpers({
		clientes : () => {
			var cli = Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : {$in : ["Cliente", "Distribuidor"]}
			}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			
			if (cli != undefined)
			{
					_.each(cli, function(c){
						if (c.profile.sucursal_id != undefined)	
							 Meteor.call("getSucursal", c.profile.sucursal_id,  function(error,result){
						     	if (result){
						      		c.profile.sucursal = result.nombreSucursal;
						      		$scope.$apply()
						      }
							});							
					});
			}
			return cli;
		},	
	});
	
	this.tieneFoto = function(sexo, foto){
		//console.log(sexo)
	  if(foto === undefined || foto === "")
	  {
		  if(sexo === "Masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  };
    
  this.convertir = function(tipo, objeto) {
	  
	  if (tipo == "Aval")
	  {
	    	customConfirm('¿Estás seguro de convertir a Aval ?', function() {		    	
		    		loading(true);
		    		Meteor.call('setClienteAval', objeto._id, function(e,r){
		          if (r)
		          {
			           	toastr.success('Guardado correctamente.');
			           	loading(false);
 
 		          }
		      });
		    
		    });
		}   
		
		 	
  }
   
};