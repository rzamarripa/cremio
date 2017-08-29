Meteor.methods({
		getcartaRecordatorio: function (objeto) {
		//console.log(objeto,"recordatori")
   // var produccion = "/home/cremio/archivos/";
		
		var fs = require('fs') ;
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getcartaUrgente: function (objeto) {
	//console.log(objeto,"URGENTE")
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
				 
		
		
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


 ////////////////////////////////////////////////////////////////////////////////////////////////////////////


  getcartaCertificado: function (objeto,objeto_id) {
	console.log(objeto,"certificacionPatrimonial")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
				 
		
		
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getReferencias: function (idReferencia) {
			var referencia = Personas.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getReferenciasP: function (idReferencia) {
			var referencia = ReferenciasPersonales.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getDocs: function (idReferencia) {
			var referencia = Documentos.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getPeople: function (idReferencia) {
			var persona = Meteor.users.findOne(idReferencia);
			
				_.each(persona, function(objeto){
					objeto.nacionalidadCliente = Nacionalidades.findOne(objeto.nacionalidad_id);
					objeto.coloniaCliente = Colonias.findOne(objeto.colonia_id);
					objeto.estadoCliente = Estados.findOne(objeto.estado_id);
					objeto.municipioCliente = Municipios.findOne(objeto.municipio_id);
					objeto.ocupacionCliente = Ocupaciones.findOne(objeto.ocupacion_id);
					objeto.ciudadCliente = Ciudades.findOne(objeto.ciudad_id);
					objeto.sucursales = Sucursales.findOne(objeto.sucursal_id);
					objeto.estadoCivilCliente = EstadoCivil.findOne(objeto.estadoCivil_id);
					_.each(objeto.referenciasPersonales_ids, function(item){
					objeto.referencias = ReferenciasPersonales.findOne(item.referenciaPersonal_id)

				})

		


				});

				//console.log(persona,"termina")
				
			//console.log("esta es la referencia",referencia)
			return persona;
	},
	// getEmpresas: function (idEmpresa) {
	// 		//console.log('hi');
	// 		Meteor.apply('findSomeShit',['Empresas', {_id: idEmpresa}, true], function(err, empresa){
	// 			Meteor.call('findSomeShit',['Ciudades', {_id: empresa.empresa_id}, true], function(err, ciudad){
	// 				Meteor.call('findSomeShit',['Municipios', {_id: empresa.municipio_id}, true], function(err, municipio){
	// 					Meteor.call('findSomeShit',['Estados', {_id: empresa.estado_id}, true], function(err, estado){
	// 						Meteor.call('findSomeShit',['Paises', {_id: empresa.pais_id}, true], function(err, pais){
	// 							Meteor.call('findSomeShit',['Colonias', {_id: empresa.colonia_id}, true], function(err, colonia){
	// 								empresa.ciudad = ciudad;
	// 								empresa.municipio = municipio;
	// 								empresa.estado = estado;
	// 								empresa.pais = pais;
	// 								empresa.colonia = colonia;
	// 								res['return'] = empresa;
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 		// empresa.municipio = Municipios.findOne(empresa.municipio_id);
	// 		// empresa.estado = Estados.findOne(empresa.estado_id);
	// 		// empresa.colonia = Colonias.findOne(empresa.colonia_id);
	// 		// empresa.pais = Paises.findOne(empresa.pais_id);
	// 		// console.log("esta es la empresa",empresa)
	// 		return res.wait();
	// },

	findSomeShit: function (collection, find, findOne){
		return findOne ? eval(collection).findOne(find) : eval(collection).find(find);
	},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getFicha: function (objeto,referencia) {
  	console.log(objeto.referencias,"FICHA")
	
		
		var fs = require('fs');
        var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var cmd = require('node-cmd');
		var ImageModule = require('docxtemplater-image-module');
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";


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
			    hora = fecha.getHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();

		fecha.setHours(0,0,0,0);
		//var fechaNaci = objeto.profile.fechaNacimiento;
		
    	//var f = fecha;
    	
    	//fechaAltaCliente = new Date(objeto.profile.fechaCreacion)
    	// fechaAltaCliente.setHours(0,0,0,0)
    	// fechaAlta = fechaAltaCliente.getUTCDate()+'-'+(fechaAltaCliente.getUTCMonth()+1)+'-'+fechaAltaCliente.getUTCFullYear();
	    // fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    //fechaNacimiento = fechaNaci.getUTCDate()+'-'+(fechaNaci.getUTCMonth()+1)+'-'+fechaNaci.getUTCFullYear();
	    fechaEmision = new Date()
	    fechaEmision=moment(fechaEmision).format("DD-MM-YYYY")


	    var f = String(objeto.foto);
					objeto.foto = f.replace('data:image/jpeg;base64,', '');

					var bitmap = new Buffer(objeto.foto, 'base64');

					fs.writeFileSync(produccion+".jpeg", bitmap);
					objeto.foto = produccion+".jpeg";
						
						 	//objeto.referenciasPersonales_ids.referencia .find(objeto.referenciasPersonales_ids.r

						objeto.fechaCreacion =moment(objeto.fechaCreacion).format("DD-MM-YYYY")
						objeto.fechaNacimiento =moment(objeto.fechaNacimiento).format("DD-MM-YYYY")

						
							objeto.ciudad = objeto.ciudadCliente.nombre
							objeto.sucursal = objeto.sucursales.nombre
							objeto.colonia = objeto.coloniaCliente.nombre
							objeto.municipio = objeto.municipioCliente.nombre
							objeto.estado = objeto.estadoCliente.nombre
							objeto.nacionalidad = objeto.nacionalidadCliente.nombre
							objeto.estadoCivil = objeto.estadoCivilCliente.nombre
							objeto.ocupacion = objeto.ocupacionCliente.nombre
							objeto.renta = objeto.rentames
							objeto.cp = objeto.codigoPostal
							objeto.renta = objeto.rentames
							objeto.telefonoMovilContacto = objeto.celular
							objeto.telefonoContacto = objeto.particular
							objeto.nombreConyu = objeto.nombreConyuge
							objeto.empresaC = Empresas.findOne(objeto.empresa_id);
							objeto.empresaC.municipio = Municipios.findOne(objeto.empresaC.municipio_id);
							objeto.municipioEmpresa = objeto.empresaC.municipio.nombre
							objeto.empresaC.municipio = Municipios.findOne(objeto.empresaC.municipio_id);
							objeto.municipioEmpresa = objeto.empresaC.municipio.nombre
							objeto.empresaC.estado = Estados.findOne(objeto.empresaC.estado_id);
							objeto.estadoEmpresa = objeto.empresaC.estado.nombre
							objeto.empresaC.colonia = Colonias.findOne(objeto.empresaC.colonia_id);
							objeto.coloniaEmpresa = objeto.empresaC.colonia.nombre
							objeto.empresaC.pais = Paises.findOne(objeto.empresaC.pais_id);
							objeto.paisEmpresa = objeto.empresaC.pais.nombre
							objeto.numeroEmpresa = objeto.empresaC.no
							objeto.empresa = objeto.empresaC.nombre
							objeto.calleEmpresa = objeto.empresaC.calle
							objeto.numeroEmpresa = objeto.empresaC.numero


						 	

						


		doc.setData({				item: 		objeto,//bien
									foto: objeto.foto,
									referencias: objeto.referencias
					


								}) 
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"FICHASOCIOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"FICHASOCIOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getRecibos: function (objeto) {
	
		console.log(objeto,"planPagos")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
				 
				var content = fs
    	   .readFileSync(produccion+"RECIBOS.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
	 _.each(objeto,function(item){
      item.fechaLimite =moment(item.fechaLimite).format("DD-MM-YYYY")
      
      if (item.proximoPago== "No hay proximo pago") {
      	item.proximoPago = "No hay próximo pago" 
      }else{
      	item.proximoPago =moment(item.proximoPago).format("DD-MM-YYYY")
      }
      

	 });

	  //console.log(objeto.planPagos);
		
		doc.setData({				items: 		objeto,
									fecha:     fecha,
									

				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"RECIBOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"RECIBOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

  getCreditoReporte: function (objeto,credito,avales,total) {
    	console.log(total,"total")
	
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteCredito.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	 	 	_.each(objeto,function(item){
	 	 		//console.log(item,"Credito")
	 	 		item.fechaLimite = item.fechaLimite.getUTCDate()+'-'+(item.fechaLimite.getUTCMonth()+1)+'-'+item.fechaLimite.getUTCFullYear();
	 	 		 if (item.fechaLimite.length < 2) item.fechaLimite = '0' + item.fechaLimite;
	 	 		   item.cargo = parseFloat(item.cargo.toFixed(2))
	 	 		   item.liquidar = parseFloat(item.liquidar.toFixed(2))
	 	 		    item.capital = parseFloat(item.capital.toFixed(2))
	 	 		// item.liquidar =              
	 	 		// if (item.estatus = 5) {
	 	 		// 	item.formaPago = item.tipoIngreso.nombre

	 	 		// }
	 	 	});

		
		doc.setData({				planPagos: 	  objeto,
									length:       objeto.length,
									fecha:        fecha,
									cliente:      credito.nombre,
									periodo:      credito.periodoPago,
									duracion:     credito.duracionMeses,
									capital:      credito.capitalSolicitado,
									total:        total.sumatoria,
									//tipoCredito:

				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteCreditoSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteCreditoSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReporteCobranza: function (objeto,inicial,final) {
	
		console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"reporteDiarioCobranza.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	    var suma = 0
		var sumaInter = 0
		var sumaIva = 0
		totalcobranza = 0
	    _.each(objeto,function(item){
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	moment(item.fechaInicial).format("DD-MM-YYYY")
	      moment(item.fechaFinal).format("DD-MM-YYYY")
	      if (item.descripcion == "Recibo") {
	      	item.movimiento = "R"
	      }else{
	      	item.movimiento = "C"
	      }
	    
	  
	       suma = item.sumaCapital
	       sumaInter = item.sumaInteres
	       sumaIva = item.sumaIva

	       totalcobranza = suma + sumaIva + sumaInter

	        item.cargo = parseFloat(item.totalPago.toFixed(2))
	        item.interes = parseFloat(item.pagoInteres.toFixed(2))
	        item.iva = parseFloat(item.pagoIva.toFixed(2))
	        item.seguro = parseFloat(item.pagoSeguro.toFixed(2))
	        item.pago = parseFloat(item.pagoCapital.toFixed(2))
	        

	    });
	    
	
	    console.log(objeto.planPagos);
		
		      doc.setData({				
      	            items: 		      objeto,
										fecha:          fecha,
										inicial:        fInicial,
										final:          fFinal,
										sumaCapital:    parseFloat(suma.toFixed(2)),
										sumaIntereses:  parseFloat(sumaInter.toFixed(2)),
										sumaIva:        parseFloat(sumaIva.toFixed(2)),
										totalCobranza:  parseFloat(totalcobranza.toFixed(2)),
		
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"reporteDiarioCobranzaSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"reporteDiarioCobranzaSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

  ReporteCreditos: function (objeto,inicial,final) {
	
		//console.log(objeto,"fwfe ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		//
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteDiarioCreditos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	   
          var suma = 0
          var sumaSol = 0
	    _.each(objeto,function(item){
	    	item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
	    	suma = item.sumaCapital
	    	sumaSol = item.sumaAPagar
	    	item.numeroCliente = item.numeroCliente + "";
	    	item.adeudoInicial = parseFloat(item.adeudoInicial.toFixed(2))
	    	item.saldoActual = parseFloat(item.saldoActual.toFixed(2))

	    });

	    // console.log(objeto.planPagos);
		
		doc.setData({				
						items: 		 objeto,
						fecha:     fecha,
						inicial:    fInicial,
						final:      fFinal,
						sumaCapital : suma,
						sumaAPagar: sumaSol,
													
				
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteDiarioCreditosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteDiarioCreditosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

  ReporteMovimientoCuenta: function (objeto,inicial,final) {
	
		console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteMovimientoCuentas.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	    _.each(objeto,function(item){
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	
	    });
	    
	    console.log(objeto.planPagos);
		
		doc.setData({				items: 		 objeto,
												fecha:     fecha,
												inicial:    fInicial,
												final:      fFinal,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteMovimientoCuentasSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteMovimientoCuentasSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ReportesBanco: function (objeto,inicial,final) {
	
		console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
		var content = fs
    	   .readFileSync(produccion+"ReporteBancos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	    _.each(objeto,function(item){
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	
	    });
	    
	    console.log(objeto.planPagos);
		
		doc.setData({				
			            item: 		 objeto,
						fecha:       fecha,
						inicial:     fInicial,
						final:       fFinal,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteBancosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteBancosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  
  
  
  contratos: function (contrato,credito,cliente,planPagos,avales) {
	  	

    function Unidades(num){

		        switch(num)
		        {
		            case 1: return 'UN';
		            case 2: return 'DOS';
		            case 3: return 'TRES';
		            case 4: return 'CUATRO';
		            case 5: return 'CINCO';
		            case 6: return 'SEIS';
		            case 7: return 'SIETE';
		            case 8: return 'OCHO';
		            case 9: return 'NUEVE';
		        }
		
		        return '';
		    
    }//Unidades()
		function Decenas(num){
		
		        let decena = Math.floor(num/10);
		        let unidad = num - (decena * 10);
		
		        switch(decena)
		        {
		            case 1:
		                switch(unidad)
		                {
		                    case 0: return 'DIEZ';
		                    case 1: return 'ONCE';
		                    case 2: return 'DOCE';
		                    case 3: return 'TRECE';
		                    case 4: return 'CATORCE';
		                    case 5: return 'QUINCE';
		                    default: return 'DIECI' + Unidades(unidad);
		                }
		            case 2:
		                switch(unidad)
		                {
		                    case 0: return 'VEINTE';
		                    default: return 'VEINTI' + Unidades(unidad);
		                }
		            case 3: return DecenasY('TREINTA', unidad);
		            case 4: return DecenasY('CUARENTA', unidad);
		            case 5: return DecenasY('CINCUENTA', unidad);
		            case 6: return DecenasY('SESENTA', unidad);
		            case 7: return DecenasY('SETENTA', unidad);
		            case 8: return DecenasY('OCHENTA', unidad);
		            case 9: return DecenasY('NOVENTA', unidad);
		            case 0: return Unidades(unidad);
		        }
		    }//Unidades()
    function DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' Y ' + Unidades(numUnidades)

        return strSin;
    }//DecenasY()
    function Centenas(num) {
		        let centenas = Math.floor(num / 100);
		        let decenas = num - (centenas * 100);
		
		        switch(centenas)
		        {
		            case 1:
		                if (decenas > 0)
		                    return 'CIENTO ' + Decenas(decenas);
		                return 'CIEN';
		            case 2: return 'DOSCIENTOS ' + Decenas(decenas);
		            case 3: return 'TRESCIENTOS ' + Decenas(decenas);
		            case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
		            case 5: return 'QUINIENTOS ' + Decenas(decenas);
		            case 6: return 'SEISCIENTOS ' + Decenas(decenas);
		            case 7: return 'SETECIENTOS ' + Decenas(decenas);
		            case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
		            case 9: return 'NOVECIENTOS ' + Decenas(decenas);
		        }
		
		        return Decenas(decenas);
		    }//Centenas()
    function Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let letras = '';

        if (cientos > 0)
            if (cientos > 1)
                letras = Centenas(cientos) + ' ' + strPlural;
            else
                letras = strSingular;

        if (resto > 0)
            letras += '';

        return letras;
    }//Seccion()
    function Miles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
        let strCentenas = Centenas(resto);

        if(strMiles == '')
            return strCentenas;

        return strMiles + ' ' + strCentenas;
    }//Miles()
    function Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
        let strMiles = Miles(resto);

        if(strMillones == '')
            return strMiles;

        return strMillones + ' ' + strMiles;
    }//Millones()
		function NumeroALetras(num, currency) {
        currency = currency || {};
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: '',
            letrasMonedaPlural: currency.plural || 'PESOS',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: currency.singular || 'PESO', //'PESO', 'Dólar', 'Bolivar', 'etc'
            letrasMonedaCentavoPlural: currency.centPlural || 'PESOS',
            letrasMonedaCentavoSingular: currency.centSingular || 'PESO'
        };

        if (data.centavos > 0) {
            data.letrasCentavos = 'CON ' + (function () {
                    if (data.centavos == 1)
                        return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
                    else
                        return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
                })();
        };

        if(data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1)
            return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
        else
            return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    };
		
			
		var letra = NumeroALetras(contrato.capitalSolicitado);
		console.log("Letra:",letra);
	if (avales == undefined) {
		avales = cliente

	}
	if (contrato.seguro == undefined) {
		contrato.seguro = 0
	}
	  
  	cliente.nacionalidad = cliente.nacionalidadCliente.nombre
  	cliente.colonia = cliente.coloniaCliente.nombre
  	cliente.estado = cliente.estadoCliente.nombre
  	cliente.ocupacion = cliente.ocupacionCliente.nombre
  	cliente.ciudad = cliente.ciudadCliente.nombre
  	 _.each(planPagos,function(pp){
		 	pp.importeRegular = parseFloat(pp.importeRegular.toFixed(2))
		 	pp.iva = parseFloat(pp.iva.toFixed(2))
		 	if (pp.sumatoria) {pp.sumatoria = parseFloat(pp.sumatoria.toFixed(2))}
		 	if (pp.total) {pp.total = parseFloat(pp.total.toFixed(2))}
		 	if (pp.capital) {pp.capital = parseFloat(pp.capital.toFixed(2))}
		 	if (pp.liquidar) {pp.liquidar = parseFloat(pp.liquidar.toFixed(2))}
		 	pp.fechaLimite = moment(pp.fechaLimite).format("DD-MM-YYYY")
		 	


		 });
  	 _.each(contrato.garantias,function(item){
  	 	item.fechaFiniquito = moment(item.fechaFiniquito).format("DD-MM-YYYY")
  	 	item.fechaComercializacion = moment(item.fechaComercializacion).format("DD-MM-YYYY")

  	 });
  	//var garantias = contrato.garantias[0]

  
  		
  	if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) {
	
	    //console.log(contrato,"contratos  sin aval ni garantias")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";
				
				if (contrato.tipoInteres.tipoInteres == "Simple") {
					var content = fs
					.readFileSync(produccion+"CONTRATOINTERES.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
					var content = fs
					.readFileSync(produccion+"CONTRATOINTERESSSI.docx", "binary");
				}
				if (contrato.tipoInteres.tipoInteres == "Compuesto") {
					var content = fs
					.readFileSync(produccion+"CONTRATOINTERESCOMPUESTO.docx", "binary");
				}
					
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	 
	    
	  		doc.setData({			items: 	   contrato,
									fecha:     fecha,
									cliente: cliente,
									contrato: contrato,
									pp: planPagos,
									letra : letra,
									aval: avales,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
			
 		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
     		 	fs.writeFileSync(produccion+"CONTRATOINTERESSalidaSSISalida.docx",buf);
     		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOINTERESSalidaSSISalida.docx");
     		 }
     		 if (contrato.tipoInteres.tipoInteres == "Simple") {
     		 	fs.writeFileSync(produccion+"CONTRATOINTERESSalida.docx",buf);
     		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOINTERESSalida.docx");
     		 }
     		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
     		 	fs.writeFileSync(produccion+"CONTRATOINTERESSalidaCOMPUESTOSalida.docx",buf);
     		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOINTERESSalidaCOMPUESTOSalida.docx");
     		 }		

    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
   }
   	if (contrato.avales_ids && _.isEmpty(contrato.garantias)) {
   	//console.log(contrato,"contratos con aval sin garantias ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
	    //var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";

	    if (contrato.tipoInteres.tipoInteres == "Simple") {
			var content = fs
					.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIO.docx", "binary");
		}
		if (contrato.tipoInteres.tipoInteres == "Compuesto") {
			var content = fs
					.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOCOMPUESTO.docx", "binary");
		}
		if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
			var content = fs
					.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSSI.docx", "binary");
		}
    	   
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	  
	    
	  		doc.setData({				items: 		 contrato,
									    fecha:     fecha,
									    cliente:    cliente,
									    pp: planPagos,
									    contrato: contrato,
									    letra : letra,
									    aval: avales,
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 	           		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
             		 	fs.writeFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalidaSSISalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalidaSSISalida.docx");
             		 }
             		 if (contrato.tipoInteres.tipoInteres == "Simple") {
             		 	fs.writeFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalida.docx");
             		 }
             		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
             		 	fs.writeFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalidaCOMPUESTOSalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalidaCOMPUESTOSalida.docx");
             		 }	
				
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
   }


  if (contrato.garantias && contrato.tipoGarantia == "general") {
   	//console.log(contrato,"hipotecarios ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		// var produccion = "/home/cremio/archivos/";
	    var produccion = meteor_root+"/web.browser/app/plantillas/";
		if (contrato.tipoInteres.tipoInteres == "Simple") {
			var content = fs
					.readFileSync(produccion+"CONTRATOHIPOTECARIO.docx", "binary");
		}
		if (contrato.tipoInteres.tipoInteres == "Compuesto") {
			var content = fs
					.readFileSync(produccion+"CONTRATOHIPOTECARIOCOMPUESTO.docx", "binary");
		}
		if (contrato.tipoInteres.tipoInteres == "saldos Insolutos") {
			var content = fs
					.readFileSync(produccion+"CONTRATOHIPOTECARIOSSI.docx", "binary");
		}
				
    	   
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
		
		
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	
	    
	  		doc.setData({		    items: 	   contrato,
									fecha:     fecha,
									cliente: cliente,
									contrato: contrato,
									pp: planPagos,
									letra : letra,
									aval: avales,
													
				});
								
		doc.render();
 
			
				var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
             		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
             		 	console.log(",cjecj")
             		 	fs.writeFileSync(produccion+"CONTRATOHIPOTECARIOSalidaSSISalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOHIPOTECARIOSalidaSSISalida.docx");
             		 }
             		 if (contrato.tipoInteres.tipoInteres == "Simple") {
             		 	fs.writeFileSync(produccion+"CONTRATOHIPOTECARIOSalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOHIPOTECARIOSalida.docx");
             		 }
             		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
             		 	fs.writeFileSync(produccion+"CONTRATOHIPOTECARIOSalidaCOMPUESTOSalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOHIPOTECARIOSalidaCOMPUESTOSalida.docx");
             		 }
				    
  
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');

   }
   if (contrato.garantias && contrato.tipoGarantia == "mobiliaria") {
   		//console.log(contrato,"mobiliaria ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		//var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";
		if (contrato.tipoInteres.tipoInteres == "Simple") {
			console.log("entra SIMPLE")
			var content = fs				
					.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIA.docx", "binary");
		}
		if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
			console.log("entra saldos")
			var content = fs				
					.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASSI.docx", "binary");
		}
		if (contrato.tipoInteres.tipoInteres == "Compuesto") {
			console.log("entra COMPUESTO")
			var content = fs				
					.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIACOMPUESTO.docx", "binary");
		}
				
    	   
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
	  		doc.setData({				items: 	   contrato,
									    fecha:     fecha,
									    cliente:   cliente,
										contrato: contrato,
										pp: planPagos,
										letra : letra,
										aval : avales,
										//garantias: 
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
             		 if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
             		 	console.log(",monndddrigoo")
             		 	fs.writeFileSync(produccion+"CONTRATOGARANTIAPRENDARIASSISalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASSISalida.docx");
             		 }
             		 if (contrato.tipoInteres.tipoInteres == "Simple") {
             		 	fs.writeFileSync(produccion+"CONTRATOGARANTIAPRENDARIASalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASalida.docx");
             		 }
             		 if (contrato.tipoInteres.tipoInteres == "Compuesto") {
             		 	fs.writeFileSync(produccion+"CONTRATOGARANTIAPRENDARIACOMPUESTOSalida.docx",buf);
             		 	 var bitmap = fs.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIACOMPUESTOSalida.docx");
             		 }
				

    //var bitmap = fs.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASalida.docx");
    
    return new Buffer(bitmap).toString('base64');

   }
},
	getListaCobranza: function (objeto) {
	
		console.log(objeto,"planPagos")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
				 
				var content = fs
    	   .readFileSync(produccion+"LISTACOBRANZA.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
	 _.each(objeto,function(item){
      item.fechaLimite =moment(item.fechaLimite).format("DD-MM-YYYY")
     
	 });
		
			doc.setData({				items: 		objeto,
										fecha:     fecha,
									

				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"LISTACOBRANZASalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccion+"LISTACOBRANZASalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 

  imprimirHistorial: function (objeto,cliente,credito) {
	
		console.log(credito,"cre")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var ImageModule = require('docxtemplater-image-module');
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
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
    	   .readFileSync(produccion+"HISTORIALCREDITICIO.docx", "binary");
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

		var pic = String(cliente.foto);
		cliente.foto = pic.replace('data:image/jpeg;base64,', '');
		var bitmap = new Buffer(cliente.foto, 'base64');
		fs.writeFileSync(produccion+".jpeg", bitmap);
		cliente.foto = produccion+".jpeg";
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
      objeto.fechaLimite =moment(objeto.fechaLimite).format("DD-MM-YYYY")
      cliente.fechaCreacion =moment(cliente.fechaCreacion).format("DD-MM-YYYY")
      cliente.fechaNa =moment(cliente.fechaNa).format("DD-MM-YYYY")
      credito.fechaEntrega =moment(credito.fechaEntrega).format("DD-MM-YYYY")
      credito.adeudoInicial = parseFloat(credito.adeudoInicial.toFixed(2))
      credito.saldoActual = parseFloat(credito.saldoActual.toFixed(2))
      credito.saldoMultas = parseFloat(credito.saldoMultas.toFixed(2))

      var totalCargos = 0
      var totalAbonos = 0 
      _.each(objeto,function(item){
      item.fechaSolicito =moment(item.fechaSolicito).format("DD-MM-YYYY")
      item.saldo = parseFloat(item.saldo.toFixed(2))
      item.cargo = parseFloat(item.cargo.toFixed(2))
      totalAbonos = parseFloat(item.sumaAbonos.toFixed(2))
      totalCargos = parseFloat(item.sumaCargos.toFixed(2))
      totalSaldo =  parseFloat(item.ultimoSaldo.toFixed(2))
	 });
		
		doc.setData({				
						items:   objeto,
						fecha:   fecha,
						cliente: cliente,
						foto:    cliente.foto,
						sucursal: cliente.sucursal,
						fechaCreacion : cliente.fechaCreacion,
						nombreCompleto :  cliente.profile.nombreCompleto,
						sexo : cliente.profile.sexo,
						nacionalidad : cliente.clienteNacionalidad.nombre,
						ocupacion : cliente.ocupacion,
						fechaNacimiento : cliente.fechaNa,
						lugarNacimiento : cliente.lugarNacimiento,
						capitalSolicitado : credito.capitalSolicitado,
						numeroPagos : credito.numeroPagos,
						adeudoInicial : credito.adeudoInicial,
						saldoActual : credito.saldoActual,
						fechaEntrega : credito.fechaEntrega,
						saldoMultas : credito.saldoMultas,
						totalCargos : totalCargos,
						totalAbonos : totalAbonos,
						totalSaldo : totalSaldo,
				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"HISTORIALCREDITICIOSalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccion+"HISTORIALCREDITICIOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 

  formaSolicitud: function () {
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"FormatoSol.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
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
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	   
			doc.setData({				

				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"FormatuSolSalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccion+"FormatuSolSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 
  imprimirImagenDocumento: function (imagen) {
	   
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var ImageModule = require('docxtemplater-image-module');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var produccion = "/home/cremio/archivos/";

			var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [400,250];
		}
		
		var imageModule=new ImageModule(opts);

				 
				var content = fs
    	   .readFileSync(produccion+"imagenDocumento.docx", "binary");
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

								var f = String(imagen);
					imagen = f.replace('data:image/jpeg;base64,', '');

					var bitmap = new Buffer(imagen, 'base64');

					fs.writeFileSync(produccion+".jpeg", bitmap);
					imagen = produccion+".jpeg";
		
		var fecha = new Date();
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
		
		doc.setData({				imagen:    imagen,
									fecha:     fecha,
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"imagenDocumentoSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"imagenDocumentoSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
	
});