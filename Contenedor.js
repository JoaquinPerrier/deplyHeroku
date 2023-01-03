const fs = require("fs");

class Contenedor {
  constructor(nombreArchivo) {
    this.nombreArchivo = nombreArchivo;
  }

  save = async (objetoAGuardar) => {
    try {
      // OBTENEMOS OBJETOS PARA VER ULTIMO ID
      let ultimaID;

      let productsParsed = await this.getAll();
      // console.log(productsParsed);
      //ultimaID = productsParsed.length + 1;
      //objetoAGuardar.id = ultimaID;
      // console.log(objetoAGuardar);
      productsParsed.push(objetoAGuardar);
      console.log(productsParsed);

      await fs.promises.writeFile(
        `./${this.nombreArchivo}`,
        JSON.stringify(productsParsed),
        (err) => {
          if (err) {
            console.log("ERROR");
          } else {
            console.log("contenido agregado al final del .txt");
          }
        }
      );
    } catch (error) {
      console.log("ERROR: PRODUCTO NO CARGADO");
    }
  };

  modificarObjeto = async (newArray) => {
    try {
      await fs.promises.writeFile(
        `./${this.nombreArchivo}`,
        JSON.stringify(newArray)
      );
    } catch (error) {
      console.log("ERROR");
    }
  };

  getAll = async () => {
    try {
      const products = await fs.promises.readFile(
        `./${this.nombreArchivo}`,
        "utf-8"
      );
      let productsParsed;
      return (productsParsed = JSON.parse(products));
    } catch (error) {
      await fs.promises.writeFile(
        `./${this.nombreArchivo}`,
        JSON.stringify([])
      );
      products = [];
    }
  };

  getById = async (idGet) => {
    try {
      let productsParsed = await this.getAll();
      //console.log(productsParsed)
      let productoEncontrado;

      productsParsed.forEach((element) => {
        if (element.id == idGet) {
          productoEncontrado = element;
        }
      });
      return productoEncontrado;
    } catch (error) {
      console.log("Producto con ID inexistente");
      return null;
    }
  };

  deleteById = async (id) => {
    try {
      let productsParsed = await this.getAll();
      console.log(productsParsed);
      let arrayConProductoEliminado = productsParsed.filter(
        (element) => element.id != id
      );
      await fs.promises.writeFile(
        `./${this.nombreArchivo}`,
        JSON.stringify(arrayConProductoEliminado, null, 2)
      );
      await console.log(`Se ha eliminado el id: ${id}`);
    } catch (error) {
      console.log("ERROR, NO FUE POSIBLE BORRAR OBJETO");
    }
  };

  deleteAll = async () => {
    try {
      await fs.promises.writeFile(
        `./${this.nombreArchivo}`,
        JSON.stringify([])
      );
    } catch (error) {
      console.log("ERROR");
    }
  };
}

// DESCOMENTAR ESTAS LINEAS PARA QUE FUNCIONE
//let contenedor = new Contenedor("productos.txt");

//async function correrPrograma() {
// DEVUELVE TODO EL CONTENIDO DEL ARCHIVO:
// console.log(await contenedor.getAll());
// DEVUELVE EL CONTENIDO DEL ID BUSCADO
// let productoEncontrado = await contenedor.getById(2);
// console.log(productoEncontrado);
// GUARDA OBJETO
//let nuevoObjeto = {
//  title: "asdsadsad",
//  price: 145,
//  thumbnail: "www.img.com/soda.jpg",
//};
//await contenedor.save(nuevoObjeto);
// BORRA OBJETO POR ID
// await contenedor.deleteById(6);
// BORRA TODOS LOS OBJETOS
// await contenedor.deleteAll();
//}

//correrPrograma();
//console.log("salio");

module.exports = Contenedor;
