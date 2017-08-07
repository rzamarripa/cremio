angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', '$reactive','$state', function ($scope, $meteor, $reactive, $state)
{
	let root = $reactive(this).attach($scope);
	window.root = root;
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	this.clientesRoot = [];
	this.clientes_ids = [];
	this.referencias = [];
	this.hoy = new Date();
	this.caja = {};
	this.nombreCliente = "";
	
	

	this.subscribe('buscarRootClientesDistribuidores', () => {
		if(this.getReactively("buscar.nombre").length > 4){
			root.buscando = true;			
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
		else if (this.getReactively("buscar.nombre").length  == 0 )
			this.buscando = false;		
  });  
  	this.helpers({
		clientesRoot : () => {
			
			var clientes = Meteor.users.find({
				"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : {$in : ["Cliente", "Distribuidor"]}
			}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
	
			if(clientes){
				this.clientes_ids = _.pluck(clientes, "_id");
			
				_.each(clientes, function(cliente){
					cliente.profile.creditos = Creditos.find({cliente_id : cliente._id, estatus : 4}).fetch();
				})
			}
						
			return clientes;
			
		},
	});

	this.verMenu =()=>{
		var user= Meteor.user();
		//console.log("usuario",user);
		if( user && user.roles && user.roles[0]=="Cajero"){
			
			var caja = this.caja;
			//console.log("caja",caja);
			if (caja && caja.estadoCaja=="Cerrada")
				return false;
		}
		return true;
	}

	this.tieneFoto = function(foto, sexo){
		//console.log("Aui es");
	  if(foto === undefined){
		  if(sexo === "MASCULINO")
			  return "img/badmenprofile.png";
			else if(sexo === "FEMENINO"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
	  }else{
		  return foto;
	  }
  };
 
/*

	this.diarioCobranza= function(objeto) {

		//console.log(objeto,"objetillo")
		objeto.fechaInicial = objeto[0].fechaSolicito
		objeto.objetoFinal = objeto[objeto.length - 1];
		objeto.fechaFinal = objeto.objetoFinal.fechaSolicito
		//console.log(objeto,"actualizado")

	};
*/

	//Funcion Evalua la sessión del usuario
	this.autorun(function() {
    if(!Meteor.user()){	    
    	$state.go('anon.login');
    }    
  });	


	this.descargarFormato = function() 
  {
    Meteor.call('formaSolicitud', function(error, response) {     
       if(error)
       {
        console.log('ERROR :', error);
        return;
       }
       else
       {
      function b64toBlob(b64Data, contentType, sliceSize) {
          contentType = contentType || '';
          sliceSize = sliceSize || 512;
          var byteCharacters = atob(b64Data);
          var byteArrays = [];
          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
        
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          var blob = new Blob(byteArrays, {type: contentType});
          return blob;
          }
          var blob = b64toBlob(response, "application/docx");
          var url = window.URL.createObjectURL(blob);
          var dlnk = document.getElementById('dwnldLnk');

           dlnk.download = "FormatoSol.docx"; 
          dlnk.href = url;
          dlnk.click();       
          window.URL.revokeObjectURL(url);
   
      }
    
    });

  };




}])