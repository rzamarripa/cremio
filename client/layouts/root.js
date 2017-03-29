angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', '$reactive', function ($scope, $meteor, $reactive)
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
	
	this.subscribe('creditos', () => {
		return [{estatus : 2, cliente_id : { $in : this.getReactively("clientes_ids")}}];
	})
	
	this.subscribe('cajas',()=>{
		console.log(Meteor.user())
		return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile? Meteor.user().profile.sucursal_id : "":""}]
	})

	this.subscribe('buscarClientes', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			console.log(root.buscar.nombre);
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

		this.subscribe('ocupaciones', () => {
		return [{estatus:true  }];
	});
	this.subscribe('nacionalidades', () => {
		return [{estatus:true  }];
	});
	this.subscribe('estadoCivil', () => {
		return [{estatus:true  }];
	});
	this.subscribe('estados', () => {
		return [{estatus:true  }];
	});
	this.subscribe('paises', () => {
		return [{estatus:true  }];
	});
	this.subscribe('empresas', () => {
		return [{estatus:true  }];
	});
	this.subscribe('colonias', () => {
		return [{estatus:true  }];
	});
	this.subscribe('ciudades', () => {
		return [{estatus:true  }];
	});
	this.subscribe('creditos', () => {
		return [{estatus:true  }];
	});
  
  	this.helpers({
	  	caja : () =>{
		  		return Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile? Meteor.user().profile.caja_id : "":"");
	  	},
		clientesRoot : () => {
			var clientes = Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			if(clientes){
				this.clientes_ids = _.pluck(clientes, "_id");
			
				_.each(clientes, function(cliente){
					cliente.profile.creditos = Creditos.find({cliente_id : cliente._id, estatus : 2}).fetch();
				})
			}
						
			return clientes;
			
		},
		creditos : () => {
			return Creditos.find().fetch();

		},

	});

	this.verMenu =()=>{
		var user= Meteor.user();
		console.log("usuario",user);
		if( user && user.roles && user.roles[0]=="Cajero"){
			
			var caja = this.caja;
			console.log("caja",caja);
			if (caja && caja.estadoCaja=="Cerrada")
				return false;
		}
		return true;
	}

	this.tieneFoto = function(foto, sexo){
		
	  if(foto === undefined){
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



  this.generarFicha= function(objeto,referencia_id) 
  {
		console.log("entro:", objeto);

		root.cliente = objeto.profile	
  	    root.referencias = [];
	  	_.each(root.cliente.referenciasPersonales_ids,function(referencia){
	  		
			Meteor.call('getReferencias', referencia, function(error, result){	
			//console.log("entra aqui",referencia)					
				if (result)
				{
					console.log("entra aqui");
					console.log("result",result);
					root.referencias.push(result);
					$scope.$apply();			
				}
			});	
	  	});

		objeto.nombreCompleto = objeto.profile.nombreCompleto
		objeto.referencias = root.referencias;
		objeto.lugarNacimiento = objeto.profile.lugarNacimiento;

		_.each(objeto, function(cliente){
		  			
		  			cliente.ocupacion = Ocupaciones.findOne(cliente.ocupacion_id)
		  			cliente.estadoCivil = EstadoCivil.findOne(cliente.estadoCivil_id)
		  			cliente.nacionalidad = Nacionalidades.findOne(cliente.nacionalidad_id)
		  			cliente.estado = Estados.findOne(cliente.estado_id)
		  			cliente.pais = Paises.findOne(cliente.pais_id)
		  			cliente.empresa = Empresas.findOne(cliente.empresa_id)
		  			cliente.colonia = Colonias.findOne(cliente.colonia_id)
		  			cliente.ciudad = Ciudades.findOne(cliente.ciudad_id)

		  			
		  		})
		objeto.ocupacion = objeto.profile.ocupacion
		objeto.estadoCivil = objeto.profile.estadoCivil
		objeto.nacionalidad = objeto.profile.nacionalidad
		objeto.estado = objeto.profile.estado
		objeto.pais = objeto.profile.pais
		objeto.colonia = objeto.profile.colonia
	    objeto.ciudad = objeto.profile.ciudad


		Meteor.call('getFicha', objeto, function(error, response) {

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
					  
					  //console.log(url);
					  var dlnk = document.getElementById('dwnldLnk');

				    dlnk.download = "FICHASOCIO.docx"; 
						dlnk.href = url;
						dlnk.click();		    
					  window.URL.revokeObjectURL(url);

  
		   }
		});

		
	}; 

	this.diarioCobranza= function(objeto) {

		//console.log(objeto,"objetillo")
		objeto.fechaInicial = objeto[0].fechaSolicito
		objeto.objetoFinal = objeto[objeto.length - 1];
		objeto.fechaFinal = objeto.objetoFinal.fechaSolicito
		console.log(objeto,"actualizado")






	}

















}])