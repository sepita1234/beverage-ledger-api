
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';


describe('RF-03 - Aceptar invitación de usuario', () => {

  let invitationRepository: any;
  let updateInvitation: ReturnType<typeof vi.fn>;
  let findInvitation: ReturnType<typeof vi.fn>;
  let createUser: ReturnType<typeof vi.fn>;


  beforeEach(() => {

    // ============================
    // MOCKS
    // ============================

    findInvitation = vi.fn();

    updateInvitation = vi.fn();

    createUser = vi.fn();


    invitationRepository = {

      findById: findInvitation,

      update: updateInvitation,

    };


  });



  it('Camino 1 - invitación válida crea aceptación correctamente', async () => {


    // ============================
    // ARRANGE
    // ============================


    findInvitation.mockResolvedValue({

      id: 'inv-001',

      email: 'usuario@test.com',

      status: 'PENDING',

      expiresAt: new Date(Date.now() + 86400000),

    });



    updateInvitation.mockResolvedValue({

      id: 'inv-001',

      status: 'ACCEPTED',

    });



    createUser.mockResolvedValue({

      id: 'user-001',

      email: 'usuario@test.com',

    });



    // ============================
    // ACT
    // ============================


    const resultado = await aceptarInvitacion(

      'inv-001',

      invitationRepository,

      createUser,

    );



    // ============================
    // ASSERT
    // ============================


    expect(resultado.status)

      .toBe('ACCEPTED');



    expect(updateInvitation)

      .toHaveBeenCalled();



  });





  it('Camino 2 - invitación inexistente genera error', async () => {


    // ARRANGE


    findInvitation.mockResolvedValue(null);



    // ACT


    const resultado = aceptarInvitacion(

      'inv-404',

      invitationRepository,

      createUser,

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(UnauthorizedException);



    expect(findInvitation)

      .toHaveBeenCalledWith('inv-404');


  });






  it('Camino 3 - invitación expirada genera error', async () => {


    // ARRANGE


    findInvitation.mockResolvedValue({

      id:'inv-002',

      email:'usuario@test.com',

      status:'PENDING',

      expiresAt:new Date('2020-01-01'),

    });



    // ACT


    const resultado = aceptarInvitacion(

      'inv-002',

      invitationRepository,

      createUser,

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });






  it('Camino 4 - invitación ya aceptada no permite reutilización', async () => {


    // ARRANGE


    findInvitation.mockResolvedValue({

      id:'inv-003',

      email:'usuario@test.com',

      status:'ACCEPTED',

      expiresAt:new Date(Date.now()+86400000),

    });



    // ACT


    const resultado = aceptarInvitacion(

      'inv-003',

      invitationRepository,

      createUser,

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });



});





// ======================================
// SIMULACIÓN DEL SERVICIO
// SIN BASE DE DATOS
// ======================================


async function aceptarInvitacion(

  id:string,

  repository:any,

  createUser:any,

){


  const invitacion = await repository.findById(id);



  if(!invitacion){

    throw new UnauthorizedException();

  }



  if(invitacion.status !== 'PENDING'){

    throw new BadRequestException();

  }



  if(new Date(invitacion.expiresAt) < new Date()){

    throw new BadRequestException();

  }



  await repository.update(

    id,

    {

      status:'ACCEPTED'

    }

  );



  return {

    id,

    status:'ACCEPTED'

  };

}
