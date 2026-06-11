import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserContextStore } from '../user-context/user-context.store';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  imports: [
    UserContextModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('GATEWAY_URL', 'http://localhost:3000'),
        timeout: config.get<number>('HTTP_TIMEOUT', 5000),
      }),
    }),
  ],
  exports: [HttpModule],
})
export class GatewayHttpModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly userContextStore: UserContextStore,
  ) {}

  onModuleInit() {
    this.httpService.axiosRef.interceptors.request.use((config) => {
      const user = this.userContextStore.get();
      if (user?.token) {
        config.headers.Authorization = user.token;
      }
      return config;
    });
  }
}
