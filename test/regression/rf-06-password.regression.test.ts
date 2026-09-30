import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';


describe('RF-06 - Cambio de contraseña de usuario', () => {


  let findUser: ReturnType<typeof vi.fn>;
  let verifyPassword: ReturnType<typeof vi.fn>;
  let updatePassword: ReturnType<typeof vi.fn>;



  beforeEach(() => {


    // =========================
    // MOCKS
    // =========================


    findUser = vi.fn();

    verifyPassword = vi.fn();

    updatePassword = vi.fn();


  });





  it('Camino 1 - usuario cambia contraseña correctamente', async () => {


    // ARRANGE


    findUser.mockResolvedValue({

      id:'user-001',

      email:'usuario@test.com',

      passwordHash:'hash-anterior'

    });



    verifyPassword.mockResolvedValue(true);



    updatePassword.mockResolvedValue({

      id:'user-001',

      passwordHash:'hash-nuevo'

    });




    // ACT


    const resultado = await cambiarPassword(

      'user-001',

      'claveActual',

      'claveNueva',

      findUser,

      verifyPassword,

      updatePassword

    );




    // ASSERT


    expect(resultado.passwordHash)

      .toBe('hash-nuevo');



    expect(updatePassword)

      .toHaveBeenCalled();



  });






  it('Camino 2 - usuario inexistente rechaza cambio de contraseña', async () => {


    // ARRANGE


    findUser.mockResolvedValue(null);



    // ACT


    const resultado = cambiarPassword(

      'user-no-existe',

      'claveActual',

      'claveNueva',

      findUser,

      verifyPassword,

      updatePassword

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(UnauthorizedException);



  });






  it('Camino 3 - contraseña actual incorrecta rechaza actualización', async () => {


    // ARRANGE


    findUser.mockResolvedValue({

      id:'user-002',

      passwordHash:'hash'

    });



    verifyPassword.mockResolvedValue(false);




    // ACT


    const resultado = cambiarPassword(

      'user-002',

      'claveIncorrecta',

      'claveNueva',

      findUser,

      verifyPassword,

      updatePassword

    );




    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(UnauthorizedException);



  });







  it('Camino 4 - nueva contraseña vacía no permite actualización', async () => {


    // ARRANGE


    findUser.mockResolvedValue({

      id:'user-003',

      passwordHash:'hash'

    });



    // ACT


    const resultado = cambiarPassword(

      'user-003',

      'claveActual',

      '',

      findUser,

      verifyPassword,

      updatePassword

    );




    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });







  it('Camino 5 - nueva contraseña igual a la actual es rechazada', async () => {


    // ARRANGE


    findUser.mockResolvedValue({

      id:'user-004',

      passwordHash:'claveActual'

    });



    verifyPassword.mockResolvedValue(true);



    // ACT


    const resultado = cambiarPassword(

      'user-004',

      'claveActual',

      'claveActual',

      findUser,

      verifyPassword,

      updatePassword

    );




    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });



});





// =======================================
// SIMULACIÓN DEL CASO DE USO
// =======================================


async function cambiarPassword(

  userId:string,

  currentPassword:string,

  newPassword:string,

  findUser:any,

  verifyPassword:any,

  updatePassword:any

){


  const usuario = await findUser(userId);



  if(!usuario){

    throw new UnauthorizedException();

  }




  if(!newPassword){

    throw new BadRequestException();

  }




  if(newPassword === currentPassword){

    throw new BadRequestException();

  }




  const valido = await verifyPassword(

    currentPassword,

    usuario.passwordHash

  );




  if(!valido){

    throw new UnauthorizedException();

  }




  return await updatePassword(

    userId,

    {

      passwordHash:'hash-nuevo'

    }

  );


}