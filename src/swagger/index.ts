import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Chatroom')
  .setDescription('Chatroom API description')
  .setVersion('0.0.1')
  .build();

export function useSwagger(app) {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document);
}
