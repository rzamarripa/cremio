Meteor.methods({
		getcartaRecordatorio: function (objeto) {
	console.log(objeto,"recordatori")
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    							.readFileSync(produccion+"RECORDATORIOS.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
    var cliente =objeto.cliente.profile.nombreCompleto
    var nombreCliente  = cliente.toUpperCase();
    var calle = objeto.cliente.profile.calle
    var calleCLiente = calle.toUpperCase();
    var colonia = objeto.cliente.profile.colonia
    var coloniaCliente = colonia.toUpperCase();
    var ciudad = objeto.cliente.profile.ciudad
    var ciudadCliente = ciudad.toUpperCase();
    var estado = objeto.cliente.profile.estado
    var estadoCliente = estado.toUpperCase();
    var pais = objeto.cliente.profile.pais
    var paisCliente = pais.toUpperCase();

		doc.setData({		        nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									pagosVencidos:          objeto.credito.pagosVencidos,
									fechaEmision: 	        fecha});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"RECORDATORIOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"RECORDATORIOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },


  getcartaUrgente: function (objeto) {
	console.log(objeto,"URGENTE")
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    							.readFileSync(produccion+"URGENTE.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    var cliente =objeto.cliente.profile.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.cliente.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.cliente.profile.colonia
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.cliente.profile.ciudad
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.cliente.profile.estado
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.cliente.profile.pais
	    var paisCliente = pais.toUpperCase();
		
		doc.setData({				nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									avales:		   			objeto.credito.avales,
									pagosVencidos:          objeto.credito.pagosVencidos,
									fechaEmision: 	        fecha});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"URGENTESSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"URGENTESSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },


  

  getcartaCertificado: function (objeto,objeto_id) {
	console.log(objeto,"certificacionPatrimonial")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    	   .readFileSync(produccion+"certificacionPatrimonial.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    var cliente =objeto.cliente.profile.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.cliente.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.cliente.profile.colonia
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.cliente.profile.ciudad
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.cliente.profile.estado
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.cliente.profile.pais
	    var paisCliente = pais.toUpperCase();


		
		doc.setData({				nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									fechaEmision: 	        fecha,
									avales:		   			objeto.credito.avales});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"certificacionPatrimonialSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"certificacionPatrimonialSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },
  getReferencias: function (idReferencia) {
			var referencia = Personas.findOne(idReferencia);
			console.log("esta es la referencia",referencia)
			return referencia;
	},

  getFicha: function (objeto,referencia_id) {
	console.log(objeto,"ficha")
		
		
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
<<<<<<< HEAD
		var produccion = meteor_root+"/web.browser/app/plantillas/";
		var cmd = require('node-cmd');
		var ImageModule = require('docxtemplater-image-module');
		//var produccion = "/home/isde/archivos/";
=======
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var produccion = "/home/cremio/archivos/";
>>>>>>> 3cc1d570dac3ae9d22846f3d69b9bd65f10c8992
				 
	

		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [180,160];
		}
		
		var imageModule=new ImageModule(opts);


		var content = fs
    							.readFileSync(produccion+"FICHASOCIO.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.attachModule(imageModule)
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});


		
		var fecha = new Date();
		fecha.setHours(0,0,0,0);
		var fechaNaci = objeto.profile.fechaNacimiento;
    	//var f = fecha;
    	hora = fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
    	fechaAltaCliente = new Date(objeto.profile.fechaCreacion)
    	fechaAltaCliente.setHours(0,0,0,0)
    	fechaAlta = fechaAltaCliente.getUTCDate()+'-'+(fechaAltaCliente.getUTCMonth()+1)+'-'+fechaAltaCliente.getUTCFullYear();
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fechaNacimiento = fechaNaci.getUTCDate()+'-'+(fechaNaci.getUTCMonth()+1)+'-'+fechaNaci.getUTCFullYear();
	    var cliente =objeto.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.colonia.nombre
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.ciudad.nombre
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.estado.nombre
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.pais.nombre
	    var paisCliente = pais.toUpperCase();
		var sexoCliente = objeto.profile.sexo
	    var sexo  = sexoCliente.toUpperCase();
	    var nacionalidadCliente = objeto.nacionalidad.nombre
	    var nacionalidad  = nacionalidadCliente.toUpperCase();
	    var lugar = objeto.lugarNacimiento
	    var lugarNacimiento  = lugar.toUpperCase();
	    var ocupa = objeto.ocupacion.nombre
	    var ocupacion  = ocupa.toUpperCase();
	    var est = objeto.estadoCivil.nombre
	    var estadoCivil  = est.toUpperCase();
	    var anti = objeto.profile.tiempoResdencia
	    var antiguedad  = anti.toUpperCase(); 
	    var anti = objeto.profile.tiempoResdencia
	    var antiguedad  = anti.toUpperCase();
	    var sucu = objeto.sucursal.nombre;
	    var sucursal = sucu.toUpperCase();
	    var muni = objeto.municipio;
	    var municipio = muni.toUpperCase();
	    var empre = objeto.empresa.nombre;
	    var empresa = empre.toUpperCase();
	    var call = objeto.empresa.calle;
	    var calleEmpresa = call.toUpperCase();
	    var col = objeto.empresa.colonia;
	    var coloniaEmpresa = col.toUpperCase();
	    // var cas = objeto.profile.casa
	    // var casa = cas.toUpperCase();
	    // var loca = objeto.empresa.municipio;
	    // var LocalidadEmpresa = loca.toUpperCase();

	     var dep = objeto.empresa.departamento;
		 var departamento = dep.toUpperCase();
		 var pues = objeto.empresa.puesto;
		 var puesto = pues.toUpperCase();
		 var anti = objeto.empresa.tiempoLaborando;
		 var antiguedadEmpresa = anti.toUpperCase();
		 var jef = objeto.empresa.jefeInmediato;
		 var jefe = jef.toUpperCase();




	    var f = String(objeto.profile.foto);
					objeto.profile.foto = f.replace('data:image/jpeg;base64,', '');

					var bitmap = new Buffer(objeto.profile.foto, 'base64');

					fs.writeFileSync(produccion+".jpeg", bitmap);
					objeto.profile.foto = produccion+".jpeg";


		doc.setData({				nombreCompleto: 		nombreCliente,
									sexo:                   sexo,
									fechaEmision:           fecha,
									nacionalidad:           nacionalidad,
									fechaNacimiento:        fechaNacimiento,
									lugarNacimiento:        lugarNacimiento,
									ocupacion:              ocupacion,
									estadoCivil:            estadoCivil,
									 calle: 			    calleCLiente,
									 no: 				    objeto.profile.numero,
									 antiguedad:            antiguedad,
									 colonia: 				coloniaCliente,
									 cp: 	        		objeto.profile.codigoPostal,
									 ciudad: 				ciudadCliente,
									 estado: 				estadoCliente,
									 pais: 					paisCliente,
									 fechaCreacion:         fechaAlta,
									 hora:                  hora,
									 foto:                  objeto.profile.foto,
									 sucursal:              sucursal,
									 municipio:             municipio,
									 telefonoContacto:      objeto.profile.telefono,
									 telefonoAlternativo: objeto.profile.otroTelefono,
									 telefonoMovilContacto: objeto.profile.celular,
									 correo:                objeto.profile.correo,



									 //////////////////// REFERENCIAS PERSONALES //////////////////////
									 ingresosPersonales:    objeto.profile.ingresosPersonales,
									 ingresosConyuge:       objeto.profile.ingresosConyuge,
									 gastosFijos:           objeto.profile.gastosFijos,
									 gastoEventuales:       objeto.profile.gastosEventuales,
									 otrosIngresos:         objeto.otrosIngresos,


									 /////////////////// CONTACTO //////////////////////
									 referencias:           objeto.referencias,


									//////////////////// EMPRESA //////////////////////
									empresa:               empresa, 
									calleEmpresa:          calleEmpresa,
									coloniaEmpresa:        coloniaEmpresa,
									telefonoEmpresa:       objeto.empresa.telefono,
									departamento:          departamento,
									puesto:                puesto,
									antiguedad:            antiguedad,
									numeroEmpresa:         objeto.empresa.numero,
									cpEmpresa:             objeto.empresa.codigoPostal,

									




									//////////////////// CONYUGE //////////////////////
									telefonoConyuge:       objeto.profile.telefonoConyuge,
									ocupacionConyuge:      objeto.profile.ocupacionConyuge,
									nombreConyu:           objeto.profile.nombreConyuge,



								}) 
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"FICHASOCIOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"FICHASOCIOSalida.docx");

   // cmd.run('unoconv -f pdf '+ produccion+'cedulaSalida.docx');
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },

  	
	
});