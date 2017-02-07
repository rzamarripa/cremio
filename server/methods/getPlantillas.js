
Meteor.methods({
  getcertificacionPatrimonial: function () {
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = meteor_root+"/web.browser/app/plantillas/";
		//var produccion = "/home/isde/archivos/";
		
		/*
		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [80,80];
		}
		
		var imageModule=new ImageModule(opts);
		*/
		
		var content = fs
    							.readFileSync(produccion+"certificacionPatrimonial.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
								//.attachModule(imageModule)
								
		
		var fecha = new Date();
		var f = fecha;
		f = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
		
		doc.setData({	fecha: new Date(), 
									nombreCompleto: "Nombre de Prueba", 
									direccion: "Domicilio de Prueba", 
									ciudad: "Culiacán Rosales",
									estado: "Sinaloa",
									pais: "México",
									saldo: 5000
								});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"certifiacionPatrimonialSalida.docx",buf);

		
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"certifiacionPatrimonialSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  }
});

