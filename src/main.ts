import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const config = new DocumentBuilder()
    .setTitle('Sistema RRHH - API')
    .setDescription('API del sistema RRHH para colegios privados')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT || 3000)
  console.log(`🚀 Backend corriendo en http://localhost:${process.env.PORT || 3000}`)
  console.log(`📘 Swagger disponible en http://localhost:${process.env.PORT || 3000}/api`)
}
bootstrap()