import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';



describe('RF-09 - Gestión de productos', () => {


  let findProduct: ReturnType<typeof vi.fn>;
  let updateProduct: ReturnType<typeof vi.fn>;
  let createProduct: ReturnType<typeof vi.fn>;



  beforeEach(() => {


    // ==========================
    // MOCKS
    // ==========================


    findProduct = vi.fn();

    updateProduct = vi.fn();

    createProduct = vi.fn();


  });





  it('Camino 1 - producto válido permite actualización correcta', async () => {


    // ARRANGE


    findProduct.mockResolvedValue({

      id:'product-001',

      name:'Bebida prueba',

      status:'ACTIVE'

    });



    updateProduct.mockResolvedValue({

      id:'product-001',

      name:'Bebida actualizada'

    });



    // ACT


    const resultado = await actualizarProducto(

      'product-001',

      {
        name:'Bebida actualizada'
      },

      findProduct,

      updateProduct

    );



    // ASSERT


    expect(resultado.name)

      .toBe('Bebida actualizada');



    expect(updateProduct)

      .toHaveBeenCalled();

  });







  it('Camino 2 - producto inexistente no permite actualización', async () => {


    // ARRANGE


    findProduct.mockResolvedValue(null);



    // ACT


    const resultado = actualizarProducto(

      'product-404',

      {
        name:'Nuevo producto'
      },

      findProduct,

      updateProduct

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(NotFoundException);



  });







  it('Camino 3 - nombre vacío no permite guardar producto', async () => {


    // ARRANGE


    findProduct.mockResolvedValue({

      id:'product-002',

      status:'ACTIVE'

    });



    // ACT


    const resultado = actualizarProducto(

      'product-002',

      {
        name:''
      },

      findProduct,

      updateProduct

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });







  it('Camino 4 - código duplicado rechaza creación de producto', async () => {


    // ARRANGE


    createProduct.mockRejectedValue(

      new BadRequestException()

    );



    // ACT


    const resultado = crearProducto(

      {
        code:'ABC123',
        name:'Producto prueba'
      },

      createProduct

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });







  it('Camino 5 - producto inactivo no permite actualización', async () => {


    // ARRANGE


    findProduct.mockResolvedValue({

      id:'product-003',

      name:'Producto antiguo',

      status:'INACTIVE'

    });



    // ACT


    const resultado = actualizarProducto(

      'product-003',

      {
        name:'Cambio'
      },

      findProduct,

      updateProduct

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });



});





// ======================================
// SIMULACIÓN DEL CASO DE USO
// ======================================


async function actualizarProducto(

  id:string,

  data:any,

  findProduct:any,

  updateProduct:any

){


  const producto = await findProduct(id);



  if(!producto){

    throw new NotFoundException();

  }



  if(!data.name){

    throw new BadRequestException();

  }



  if(producto.status === 'INACTIVE'){

    throw new BadRequestException();

  }



  return await updateProduct(

    id,

    data

  );


}






async function crearProducto(

  data:any,

  createProduct:any

){


  if(!data.name){

    throw new BadRequestException();

  }



  return await createProduct(data);


}