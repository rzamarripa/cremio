angular.module("creditoMio")
.controller("RootCtrl", RootCtrl);
 function RootCtrl($scope, $meteor, $reactive,  $state, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscar.numeroCliente = "";
	this.buscando = false;
	
	rc.porNumero = false;
	rc.porCliente = false;
	
	//this.clientesRoot = [];
	this.clientes_ids = [];

	this.hoy = new Date();
	
	rc.nc = "";
	rc.nd = "";
	rc.sucursal = {};
	//this.caja = {};
	//this.nombreCliente = "";
	var user = Meteor.users.findOne();
	
	this.subscribe('sucursales', () => {
		
		if (user.username != "admin")
			return [{_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""}]
	});	
	

	this.subscribe('buscarRootClientesDistribuidores', () => {
		
		if(rc.getReactively("buscar.nombre").length > 4){
			
			rc.clientesRoot = [];
			rc.buscando = true;			
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : rc.getReactively('buscar.nombre')
				} 		   
	    }];
		}
		else if (rc.getReactively("buscar.nombre").length  == 0 )
		{
			this.buscando = false;	
		}

  });  

	this.subscribe('buscarRootClientesDistribuidoresNumero', () => {
			
			rc.clientesRoot = [];
			rc.nc = rc.getReactively("buscar.numeroCliente");
			rc.nd = rc.getReactively("buscar.numeroCliente");

			var clave = rc.getReactively("sucursal.clave");

			//armar el numero
			var numero = parseInt(rc.nc);

			if (isNaN(numero) == false) //es Número
			{

				if (numero < 10)
				{
					 rc.nc = clave + '-C000' + numero.toString();
					 rc.nd = clave + '-D000' + numero.toString();
				}	 
				else if (numero < 100)
				{
	  			 rc.nc = clave + '-C00' + numero.toString();
					 rc.nd = clave + '-D00' + numero.toString();
	  		}	 
	  		else if (numero < 1000)
	  		{
	  			 rc.nc = clave + '-C0' + numero.toString();	 
					 rc.nd = clave + '-D0' + numero.toString();	 
	  		}	 
	  		else
	  		{
	  			 rc.nc = clave + '-C' + numero.toString();
					 rc.nd = clave + '-D' + numero.toString();
	  		}	 

			}			
			
			
			if(rc.getReactively("buscar.numeroCliente").length > 0 )
			{
				 rc.buscando = true;	
				return [{
			    options : { limit: 20 },
			    where : { 
						numeroCliente 			: (rc.porCliente ? rc.nd : rc.nc)
					} 		   
		    }];
			}
			else if (rc.getReactively("buscar.numeroCliente").length  == 0 ){
				this.buscando = false;		
			}

  }); 


  
  this.helpers({
		clientesRoot : () => {
			
			if (rc.getReactively('buscar.nombre').length > 4)
			{
				var clientes = Meteor.users.find({
					"profile.nombreCompleto": { '$regex' : '.*' + rc.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
			  	roles : {$in : ["Cliente", "Distribuidor"]}
				}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			}
			
			if(rc.getReactively("buscar.numeroCliente").length > 0 )
			{
				
				var clientes = Meteor.users.find({$or: [{"profile.numeroCliente": (rc.porCliente ? rc.nd : rc.nc)}]}).fetch();
				
			}
				
	
			if(clientes){
				this.clientes_ids = _.pluck(clientes, "_id");
			
				_.each(clientes, function(cliente){
					cliente.profile.creditos = Creditos.find({cliente_id : cliente._id, estatus : 4}).fetch();
				})
			}
						
			return clientes;
			
		},
		sucursal : () => {
			
			if (user.username != "admin")
			{	 
				var s = Sucursales.findOne({_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""});
				if (s != undefined)
						rc.sucursal = s;
				
				return rc.sucursal;
			}	
		},	
/*
		inicio:()=>{
			if (Meteor.user().username != "admin") {
		    var fecha = new Date();
            hora = fecha.getHours()+':'+fecha.getMinutes();
   
          usuario = Meteor.user().profile.sucursal_id
            	   //console.log(hora,"hora")
           // console.log(usuario,"id")

             Meteor.call('getSucursal',usuario, function(error, result){           					
					if (result)
					{
						//console.log("result",result)
					    rc.sucursalVer = result
					}
					//console.log("avales",rc.avalesCliente)
					var entrada = rc.sucursalVer.horaEntrada
					var salida = rc.sucursalVer.horaSalida
             // console.log(entrada,"entrada") 
             var horaEntrada = entrada.getHours()+':'+entrada.getMinutes()
             var horaSalida = salida.getHours()+':'+salida.getMinutes()
             console.log(horaEntrada,"entrada","y",horaSalida,"salida")
            
			    // if (horaEntrada < 10) {
			    //     horaEntrada = "0" + horaEntrada;
			    // }
			     //console.log(horaEntrada,"entrada") 
		        
		             if (hora == horaSalida) {
		             	// $state.go('anon.logout');
		             	rc.sucursalVer.laborando = false

		             	
		             }
		             if (horaEntrada == hora) {
		             	rc.sucursalVer.laborando = true
		             	
		             }
		             if (rc.sucursalVer.laborando == false) {
		             	$state.go('anon.logout');
		             	toastr.error("No puedes ingresar en este horario");

		             }
		             //console.log("estatusSucursal", rc.sucursalVer)


				});
          	}
   
		},
*/
	});


	/*
this.verMenu =()=>{
		var user = Meteor.user();
		console.log("usuario",user);
		if( user && user.roles && user.roles[0]=="Cajero"){
			
			var caja = this.caja;
			//console.log("caja",caja);
			if (caja && caja.estadoCaja=="Cerrada")
				return false;
		}
		return true;
	}
*/

/*
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
*/
 
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
	  loading(true);
    Meteor.call('formaSolicitud', function(error, response) {     
       if(error)
       {
        console.log('ERROR :', error);
        loading(false);
        return;
       }
       else
       {
	       		downloadFile(response);
				 		loading(false);
	       
		      /*
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
*/
		      
		    }  
    });

  };
  
  this.cambiarNumero = function() 
  {
  	rc.porNumero = false;
  };
  this.cambiarNombre = function() 
  {
  	rc.porNumero = true;

  };
  
  
  this.cambiarCliente = function() 
  {
  	rc.porCliente = false;
  };
  this.cambiarDistribuidor = function() 
  {
  	rc.porCliente = true;

  };
  


};