import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator(() => {
  return {
    id: 3,
    name: 'gary',
  };
});
