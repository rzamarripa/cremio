angular
.module("creditoMio")
.controller("ImportarNotasCtrl", ImportarNotasCtrl);
function ImportarNotasCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
  rc.action = true;
  rc.clientes = {};
  
  rc.arreglo = [];
  
  this.subscribe('clienteImportar', () => {
		return [{ }];
	});
  

	this.guardar = function()
	{	
			if (rc.clientes.NOTAS.length == 0){
					 toastr.error('Error al guardar los datos.');
		       return;
		  }
		  
		  for (var i = 0; i < rc.clientes.NOTAS.length;i++)
		  {
			  	var objeto = {};
			  	
			  	 			  	
/*
					
					objeto.profile.apellidoPaterno 		= "";
					objeto.profile.apellidoMaterno 		= "";
					objeto.profile.nombre							= "";
					objeto.profile.nombreCompleto			= "";
					objeto.profile.fecha 							= "";
					objeto.profile.hora								= "";
					objeto.profile.libro		 					= "";
					objeto.profile.foja		 						= "";
					objeto.profile.noDeActa 					= "";
					objeto.profile.fechaNacimiento 		= "";
					objeto.profile.lugarNacimiento		= "";
					objeto.profile.hijoNatural				= "";
					objeto.profile.padre							= "";
					objeto.profile.madre							= "";
					objeto.profile.abueloPaterno	  	= "";
					objeto.profile.abuelaPaterno	  	= "";
					objeto.profile.abueloMaterno	  	= "";
					objeto.profile.abuelaMaterno	  	= "";
					objeto.profile.padrino				  	= "";
					objeto.profile.madrina				  	= "";
 					objeto.profile.registroCivil	  	= "";
 					objeto.profile.lugar					  	= "";
 					objeto.profile.esHijo					  	= "";
 					objeto.profile.fechaRegistro 			= "";
 					objeto.profile.lugarParroquia			= "";
 					objeto.profile.sacerdoteBautizo 	= "";
					objeto.profile.parroco				 		= "";
								
*/
					/////////////////////////////////////////////////////////////////			
					
					
					
					objeto.fecha					 	= new Date(rc.clientes.NOTAS[i].Fecha);
					objeto.descripcion  	 	= rc.clientes.NOTAS[i].Nota;
					var numero						  =  Number(rc.clientes.NOTAS[i].Cliente);
 				  objeto.usuario_id		  	= Meteor.userId();
 				  objeto.tipo							= 'Cliente';
 				  objeto.titulo						= rc.clientes.NOTAS[i].Titulo;
 				  objeto.perfil						= 'perfil';
 				  objeto.respuesta				= false;
 				  objeto.hora							= '';
 				  objeto.estatus					= true;
 				 
 				  
 				  if (numero < 10)
						 objeto.numeroCliente =  '01-C000' + numero.toString();
					else if (numero < 100)
		  			 objeto.numeroCliente =  '01-C00' + numero.toString();
		  		else if (numero < 1000)
		  			 objeto.numeroCliente =  '01-C0' + numero.toString();	 
		  		else
		  			 objeto.numeroCliente =  '01-C' + numero.toString();
 				  
				  var user = Meteor.users.findOne({"profile.numeroCliente" : objeto.numeroCliente} );
 					
 					console.log(objeto.numeroCliente); 
 					objeto.nombreCliente  = user.profile.nombreCompleto;
			    objeto.cliente_id 		= user._id;
  					 
 					 /*

 				   Meteor.call('getUsuarioNumeroCliente', objeto.numeroCliente, function(e,r){
		          if (r)
		          {
			          	objeto.nombreCliente  = r.profile.nombreCompleto;
			          	objeto.cliente_id 		= r._id;
			          	
			          	console.log(objeto.numeroCliente);
 			          	//console.log(objeto)
			            //Notas.insert(objeto);
		          }
		          if (e)
		          {
			          	console.log(e);
			          
		          }
		      });
 				  
*/
 				  //Notas.insert(objeto);
 				  
 				  //console.log(objeto)
 		      //Ojo estas son las de Rubidia
		      
 					
					Notas.insert(objeto);
					
					/*
objeto.profile.sucursal_id 				= "gYBgCCEZmiHNn7FkJ";
		      objeto.profile.pais_id						= "Anoby4iZzzqi9Zwdu";
					objeto.profile.estado_id 					= "ons8MhAoq2n6GwFsB";
*/
 
					/*
 Meteor.call('createUsuario', objeto, "Cliente", function(e,r){
		          if (r)
		          {
			          	console.log("OK");
		          }
		          if (e)
		          {
			          	console.log(e);
			          
		          }
		      });
*/
 					rc.clientes.NOTAS.splice(i, 1);
					i--;

									
		  }	  
		  
		  rc.clientes = {};

	};
			
	var X = XLSX;
	
	function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
			var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			if(roa.length > 0){
				result[sheetName] = roa;
			}
		});
		return result;
	}
		
	function process_wb(wb) {
		loading(true);
		var output = {};
		output = JSON.stringify(to_json(wb), 2, 2);				
		rc.clientes = JSON.parse(output);
		$scope.$apply();
		loading(false);
	}
	
	var xlf = document.getElementById('xlf');
	
	function handleFile(e) {
		
		var files = e.target.files;
		var f = files[0];
		{
			var reader = new FileReader();
			var name = f.name;
			reader.onload = function(e) {
				var data = e.target.result;
				var wb;
				wb = X.read(data, {type: 'binary'});
				process_wb(wb);
			};
			reader.readAsBinaryString(f);
		}
	}
	
	if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
	
	
};



