import { secret as jwtKey } from 'src/config/jwt';
import * as jwt from 'jsonwebtoken';

export function verifyToken(token, secret: string = jwtKey): Promise<any> {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (error, payload) => {
      if (error) {
        resolve({ id: -1 });
      } else {
        resolve(payload);
      }
    });
  });
}
