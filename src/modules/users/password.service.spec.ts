import * as bcrypt from 'bcryptjs';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('hashes a password with bcrypt', async () => {
    const hashSpy = jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(async () => 'hashed');

    const result = await service.hash('secret');

    expect(hashSpy).toHaveBeenCalledWith('secret', 10);
    expect(result).toBe('hashed');
  });
});
