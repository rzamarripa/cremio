angular.module("creditoMio")
.controller("AvalesListaCtrl", AvalesListaCtrl);
 function AvalesListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  window.rc = rc;
  
  this.subscribe('buscarAvales', () => {
	  
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
		avales : () => {
			return Avales.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' }
			}, { sort : {"profile.nombreCompleto" : 1 }});
		},
	});
	
	this.tieneFoto = function(sexo, foto){
		
	  if(foto === undefined || foto == ""){
		  //console.log(foto);
		  if(sexo === "Masculino" || sexo === "MASCULINO")
			  return "img/badmenprofile.png";
			else if(sexo === "Femenino" || sexo === "FEMENINO"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
	  }else{
		  return foto;
	  }
  };
  
  this.convertir = function(tipo, objeto) {
	  
	  if (tipo == "Cliente")
	  {
	    	customConfirm('¿Estás seguro de convertir a Cliente ?', function() {		    	
		    		Meteor.call('getAvalCompleto', objeto, function(e,r){
		          if (r)
		          {
			          		delete r.profile.creditos;
			          		delete r.password;
			          		r.createdAt = new Date();
										Meteor.call('createUsuario', r, "Cliente", function(e,result){
							          if (result)
							          {
								          	Avales.update({_id: objeto._id}, {$set: {"profile.esCliente": true}});
							              toastr.success('Guardado correctamente.');
							              $state.go('root.avalesLista', { 'objeto_id':r});
							          }
							      });			          	
		          }
		      });
		    
		    });
		}    	
		else
		{
				customConfirm('¿Estás seguro de convertir a Distribuidor ?', function() {
					
					Meteor.call('getAvalCompleto', objeto, function(e,r){
		          if (r)
		          {
			          		//console.log(objeto);
			          		//console.log(r);
			          		delete r.profile.creditos;
			          		delete r.password;
			          		r.createdAt = new Date();
										Meteor.call('createUsuario', r, "Distribuidor", function(e,result){
							          if (result)
							          {
								          	Avales.update({_id: objeto._id}, {$set: {"profile.esDistribuidor": true}});
							              toastr.success('Guardado correctamente.');
							              $state.go('root.avalesLista', { 'objeto_id':r});
							          }
							      });			          	
		          }
		      });
		    });
		}    
		
  }   	
  
  this.generarFicha = function(objeto) 
  {

			loading(true);
			//rc.datosCliente = result.profile;
			
			Meteor.call('getFichaAval', objeto._id, 'pdf', function(error, response) {

				   if(error)
				   {
				    console.log('ERROR :', error);
				    loading(false);
				    return;
				   }
				   else
				   {
					   	//console.log(response);
					 		downloadFile(response);
					 		loading(false);
					 }
			});
	}; 
  
};